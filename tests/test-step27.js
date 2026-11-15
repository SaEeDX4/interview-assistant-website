/* Step 27 — Replay aligned with the chips, sticky bar that can never
   overlap its dismiss, and the privacy note rebuilt as a trust block.
   Run: node tests/test-step27.js
   (from ~/workspace/interview-assistant-website).
   (1) Replay: the BUTTON stays 44×44 (the Step 11 target) but its visible
   box is 36×30 — the same height as the chips, the same width as the blue
   send button — right-aligned inside the button (Step 28; centred it sat
   4px left of the send button's centre, measured live at 390px), so the
   visible row is one clean 30px line. Apple HIG "hit region" / Material 3
   "target size": the hit region and the visual container are different
   numbers. The glyph is a 16px SVG, not the ↻ text character. The focus
   ring lands on the visible box. The row stays 44px tall, so no hero
   height moves (STABILITY).
   (2) Sticky bar: the dismiss is an in-flow flex item with a 12px gap —
   overlap becomes structurally impossible. Measured live before the fix:
   the absolute × sat at exactly 0.00px from the pill's right edge at
   390/420/360/320 (no literal overlap, zero clearance — which is why it
   looked like it ran onto the ×). The bar's button radius is 12px
   (Apple HIG concentric radii; M3 Square-S), scoped to .sticky-cta .btn;
   every other .btn stays a 999px pill.
   (3) Privacy note: the bordered grey box with an underlined inline link
   is gone. Direction A (Google Safety Center principles style): eyebrow +
   bold headline, the three promises as scannable icon chips (eye /
   mic-off / no-storage), and the link as a real tonal button. The same
   link treatment is used in the honest strip, so the two never disagree. */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "website");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const js = fs.readFileSync(path.join(root, "app.js"), "utf8");
let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");

