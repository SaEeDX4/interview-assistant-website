/* Step 58 — Support motion & scroll discipline. The owner
   reported three defects on the live support page (desktop):
   the opening snapped instead of unfolding (D1), clicking a
   symptom card bounced the scroll up then back down (D2), and
   the Common Topics rows had unequal heights (D3). These guards
   pin the fix's structure: one focus path that never scrolls,
   one managed scroll that lands the panel under the sticky
   header, the 340ms house-easing unfold with its reduced-motion
   and stub guards, anchoring switched off on the support page,
   and equal grid rows for the tiles. Behaviour (scrollY
   timelines, tile measurements, animation sampling) is pinned
   by the Playwright motion audit in
   ~/workspace/step58-support-motion/audit.py — 28 checks.
   Root causes and evidence: step58-support-motion/report.md. */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "website");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const js = fs.readFileSync(path.join(root, "app.js"), "utf8");

let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}

const mod = js.slice(js.indexOf("/* Step 54"));

/* 1. Focus discipline — the browser never scrolls on focus. */
check("focus: one helper focuses with preventScroll",
  mod.includes("function focusInput()")
  && mod.includes("input.focus({ preventScroll: true })"));
check("focus: every interaction path uses the helper (7+ call sites)",
  (mod.match(/focusInput\(\);/g) || []).length >= 7,
  String((mod.match(/focusInput\(\);/g) || []).length));
check("focus: no handler focuses bare outside the helper's fallback",
  (mod.match(/input\.focus\(\);/g) || []).length === 1,
  String((mod.match(/input\.focus\(\);/g) || []).length));

/* 2. The one managed scroll. */
check("scroll: revealAssistant computes the header-offset target",
  mod.includes("function revealAssistant()")
  && mod.includes("var HEADER_OFFSET = 84")
  && mod.includes("root.getBoundingClientRect().top + y - HEADER_OFFSET"));
check("scroll: smooth by default, instant under reduced motion",
  mod.includes('window.scrollTo({ top: target, behavior: reduceMotion ? "auto" : "smooth" })'));
check("scroll: fully capability-guarded for the stub harnesses",
  mod.includes('typeof window.scrollTo !== "function"')
  && mod.includes('typeof root.getBoundingClientRect !== "function"'));
check("scroll: the root scrollIntoView is gone (the combobox's option scroll stays)",
  !mod.includes('scrollIntoView({ block: "start" })')
  && mod.includes('scrollIntoView({ block: "nearest" })'));
check("scroll: outside-panel triggers reveal, in-panel ones do not",
  mod.includes("wireTopicButtons(tilesEl, true)")
  && mod.includes("wireTopicButtons(symptomsEl, true)")
  && mod.includes("wireTopicButtons(topicsEl, false)")
  && mod.includes("wireTopicButtons(suggestEl, false)"));
check("scroll: the deep-link arrival takes the managed scroll too",
  mod.slice(mod.indexOf("function arriveFromTopic()")).includes("revealAssistant();"));

/* 3. The opening unfold (D1). */
check("motion: the body unfold is animated in the module",
  mod.includes("function animateBodyOpen()")
  && mod.includes('"height .34s cubic-bezier(.2,.7,.3,1)"'));
check("motion: the unfold is skipped under reduced motion",
  mod.includes('window.matchMedia("(prefers-reduced-motion: reduce)")')
  && mod.includes("if (reduceMotion || !bodyEl) { return; }"));
check("motion: no rAF in the environment means instant, as before",
  mod.includes('typeof requestAnimationFrame !== "function"'));
check("motion: collapse cancels the animation and clears its styles",
  mod.includes("function clearBodyAnimStyles()")
  && mod.slice(mod.indexOf("function collapse()"), mod.indexOf("function collapse()") + 260)
       .includes("clearBodyAnimStyles();"));

/* 4. Scroll anchoring off, support page only (D2). */
check("css: the support page opts out of scroll anchoring",
  css.includes("body:has(#support-assistant) { overflow-anchor: none; }"));
check("css: no fourth reduced-motion block was added",
  (css.match(/@media \(prefers-reduced-motion: reduce\)/g) || []).length === 3);

/* 5. Equal topic tiles (D3). */
check("css: topic rows share one height via grid-auto-rows: 1fr",
  /\.topic-tiles \{[^}]*grid-auto-rows: 1fr;/.test(css));
check("css: the single-column phone layout sizes tiles to content again",
  css.includes(".topic-tiles { grid-template-columns: 1fr; grid-auto-rows: auto; }"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
