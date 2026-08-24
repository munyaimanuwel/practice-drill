# Interview Drill — Brand & Design Assets

Hand-crafted brand kit built from the app's design tokens (`app/tokens.css` → copied here as `tokens.css`). No AI generation used; everything is SVG/HTML and re-exportable.

## Palette (source of truth: `app/tokens.css`)

| Token | Value | Use |
|-------|-------|-----|
| Primary | `#2563EB` (blue-600) | Actions, links, quiz accents |
| Secondary | `#9333EA` (purple-600) | "Request grade", gradient ends |
| Foreground | `#0F172A` (slate-900) | Text, inverted surfaces |
| Muted | `#64748B` (slate-500) | Secondary text |
| Gradient | blue → purple 135° | Logo tiles, CTAs, banners |

## Logo (`logo/`)

- `interview-drill-mark.svg` — **primary**: bullseye + drill-check in gradient tile ("progress through practice")
- `interview-drill-mark-alt.svg` — alt: terminal prompt `>_`
- `interview-drill-lockup.svg` / `-dark.svg` — horizontal wordmark lockups
- `preview.html` — size/favicon test gallery (open in browser)

## Icons (`icons/`)

8 UI icons, 24px outlined, `stroke="currentColor"` (inherit any token color):
`quiz, code, upload, download, grade, sessions, logout, user` + `preview.html`

## CIP (`cip/`)

Business card (front/back) and A4 letterhead mockups — `*.html` + `*.png` exports.

## Banners (`banners/`)

- `hero-1920x600` — website hero
- `linkedin-1584x396` — LinkedIn header

## Social (`social/`)

IG post 1080², X post 1200×675, LinkedIn post 1200×627 — `*.html` + `*.png`.

## Slides (`slides/overview-deck.html`)

8-slide overview deck. Imports `tokens.css`, all colors via `hsl(var(--token))`, Chart.js progress chart reading brand vars at runtime, keyboard ← → / click nav, progress bar.

## Re-exporting PNGs

```powershell
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" `
  --headless --disable-gpu --no-sandbox --hide-scrollbars `
  --screenshot=<out.png> --window-size=<W>,<H> file:///<abs-path-to-html>
```

Note: use old `--headless` (not `--headless=new`) with this Edge version.
