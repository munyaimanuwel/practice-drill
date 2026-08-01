# UI_SCREENS.md — P0

Desktop-first. Clean, dense, readable. Dark or light OK — pick one and stay consistent.

## Routes

| Path | Auth | Purpose |
|------|------|---------|
| `/login` | public | Email + password |
| `/` | yes | Redirect to `/sessions` |
| `/sessions` | yes | List sessions |
| `/sessions/[id]` | yes | Session detail (quiz or code) |
| `/sessions/new` | admin | Optional simple form to create session (or rely on seed only) |

## /login
- Email, password, Submit  
- Error alert on failure  
- Redirect to `/sessions`

## /sessions
**Header:** app name “Interview Drill”, user name, Logout  

**List:**
- Filters: All | Ready | In progress | Submitted | Graded (simple tabs or select)
- Cards/rows: title, type badge (Quiz/Code), status badge, difficulty, scheduled/created date, score if graded  
- Click → detail  

**Empty state:** “No sessions yet. Run seed or create via API.”

## /sessions/[id] — Quiz
- Title, topics, time limit, status  
- Button: Start (if ready) → in_progress  
- For each question: prompt + textarea  
- Save draft (optional PATCH answers without finalize)  
- **Submit answers**  
- **Request grade** (if submitted)  
- If graded: show score + feedback markdown  

## /sessions/[id] — Code
- Title, topics, time limit, status  
- Render `brief_markdown` and `rubric_markdown`  
- **Download starter** (if hasStarter)  
- Instructions: “Open in Cursor/VS, unzip, solve, zip the solution folder, upload.”  
- **Upload submission** (file input)  
- **Request grade**  
- If graded: score + feedback  

## UX rules
- Disable double-submit  
- Show upload progress or spinner  
- Confirm before finalize submit if easy  
- No emoji spam; professional tone  

## Accessibility baseline
- Labels on inputs  
- Keyboard-focusable buttons  
- Contrast readable  