// 1. Replay: button 44×44 (target), visible box 36×30.
check("Replay button is 44×44 (the tap target)",
  /\.app-replay \{[\s\S]*?width: 44px;[\s\S]*?height: 44px;/.test(clean));
check("Replay visible box is 36×30 (chips' height, send button's width)",
  /\.app-replay-box \{[\s\S]*?width: 36px;[\s\S]*?height: 30px;/.test(clean));
check("Replay visible box shares the chips' surface, border and radius",
  /\.app-replay-box \{[\s\S]*?background: var\(--app-surface-2\);[\s\S]*?border: 1px solid var\(--app-border\);[\s\S]*?border-radius: 8px;/.test(clean));
check("Replay button itself is transparent (no double box)",
  /\.app-replay \{[\s\S]*?background: none;[\s\S]*?border: 0;/.test(clean));

// 2. Replay glyph: a 16px SVG, never the ↻ text character.
check("Replay glyph is a 16px SVG inside the visible box",
  /id="hero-replay"[^>]*><span class="app-replay-box"><svg width="16" height="16" viewBox="0 0 24 24"[^>]*>[\s\S]*?<\/svg><\/span><\/button>/.test(html));
check("no ↻ text character anywhere in index.html",
  !/↻/.test(html));
check("Replay focus ring lands on the visible box, not the 44px button",
  /\.app-replay:focus-visible \{ outline: none;/.test(clean) &&
  /\.app-replay:focus-visible \.app-replay-box \{ outline: 3px solid var\(--focus\); outline-offset: 2px;/.test(clean));

// 3. Sticky bar: dismiss in-flow, 12px gap, 12px radius, no 56px reserve.
const closeRule = (clean.match(/\.sticky-cta-close \{[\s\S]*?\}/) || [""])[0];
check("sticky dismiss is in-flow (no absolute positioning)",
  !/position:\s*absolute/.test(closeRule) && /flex: none;/.test(closeRule));
check("sticky dismiss stretches to the primary button's height (Step 28: square via aspect-ratio, 44px floor, no fixed 44px)",
  /border-radius: 12px;/.test(closeRule) && /background: var\(--surface-2\);/.test(closeRule) &&
  /align-self: stretch;/.test(closeRule) && /aspect-ratio: 1;/.test(closeRule) &&
  /min-width: 44px;/.test(closeRule) && /min-height: 44px;/.test(closeRule) &&
  !/(^|[\s;{])width: 44px;/.test(closeRule) && !/(^|[\s;{])height: 44px;/.test(closeRule));
check("sticky bar has a 12px gap and 16px side padding (no 56px reserve)",
  /\.sticky-cta \{[\s\S]*?gap: 12px;[\s\S]*?padding: 12px 16px/.test(clean) &&
  !/\.sticky-cta \{[^}]*56px/.test(clean));
check("sticky bar buttons use a 12px radius, scoped to the bar only",
  /\.sticky-cta \.btn \{ border-radius: 12px;/.test(clean));
check("every other .btn is still a 999px pill (no global radius change)",
  /\.btn \{[\s\S]*?border-radius: 999px;/.test(clean));
check("sticky primary still flexes full-width at phone widths",
  /@media \(max-width: 480px\) \{[\s\S]*?\.sticky-cta \.btn-primary \{ flex: 1 1 auto;/.test(clean));

// 4. Privacy note: Direction A — eyebrow + headline + three icon chips + link button.
check("ethics strip is a div with eyebrow, headline, nevers list and link button",
  /<div class="ethics-strip">[\s\S]*?<p class="ethics-eyebrow">Privacy, by design<\/p>[\s\S]*?<p class="ethics-headline">A visible window\. Nothing hidden, nothing recorded, nothing stored\.<\/p>[\s\S]*?<ul class="ethics-nevers">[\s\S]*?<\/ul>[\s\S]*?<a class="ethics-link" href="privacy\.html">How we handle privacy/.test(html));
check("ethics strip has exactly three never-chips, in order",
  (html.match(/<li><svg[\s\S]*?<\/svg>Never (hides|records|stores audio)<\/li>/g) || []).length === 3 &&
  /Never hides<\/li>[\s\S]*?Never records<\/li>[\s\S]*?Never stores audio<\/li>/.test(html));
check("each never-chip carries a 16px SVG icon",
  (html.match(/<li><svg width="16" height="16" viewBox="0 0 24 24"/g) || []).length === 3);
check("ethics strip uses a violet tint, not a grey bordered box",
  /\.ethics-strip \{[\s\S]*?background: var\(--accent-soft\);[\s\S]*?border: 1px solid rgba\(124, 108, 255, \.16\);/.test(clean) &&
  !/\.ethics-strip \{[^}]*border: 1px solid var\(--border\)/.test(clean));
check("ethics link is a tonal button (pill, no underline), not an inline link",
  /\.ethics-link \{[\s\S]*?display: inline-flex;[\s\S]*?border-radius: 999px;[\s\S]*?text-decoration: none;/.test(clean) &&
  !/\.ethics-strip a \{/.test(clean));
check("honest strip uses the same link treatment",
  /<section class="honest-strip"[\s\S]*?<a class="ethics-link" href="privacy\.html">How we handle privacy/.test(html) &&
  /\.honest-strip \.ethics-link \{ margin-top: 16px;/.test(clean));

// 5. Typography scale: every new size is on the Step 10 scale.
check("new type sizes are on scale (eyebrow 12, headline 20, chips 13, link 14)",
  /\.ethics-eyebrow \{[^}]*font-size: 12px;/.test(clean) &&
  /\.ethics-headline \{[^}]*font-size: 20px;/.test(clean) &&
  /\.ethics-nevers li \{[^}]*font-size: 13px;/.test(clean) &&
  /\.ethics-link \{[^}]*font-size: 14px;/.test(clean));

// 6. The row stays 44px tall, so the hero height cannot move (STABILITY).
check("action row height is still set by the 44px button (no height change)",
  /\.app-replay \{[\s\S]*?height: 44px;/.test(clean) &&
  /\.app-actions \{ display: flex; align-items: center;/.test(clean));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
