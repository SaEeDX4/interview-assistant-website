/* Step 24 — hero (Replay + stats strip) and story glide.
   Run: node tests/test-step24.js
   (from ~/workspace/interview-assistant-website).
   Hero: the Replay button is centred below the window (Step 20 had it
   right-aligned alone on its row — detached); the three hero facts are a
   one-line 3-column stats strip (Tesla-style: big value, small label,
   dividers), replacing the float chips that wrapped 2+1 at 390px.
   The float chips and the floaty keyframe are gone (see test-step14).
   (Story glide checks are added with the story part of this step.) */
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

// 1. Replay is centred below the window (not right-aligned alone).
check("Replay is centred below the window (margin: 12px auto 0)",
  /\.hero-replay \{[\s\S]*?margin: 12px auto 0;/.test(clean));
check("Replay is still a 44px button, hidden until the moment plays",
  /<button type="button" class="hero-replay is-hidden" id="hero-replay"/.test(html) &&
  /\.hero-replay \{[\s\S]*?min-height: 44px;/.test(clean));

// 2. Stats strip: one line, three cells, value over label, dividers.
const stats = html.match(/<dl class="hero-stats">([\s\S]*?)<\/dl>/);
check("hero stats strip exists with three cells",
  !!stats && (stats[1].match(/class="hero-stat"/g) || []).length === 3);
check("stats values are 50–150 / 10 / 30-min with matching labels",
  !!stats &&
  /<dt>questions<\/dt>\s*<dd>50–150<\/dd>/.test(stats[1]) &&
  /<dt>languages<\/dt>\s*<dd>10<\/dd>/.test(stats[1]) &&
  /<dt>free trial<\/dt>\s*<dd>30-min<\/dd>/.test(stats[1]));
check("stats strip is a 3-column grid that never wraps",
  /\.hero-stats \{[^}]*display: grid;[^}]*grid-template-columns: repeat\(3, 1fr\);/.test(clean) &&
  !/\.hero-stats \{[^}]*flex-wrap/.test(clean));
check("stats value 20px/700 on the type scale, label 12px uppercase",
  /\.hero-stat dd \{[\s\S]*?font-size: 20px;[\s\S]*?font-weight: 700;/.test(clean) &&
  /\.hero-stat dt \{[\s\S]*?font-size: 12px;[\s\S]*?text-transform: uppercase;/.test(clean));
check("stats cells are divided (border-left on 2nd/3rd cell)",
  /\.hero-stat \+ \.hero-stat \{[^}]*border-left: 1px solid var\(--border\);/.test(clean));
check("stats strip is real content, not aria-hidden",
  !/<dl class="hero-stats"[^>]*aria-hidden/.test(html));

// 3. The float chips are fully gone (HTML + CSS + keyframe).
check("no float-chips anywhere (HTML, CSS)",
  !/float-chips/.test(html) && !/float-chips/.test(clean));
check("no floaty keyframe or animation left",
  !/floaty/.test(clean));

// 4. Step 24 fix — the Adapt-beat badge: at <=640px the badge must be
// hidden even when JS unhides it (the Step 23 bare .app-badge rule was
// overridden by the later base rule, display: inline-flex, so the badge
// showed on the Adapt beat and wrapped the header to 2 rows, +40px).
// The rule must outrank the base rule (0,2,0 beats 0,1,0).
check("<=640px badge rule outranks the base rule (.app-header .app-badge)",
  /@media \(max-width: 640px\) \{[\s\S]*?\.app-header \.app-badge \{[^}]*display: none;/.test(clean));
check("base .app-badge rule still shows the badge above 640px",
  /\.app-badge \{[^}]*display: inline-flex;/.test(clean));

// 5. Story glide (mobile player only): inactive views + headers are
// display:none in player mode, so the window is fluid; the
// question/answer stacks stay grid-stacked (a timed play must never
// grow the window mid-play) and the caption stack stays fixed.
check("player mode hides inactive views + headers (display:none)",
  /html\.story-player \.story-window \.app-header-stack > \.is-hidden,[\s\S]*?html\.story-player \.story-window \.app-window-body > \.is-hidden \{[^}]*display: none;/.test(clean));
check("question/answer stacks never get display:none in player mode",
  !/html\.story-player[\s\S]*?\.app-(question|answer)-stack > \.is-hidden[^}]*display: none/.test(clean));
check("caption stack never gets display:none in player mode",
  !/html\.story-player[\s\S]*?\.story-caption-item[^}]*display: none/.test(clean));
check("player window has a 300ms height transition on the standard curve",
  /html\.story-player \.story-window \{[^}]*transition: height \.3s cubic-bezier\(\.2,\.7,\.3,1\);/.test(clean));
check("no height transition outside player mode (desktop keeps the fixed stage)",
  !/(^|\n)\.story-window \{[^}]*transition: height/.test(clean));

// 6. The glide in app.js: measure -> freeze -> animate -> clear,
// token-guarded, gated on player + motion.
const storyJs = (js.match(/\/\* Steps 21[\s\S]*?\/\* Step 1 — scroll reveal/) || [""])[0];
check("glideRender exists and activate calls it only in player mode (not reduced)",
  /function glideRender\(beat\)/.test(storyJs) &&
  /if \(playerOn && !reduced\) \{ glideRender\(beat\); \}/.test(storyJs) &&
  /function renderBeat\(beat\)/.test(storyJs));
check("glide measures both heights, freezes, animates, clears after 350ms (token-guarded)",
  /var h0 = storyWindow\.offsetHeight;/.test(storyJs) &&
  /var h1 = storyWindow\.offsetHeight;/.test(storyJs) &&
  /storyWindow\.style\.height = h0 \+ "px";/.test(storyJs) &&
  /storyWindow\.style\.height = h1 \+ "px";/.test(storyJs) &&
  /setTimeout\(function \(\) \{[\s\S]*?if \(token !== glideToken\) \{ return; \}[\s\S]*?storyWindow\.style\.height = "";\s*\}, 350\);/.test(storyJs));
check("glide early-return (same height) clears any inline height",
  /if \(h1 === h0\) \{[\s\S]*?storyWindow\.style\.height = "";/ .test(storyJs));
check("glide is a no-op without a window (null guard)",
  /function glideRender\(beat\) \{[\s\S]*?if \(!storyWindow\) \{ renderBeat\(beat\); return; \}/.test(storyJs));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
