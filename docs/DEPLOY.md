# DEPLOY.md — Interview Drill (P0)

Production notes. Follow this after Blockers A–C are verified locally.

## Network / exposure

- **Do not expose Postgres publicly.** Bind it to localhost or an internal network only.
- Put the app behind **Tailscale** (recommended) or **Traefik basic auth**.
- No public signup — only the seeded admin account exists.

## Build & run (Docker)

```bash
# 1. Build the image
docker build -t interview-drill:latest .

# 2. Run Postgres (or point DATABASE_URL at your managed Postgres)
docker compose up -d db

# 3. Run migrations + seed once
docker run --rm \
  -e DATABASE_URL=postgresql://drill:drill@host.docker.internal:5432/interview_drill \
  -v drill_storage:/app/storage \
  interview-drill:latest \
  sh -c "npx prisma migrate deploy && npx tsx prisma/seed.ts"

# 4. Run the app
docker run -d --name interview-drill \
  -p 3000:3000 \
  -e DATABASE_URL=postgresql://drill:drill@host.docker.internal:5432/interview_drill \
  -e AUTH_SECRET=<strong random string> \
  -e SESSION_CREATE_TOKEN=<strong random string> \
  -e SEED_USER_EMAIL=manuwel@local.dev \
  -e SEED_USER_PASSWORD=<strong password> \
  -e NODE_ENV=production \
  -v drill_storage:/app/storage \
  interview-drill:latest
```

## Env vars required in prod

| Var | Notes |
|-----|-------|
| `DATABASE_URL` | Point at Postgres reachable from the app container |
| `AUTH_SECRET` | **Must** be a strong random string (session cookie signing) |
| `SESSION_CREATE_TOKEN` | **Must** be a strong random string (service/Hermes API) |
| `SEED_USER_EMAIL` / `SEED_USER_PASSWORD` / `SEED_USER_NAME` | Only used at seed time |
| `STORAGE_ROOT` | Defaults to `./storage`; in Docker mount a volume here |
| `MAX_UPLOAD_BYTES` | Default 20 MB |

> Do **not** reuse the `change-me-*` values from `.env.example` in production.
> Rotate the seed password after first login.

## Migrations

- Migrations are committed under `prisma/migrations/`.
- On release: run `npx prisma migrate deploy` (non-interactive), then `npm run db:seed` if needed.
- Never run `prisma migrate dev` against production.

## Storage volume

- `storage/starters/` and `storage/submissions/` hold the uploaded zips.
- Mount a persistent volume at `/app/storage` — otherwise uploads are lost on container recreate.

## Dokploy / Nixpacks alternative

If using Dokploy with Nixpacks instead of the Dockerfile:
1. Set build command `npm run build`, start command `npm start`.
2. Add `output: "standalone"` is already in `next.config.mjs`; ensure Nixpacks copies `prisma/` and runs `prisma migrate deploy` as a pre-start hook.
3. Mount a persistent volume for `/app/storage` (or the repo's `storage/`).

## Health check

`GET /login` returns 200 (public). For a deeper check, verify `/api/auth/me` returns 401 without a cookie.
