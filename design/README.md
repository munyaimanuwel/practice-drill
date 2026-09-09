# Interview Drill — Brand & Design Assets

Identity kit for the personal interview practice app. Production marks are SVG. Tokens live in `app/tokens.css` (copied here as `tokens.css`). Shared CSS variables and fonts: `_brand.css`.

Guidelines: [`docs/brand-guidelines.md`](../docs/brand-guidelines.md).

## Palette

| Token | Value | Use |
|-------|-------|-----|
| Drill Blue | `#2563EB` | Actions, links, quiz |
| Signal Violet | `#7C3AED` | Request grade, gradient end |
| Ink | `#0C1B33` | Text, dark panels |
| Paper | `#E8EEF6` | Page background |
| Gradient | blue → violet 135° | Logo tile, spine, CTAs |

## Logo (`logo/`)

- `interview-drill-mark.svg` — **primary tile**: range target (ring, crosshair, diamond)
- `interview-drill-mark-standalone.svg` — transparent ring mark
- `interview-drill-mark-mono.svg` — `currentColor`
- `interview-drill-mark-alt.svg` — code prompt accent
- `interview-drill-lockup.svg` / `-dark.svg` — horizontal lockups
- `preview.html` — size gallery
- `archive/` — v1 bullseye-check
- `explorations/` — raster AI studies (SVG is source of truth)

## Icons (`icons/`)

12 UI icons, 24px, `currentColor`:
`quiz, code, upload, download, grade, sessions, logout, user, start, save, clock, check`

Mirrored in `components/icons.tsx`.

## CIP (`cip/`)

Business card, A4 letterhead, envelope, email signature — `*.html` (+ PNG where exported).

## Banners (`banners/`)

| File | Size |
|------|------|
| `hero-1920x600` | Website hero |
| `linkedin-1584x396` | LinkedIn cover |
| `x-header-1500x500` | X header |
| `ig-story-1080x1920` | Instagram story |

## Social (`social/`)

IG post 1080², X post 1200×675, LinkedIn post 1200×627.

## Slides (`slides/overview-deck.html`)

8-slide overview. Keyboard ← → / click. Chart.js reads brand tokens at runtime.

## Re-exporting PNGs

```powershell
function Export-Banner($html, $png, $w, $h) {
  $abs = (Resolve-Path $html).Path -replace '\\','/'
  & "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" `
    --headless --disable-gpu --no-sandbox --hide-scrollbars `
    --screenshot=$png --window-size=$w,$h "file:///$abs"
}
```

Use old `--headless` (not `--headless=new`) with this Edge version.
