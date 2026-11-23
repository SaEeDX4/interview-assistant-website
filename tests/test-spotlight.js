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
     248x310 (<=640, in flow); window landed 360 / 336 /
     (100% - 32); self PiP 96x63 / 88x58 / 72x48 over her
     frame's corner on phones; caption bare text (no box, no
     chip) at 19/17/16px;
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
check("the expand glyph is an inline SVG inside the toggle (icon furniture, not a label)",
  /class="spotlight-glyph"/.test(html) && /<svg class="spotlight-glyph"/.test(html));
check("the live caption element exists inside the tile, aria-hidden (the canonical text stays in the window)",
  /<p class="spotlight-caption" id="spotlight-caption" aria-hidden="true"><\/p>/.test(html));
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
check("hero frame 248x310 in flow on phones (fade-through territory)",
  /position: relative; left: auto; top: auto; transform: none; flex: none;\s*width: 248px; height: 310px; border-radius: 12px; order: 1;/.test(clean));
check("window landed at 360 (desktop) / 336 (band) on the measured --spot-win-top",
  /\.call-stage\[data-spotlight\] \.call-main \.app-window \{\s*top: var\(--spot-win-top, 499px\); left: calc\(50% - 180px\);\s*transform: none; width: 360px;/.test(clean)
  && /top: var\(--spot-win-top, 425px\); left: calc\(50% - 168px\); width: 336px;/.test(clean));
check("window landed at (100% - 32) in flow on phones (centred as a flex item — no off-scale auto margin)",
  /top: auto; left: auto; width: calc\(100% - 32px\); margin: 12px 0 16px; align-self: center;/.test(clean));
check("self PiP: 96x63 desktop / 88x58 band / 72x48 over her frame's corner on phones",
  /\.call-stage\[data-spotlight\] \.call-self,\s*\.call-stage\[data-spotlight-prep\] \.call-self \{ width: 96px; height: 63px; \}/.test(clean)
  && /\.call-stage\[data-spotlight\] \.call-self,\s*\.call-stage\[data-spotlight-prep\] \.call-self \{ width: 88px; height: 58px; \}/.test(clean)
  && /width: 72px; height: 48px; top: 270px; bottom: auto; right: calc\(50% - 116px\);/.test(clean));
check("caption is bare text: no background, no border on .spotlight-caption",
  /\.spotlight-caption \{[^}]*\}/.test(clean)
  && !/\.spotlight-caption \{[^}]*(background|border)/.test(clean));
check("caption sizes 19/17/16px across the three widths",
  /width: min\(560px, calc\(100% - 32px\)\); font-size: 19px;/.test(clean)
  && /width: min\(480px, calc\(100% - 32px\)\); font-size: 17px;/.test(clean)
  && /width: min\(320px, 100%\); margin-top: 12px; font-size: 16px;/.test(clean));
check("the tile's own closing caption stands down while the Spotlight caption carries her words",
  /\.call-stage\[data-spotlight\] \.call-caption \{ display: none; \}/.test(clean));
check("the field's spotlight height is the measured --spot-main-h var",
  /\.call-stage\[data-spotlight\] \.call-main \{ min-height: var\(--spot-main-h, 640px\); \}/.test(clean));
check("radius law: toggle follows the frame (12px; 8px on the phone strip), close is 8px, no 999px anywhere in the section",
  /\.avatar-toggle \{[^}]*border-radius: 12px;/.test(clean)
  && /\.spotlight-close \{[^}]*border-radius: 8px;/.test(clean)
  && !/999px/.test(spotCss));

/* 4. The driver: a lens, never a scene. */
check("spotlight.js gates the toggle on the driver's has-avatar state (glyph fallback gets no toggle)",
  spot.includes('tile.classList.contains("has-avatar")') && spot.includes("toggle.hidden = !ok"));
check("spotlight.js never touches scene state (no scene classes, no speak keys, no pill)",
  !/is-primed|is-scene|data-speak|scene-pill/.test(spot));
check("spotlight.js never pauses, seeks or re-sources a video (the living element flies untouched)",
  !/\.pause\(|\.currentTime|requestVideoFrameCallback/.test(spot)
  && !/avatar-video/.test(spot));
check("spotlight.js mirrors the transcript from the DOM (question stack spans + closing caption)",
  spot.includes('getElementById("demo-question-stack")') && spot.includes("cloneNode(true)")
  && spot.includes('callCaption'));
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
  && /\.call-stage\[data-spotlight\] \.avatar-toggle \{\s*left: calc\(50% - 124px\); top: 16px; transform: none;/.test(clean));
check("aria-expanded and the toggle's label follow the state",
  spot.includes('setAttribute("aria-expanded", "true")') && spot.includes('setAttribute("aria-expanded", "false")')
  && spot.includes('"Back to the call view"'));
check("reduced motion gates the flights (the driver's own matchMedia law)",
  spot.includes('matchMedia("(prefers-reduced-motion: reduce)")'));
check("the phone flight is the fade-through (<=640 via matchMedia), not a scale morph",
  spot.includes('matchMedia("(max-width: 640px)")') && spot.includes("fadeFrame"));
check("heights are measured, not assumed (caption bottom + 12, window height + 16)",
  spot.includes("capRect.bottom - mainRect.top") && spot.includes("appWindow.offsetHeight + 16"));
check("the avatar driver is untouched by this workstream (Step 80 first-frame gating intact)",
  avatar.includes("requestVideoFrameCallback") && avatar.includes("gatedSwap"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
