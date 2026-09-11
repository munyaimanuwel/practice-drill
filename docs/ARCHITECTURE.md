# ARCHITECTURE.md — P0

## Overview

```
┌─────────────────────────────────────────────┐
│  Browser (desktop)                          │
│  Next.js UI                                 │
└─────────────────┬───────────────────────────┘
                  │ HTTPS / localhost
┌─────────────────▼───────────────────────────┐
│  Next.js App Router                         │
│  - RSC pages                                │
│  - Route Handlers /api/*                    │
│  - Auth middleware                          │
└───────────┬─────────────────┬───────────────┘
            │                 │
            ▼                 ▼
     ┌─────────────┐   ┌──────────────────┐
     │ PostgreSQL  │   │ Local filesystem │
     │ (Prisma)    │   │ storage/         │
     └─────────────┘   └──────────────────┘
```

## Components

### Web app
- Server components for lists/detail  
- Client components only where needed (forms, upload progress)  
- Server Actions **or** REST route handlers — pick one style and stay consistent (prefer **Route Handlers** for clear API.md)

### Auth
- Session cookie after login  
- Protect all `/app/*` and mutating APIs  
- Public: `/login` only  

### Files
```
storage/
  starters/{sessionId}/starter.zip
  submissions/{sessionId}/{timestamp}_submission.zip
```
- Serve downloads via authenticated route (not public static)  
- Max upload size: **20 MB**  
- Allow only `application/zip` / `.zip`  

### Session creation
- `POST /api/sessions` with header `Authorization: Bearer $SESSION_CREATE_TOKEN`  
  **or** logged-in user with admin flag (seed user is admin)  
- Body includes type, title, payload JSON, optional starter bytes (multipart) later; P0 can accept path or base64 small starter, or create session then `POST /api/sessions/:id/starter`

## Deploy (P0 local)
- `docker compose up -d` → Postgres  
- `pnpm dev` → Next on :3000  

## Future (not P0)
- Dokploy + Traefik  
- Scheduler POSTs sessions with the service token  
- Grade webhook  

## Threat model (minimal)
- Single trusted user  
- Still hash passwords  
- Don’t expose storage dir  
- CSRF: use same-site cookies + Next patterns  
