# DATA_MODEL.md — Prisma sketch

## Enums

```prisma
enum SessionType {
  quiz
  code
}

enum SessionStatus {
  draft
  ready
  in_progress
  submitted
  grade_requested
  graded
  cancelled
}
```

## Models

### User
| field | type | notes |
|-------|------|--------|
| id | uuid | pk |
| email | string | unique |
| name | string | |
| passwordHash | string | bcrypt |
| isAdmin | boolean | default true for seed user |
| createdAt | datetime | |

### DrillSession
| field | type | notes |
|-------|------|--------|
| id | uuid | pk |
| type | SessionType | quiz \| code |
| status | SessionStatus | |
| title | string | e.g. "Quiz — C# & Docker" |
| summary | string? | one-liner |
| topicTags | string[] | or Json |
| difficulty | int | 1–5 |
| timeLimitMinutes | int | default 45 |
| scheduledFor | datetime? | when cron intended |
| payload | Json | see below |
| starterPath | string? | relative storage path |
| submissionPath | string? | |
| score | float? | 0–100 or 0–5 — pick **0–100** for UI |
| feedback | string? | markdown |
| gradeRubricNotes | string? | internal |
| createdAt | datetime | |
| updatedAt | datetime | |
| openedAt | datetime? | |
| submittedAt | datetime? | |
| gradedAt | datetime? | |
| userId | uuid | fk → User (owner) |

### QuizAnswer (optional normalize; payload-only is OK for P0)

**P0 preference:** store quiz questions inside `DrillSession.payload` and answers in `DrillSession.answerPayload` Json field to reduce joins.

Add:

| field | type |
|-------|------|
| answerPayload | Json? |

## payload shapes

### Quiz payload
```json
{
  "questions": [
    {
      "id": "q1",
      "prompt": "Explain async/await vs Task.Run for I/O-bound work.",
      "kind": "text",
      "topic": "csharp",
      "points": 10
    }
  ]
}
```

### Code payload
```json
{
  "brief_markdown": "## Task\nBuild a minimal API that...",
  "rubric_markdown": "- Compiles\n- Handles errors\n- README",
  "language": "csharp",
  "hints": ["optional"]
}
```

### answerPayload (quiz)
```json
{
  "q1": "answer text...",
  "q2": "..."
}
```

## Indexes
- DrillSession(userId, status, scheduledFor)  
- DrillSession(status, createdAt)  
