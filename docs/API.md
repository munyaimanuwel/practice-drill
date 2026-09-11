# API.md — P0 routes

Base: same origin. JSON unless multipart.

Auth: session cookie for browser.  
Service: `Authorization: Bearer $SESSION_CREATE_TOKEN` for create-only routes (optional if admin session used).

## Auth

### POST /api/auth/login
```json
{ "email": "admin@localhost", "password": "..." }
```
→ Set session cookie; `{ "user": { "id", "email", "name" } }`

### POST /api/auth/logout
→ Clear session

### GET /api/auth/me
→ user or 401

## Sessions

### GET /api/sessions
Query: `?status=ready,in_progress,submitted` optional  
→ list for current user, newest first  
```json
[{ "id", "type", "status", "title", "summary", "difficulty", "timeLimitMinutes", "scheduledFor", "createdAt", "submittedAt", "score" }]
```

### GET /api/sessions/:id
→ full session including `payload` (not huge files). Include flags: `hasStarter`, `hasSubmission`.

### POST /api/sessions
Auth: admin session **or** bearer token  
```json
{
  "type": "quiz" | "code",
  "title": "string",
  "summary": "string",
  "topicTags": ["csharp","docker"],
  "difficulty": 3,
  "timeLimitMinutes": 40,
  "scheduledFor": "2026-08-01T18:30:00+02:00",
  "status": "ready",
  "payload": { }
}
```
→ created session

### PATCH /api/sessions/:id
User can set status transitions they own:  
- `ready` → `in_progress` (open)  
- `in_progress` → `submitted` (after answers/upload)  
- `submitted` → `grade_requested`  

Admin can set `graded` + score + feedback.

### POST /api/sessions/:id/answers
Quiz only  
```json
{ "answers": { "q1": "...", "q2": "..." } }
```
→ saves answerPayload; may set status `submitted` if `finalize: true`

```json
{ "answers": { }, "finalize": true }
```

### GET /api/sessions/:id/starter
Code only — stream zip (auth required). 404 if none.

### POST /api/sessions/:id/starter
Admin/token — multipart file `file` (.zip)  
→ stores starterPath

### POST /api/sessions/:id/submission
Code only — multipart `file` (.zip), max 20MB  
→ stores submissionPath; status `submitted`

### POST /api/sessions/:id/request-grade
→ status `grade_requested`

### POST /api/sessions/:id/grade
Admin only  
```json
{ "score": 85, "feedback": "markdown..." }
```
→ status `graded`

## Errors
Standard: `{ "error": "message" }` with 400/401/403/404/413.

## P0 omitted
- Pagination cursors (OK to return last 50)  
- Websockets  
- Webhooks  
