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

### 5. After you request a grade

You wait. Grading is admin-only (`POST /api/sessions/:id/grade`). P0 has no in-app grader UI beyond that API.

Until it is graded you can still change quiz answers or replace the code zip. Once **graded**, the session is closed for edits.

### 6. Create more sessions

The UI does not include a “new session” form. Add drills in one of these ways:

1. **Seed** — `npm run db:seed` upserts the two demo sessions (safe to re-run).
2. **Admin API** (you are already signed in as the seeded admin):

   ```bash
   curl -X POST http://localhost:3000/api/sessions \
     -H "Cookie: <session cookie>" -H "Content-Type: application/json" \
     -d '{"type":"quiz","title":"My quiz","status":"ready","payload":{"questions":[]}}'
   ```

3. **Service token** — `Authorization: Bearer $SESSION_CREATE_TOKEN` with the same JSON body.

For a code session, upload the starter zip after create:

```bash
curl -X POST http://localhost:3000/api/sessions/<id>/starter \
  -H "Authorization: Bearer $SESSION_CREATE_TOKEN" \
  -F "file=@starter.zip"
```

CLI alternative: `npm run session:create` (see env comments in `.env.example`).

Full HTTP spec: [`docs/API.md`](./docs/API.md).

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
