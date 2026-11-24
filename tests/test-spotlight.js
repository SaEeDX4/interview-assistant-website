/* Spotlight — Phase 1: the interviewer, up close.
   Run: node tests/test-spotlight.js (from
   ~/workspace/interview-assistant-website).
   The contracts pinned here (concept:
   ~/workspace/avatar-expand-ideation/concept.md):
   - the tap target is a real button overlaying the avatar
     frame, present only while a living persona is (spotlight.js
     gates it on the driver's has-avatar state); the glyph
     fallback gets no toggle;
   - the state hook is [data-spotlight] on .call-stage (the
     stage's attribute convention — the Step 17 census reads
     app.js only, and app.js is outside this workstream);
   - committed geometry: hero 320x400 / 264x330 (<=933) /
     232x290 (<=640, in flow; Step 89: narrowed from 248x310
     so the close corner clears the portrait); window landed
     360 / 336 / (100% - 32); self PiP 96x63 / 88x58 / 72x48 —
     on phones in the label row beside the name plate
     (Step 89: no longer over her frame's corner);
   - Step 84 re-pins: the live caption is REMOVED on the
     owner's ruling (it duplicated the QUESTION card's
     sentence word for word) — the window's landed top is now
     measured from the tile label's bottom + 16 (Step 89:
     was + 12; 16 balances the 16 above the portrait), the
     tile's own closing caption no longer stands down, and
     spotlight.js mirrors nothing;
   - the --motion-4 amendment: 400ms in :root, consumed ONLY
     by spotlight.js's flight (the scope is written into this
     suite's check names, per the concept); every CSS
     transition in the spotlight section rides the existing
     --motion-1/2/3 tokens;
   - spotlight.js never touches the scene engine: no scene
     classes, no speak-key writes, no video pause/seek — the
     lens reads DOM state and mirrors it;
   - exits: tap her again (the same toggle, aria-expanded),
     the close button, Escape (focus returns to the toggle);
   - reduced motion: spotlight.js gates its flights on the
     same matchMedia the driver uses. */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "website");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const html = fs.readFileSync(path.join(root, "demo.html"), "utf8");
const spot = fs.readFileSync(path.join(root, "spotlight.js"), "utf8");
const avatar = fs.readFileSync(path.join(root, "avatar.js"), "utf8");
let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
const spotCss = clean.slice(clean.indexOf(".spotlight-shade"));

/* 1. Markup: the lens's furniture exists, labelled, hidden
      until its driver arms it. */
check("demo.html loads spotlight.js after avatar.js",
  html.indexOf('src="avatar.js"') !== -1
  && html.indexOf('src="spotlight.js"') > html.indexOf('src="avatar.js"'));
check("the tap target is a real button over the frame, aria-expanded, hidden at rest",
  /<button type="button" class="avatar-toggle" id="avatar-toggle" aria-expanded="false" aria-label="See the interviewer up close" hidden>/.test(html));
check("the expand glyph is DELETED (Step 87): the toggle is a bare overlay button, the tile rests clean",
  /* Step 87 re-pin (annotated): the owner ruled the corners-out
     glyph made the small tile uglier, and the research showed
     no call app ships a persistent badge. The glyph and its
     rules are deleted everywhere; discoverability is the
     Lean-In performance (pinned in test-step87.js). The
     toggle itself — a real button with its aria-label — is
     unchanged. */
  !/spotlight-glyph/.test(html) && !/spotlight-glyph/.test(clean)
  && html.includes('id="avatar-toggle"'));
check("Step 84 re-pin: the live caption element is gone from the tile (it duplicated the QUESTION card — owner's ruling)",
  !/spotlight-caption/.test(html));
check("the close control is a labelled button, hidden at rest",
  /<button type="button" class="spotlight-close" id="spotlight-close" aria-label="Close the close-up" hidden>/.test(html));
check("the backdrop shade exists inside the call field",
  /<div class="spotlight-shade" aria-hidden="true"><\/div>/.test(html));

/* 2. The scoped motion amendment. */
check("--motion-4 is 400ms in :root (the Spotlight flight's scoped MOTION.md amendment)",
  /--motion-4:\s*400ms;/.test(clean));
