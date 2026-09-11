# Brand Guidelines v1.1

Practice Drill — personal interview practice for Manuwel Munyai.

## Quick Reference

- **Primary Color:** `#2563EB` (drill blue)
- **Secondary Color:** `#7C3AED` (signal violet)
- **Ink:** `#0C1B33`
- **Paper:** `#E8EEF6`
- **Primary Font:** IBM Plex Sans
- **Display Font:** Syne (wordmark and page titles only)
- **Mono Font:** IBM Plex Mono (status, dates, scores)
- **Voice:** Direct, calm, specific

## 1. Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Drill Blue | `#2563EB` | rgb(37, 99, 235) | Primary actions, links, quiz accent |
| Signal Violet | `#7C3AED` | rgb(124, 58, 237) | Request grade, gradient end |

### Neutrals

| Name | Hex | Usage |
|------|-----|-------|
| Ink | `#0C1B33` | Text, dark panels, lockup on light |
| Paper | `#E8EEF6` | Page background |
| Surface | `#FFFFFF` | Cards, ledger rows, inputs |
| Muted | `#5B6B80` | Secondary text |
| Line | `#C9D6E8` | Borders, rules |

### Status

| Token | Use |
|-------|-----|
| Info / quiz | Blue soft fill |
| Ready / code | Green soft fill |
| In progress | Amber soft fill |
| Grade requested | Violet soft fill |
| Error / cancelled | Red soft fill |

Gradient (logo tiles, spine, CTAs): **135° blue → violet**.

Source of truth in code: `app/tokens.css` (primitive → semantic → component). Mirror: `design/tokens.css`.

### Accessibility

- Ink on paper exceeds WCAG AA.
- White on drill blue and white on signal violet meet AA for buttons.
- Do not put muted text on muted fills.

## 2. Typography

### Font Stack

```css
--font-display: Syne, sans-serif;          /* wordmark, page titles */
--font-sans: "IBM Plex Sans", sans-serif;  /* UI and body */
--font-mono: "IBM Plex Mono", monospace;   /* status, dates, scores */
```

Loaded in `app/layout.tsx` via `next/font`.

### Type Scale

| Element | Font | Weight | Size | Line height |
|---------|------|--------|------|-------------|
| Display | Syne | 600 | 32–40px | 1.15 |
| Page title | Syne | 600 | 24px | 1.2 |
| Body | IBM Plex Sans | 400 | 16px | 1.5 |
| UI / labels | IBM Plex Sans | 500 | 14px | 1.4 |
| Meta | IBM Plex Mono | 400 | 11–12px | 1.4 |

Syne is reserved for the wordmark and one title per screen. Do not set body copy in Syne.

## 3. Logo Usage

The mark is a **range target**: outer ring, four crosshair ticks, inner ring, diamond at center. It means precision practice — hit the question, not a generic checkmark.

### Variants (`design/logo/`)

| File | Use |
|------|-----|
| `practice-drill-mark.svg` | App icon, favicon, CIP reverse |
| `practice-drill-mark-standalone.svg` | Transparent ring mark on photos |
| `practice-drill-mark-mono.svg` | Single-color (currentColor) |
| `practice-drill-mark-alt.svg` | Code-session accent (prompt + chevron) |
| `practice-drill-lockup.svg` | Horizontal lockup on light |
| `practice-drill-lockup-dark.svg` | Horizontal lockup on ink |

In the app, render `BrandMark` / `BrandLockup` (`components/brand-mark.tsx`) so the wordmark uses Syne. Do not use the SVG lockup text as the live UI wordmark.

v1 bullseye-check is archived at `design/logo/archive/`. Raster explorations live in `design/logo/explorations/` — SVG is the production source.

### Clear space

Minimum clear space = width of the inner diamond. Do not crowd the ticks.

### Minimum size

- Digital mark: 24px
- Favicon: 16px (ticks may drop; ring + diamond must remain)
- Print lockup: 25mm wide

### Don'ts

- Don't replace the diamond with a checkmark
- Don't recolor the tile gradient outside blue → violet
- Don't add drop shadows or 3D
- Don't rotate or skew
- Don't set the wordmark in IBM Plex on marketing pieces (use Syne)

## 4. Voice & Tone

### Brand personality

**Direct:** Say the action. Sign in, submit, request grade.  
**Calm:** Interview prep is already stressful; the UI is not.  
**Specific:** Name the artifact (starter zip, solution folder), not the platform.

### Voice chart

| Trait | We are | We are not |
|-------|--------|------------|
| Direct | "Upload submission (.zip)" | "Drop your masterpiece" |
| Calm | "Grade requested — waiting for review." | "Awesome job!!!" |
| Specific | "Run the seed script or create one via the API." | "Get started on your journey" |

### Tone by context

| Context | Tone | Example |
|---------|------|---------|
| Login | Quiet, practical | "Use the seeded account from the README." |
| Empty list | Direction | "No sessions yet. Run the seed script or create one via the API." |
| Error | Cause + next step | "Network error. Is the server running?" |
| Success | Factual | "Answers submitted." |

### Prohibited

- Emoji as icons
- Motivational coaching copy
- "Ninja", "rockstar", "crush the interview"
- ALL-CAPS eyebrows on UI chrome

## 5. Imagery & UI

### Product chrome

- **Spine:** 6px vertical gradient rail on the left of authenticated screens and the login brand panel.
- **Sessions:** briefing ledger (ruled rows), not a stack of identical cards.
- **Difficulty:** five rising ticks, not "Difficulty 3/5" as the primary display.
- **Status:** IBM Plex Mono, sharp badges (not pills).

### Icons

24px outlined, `stroke="currentColor"`, 2px stroke. Set in `design/icons/` and `components/icons.tsx`.

### Layout

Desktop-first. Content max width 64rem. Mobile stacks the ledger meta under the title.

## 6. Assets

| Path | What |
|------|------|
| `design/logo/` | Marks and lockups |
| `design/icons/` | UI icon set |
| `design/cip/` | Business card, letterhead, envelope, email signature |
| `design/banners/` | Hero, LinkedIn, X header, IG story |
| `design/social/` | IG / X / LinkedIn posts |
| `design/slides/` | Overview deck |
| `app/tokens.css` | Live tokens |
| `app/icon.svg` | Favicon |
