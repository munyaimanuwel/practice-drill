# Practice Drill

A personal practice app for quizzes and coding challenges.

Take quizzes in the browser. Download a starter pack, solve it in your local IDE, then upload a zip. Submit when you are done and request a grade.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind · Prisma · PostgreSQL · iron-session · bcrypt · local file storage.

---

## Quick start

Prereqs: Node 20+, Docker (for Postgres), `npm` (or `pnpm`).

```bash
# 1. Copy env
cp .env.example .env
# (edit .env: set AUTH_SECRET, SESSION_CREATE_TOKEN, SEED_USER_PASSWORD)

# 2. Start Postgres
docker compose up -d

# 3. Install deps
npm install

# 4. Create the database schema + seed
npx prisma migrate deploy
npm run db:seed

# 5. Run
npm run dev
```

> Migrations live under `prisma/migrations/`. For local dev you can use `npx prisma migrate dev` (interactive, also regenerates the client); for deploy/cold-start use `npx prisma migrate deploy` (non-interactive).

Open [http://localhost:3000](http://localhost:3000). You will be sent to `/login`.

> Windows note: if npm skips devDependencies, you may have `NODE_ENV=production` set globally.
> Run `set NODE_ENV=development&& npm install` (or `$env:NODE_ENV="development"; npm install` in PowerShell) once.

Seed creates one admin user (from `.env`) plus two demo sessions: a C# / Docker quiz and a C# String Calculator code challenge.

---

## How to use

The app is single-user. There is no public signup. Sign in with the seeded account, work through sessions, then request a grade.

### 1. Sign in

1. Go to [http://localhost:3000/login](http://localhost:3000/login) (or just `/` — unauthenticated visits redirect here).
2. Enter `SEED_USER_EMAIL` and `SEED_USER_PASSWORD` from your `.env`.
   Defaults in `.env.example` are `admin@localhost` / `change-me-now`.
3. Click **Sign in**.
4. You land on **Sessions**. Wrong credentials stay on login with an error.

To leave: **Logout** in the header.

### 2. Sessions list

`/sessions` is the home screen. Each row is a drill: type (**Quiz** or **Code**), status, title, difficulty ticks, scheduled date, and score if graded.

Filter with the tabs:

| Tab | Meaning |
|-----|---------|
| All | Everything assigned to you |
| Ready | Not started |
| In progress | Opened or draft saved |
| Submitted | Answers or zip sent in |
| Grade requested | Waiting for review |
| Graded | Score and feedback are in |

Click a row to open it. Empty list means seed has not run — use `npm run db:seed` or create a session via the API (below).

Statuses move like this:

```
draft → ready → in_progress → submitted → grade_requested → graded
         ↘ cancelled
```

### 3. Quiz session

Demo title after seed: **Quiz — C# & Docker**.

1. Open the quiz from the list.
2. If status is **ready**, click **Start** (moves it to **in progress**).
3. Answer each prompt in the textareas. You must answer all questions before submit.
4. **Save draft** anytime — answers persist and the session becomes **in progress** if it was still ready.
5. **Submit answers** — status becomes **submitted**. You can still edit after submit.
6. **Request grade** when you are done editing — status becomes **grade requested**.
7. After an admin grades it, the page shows **score /100** and written feedback.

### 4. Code session

Demo title after seed: **Code — String Calculator (C#)**.

1. Open the code session from the list.
2. If status is **ready**, click **Start**.
3. Read **Brief** and **Rubric** (and **Hints** if present).
4. Click **Download starter (.zip)**. Unzip it and open the folder in Cursor, VS Code, or Visual Studio.
5. Solve locally (`dotnet build`, `dotnet test`, `dotnet run` for the demo kata).
6. Zip the **whole solution folder** (not a single file) and click **Upload submission (.zip)**.
   Only `.zip` files are accepted; default cap is 20 MB. You can replace the zip until it is graded.
7. Upload sets status to **submitted**. Click **Request grade**.
8. After grading, score and feedback appear on the same page.

The app stores zips only. It does **not** run your code.

### 5. Who grades, and how to set it up

There is **no separate grader account** and **no grade form in the UI**. The seeded user is an **admin** (`isAdmin: true`). That same person can take the drills and later grade them by hand, or you can point **Hermes / an AI worker** at the HTTP API (see [Wire Hermes + AI](#7-wire-hermes--ai-scheduler-and-grader)).

P0 does not auto-grade and does not execute uploaded code. A human or an external agent reads the answers (or the zip under `storage/submissions/`) and posts a score.

**Setup:** nothing extra. `npm run db:seed` creates the admin. Sign in with `SEED_USER_EMAIL` / `SEED_USER_PASSWORD`.

**When you can grade:** the session must be **grade requested** (the learner clicked **Request grade** after submit).

**How to grade** (admin session cookie from the browser, or log in with curl first):

```bash
# 1. Sign in and save the cookie
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$SEED_USER_EMAIL\",\"password\":\"$SEED_USER_PASSWORD\"}"

# 2. Grade (score 0–100, optional feedback markdown)
curl -b cookies.txt -X POST http://localhost:3000/api/sessions/<id>/grade \
  -H "Content-Type: application/json" \
  -d '{"score":85,"feedback":"Clear explanation of scoped vs singleton. Mention captive dependencies next time."}'
```

That sets status to **graded**, stores `score` / `feedback` / `gradedAt`, and shows them on the session page. Non-admins get **403**. Once graded, the learner cannot edit answers or replace the zip.

You can inspect sessions in Prisma Studio (`npm run db:studio`) if you want to look at stored answers or file paths before grading.

### 6. How challenges are created

The UI has **no “new session” screen**. Challenges (sessions) are created out of band, then they show up on **Sessions** for the seeded user.

Use `status: "ready"` so they appear as startable. `draft` stays hidden from the usual “ready to work” flow.

#### Option A — Seed (two demos)

`npm run db:seed` upserts:

| Title | Type | What it is |
|-------|------|------------|
| Quiz — C# & Docker | quiz | 5 original generic prompts in `prisma/seed.ts` |
| Code — String Calculator (C#) | code | Public TDD kata; starter zip built from `fixtures/sample-starter/` |

Safe to re-run. It will not overwrite an existing demo session’s payload after first create (`update: {}`).

#### Option B — Admin API

You are already the admin after seed. Create a **quiz**:

```bash
curl -b cookies.txt -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "type": "quiz",
    "title": "Quiz — HTTP caching",
    "summary": "Cache-Control, ETag, and when to revalidate.",
    "topicTags": ["http","web"],
    "difficulty": 3,
    "timeLimitMinutes": 30,
    "status": "ready",
    "payload": {
      "questions": [
        {"id":"q1","prompt":"When would you use ETag vs Cache-Control: no-store?","kind":"text","topic":"http","points":10}
      ]
    }
  }'
```

Create a **code** challenge, then attach a starter zip:

```bash
curl -b cookies.txt -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "type": "code",
    "title": "Code — FizzBuzz",
    "summary": "Console app with tests.",
    "topicTags": ["csharp"],
    "difficulty": 2,
    "timeLimitMinutes": 45,
    "status": "ready",
    "payload": {
      "brief_markdown": "## Task\nImplement FizzBuzz for 1..n.",
      "rubric_markdown": "- Compiles\n- Tests pass\n- README",
      "language": "csharp",
      "hints": ["Start with the modulo cases."]
    }
  }'

curl -b cookies.txt -X POST http://localhost:3000/api/sessions/<id>/starter \
  -F "file=@starter.zip"
```

#### Option C — Service token (no browser)

Set `SESSION_CREATE_TOKEN` in `.env` to a long random string (not the `change-me-*` default). Same JSON body as above:

```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Authorization: Bearer $SESSION_CREATE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"quiz","title":"My quiz","status":"ready","payload":{"questions":[]}}'
```

The new session is assigned to the first user in the database (the seeded admin).

#### Option D — CLI

```bash
# PowerShell example
$env:CREATE_TYPE="quiz"
$env:CREATE_TITLE="Quiz — Docker layers"
$env:CREATE_STATUS="ready"
$env:CREATE_PAYLOAD='{"questions":[{"id":"q1","prompt":"Why does instruction order matter in a Dockerfile?","kind":"text","points":10}]}'
npm run session:create
```

Other `CREATE_*` vars are listed in `.env.example`.

Payload shapes: [`docs/DATA_MODEL.md`](./docs/DATA_MODEL.md). Full HTTP spec: [`docs/API.md`](./docs/API.md).

### 7. Wire Hermes + AI (scheduler and grader)

This repo does **not** embed Hermes or an LLM. It exposes HTTP so an external runner (Hermes workflows, cron, GitHub Actions, a VPS script) can:

1. **Schedule / generate challenges** — create `ready` sessions (and upload a starter zip for code).
2. **Grade** — poll for `grade_requested`, send the payload to your model, post `score` + `feedback`.

```
Hermes (cron / workflow)
        │
        │  Bearer SESSION_CREATE_TOKEN
        ▼
POST /api/sessions  (+ POST /api/sessions/:id/starter for code)
        │
        ▼
Learner in the browser → submit → Request grade
        │
        │  admin cookie (SEED_USER_EMAIL / PASSWORD)
        ▼
Hermes/AI: GET /api/sessions?status=grade_requested
        → GET /api/sessions/:id
        → model returns { score, feedback }
        → POST /api/sessions/:id/grade
```

**Auth is split on purpose.** Middleware only lets the service token through on create + starter upload. Listing, reading answers, and grading need an **admin session cookie**.

| Job | Route | Auth |
|-----|--------|------|
| Create session | `POST /api/sessions` | `Authorization: Bearer $SESSION_CREATE_TOKEN` |
| Upload starter zip | `POST /api/sessions/:id/starter` | same bearer |
| List waiting grades | `GET /api/sessions?status=grade_requested` | admin cookie |
| Read questions + answers | `GET /api/sessions/:id` | admin cookie |
| Submit grade | `POST /api/sessions/:id/grade` | admin cookie |

There is **no webhook** when someone clicks **Request grade**. The grader must poll (Hermes every N minutes is enough). There is **no GET for the submission zip**; quiz grading is fully HTTP. For code, run the grader on the same machine as the app and read `session.submissionPath` under `STORAGE_ROOT` (default `./storage`).

#### Env the worker needs

Put these in Hermes / the VPS job env — not in git:

```bash
export APP_URL="https://drill.yourdomain.com"   # or http://localhost:3000
export SESSION_CREATE_TOKEN="long-random"       # must match the app .env
export SEED_USER_EMAIL="admin@localhost"
export SEED_USER_PASSWORD="your-strong-password"
# plus whatever your LLM gateway uses (Hermes already has this)
```

`SESSION_CREATE_TOKEN` must **not** be the placeholder `change-me-session-create-token` — the app ignores that value.

#### Scheduler job (Hermes creates a quiz)

Have an LLM emit JSON that matches `payload.questions`, then POST it. Example Hermes step / shell:

```bash
# 1. Generate questions (swap for your Hermes LLM node)
QUESTIONS='{
  "questions": [
    {"id":"q1","prompt":"What does docker-compose healthcheck actually wait for?","kind":"text","topic":"docker","points":10},
    {"id":"q2","prompt":"Scoped vs singleton in ASP.NET Core — give one valid use of each.","kind":"text","topic":"csharp","points":10}
  ]
}'

# 2. Create a ready session (assigned to the seeded user)
curl -sS -X POST "$APP_URL/api/sessions" \
  -H "Authorization: Bearer $SESSION_CREATE_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"quiz\",
    \"title\": \"Quiz — $(date +%Y-%m-%d)\",
    \"summary\": \"Generated by Hermes\",
    \"topicTags\": [\"csharp\",\"docker\"],
    \"difficulty\": 3,
    \"timeLimitMinutes\": 40,
    \"status\": \"ready\",
    \"scheduledFor\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
    \"payload\": $QUESTIONS
  }"
```

Code session: same `POST /api/sessions` with `type: "code"` and `brief_markdown` / `rubric_markdown` in `payload`, then:

```bash
curl -sS -X POST "$APP_URL/api/sessions/$SESSION_ID/starter" \
  -H "Authorization: Bearer $SESSION_CREATE_TOKEN" \
  -F "file=@starter.zip"
```

Schedule that workflow daily (or whenever you want a new drill). The learner just opens **Sessions**.

#### Grader job (Hermes + AI)

```bash
# 1. Admin login → cookie jar (grade routes reject the bearer token)
curl -sS -c /tmp/drill-cookies -X POST "$APP_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$SEED_USER_EMAIL\",\"password\":\"$SEED_USER_PASSWORD\"}"

# 2. Poll sessions waiting for review
curl -sS -b /tmp/drill-cookies \
  "$APP_URL/api/sessions?status=grade_requested"
# → { "sessions": [ { "id", "type", "title", ... } ] }

# 3. Load one session (quiz: payload.questions + answerPayload)
SESSION_ID="<id from step 2>"
curl -sS -b /tmp/drill-cookies "$APP_URL/api/sessions/$SESSION_ID"
# → { "session": { "payload": { "questions": [...] }, "answerPayload": { "q1": "..." }, ... } }

# 4. Ask your model for JSON { "score": 0-100, "feedback": "markdown" }
#    Feed it: title, payload (questions or brief/rubric), answerPayload, and any local zip.
#    Example shape of the model output:
#    {"score":82,"feedback":"q1 solid on healthchecks. q2 mixed up scoped vs transient."}

# 5. Write the grade (admin only)
curl -sS -b /tmp/drill-cookies -X POST "$APP_URL/api/sessions/$SESSION_ID/grade" \
  -H "Content-Type: application/json" \
  -d '{"score":82,"feedback":"q1 solid on healthchecks. q2 mixed up scoped vs transient."}'
```

Suggested model instructions (drop into the Hermes LLM node):

- You are grading a practice drill, not writing a new one.
- Use the session `payload` as the rubric (quiz points, or `rubric_markdown` for code).
- Return **only** JSON: `{"score": <0-100 integer>, "feedback": "<markdown>"}`.
- Score is overall 0–100 (this app does not store per-question scores).
- Do not execute untrusted code. For code sessions, review the zip; do not run it unless you sandbox it yourself.

#### Two Hermes workflows (typical)

| Workflow | Trigger | What it does |
|----------|---------|----------------|
| **Create** | Cron (e.g. daily) | LLM writes a quiz or code brief → `POST /api/sessions` (+ starter zip) |
| **Grade** | Cron every 5–15 min | Login → list `grade_requested` → LLM grades → `POST .../grade` |

Keep the learner loop in the browser. Hermes never needs to click **Start** / **Submit**; it only creates work and writes grades.

If create returns **401**, the bearer token does not match the app or is still the `change-me-*` placeholder. If grade returns **401**, you forgot the admin cookie. If grade returns **403**, the seeded user is not `isAdmin`.

---

## Env vars (`.env.example`)

| Var | Description |
|-----|-------------|
| `DATABASE_URL` | Postgres connection string (matches docker-compose) |
| `AUTH_SECRET` | Long random string used to sign session cookies |
| `NEXTAUTH_URL` | Base URL (not used by iron-session, kept for parity) |
| `SEED_USER_EMAIL` / `SEED_USER_PASSWORD` / `SEED_USER_NAME` | Seeded admin account |
| `SESSION_CREATE_TOKEN` | Bearer token for `POST /api/sessions` |
| `STORAGE_ROOT` | Where starter/submission zips live (default `./storage`) |
| `MAX_UPLOAD_BYTES` | Max upload size, default 20 MB |

Do not commit `.env`. Only `.env.example` (placeholder values) is in git.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Next dev server on :3000 |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:seed` | Seed admin user + 2 demo sessions |
| `npm run db:studio` | Prisma Studio |
| `npm run session:create` | CLI to create a session from env/JSON |

## API (summary)

See `docs/API.md` for full spec.

| Method | Route | Auth |
|--------|-------|------|
| POST | `/api/auth/login` | public |
| POST | `/api/auth/logout` | public |
| GET | `/api/auth/me` | session |
| GET | `/api/sessions?status=ready,submitted` | session |
| GET | `/api/sessions/:id` | session |
| POST | `/api/sessions` | admin session or bearer token |
| PATCH | `/api/sessions/:id` | session (status transitions) |
| POST | `/api/sessions/:id/answers` | session (quiz) |
| GET | `/api/sessions/:id/starter` | session (code) |
| POST | `/api/sessions/:id/starter` | admin/token (code) |
| POST | `/api/sessions/:id/submission` | session (code, zip ≤ 20 MB) |
| POST | `/api/sessions/:id/request-grade` | session |
| POST | `/api/sessions/:id/grade` | admin |

## File storage

- `storage/starters/{sessionId}.zip`
- `storage/submissions/{sessionId}/{timestamp}_submission.zip`
- `storage/` is gitignored. Downloads are served through the authenticated route, never as static files.

## Design

Brand kit lives in `design/` (logo, icons, CIP, banners, social, slides). Guidelines: `docs/brand-guidelines.md`. Live tokens: `app/tokens.css`. The app uses IBM Plex Sans / Syne / IBM Plex Mono via `next/font`.

## Docs

| File | Contents |
|------|----------|
| [AGENTS.md](./AGENTS.md) | Instructions for coding agents |
| [docs/PRODUCT.md](./docs/PRODUCT.md) | Product scope |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design |
| [docs/DATA_MODEL.md](./docs/DATA_MODEL.md) | Prisma / JSON shapes |
| [docs/API.md](./docs/API.md) | HTTP API |
| [docs/UI_SCREENS.md](./docs/UI_SCREENS.md) | Screens |
| [docs/BUILD_PLAN.md](./docs/BUILD_PLAN.md) | Build order |
| [docs/ACCEPTANCE.md](./docs/ACCEPTANCE.md) | Done checklist |
| [docs/DEPLOY.md](./docs/DEPLOY.md) | Dokploy / Docker deployment guide |

## Deploy

Deploy to a VPS with **Dokploy** using the included `Dockerfile` — see
[`docs/DEPLOY.md`](./docs/DEPLOY.md) (Postgres service, env vars, persistent volume, TLS, redeploys).
