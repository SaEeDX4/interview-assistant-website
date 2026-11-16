/* Step 38 — three owner-spotted defects fixed together:
   (1) the story live header's close button clipped on desktop,
   (2) the start button's play glyph under a "Pause" label,
   (3) the "What it does" trio's ragged heights — rebuilt as the
   Timeline Trio (research: step38-feature-trio-research.md). */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const index = fs.readFileSync(path.join(root, "website/index.html"), "utf8");
const js = fs.readFileSync(path.join(root, "website/app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "website/styles.css"), "utf8");
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");

let pass = 0, fail = 0;
function check(name, ok) {
  if (ok) { pass++; console.log("PASS " + name); }
  else { fail++; console.log("FAIL " + name); }
}

/* 1 — the story header sheds decoration, never the close button. */
check("story live header sheds the help/more icon buttons",
  clean.includes("#story-live-header .app-icon-btn { display: none; }"));
check("story live header sheds minimise/maximise, keeps close",
  clean.includes("#story-live-header .app-win-btn:not(:last-child) { display: none; }"));
check("story badge sheds at <=1024px (closed-set width)",
  /@media \(max-width: 1024px\) \{[\s\S]*?\.story-window \.app-header \.app-badge \{ display: none; \}/.test(clean));
check("the shed is CSS-only: faithful markup counts survive",
  (index.match(/class="app-icon-btn"/g) || []).length >= 2 &&
  (index.match(/class="app-win-btn"/g) || []).length >= 3);

/* 2 — the start icon follows the label, in JS and in the snapshots. */
check("no text play glyph remains in any start icon",
  !index.includes('<span class="app-start-icon" aria-hidden="true">▶</span>'));
check("static Pause snapshots carry the pause bars",
  (index.match(/<span class="app-start-icon" aria-hidden="true"><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3\.8"/g) || []).length === 5);
check("both engines swap the icon with the label (setStart)",
  (js.match(/function setStart\(label\)/g) || []).length === 2 &&
  (js.match(/setStart\("Pause"\)/g) || []).length === 4 &&
  (js.match(/setStart\("Start listening"\)/g) || []).length === 2 &&
  js.includes('if (startIconEl) { startIconEl.innerHTML = label === "Pause" ? PAUSE_ICON : PLAY_ICON; }'));
check("start icons are sized SVGs now",
  /\.app-start-icon svg \{ display: block; width: 11px; height: 11px; \}/.test(clean));

/* 3 — the Timeline Trio. */
check("the trio is an ordered list with three timeline cards",
  index.includes('<ol class="grid grid-3 grid-timeline">') &&
  (index.match(/<li class="card tl-card">/g) || []).length === 3);
check("heights are structural: stretch grid + flex-column cards + pinned fact",
  /\.grid\.grid-timeline \{[^}]*align-items: stretch/.test(clean) &&
  /\.tl-card \{[^}]*flex-direction: column/.test(clean) &&
  /\.tl-fact \{[^}]*margin: auto 0 0/.test(clean));
check("nodes, phases, taglines and facts are all present",
  ["Before", "During", "During — your words"].every((t) => index.includes(t)) &&
  ["Built only from facts you confirm.", "Short enough to say out loud.", "Keywords, not a script."].every((t) => index.includes(t)) &&
  ["A 50–150 question bank, built before the call.", "One point at a time — never a wall of text.", "toggles it live."].every((t) => index.includes(t)));
check("node is a rounded square (8px), never a circle",
  /\.tl-node \{[^}]*border-radius: 8px/.test(clean) &&
  !/\.tl-node \{[^}]*border-radius: 50%/.test(clean));
check("the thread: solid into Live, dashed into Coach, vertical rail at <=1024px",
  /\.tl-card:not\(:last-child\)::after \{[^}]*border-top: 1px solid/.test(clean) &&
  /\.tl-card:nth-child\(2\)::after \{ border-top-style: dashed; \}/.test(clean) &&
  /@media \(max-width: 1024px\) \{[\s\S]*?\.tl-card:not\(:last-child\)::after \{[^}]*border-left: 1px solid/.test(clean));
check("card bodies fit the premium copy budget (<=240 chars)",
  ["only the ones you confirm are ever used.", "written to be said, not read.", "so the words stay yours."].every((t) => index.includes(t)) &&
  !index.includes("A 50–150 question bank is built for\n            that interview."));
check("'See all features' is a text link now, not a filled button",
  index.includes('<a class="text-link" href="features.html">See all features <span class="text-link-arrow" aria-hidden="true">→</span></a>') &&
  /\.text-link \{[^}]*padding: 12px 0/.test(clean) &&
  clean.includes(".text-link:hover .text-link-arrow { transform: translateX(4px); }"));
check("timeline cards do not lift on hover (connector honesty)",
  clean.includes(".tl-card:hover { transform: none;"));

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
