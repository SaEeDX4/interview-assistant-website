# Interview Assistant — Color & Contrast Standard (Step 12)

**Status:** in force from Step 12 (2026-11-14). Every color in
`website/styles.css` must come from the token set below.
`tests/test-step12.js` enforces it automatically.

**Basis:** WCAG 2.2 AA (1.4.3 Contrast Minimum 4.5:1 for normal text, 3:1
for large text and UI components), Apple HIG (semantic colors, one token
per role), Material color roles.

## 1. The tokens — the only colors in the file

All tokens live in `:root`. Nothing outside `:root` may contain a hex
color; nothing may invent a new hue.

| Token | Value | Role |
|-------|-------|------|
| `--bg` | `#0a0c10` | page background |
| `--bg-soft` | `#0e1218` | soft background (gradient end, header) |
| `--surface` | `#12161e` | card background |
| `--surface-2` | `#171d28` | raised surface (chips, badges, inputs) |
| `--surface-mid` | `#11151d` | gradient mid-stop between surface-2 and bg-soft |
| `--border` | `#232b38` | borders |
| `--border-strong` | `#32405a` | strong borders |
| `--text` | `#f2f4f8` | primary text |
| `--muted` | `#9aa3b2` | secondary text |
| `--muted-2` | `#8d97a8` | tertiary text (docs/29: `#6b7484` was 3.84:1 — failed AA) |
| `--accent` | `#7c6cff` | primary violet (buttons, links, highlights) |
| `--accent-hover` | `#8d80ff` | primary button hover |
| `--accent-light` | `#cfc8ff` | light lavender text (badges, link hover) |
| `--accent-soft` | `rgba(124,108,255,.14)` | violet tint background |
| `--accent-2` | `#2dd4bf` | teal (live, now, success states) |
| `--accent-2-light` | `#7df0dd` | light teal text (badges, meter gradient) |
| `--coach` | `#f5b94e` | amber (Coach mode) |
| `--coach-light` | `#f8cd7d` | light amber text (badges) |
| `--good` | `#34d399` | green (good states) |
| `--warn` | `#fbbf24` | amber (warnings) |
| `--warn-light` | `#fcd34d` | light amber text (badges) |
| `--danger` | `#f87171` | red text (the "no" markers) |
| `--danger-light` | `#fca5a5` | light red text (headings) |
| `--danger-soft` | `rgba(248,113,113,.14)` | red tint background |
| `--focus` | `#a99fff` | focus outline |
| `--skeleton` | `#2a3547` | skeleton loading bars |
| `--app-bg` | `#0F1115` | the app window background (Step 21) |
| `--app-surface` | `#161920` | the app cards |
| `--app-surface-2` | `#1D212A` | the app raised surfaces (pill, chips, inputs) |
| `--app-surface-3` | `#252A35` | the app meter / progress track |
| `--app-border` | `#2A303C` | the app borders |
| `--app-text` | `#ECEEF2` | the app primary text |
| `--app-dim` | `#A3A9B5` | the app secondary text |
| `--app-faint` | `#8B92A0` | the app tertiary text (card labels) |
| `--app-accent` | `#5B8DEF` | the app blue accent (dots, coach keywords) |
| `--app-accent-strong` | `#3567D0` | the app primary button fill (Start) |
| `--app-accent-soft` | `#335B8DEF` | the app accent tint (Concise badge) |
| `--app-listening` | `#3DD68C` | the app listening green (pill, meter, checks) |
| `--app-thinking` | `#F2B44C` | the app thinking amber (pill, profile-gap) |
| `--app-error` | `#EF6B6B` | the app error red |
| `--shadow-card` / `--shadow-lift` | black alpha | shadows only |

**Dark text on bright backgrounds is always `var(--bg)`** — one dark text
color everywhere (buttons, active toggles, badges, range thumb border).
The old second dark `#221a05` on Coach is gone: `#0a0c10` on Coach is
11.12:1, visually identical.

## 2. Contrast — measured, not eyeballed

