# Interview Drill

Personal interview practice app (P0): in-browser quizzes + downloadable coding challenges for local IDE work.

**For:** Manuwel Munyai — job-hunt interview prep (Senior .NET / DevOps hybrid).  
**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind · Prisma · PostgreSQL · iron-session · bcrypt · local file storage.

---

## Quick start (cold start in < 15 min)

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

> Migrations are committed under `prisma/migrations/`. For local dev you can use `npx prisma migrate dev` (interactive, also regenerates the client); for deploy/cold-start use `npx prisma migrate deploy` (non-interactive).

Open http://localhost:3000 → sign in → complete a quiz → download/upload a code session.

> Windows note: if npm skips devDependencies, you may have `NODE_ENV=production` set globally.
> Run `set NODE_ENV=development&& npm install` (or `$env:NODE_ENV="development"; npm install` in PowerShell) once.

## Env vars (`.env.example`)

| Var | Description |
|-----|-------------|
| `DATABASE_URL` | Postgres connection string (matches docker-compose) |
| `AUTH_SECRET` | Long random string used to sign session cookies |
| `NEXTAUTH_URL` | Base URL (not used by iron-session, kept for parity) |
| `SEED_USER_EMAIL` / `SEED_USER_PASSWORD` / `SEED_USER_NAME` | Seeded admin account |
| `SESSION_CREATE_TOKEN` | Bearer token for `POST /api/sessions` (service/Hermes later) |
| `STORAGE_ROOT` | Where starter/submission zips live (default `./storage`) |
| `MAX_UPLOAD_BYTES` | Max upload size, default 20 MB |

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

## Creating sessions

Three ways (per `docs/ARCHITECTURE.md`):

1. **Seed script** — `npm run db:seed` creates 1 quiz + 1 code session.
2. **Authenticated admin API** — log in as the seeded admin, then:
   ```bash
   curl -X POST http://localhost:3000/api/sessions \
     -H "Cookie: <session cookie>" -H "Content-Type: application/json" \
     -d '{"type":"quiz","title":"My quiz","status":"ready","payload":{"questions":[]}}'
   ```
3. **Service token** — `Authorization: Bearer $SESSION_CREATE_TOKEN` (same body).

For code sessions, upload the starter zip after creating the session:
```bash
curl -X POST http://localhost:3000/api/sessions/<id>/starter \
  -H "Authorization: Bearer $SESSION_CREATE_TOKEN" \
  -F "file=@starter.zip"
```

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

## Status lifecycle

```
draft → ready → in_progress → submitted → grade_requested → graded
         ↘ cancelled
```

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

Deploy to your VPS with **Dokploy** using the included `Dockerfile` — see
[`docs/DEPLOY.md`](./docs/DEPLOY.md) for the full walkthrough (Postgres service,
env vars, persistent volume, TLS, redeploys).

## Changelog P0.1 (post-review fixes)

- **Middleware:** `SESSION_CREATE_TOKEN` bearer now allowed through for `POST /api/sessions` and `POST /api/sessions/:id/starter` (Hermes-cron compatible)
- **Migrations:** initial migration committed under `prisma/migrations/`; production uses `npx prisma migrate deploy`
- **Grading:** only admin can set status `graded` or write `score`/`feedback`; grading happens via `POST /api/sessions/:id/grade`
- **Cleanup:** removed duplicate POST transition handler on `[id]/route.ts` (PATCH only)
- **UI:** sessions list filter includes **Grade requested**
- **Deploy:** added `Dockerfile`, `.dockerignore`, and `docs/DEPLOY.md`

## After P0

- Hermes cron creates sessions via API (18:30 SAST)
- Deploy on Dokploy (Tailscale-only)
- Optional external grading agent
