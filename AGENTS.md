# AGENTS.md — Practice Drill (P0)
**For:** Grok Build / coding agents implementing this repo  
**Product:** Personal practice app (quiz + coding challenges)  
**Codename folder:** `practice-drill`

---

## Mission

Build a **single-user** web app where the owner can:

1. Log in  
2. See scheduled / available **drill sessions**  
3. **Quiz:** answer in the browser → submit → request grade  
4. **Code challenge:** download starter pack → solve in local IDE (Cursor/VS on Windows) → upload zip → request grade  

**Out of scope for P0:** multi-tenant SaaS, public signup, running untrusted code in a sandbox, public leaderboards, mobile apps, chat delivery.

---

## Non-negotiables

1. **Boring, maintainable stack** — Next.js App Router + TypeScript + Tailwind + Prisma + PostgreSQL.  
2. **Single user first** — one account (seeded); no open registration.  
3. **Security** — never commit secrets; env via `.env.example`; file uploads size-capped and type-checked (zip only for submissions).  
4. **No remote code execution** of user uploads in P0 — store files only; grading is manual or external agent later.  
5. **Windows IDE friendly** — code tasks must produce a **downloadable starter zip** with clear README.  
6. **Generator-friendly data model** — sessions can be created via API (scheduler later) or admin seed script.  
7. **Do not invent features** beyond docs in `/docs`. Prefer incomplete + correct over clever.

---

## Read these docs first (in order)

| Order | File | Why |
|------:|------|-----|
| 1 | `docs/PRODUCT.md` | What / why / user flows |
| 2 | `docs/ARCHITECTURE.md` | System shape |
| 3 | `docs/DATA_MODEL.md` | Prisma entities |
| 4 | `docs/API.md` | Routes |
| 5 | `docs/UI_SCREENS.md` | Pages to build |
| 6 | `docs/BUILD_PLAN.md` | Task order for implementation |
| 7 | `docs/ACCEPTANCE.md` | Done means |

Then implement per `docs/BUILD_PLAN.md`.

---

## Tech stack (locked for P0)

| Layer | Choice |
|-------|--------|
| Framework | **Next.js 15+** (App Router) + TypeScript |
| UI | Tailwind CSS + simple clean layout (no heavy component library required; shadcn optional) |
| ORM | **Prisma** |
| DB | **PostgreSQL** (Docker Compose for local) |
| Auth | **Credentials** session (Auth.js / NextAuth v5 **or** iron-session + bcrypt) — pick one, document in README |
| Files | Local disk `storage/` (gitignored); paths in DB |
| Package manager | `pnpm` preferred, else `npm` |
| Lint | ESLint + TypeScript strict |

---

## Repo layout (target after build)

```
practice-drill/
  AGENTS.md                 ← this file
  README.md
  docs/
  .env.example
  docker-compose.yml        ← postgres only
  package.json
  prisma/
    schema.prisma
    seed.ts
  src/ or app/              ← Next.js app
  storage/                  ← gitignored
    starters/
    submissions/
  scripts/
    create-session.ts       ← optional CLI to insert a session from JSON
```

---

## Implementation rules for the agent

### DO
- Follow `docs/BUILD_PLAN.md` task order  
- Make `pnpm dev` (or npm) work with Docker Postgres  
- Seed user: email/password from `.env.example` defaults  
- Implement all screens in `docs/UI_SCREENS.md`  
- Write a clear root `README.md` (setup, env, scripts)  
- Keep UI usable on desktop (primary: coding laptop)

### DO NOT
- Add OAuth providers in P0  
- Add Kubernetes / multi-region / Redis unless needed  
- Execute uploaded zips  
- Build a public marketing site  
- Store plaintext passwords  
- Commit `.env` or `storage/**` contents  

### When unsure
- Prefer the simpler option  
- Prefer explicit, boring, typed code  
- Leave a `// TODO(P1):` comment rather than scope creep  

---

## Definition of done (P0)

See `docs/ACCEPTANCE.md`. Short version:

- [ ] Login works  
- [ ] List sessions (quiz + code)  
- [ ] Complete quiz + submit  
- [ ] Download code starter zip  
- [ ] Upload submission zip  
- [ ] Mark “request grade”  
- [ ] Admin/API can create a session (script or POST)  
- [ ] README allows cold start in &lt;15 minutes  

---

## Integration note (later, not P0 build blocker)

Hermes (or any scheduler) can later `POST /api/sessions` with `SESSION_CREATE_TOKEN`, and an AI worker can grade via admin login + `POST /api/sessions/:id/grade`. For P0, a **seed script** or that HTTP API is enough — see README §7.

---

## Owner preferences

- Stack comfort: C#, .NET, Docker, Azure DevOps, Postgres — quizzes/tasks will often target these  
- Deploy target later: Dokploy on VPS; for P0 **local Docker + Next dev** is enough  

**Start building at `docs/BUILD_PLAN.md` Task 1.**


## Post-build review (2026-08-02)

Grok P0 build was reviewed. **Before deploy**, read and implement:

1. `docs/REVIEW.md` — full findings  
2. `docs/FIXES_FOR_GROK.md` — required fixes (middleware service token, Prisma migrations, graded transition auth)

Do not expand product scope. Stop when FIXES_FOR_GROK checklist passes.
