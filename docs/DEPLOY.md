# DEPLOY.md — Interview Drill on Dokploy (VPS)

Deploy the Next.js app + Postgres on a VPS using **Dokploy**. The repo ships a
production `Dockerfile`; Dokploy builds it and runs the container.

---

## Architecture on the VPS

```
Internet / Tailscale
        │
   [Traefik (Dokploy)]  →  https://drill.yourdomain
        │
   [interview-drill app]   container:3000
        │                        │
        │                        └── volume: /app/storage  (uploads, persists)
        │
   [postgres]   container:5432 (Dokploy Postgres service, NOT exposed publicly)
```

- App and Postgres both run as Dokploy services on the same Docker network.
- Postgres is **not** published to the host/Internet; the app reaches it by service name.
- Traffic is TLS-terminated by Dokploy's Traefik (Let's Encrypt).

---

## 1. Prereqs on the VPS

- VPS with Docker + Docker Compose (Dokploy installer handles this)
- DNS: `A` record for your domain → VPS IP
- Dokploy installed and logged in at `https://<vps-ip>:3000`

---

## 2. Create Postgres (Dokploy service)

In Dokploy: **Services → New → Postgres**.

| Setting | Value |
|---------|-------|
| Image | `postgres:16-alpine` |
| User | `drill` |
| Password | strong random (store it) |
| Database | `interview_drill` |
| Volume | `postgres-data:/var/lib/postgresql/data` |
| Ports | **do not publish** (internal network only) |

Note the service name (e.g. `interview-drill-postgres`) — it becomes the hostname
the app uses for `DATABASE_URL`.

> If you already run Postgres 16 on the VPS, you can skip this and just create
> the `drill` role + `interview_drill` database with `psql`.

---

## 3. Create the app service (Dokploy)

In Dokploy: **Services → New → Application (Dockerfile)**.

| Setting | Value |
|---------|-------|
| Source | Git repository `https://github.com/munyaimanuwel/interview-drill.git` |
| Branch | `master` |
| Build type | `Dockerfile` (repo root) |
| Port | `3000` |

### Env vars (Dokploy → Application → Environment)

```env
DATABASE_URL=postgresql://drill:<postgres-password>@interview-drill-postgres:5432/interview_drill?schema=public
AUTH_SECRET=<openssl rand -hex 32>
SESSION_CREATE_TOKEN=<openssl rand -hex 32>
SEED_USER_EMAIL=manuwel@local.dev
SEED_USER_PASSWORD=<strong password>
SEED_USER_NAME=Manuwel
NODE_ENV=production
MAX_UPLOAD_BYTES=20971520
```

Generate secrets with:
```bash
openssl rand -hex 32
```

### Volume (persistent storage for uploads)

Dokploy → Application → **Volumes**: mount a volume at **`/app/storage`**
(e.g. `interview-drill-storage:/app/storage`).

> Without this, uploaded starter/submission zips are lost on redeploy.

### Health check

The Dockerfile declares a `HEALTHCHECK` on `GET /login`. Dokploy will mark the
service healthy once the app responds.

---

## 4. First deploy

Click **Deploy**. The entrypoint inside the container automatically:

1. `npx prisma migrate deploy` — applies committed migrations
2. `npx tsx prisma/seed.ts` — creates the admin user + 2 demo sessions (idempotent)
3. `npm start` — starts the Next.js server on :3000

The first deploy builds the image (several minutes); subsequent deploys are fast.

---

## 5. Domain + TLS (Dokploy)

Dokploy → Application → **Domains**:

- Add `drill.yourdomain.com`
- Enable HTTPS / Let's Encrypt
- Dokploy's Traefik handles the reverse proxy + TLS termination

---

## 6. After deploy (verify)

- Open `https://drill.yourdomain.com` → redirected to `/login`
- Sign in with the seeded `SEED_USER_EMAIL` / `SEED_USER_PASSWORD`
- Complete the demo quiz, download the code starter, upload a submission
- Smoke-test the service token:

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  -X POST https://drill.yourdomain.com/api/sessions \
  -H "Authorization: Bearer $SESSION_CREATE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"quiz","title":"smoke","status":"ready","payload":{"questions":[]}}'
# → 201
```

---

## 7. Redeploying / updating

Push to `master`, then hit **Deploy** in Dokploy. The entrypoint re-runs
`migrate deploy` (no-op if up to date) and the idempotent seed, then starts.

To add a new migration later:
1. Run `npx prisma migrate dev --name <name>` locally, commit `prisma/migrations/`
2. Push — next Dokploy deploy applies it automatically

---

## Security checklist

- [ ] `AUTH_SECRET`, `SESSION_CREATE_TOKEN`, DB password, seed password are all strong random values (not `change-me-*`)
- [ ] Postgres is not exposed publicly (no published port)
- [ ] App is behind TLS (Dokploy/Traefik)
- [ ] Optional: restrict the Dokploy dashboard + app to Tailscale
- [ ] `storage/` is a mounted volume, not baked into the image
- [ ] Rotate the seed password after first login (or change `.env` and redeploy)

## Env vars reference

| Var | Required | Notes |
|-----|----------|-------|
| `DATABASE_URL` | yes | Postgres URL via Dokploy service hostname |
| `AUTH_SECRET` | yes | Session cookie signing secret |
| `SESSION_CREATE_TOKEN` | yes | Bearer token for `POST /api/sessions` + starter upload |
| `SEED_USER_EMAIL` | seed | Admin email |
| `SEED_USER_PASSWORD` | seed | Admin password |
| `SEED_USER_NAME` | no | Display name |
| `STORAGE_ROOT` | no | Defaults to `/app/storage` in the image |
| `MAX_UPLOAD_BYTES` | no | Default 20 MB |

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| 502 from Dokploy | Check the app log; likely app not healthy yet (first build is slow) |
| "Credentials not valid" on migrate | `DATABASE_URL` user/password mismatch; check Postgres service env |
| Uploads disappear after redeploy | Volume not mounted at `/app/storage` |
| 413 on upload | `MAX_UPLOAD_BYTES` or Dokploy/Traefik body limit too low |
| 401 from `/api/sessions` with token | `SESSION_CREATE_TOKEN` differs between app env and curl header |
