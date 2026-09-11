# P0 Code Review — Practice Drill
**Date:** 2026-08-02  
**Reviewer:** J.A.R.V.I.S. (read-only audit of Grok Build on `D:\Projects\Github\practice-drill`)  
**Verdict:** **Mostly good for P0 — fix blockers below before production deploy.**

---

## What's solid (matches spec)

| Area | Status |
|------|--------|
| Stack | Next 15, TS, Tailwind, Prisma, Postgres, iron-session, bcrypt, zod |
| Data model | `User` + `DrillSession`, enums, indexes, payload/answerPayload JSON |
| Auth API | login / logout / me |
| Session API | list, get, create, patch, answers, starter GET/POST, submission, request-grade, grade |
| UI routes | `/login`, `/`→sessions, `/sessions`, `/sessions/[id]` |
| Components | login-form, quiz-form, code-form, badges, markdown, logout |
| Seed | Admin user + quiz (5 Qs C#/Docker) + code (StringCalculator fixture) + starter zip build |
| Fixtures | Real C# solution under `fixtures/sample-starter/` |
| Scripts | `create-session.ts`, package.json db scripts |
| docker-compose | Postgres 16 |
| README | Cold start documented |
| .gitignore | `.env`, `storage/`, `node_modules` |

Grok covered the BUILD_PLAN spine well.

---

## Blockers (must fix)

### 1. Middleware blocks service-token API
**File:** `middleware.ts`

All `/api/*` except login/logout require a browser session cookie **before** route handlers run.  
So `Authorization: Bearer $SESSION_CREATE_TOKEN` never reaches `POST /api/sessions` or `POST .../starter`.

**Fix:** If `Authorization: Bearer` matches `SESSION_CREATE_TOKEN`, allow through (or only for POST `/api/sessions` and POST `/api/sessions/*/starter`).

### 2. No Prisma migrations committed
**Dir:** `prisma/` has only `schema.prisma` + `seed.ts` — **no `migrations/`**.

`prisma migrate dev` is interactive and fragile for deploy.  

**Fix:** Generate and commit an initial migration, e.g.:
```bash
npx prisma migrate dev --name init
```
Ensure `prisma/migrations/**` is in git. Document `npx prisma migrate deploy` for production.

### 3. Non-admin can self-transition to `graded`
**File:** `app/api/sessions/[id]/route.ts` (PATCH/POST)

Allowed transitions include `grade_requested → graded` for **any session owner**. Spec: only **admin** (or grade endpoint) sets `graded`.

**Fix:** If `status === "graded"` (or score/feedback set), require `user.isAdmin`. Prefer grading only via `POST .../grade`.

---

## Medium issues (should fix before deploy)

### 4. Service-token create assigns wrong user if multi-user later
`POST /api/sessions` with token uses `user?.id ?? (await prisma.user.findFirst())!.id` — OK for single-user P0; document or require `userId` in body for a scheduler.

### 5. Optional `/sessions/new` UI missing
Spec listed as optional Task 9 — not present. Seed + API are enough for P0; optional for UX.

### 6. Deploy artifacts missing
No `Dockerfile`, no Dokploy compose, no production notes (`NODE_ENV`, volume for `storage/`). Fine for local P0; **block production** until added (can be a follow-up doc task).

### 7. Filter tabs omit `grade_requested` / `draft`
Sessions list filters: All / Ready / In progress / Submitted / Graded — missing **grade_requested** (and draft). Easy UI fix.

### 8. `readStarterZip` vs `starterPath` in DB
Download uses `storage/starters/{id}.zip` via helper; seed writes same path. Good.  
If admin uploads starter, path is updated — still helper-based. OK.

### 9. Duplicate POST handler on `[id]/route.ts`
PATCH and POST both implement the same transition logic — redundant; keep PATCH only per API.md (harmless).

### 10. AUTH_SECRET fallback in code
Dev fallback secret exists if env is default — OK for local; **production must set strong AUTH_SECRET** (document in deploy).

---

## Security notes (deploy)

- [ ] Do not commit `.env` (gitignored — good)  
- [ ] Rotate seed password from `change-me-now`  
- [ ] Put app behind a private network or auth at Traefik  
- [ ] Persist `storage/` volume  
- [ ] `SIGNUPS` N/A (no registration) — good  

---

## Acceptance checklist (from docs vs code)

| Criterion | Likely |
|-----------|--------|
| Login / logout / me | Yes |
| List + detail sessions | Yes |
| Quiz answer + submit | Yes |
| Code download starter | Yes |
| Code upload zip + size/type check | Yes |
| Request grade | Yes (verify request-grade route) |
| Admin grade | Yes |
| API create session | **Broken for bearer until middleware fix** |
| Seed demo data | Yes |
| `pnpm/npm build` | Not run in this review — Grok should verify |
| Migrations for cold deploy | **Missing** |

---

## Recommendation

1. **Do not deploy to public internet yet.**  
2. Prompt Grok with `docs/FIXES_FOR_GROK.md` (same folder).  
3. After fixes: local `migrate deploy` + seed + manual click-through, then Dokploy.

**Overall:** ~85% P0 complete; three real blockers (middleware token, migrations, graded transition).
