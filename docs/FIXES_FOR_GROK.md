# FIXES_FOR_GROK.md — P0 follow-up (do these next)

**Context:** Human review of your P0 build. Implement **all Blockers**, then Medium items if time. Do not expand product scope.

Read `docs/REVIEW.md` for full notes.

---

## Blocker A — Middleware allows service token

**File:** `middleware.ts`

**Problem:** Bearer `SESSION_CREATE_TOKEN` never reaches route handlers because middleware requires a cookie session for all `/api/*` except login/logout.

**Required behavior:**
- If request has header `Authorization: Bearer <token>` and token equals `process.env.SESSION_CREATE_TOKEN` (non-empty), allow the request through middleware **without** a user session.
- Still require real user session for all other API routes.
- Do not log the token.

**Test:**  
```bash
curl -s -X POST http://localhost:3000/api/sessions \
  -H "Authorization: Bearer $SESSION_CREATE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"quiz","title":"Token test","status":"ready","payload":{"questions":[]}}'
```
Expect **201**, not 401.

Also verify starter upload with same bearer still works:
`POST /api/sessions/:id/starter` with `-F file=@...`

---

## Blocker B — Commit Prisma migrations

**Problem:** No `prisma/migrations/` directory. Production/deploy cannot rely on interactive `migrate dev`.

**Required:**
1. Ensure Postgres is up (`docker compose up -d`).
2. Run: `npx prisma migrate dev --name init` (or `migrate diff` + commit) so an initial migration is created.
3. Commit the entire `prisma/migrations/` tree to git.
4. Update README:
   - Local: `npx prisma migrate dev` (or deploy)
   - Production: `npx prisma migrate deploy` then `npm run db:seed`

**Test:** Wipe DB volume, run `migrate deploy` + seed, app works.

---

## Blocker C — Only admin may set status `graded`

**Files:** `app/api/sessions/[id]/route.ts` (PATCH and any POST transition)

**Problem:** Owner can transition `grade_requested → graded` without being admin.

**Required:**
- Transitions to `graded` **only if** `user.isAdmin`.
- Prefer: non-admins cannot set `graded` via PATCH at all; use existing `POST /api/sessions/:id/grade` for grading.
- Setting `score` / `feedback` remains admin-only (already partly there).

**Test:** As normal flow, user reaches `grade_requested`; user PATCH to graded → **403**. Admin grade endpoint → **200** and status graded.

---

## Medium D — Session list filter includes `grade_requested`

**File:** `app/sessions/page.tsx` (and badges if needed)

Add filter tab **Grade requested** (`grade_requested`).

---

## Medium E — Production deploy notes (docs only if no time to Dockerfile)

Add `docs/DEPLOY.md` with:
- Dockerfile multi-stage (node build + start) **or** Dokploy Nixpacks notes
- Env vars required in prod
- Volume mount for `./storage`
- `prisma migrate deploy` on release
- Recommend Tailscale-only or Traefik basic auth
- Do not expose Postgres publicly

Optional but preferred: working `Dockerfile` + `.dockerignore`.

---

## Medium F — Cleanup (optional)

- Remove duplicate POST transition logic on `[id]/route.ts` if PATCH is enough (API.md).
- Ensure `request-grade` route sets status correctly and is used by UI buttons.

---

## Out of scope (do not do now)

- AI auto-grading  
- Executing uploaded zips  
- Multi-user signup  
- OAuth  
- Changing quiz content / curriculum  

---

## Done when

- [ ] Blockers A–C fixed and manually tested  
- [ ] `npm run build` succeeds  
- [ ] Fresh DB: migrate deploy + seed + login + quiz submit + code download/upload + request grade + admin grade  
- [ ] Bearer create session works  
- [ ] Short note in README “Changelog P0.1” listing fixes  

After this, human will deploy.