Every text/background pair on the site is **≥ 4.5:1** (WCAG AA for normal
text). Measured with the WCAG relative-luminance formula (the test
recomputes them). The tightest pairs:

| Pair | Ratio |
|------|-------|
| dark text on accent (primary buttons) | 5.08:1 |
| accent text on bg | 5.08:1 |
| muted-2 on surface-2 (tertiary text on raised cards) | 5.73:1 |
| muted-2 on surface | 6.15:1 |
| muted on surface-2 | 6.64:1 |
| muted-2 on bg | 6.64:1 |
| muted on bg | 7.69:1 |
| text on bg | 17.77:1 |
| app text on app Start button (`--app-text` on `--app-accent-strong`) | 4.52:1 |
| app accent on app surface-2 (coach keywords, badge) | 4.99:1 |
| app faint on app surface-2 (pill, labels) | 5.15:1 |

The `--app-*` tokens are the real app's values (`Themes/Theme.xaml`), used
**only** inside `.app-window` depictions — the hero mockup, the scroll-story
window and snapshots, and the demo's bullets/coach keywords (Step 21). The
site outside the window keeps its violet brand. The app tokens are never
used for site text, buttons or chrome.

Badge text sits on tinted backgrounds (`.12`–`.16` alpha over bg); the
composite is only slightly lighter than bg, so badge ratios stay ≥ 11:1.
The focus outline (`--focus` on bg, 8.47:1) is a 3px ring, not text.

## 3. Tints — alpha overlays of token hues only

`rgba()` values may use **only** these hues: accent `(124,108,255)`,
teal `(45,212,191)`, coach `(245,185,78)`, red `(248,113,113)`, white,
black, and the four surface tones `(10,12,16)`, `(14,18,24)`,
`(18,22,30)`, `(23,29,40)`. A tint is an alpha overlay of a token, never
a new color. (The file has ~40 rgba values; they are all overlays of
token hues — the standard locks that in so no new hue can creep in.)

## 4. Audit log

- **Step 12** inventoried every color in `styles.css` and computed the
  contrast of every text/background pair. Findings:
  - **No contrast failures.** Every text color passes AA on every
    background it sits on (tightest: 5.08:1, dark-on-accent and
    accent-on-bg). The old failing `#6b7484` (4.15:1) survives only in
    the `:root` comment that documents its replacement.
  - **P1 — no red token:** the whole red scale was hard-coded in 6 places
    (`rgba(248,113,113,…)` ×4, `#fca5a5`, `#f87171`). Added
    `--danger`, `--danger-light`, `--danger-soft`.
  - **P1 — near-duplicate light variants:** `#c6bdff` vs `#cfc8ff` (two
    lavenders), `#7df0dd` vs `#5eead4` (two light teals), `#f8cd7d` vs
    `#fcd34d` (two light ambers), `#8d80ff` vs `#7c6cff` (hover violet).
    Consolidated into `--accent-light`, `--accent-2-light`,
    `--coach-light`, `--warn-light`, `--accent-hover`.
  - **P1 — hard-coded surfaces:** `#11151d` (gradient mid-stop) and
    `#2a3547` (skeleton) had no token; gradient used literal
    `#171d28`/`#0e1218` instead of `var()`. Added `--surface-mid`,
    `--skeleton`; gradient now uses `var()`. The Pro meter gradient ended
    in the focus color `#a99fff` — now `var(--accent-light)`, mirroring
    the trial meter (accent-2 → accent-2-light).
  - **P1 — two dark text colors:** `#0a0c10` (7×) and `#221a05` (1×).
    All are now `var(--bg)`.
  - 10 new tokens; 21 replacements; zero visual change (every new token
    equals the value it replaces, except `#c6bdff`→`#cfc8ff`,
    `#5eead4`→`#7df0dd`, `#221a05`→`#0a0c10`, `#a99fff`→`#cfc8ff` in the
    Pro meter — all imperceptible).
- **Method:** full color inventory + WCAG contrast computation for every
  pair + fresh live re-verification after the fix.
