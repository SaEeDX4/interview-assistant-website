/* Step 37a — the hero's minutes meter, the suggested-question
   after-block, and the demo honesty-note fix.
   Proposal: ~/workspace/step37-livetrial-proposal.md §5.1 + §7. */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const index = fs.readFileSync(path.join(root, "website/index.html"), "utf8");
const demo = fs.readFileSync(path.join(root, "website/demo.html"), "utf8");
const js = fs.readFileSync(path.join(root, "website/app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "website/styles.css"), "utf8");

let pass = 0, fail = 0;
function check(name, ok) {
  if (ok) { pass++; console.log("PASS " + name); }
  else { fail++; console.log("FAIL " + name); }
}

/* 1 — the minutes meter is in the hero header, in the app's format. */
check("minutes meter in the hero header",
  index.includes('<span class="app-minutes" aria-hidden="true"><span id="mock-minutes-num">30</span>/30<span class="app-minutes-unit"> min</span></span>'));
check("minutes meter styled (11px, faint, tabular)",
  /\.app-minutes \{[^}]*font-size: 11px/.test(css) &&
  /\.app-minutes \{[^}]*var\(--app-faint\)/.test(css) &&
  /\.app-minutes \{[^}]*tabular-nums/.test(css));

/* 2 — the <=440px shed keeps the one-row rule with the meter present. */
const shed = css.slice(css.indexOf("@media (max-width: 440px)"));
check("shed block drops the meter's unit suffix at <=440px",
  shed.includes(".app-minutes-unit { display: none; }"));
check("shed block drops the hero's decorative stop at <=440px",
  shed.includes(".app-stop--hero { display: none; }") &&
  index.includes('class="app-stop app-stop--hero"'));

/* 3 — the minutes logic: once per heard question, sample plays only. */
check("minutes state exists (30, heard set, pending flag)",
  js.includes("var minutesLeft = 30;") && js.includes("var heardKeys = {};") && js.includes("var minutePending = false;"));
check("play() arms the minute; completion consumes it",
  js.includes("minutePending = true;") &&
  (js.match(/consumeMinute\(\);/g) || []).length >= 2 &&
  js.includes('if (source !== "sample" || heardKeys[key]) { return; }'));
check("the meter element is updated by id",
  js.includes('document.getElementById("mock-minutes-num")') &&
  js.includes("minutesNum.textContent = String(minutesLeft);"));

/* 4 — the after-block: reserved space, two real buttons, handoff. */
check("after-block markup (reserved via is-hidden, handoff to demo.html)",
  index.includes('<div class="hero-after is-hidden" id="hero-after">') &&
  index.includes('<button type="button" class="suggest-btn" id="suggest-1"></button>') &&
  index.includes('<button type="button" class="suggest-btn" id="suggest-2"></button>') &&
  index.includes("One question, from a prepared bank. The full demo has all ten") &&
  index.includes('<a href="demo.html">Try the full demo</a>'));
check("suggest buttons meet the target + radius law (44px, 12px)",
  /\.suggest-btn \{[^}]*min-height: 44px/.test(css) &&
  /\.suggest-btn \{[^}]*border-radius: 12px/.test(css));
check("suggest hover is gated (hover + fine pointer)",
  css.includes("@media (hover: hover) and (pointer: fine)") &&
  /\.suggest-btn:hover/.test(css));

/* 5 — the suggestion engine: pool, exclusion, rotation, real plays. */
check("suggestion pool + render excludes the current question",
  js.includes('var SUGGEST_POOL = ["tell", "hire", "weakness", "story", "five", "salary", "conflict", "why"];') &&
  js.includes("if (k !== key && picked.indexOf(k) === -1) { picked.push(k); }") &&
  js.includes("function renderSuggestions()"));
check("playSample switches the bank question and plays it",
  js.includes("function playSample(newKey)") &&
  js.includes('source = "sample";') &&
  js.includes("renderSuggestions();"));
check("after-block reveals on completion (both paths)",
  (js.match(/showAfter\(\);/g) || []).length >= 2 &&
  js.includes('afterEl.classList.remove("is-hidden")'));

/* 6 — honesty: the false 'no network' claim is gone everywhere;
   the demo notes tell the truth about the typed path. */
check("no 'no network' claim remains in pages or app.js",
  !index.includes("no network") && !demo.includes("no network") && !js.includes("no network"));
check("both demo notes disclose the live typed path",
  index.includes("it may be answered live over the network") &&
  demo.includes("it may be answered live over the network"));
check("the unmeasured demo-next timing claim is retired",
  !js.includes("took about 2 minutes") && !js.includes("took about a minute") &&
  !index.includes("took about 2 minutes") && !demo.includes("took about 2 minutes") &&
  js.includes("Three points, ready to say out loud"));

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
