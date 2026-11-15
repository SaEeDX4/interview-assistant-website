/* Step 11 — touch targets & accessibility. Run: node tests/test-step11.js
   (from ~/workspace/interview-assistant-website).
   The standard (ACCESSIBILITY.md): every interactive target >= 44px tall
   (range thumb >= 24px), focus always visible, every input labelled, ARIA
   states truthful in the HTML and updated by JS, landmarks on every page. */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "website");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const js = fs.readFileSync(path.join(root, "app.js"), "utf8");
const htmlFiles = fs.readdirSync(root).filter((x) => x.endsWith(".html"));
const html = {};
for (const f of htmlFiles) html[f] = fs.readFileSync(path.join(root, f), "utf8");
let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}

// ---- 1. Touch-target heights, computed from the CSS ---------------------
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
function decls(selector) {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = clean.match(new RegExp(esc + "\\s*\\{([^}]*)\\}"));
  if (!m) return null;
  const out = {};
  for (const d of m[1].split(";")) {
    const i = d.indexOf(":");
    if (i > 0) out[d.slice(0, i).trim()] = d.slice(i + 1).trim();
  }
  return out;
}
function px(v) { return v ? Number((v.match(/([\d.]+)px/) || [])[1]) : null; }
function padV(d) {
  if (!d || !d.padding) return 0;
  const parts = d.padding.split(/\s+/).map((x) => Number(x.replace("px", "")));
  return parts[0]; // padding: A B -> A is vertical; padding: A -> A
}
function heightOf(selector, opts = {}) {
  const d = decls(selector);
  if (!d) return null;
  let size = null, lh = null;
  if (d.font) {
    const f = d.font.match(/(\d+)\s+([\d.]+)px\/([\d.]+)/);
    if (f) { size = Number(f[2]); lh = Number(f[3]); }
  }
  if (size === null && d["font-size"]) size = px(d["font-size"]);
  if (lh === null && d["line-height"]) lh = Number(d["line-height"]);
  if (lh === null) lh = opts.lh !== undefined ? opts.lh : 1.65; // body default
  if (size === null) size = opts.size;
  const border = d.border ? 2 : (opts.border || 0);
  const minH = d["min-height"] ? px(d["min-height"]) : 0;
  return Math.max(padV(d) * 2 + size * lh + border, minH);
}
const targets = [
  [".btn", {}, 44], [".btn-small", { lh: 1.3, border: 2 }, 44],
  [".nav-toggle", { border: 2 }, 44], [".acc-btn", {}, 44],
  [".chip", {}, 44], [".chips-big .chip", { border: 2 }, 44],
  [".mode-btn", {}, 44], [".radio-pill", {}, 44], [".seg-btn", {}, 44],
  [".site-nav a", {}, 44], [".site-footer nav a", {}, 44],
  [".demo-foot input", {}, 44],
];
let heightsOk = true, heightsNotes = [];
for (const [sel, opts, min] of targets) {
  const h = heightOf(sel, opts);
  if (h === null || h < min - 0.01) { heightsOk = false; heightsNotes.push(`${sel}: ${h === null ? "no rule" : h.toFixed(1) + "px"}`); }
}
check("every interactive target >= 44px tall (computed from CSS)",
  heightsOk, heightsNotes.join(" | "));
const close = decls(".sticky-cta-close");
check("sticky close button matches the primary button's height and is never below 44px (Step 28: stretch + aspect-ratio 1 + 44px floor)",
  close && close["align-self"] === "stretch" && close["aspect-ratio"] === "1" &&
  px(close["min-width"]) === 44 && px(close["min-height"]) === 44);

// Range thumb: 24px, webkit + moz, custom track (input appearance: none).
check("range thumb is 24px (webkit + moz) with a styled track",
  /::-webkit-slider-thumb\s*\{[^}]*width:\s*24px[^}]*height:\s*24px/s.test(css)
  && /::-moz-range-thumb\s*\{[^}]*width:\s*24px[^}]*height:\s*24px/s.test(css)
  && /\.calc input\[type="range"\]\s*\{[^}]*appearance:\s*none/s.test(css)
  && /::-webkit-slider-runnable-track\s*\{[^}]*height:\s*4px/s.test(css));

// ---- 2. ARIA states ------------------------------------------------------
// Accordion: the HTML describes the NO-JS state — without JS the panels
// stay visible (app.js comment; CSS collapses them only under html.js-acc),
// so aria-expanded="true" is the truthful HTML value on BOTH FAQ pages.
// app.js sets it to "false" on load and toggles on click (checked below).
const support = html["support.html"];
const accBtns = [...support.matchAll(/<button class="acc-btn"[^>]*>/g)].map((m) => m[0]);
const indexAccBtns = [...html["index.html"].matchAll(/<button class="acc-btn"[^>]*>/g)].map((m) => m[0]);
check("accordion buttons say aria-expanded=true in HTML on both FAQ pages (no-JS state: panels visible)",
  accBtns.length === 7 && indexAccBtns.length === 5
  && [...accBtns, ...indexAccBtns].every((b) => b.includes('aria-expanded="true"'))
  && !/class="acc-panel open"/.test(support) && !/class="acc-panel open"/.test(html["index.html"]),
  `support: ${accBtns.length}, index: ${indexAccBtns.length}`);
