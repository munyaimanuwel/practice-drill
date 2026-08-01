# BUILD_PLAN.md — implement in order

> For Grok Build: complete each task before the next. Commit mentally after each green check.

## Task 1: Scaffold
- Create Next.js TS app in repo root (or `apps/web` if you must — **prefer root**)  
- Tailwind  
- ESLint  
- `.gitignore`: node_modules, .env, storage, .next  
- Root README skeleton  

## Task 2: Docker Postgres + Prisma
- `docker-compose.yml` with Postgres 16, port 5432, volume  
- Prisma schema per DATA_MODEL.md  
- Migrate  
- Seed user from env  

## Task 3: Auth
- Login/logout/me  
- Password hash bcrypt  
- Middleware protect `/sessions` and APIs except login  

## Task 4: Session CRUD API
- list, get, create (admin/token), patch status  
- Validate with zod  

## Task 5: Quiz flow API + UI
- answers endpoint  
- Quiz detail page with form  
- Submit + request grade  

## Task 6: Code flow files
- storage helpers  
- starter upload (admin) + download  
- submission upload  
- Code detail page  

## Task 7: Seed demo data
- 1 quiz session (5 questions, C# + Docker mix)  
- 1 code session with a **tiny** C# console or webapi starter zip checked into `fixtures/sample-starter.zip` and copied on seed  

## Task 8: Polish
- Status badges  
- Empty/error states  
- README full setup  
- Run through ACCEPTANCE.md checklist  

## Task 9 (optional P0)
- `/sessions/new` admin form for quick manual session create  

## Verification commands (document actual ones you use)
```bash
docker compose up -d
cp .env.example .env
pnpm install
pnpm prisma migrate dev
pnpm prisma db seed
pnpm dev
```
Open http://localhost:3000 → login → complete quiz → download/upload code session.
