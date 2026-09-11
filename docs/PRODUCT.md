# PRODUCT.md — Practice Drill P0

## Problem
Practice is split across chat threads, markdown files, and local IDEs. This app is one place to:
- Take **quizzes** in-browser
- Pull **coding challenges** into a local IDE
- Submit work for **review/grading**

## Users
**Exactly one human user** (the seeded admin). No multi-tenant.

## Core loop

### Quiz session
1. Open app → see available sessions
2. Open quiz session
3. Answer questions (text / multi-line)
4. Submit answers
5. Status → `submitted`
6. Optional: click **Request grade** → status `grade_requested` (human/agent grades later; P0 may store placeholder feedback fields)

### Code session
1. Open code session → read brief + rubric in UI
2. **Download starter zip**
3. Work in a local IDE
4. **Upload solution zip**
5. Status → `submitted` / `grade_requested`

### Session generation (out of band)
- P0: seed script or API creates sessions
- Later: Hermes (or any scheduler) POSTs sessions with the service token; an AI worker can poll `grade_requested` and POST grades as admin (see README §7)

## Session types
| type | UI | Artifacts |
|------|-----|-----------|
| `quiz` | Question list + answer fields | answers JSON |
| `code` | Brief + rubric + download/upload | starter zip, submission zip |

## Status lifecycle
```
draft → ready → in_progress → submitted → grade_requested → graded
         ↘ cancelled
```
- `ready` — visible to user
- `in_progress` — user opened it
- `submitted` — answers or zip uploaded
- `grade_requested` — user asked for review
- `graded` — score + feedback filled

## Explicit non-goals (P0)
- Running unit tests on upload
- Real-time multiplayer
- Public leaderboards
- Mobile-first design
- AI grading inside the app (may be external later)

## Success
A full quiz and a full code challenge loop work locally.
