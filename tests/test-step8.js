/* Step 8 spacing audit — static checks on styles.css + HTML structure.
   Run: node tests/test-step8.js   (from ~/workspace/interview-assistant-website)
   The defect class: base headings carry no top margin, so an h2 starting a
   new block inside a section sat flush (0-28px) against the block above it
   — the download page's "You'll need" heading touched the Portable ZIP card
   (Saeed's screenshot). Fix: a scoped section-rhythm rule gives direct-child
   h2s 48px (40px on phones) and h3s 28px above them, with exceptions for
   first-child headings and eyebrow/step-num label+heading units. */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "website");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}

// 1. The section-rhythm rule exists and excludes the terms doc page.
check("rhythm rule for section h2 (48px)",
  /\.section\s*>\s*\.container:not\(\.doc\)\s*>\s*h2[^{]*\{[^}]*margin-top:\s*48px/s.test(css));
check("rhythm rule for section h3 (28px)",
  /\.section\s*>\s*\.container:not\(\.doc\)\s*>\s*h3[^{]*\{[^}]*margin-top:\s*28px/s.test(css));
check("rhythm rule for two-col h3 (Hotkeys, 28px)",
  /\.section\s*>\s*\.container:not\(\.doc\)\s*>\s*\.two-col\s*>\s*div\s*>\s*h3\s*\{[^}]*margin-top:\s*28px/s.test(css));
check("mobile rhythm: h2 40px at <=640px",
  /@media\s*\(max-width:\s*640px\)\s*\{[^}]*\.section\s*>\s*\.container[^{]*h2[^{]*\{[^}]*margin-top:\s*40px/s.test(css));

// 2. Exceptions: first-child and label+heading units keep margin-top 0.
check("exception: first-child h2 keeps 0",
  /\.section\s*>\s*\.container[^{]*h2:first-child[^{]*\{[^}]*margin-top:\s*0/s.test(css));
check("exception: eyebrow + h2 keeps 0",
  /\.eyebrow\s*\+\s*h2[^{]*\{[^}]*margin-top:\s*0/s.test(css));

// 3. Terms doc rule untouched (its own 32px + border rhythm).
check("terms .doc h2 rule still 32px + border-top",
  /\.doc h2\s*\{[^}]*margin-top:\s*32px/s.test(css)
  && /\.doc h2\s*\{[^}]*border-top:\s*1px solid var\(--border\)/s.test(css));

// 4. The reported defect is covered: download "You'll need" h2 is a direct
//    child of the section container, so the rhythm rule applies to it.
const dl = fs.readFileSync(path.join(root, "download.html"), "utf8");
check("download You'll-need h2 is a direct container child",
  /<div class="container narrow">[\s\S]*?<h2>You\u2019ll need<\/h2>/.test(dl)
  && !/class="(card|grid|two-col)"/.test(dl.split("<h2>You\u2019ll need")[0].slice(-200)));

// 5. Step 6/7 regression smoke: rules those steps added are still present.
check("step7 code token rule still present", /code\s*\{\s*overflow-wrap:\s*anywhere;\s*\}/.test(css));
check("step6 pipe-list 1fr rule still present",
  /@media\s*\(max-width:\s*640px\)\s*\{\s*\.pipe-list\s*\{\s*grid-template-columns:\s*1fr;\s*\}\s*\}/.test(css));
check("step6 sticky bar hides secondary button <=480px",
  /@media\s*\(max-width:\s*480px\)\s*\{[^}]*\.sticky-cta\s+\.btn-secondary\s*\{\s*display:\s*none;/s.test(css));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