check("hero mock status (pill) is aria-hidden (decorative duplicate of the demo)",
  /<div class="app-header" aria-hidden="true">[\s\S]*?<p class="app-pill" id="mock-pill">/.test(html["index.html"]));
check("demo status uses role=status (live region)",
  html["demo.html"].includes('id="demo-status" role="status"')
  && html["index.html"].includes('id="demo-status" role="status"'));
check("toggle buttons carry aria-pressed",
  [...html["demo.html"].matchAll(/<button[^>]*class="(?:mode-btn|seg-btn)[^>]*>/g)]
    .every((m) => m[0].includes("aria-pressed=")));
check("nav toggle carries aria-expanded + aria-controls + aria-label",
  htmlFiles.every((f) => /<button class="nav-toggle"[^>]*aria-expanded="[^"]*"[^>]*aria-controls="site-nav"[^>]*aria-label="Menu"/.test(html[f])));
check("JS updates aria-expanded on the nav toggle",
  /toggle\.setAttribute\("aria-expanded"/.test(js));
check("JS updates aria-expanded on accordion buttons",
  /btn\.setAttribute\("aria-expanded", String\(open\)\)/.test(js));

// ---- 3. Focus, labels, landmarks, motion --------------------------------
// The one documented exception (ACCESSIBILITY.md §2): the hero Replay
// button's visible box (36×30) is smaller than its 44×44 hit region, so
// the button's own outline is suppressed and the identical 3px/2px ring
// is drawn on the visible box instead — focus is still always visible,
// on the thing the eye sees. Anything else suppressed still fails.
check(":focus-visible outline exists and outline is never suppressed (except the documented Replay ring move)",
  /^:focus-visible\s*\{[^}]*outline:\s*3px solid var\(--focus\)/m.test(css)
  && !/outline:\s*(none|0)(;|\s)/.test(css.replace(".app-replay:focus-visible { outline: none; }", ""))
  && /\.app-replay:focus-visible \.app-replay-box \{ outline: 3px solid var\(--focus\); outline-offset: 2px;/.test(css));
let labelsOk = true, labelsNotes = [];
for (const f of htmlFiles) {
  const forIds = new Set([...html[f].matchAll(/<label[^>]*for="([^"]+)"/g)].map((m) => m[1]));
  // Inputs wrapped in a <label>...</label> are labelled even without an id.
  const wrapped = new Set();
  for (const lm of html[f].matchAll(/<label[^>]*>([\s\S]*?)<\/label>/g)) {
    for (const im of lm[1].matchAll(/<input[^>]*>/g)) wrapped.add(im[0]);
  }
  for (const m of html[f].matchAll(/<input[^>]*>/g)) {
    const id = (m[0].match(/id="([^"]+)"/) || [])[1];
    if (!wrapped.has(m[0]) && (!id || !forIds.has(id))) {
      labelsOk = false; labelsNotes.push(`${f}: unlabelled input ${id || m[0].slice(0, 40)}`);
    }
  }
}
check("every input has a label", labelsOk, labelsNotes.join(" | "));
let landmarksOk = true, landmarksNotes = [];
for (const f of htmlFiles) {
  const n = (tag) => (html[f].match(new RegExp("<" + tag + "[\\s>]", "g")) || []).length;
  if (n("main") !== 1 || n("header") !== 1 || n("footer") !== 1) {
    landmarksOk = false; landmarksNotes.push(`${f}: main/header/footer ${n("main")}/${n("header")}/${n("footer")}`);
  }
  if (!/<nav[^>]*aria-label="Main"/.test(html[f])) { landmarksOk = false; landmarksNotes.push(`${f}: nav without aria-label`); }
  if (!/class="skip-link"/.test(html[f])) { landmarksOk = false; landmarksNotes.push(`${f}: no skip link`); }
}
check("one main/header/footer + labelled nav + skip link on every page",
  landmarksOk, landmarksNotes.join(" | "));
check("prefers-reduced-motion respected in CSS and JS",
  (css.match(/@media \(prefers-reduced-motion: reduce\)/g) || []).length >= 2
  && (js.match(/matchMedia\("\(prefers-reduced-motion: reduce\)"\)/g) || []).length >= 2);

// ---- 4. Regressions -------------------------------------------------------
check("step10: no unloaded weights (650/750) reintroduced",
  !/font-weight:\s*650/.test(css) && !/font-weight:\s*750/.test(css) && !/font:\s*650\s/.test(css));
check("step9: hero->content 48px still present",
  /\.page-hero\s*\+\s*\.section\s*\{\s*padding-top:\s*40px;\s*\}/.test(css));
check("step8: h2 48px rhythm still present",
  /\.section\s*>\s*\.container:not\(\.doc\)\s*>\s*h2[^{]*\{[^}]*margin-top:\s*48px/s.test(css));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