check("--motion-4 scope: spotlight.js is its only consumer (no CSS rule references it)",
  !/var\(--motion-4\)/.test(clean) && spot.includes('"--motion-4"'));
check("the return flight reads --motion-3 (exits faster than entrances)",
  spot.includes('"--motion-3"'));
check("every transition in the spotlight CSS rides --motion-1/2/3 or the one easing token",
  ![...spotCss.matchAll(/transition:\s*([^;]+);/g)].some((m) => /[\d.]+s/.test(m[1])));

/* 3. Committed geometry. */
check("hero frame 320x400 centred on the lens axis (desktop)",
  /\.call-stage\[data-spotlight\] \.avatar-frame,\s*\.call-stage\[data-spotlight-prep\] \.avatar-frame \{\s*left: calc\(50% - 160px\); top: 16px; width: 320px; height: 400px;/.test(clean));
check("hero frame 264x330 in the <=933 band (centred on translateX(-50%) — test-step6 bans the 132px literal the calc would need)",
  /left: 50%; transform: translateX\(-50%\); top: 16px; bottom: auto; width: 264px; height: 330px;/.test(clean));
check("hero frame 232x290 in flow on phones (fade-through territory. Step 89 re-pin: 248x310 → 232x290 so the close button's corner clears the portrait's right edge — at 248 the clearance measured 0.5px and the button straddled the corner in the owner's screenshot)",
  /position: relative; left: auto; top: auto; transform: none; flex: none;\s*width: 232px; height: 290px; border-radius: 12px; order: 1;/.test(clean));
check("window landed at 360 (desktop) / 336 (band) on the measured --spot-win-top (Step 84: fallbacks now sit under the label, 453/383. Step 89 re-pin: 457/387 — the measured gap under the label is now 16, matching the 16 above the portrait, so the hero column is balanced in its area)",
  /\.call-stage\[data-spotlight\] \.call-main \.app-window \{\s*top: var\(--spot-win-top, 457px\); left: calc\(50% - 180px\);\s*transform: none; width: 360px;/.test(clean)
  && /top: var\(--spot-win-top, 387px\); left: calc\(50% - 168px\); width: 336px;/.test(clean));
check("window landed at (100% - 32) in flow on phones (centred as a flex item — no off-scale auto margin. Step 89 re-pin: margin-top 12 → 16, the same balance as above)",
  /top: auto; left: auto; width: calc\(100% - 32px\); margin: 16px 0 16px; align-self: center;/.test(clean));
check("self PiP: 96x63 desktop / 88x58 band / 72x48 in the label row on phones (Step 89 re-pin: the phone PiP leaves the portrait — it sat over her frame's corner as a three-line text sticker in the owner's screenshot; it now sits right of the name plate on the window's grid, right: 16, centred on the label at top: 312)",
  /\.call-stage\[data-spotlight\] \.call-self,\s*\.call-stage\[data-spotlight-prep\] \.call-self \{ width: 96px; height: 63px; \}/.test(clean)
  && /\.call-stage\[data-spotlight\] \.call-self,\s*\.call-stage\[data-spotlight-prep\] \.call-self \{ width: 88px; height: 58px; \}/.test(clean)
  && /width: 72px; height: 48px; top: 312px; bottom: auto; right: 16px;/.test(clean));
check("Step 84 re-pin: no .spotlight-caption rules remain anywhere in the sheet",
  !/\.spotlight-caption/.test(clean));
check("Step 84 re-pin (Step 90 annotation: the caption element itself is now deleted entirely — owner's addendum C — so no stand-down rule exists or is needed)",
  !/\.call-stage\[data-spotlight\] \.call-caption \{ display: none; \}/.test(clean) &&
  !/\.call-caption/.test(clean));
check("the field's spotlight height is the measured --spot-main-h var",
  /\.call-stage\[data-spotlight\] \.call-main \{ min-height: var\(--spot-main-h, 640px\); \}/.test(clean));
check("radius law: toggle follows the frame (12px; 8px on the phone strip), close is 8px, no 999px anywhere in the section",
  /\.avatar-toggle \{[^}]*border-radius: 12px;/.test(clean)
  && /\.spotlight-close \{[^}]*border-radius: 8px;/.test(clean)
  && !/999px/.test(spotCss));

/* 4. The driver: a lens, never a scene. */
check("spotlight.js gates the toggle on the driver's has-avatar state (glyph fallback gets no toggle)",
  spot.includes('tile.classList.contains("has-avatar")') && spot.includes("toggle.hidden = !ok"));
check("spotlight.js never WRITES scene state (no scene-class writes, no speak keys, no pill)",
  /* Step 87 re-pin (annotated): the Lean-In hint — commissioned
     after this contract was written — must know a play is live
     before it performs, so the module makes exactly ONE
     read-only eligibility check, classList.contains("is-scene"),
     and receives the first-question beat through a document
     event the demo module dispatches. It still never writes a
     scene class, never reads or sets a speak key, and never
     touches the pill: the lens does not drive the scene. */
  !/classList\.(add|remove|toggle)\("(is-primed|is-scene)"\)/.test(spot)
  && !/data-speak|scene-pill/.test(spot)
  && spot.includes('classList.contains("is-scene")'));
check("spotlight.js never pauses, seeks or re-sources a video (the living element flies untouched)",
  !/\.pause\(|\.currentTime|requestVideoFrameCallback/.test(spot)
  && !/avatar-video/.test(spot));
check("Step 84 re-pin: spotlight.js mirrors nothing (no cloneNode, no question-stack read, no caption element)",
  !spot.includes("cloneNode") && !spot.includes("demo-question-stack")
  && !spot.includes("spotlight-caption") && !spot.includes("callCaption"));
check("flights are WAAPI transforms (FLIP) — element.animate with translate/scale, transform-origin 0 0",
  spot.includes(".animate(") && spot.includes("translate(") && spot.includes("scale(")
  && spot.includes('el.style.transformOrigin = "0 0"'));
check("the band flight composes with the hero frame's resting translateX(-50%) instead of replacing it",
  spot.includes("frameBase()") && spot.includes('matchMedia("(max-width: 933px)")'));
check("will-change is rented for the flight and returned on land",
  spot.includes('el.style.willChange = "transform"') && spot.includes('el.style.willChange = ""'));
check("exits: the toggle re-toggles, the close button closes, Escape closes with focus return",
  spot.includes('e.key === "Escape"') && spot.includes("toggle.focus()")
  && spot.includes('closeBtn.addEventListener("click"'));
check("keyboard open hands focus to the close control (click detail 0, consumed when the state lands)",
  spot.includes("e.detail === 0") && spot.includes("pendingFocusClose") && spot.includes("closeBtn.focus()"));
check("the phone hero sheds the band's centring transform (frame and toggle both reset it)",
  /\.call-stage\[data-spotlight\] \.avatar-frame,\s*\.call-stage\[data-spotlight-prep\] \.avatar-frame \{\s*position: relative; left: auto; top: auto; transform: none;/.test(clean)
  && /\.call-stage\[data-spotlight\] \.avatar-toggle \{\s*left: calc\(50% - 116px\); top: 16px; transform: none;/.test(clean));
check("aria-expanded and the toggle's label follow the state",
  spot.includes('setAttribute("aria-expanded", "true")') && spot.includes('setAttribute("aria-expanded", "false")')
  && spot.includes('"Back to the call view"'));
check("reduced motion gates the flights (the driver's own matchMedia law)",
  spot.includes('matchMedia("(prefers-reduced-motion: reduce)")'));
check("the phone flight is the fade-through (<=640 via matchMedia), not a scale morph",
  spot.includes('matchMedia("(max-width: 640px)")') && spot.includes("fadeFrame"));
check("heights are measured, not assumed (Step 84: tile-label bottom + 12, window height + 16)",
  spot.includes("labelRect.bottom - mainRect.top") && spot.includes("appWindow.offsetHeight + 16"));
check("the avatar driver is untouched by this workstream (Step 80 first-frame gating intact)",
  avatar.includes("requestVideoFrameCallback") && avatar.includes("gatedSwap"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
