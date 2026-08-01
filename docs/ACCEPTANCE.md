# ACCEPTANCE.md — P0 done checklist

## Setup
- [ ] Fresh clone: follow README only; app runs  
- [ ] `.env.example` documents all vars  
- [ ] `docker compose up -d` starts Postgres  
- [ ] Seed creates admin user + 2 demo sessions  

## Auth
- [ ] Wrong password fails  
- [ ] Login succeeds and reaches `/sessions`  
- [ ] Logout works  
- [ ] Unauthenticated `/sessions` redirects to login  

## Quiz
- [ ] Open ready quiz → status becomes in_progress (or on first edit)  
- [ ] Can answer all questions  
- [ ] Submit sets status submitted and persists reload  
- [ ] Request grade sets grade_requested  
- [ ] Admin grade endpoint (or seed script) can set graded + feedback visible  

## Code
- [ ] Download starter returns zip  
- [ ] Zip opens with README inside  
- [ ] Upload submission zip succeeds  
- [ ] Oversized or non-zip rejected  
- [ ] Request grade works  

## API create
- [ ] POST session with admin or token creates ready session visible in list  

## Quality
- [ ] `tsc` / build passes (`pnpm build`)  
- [ ] No secrets in git  
- [ ] storage/ gitignored  

## Explicitly NOT required
- [ ] AI auto-grade  
- [ ] Executing uploaded code  
- [ ] Deploy to Dokploy  
- [ ] Mobile layout perfection  
