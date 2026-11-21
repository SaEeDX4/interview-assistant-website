/* Step 67 suite — How It Works stepper: NO INTERNAL SPREAD,
   and the hero clock strip as a true aligned grid.
   Owner-reported from his desktop (live site, stage 1) and
   confirmed on his phone: the space inside stages 1–4 was
   distributed through the columns — the confirmed-fact rows
   floated apart across their card, the caption's fear line
   sat adrift with slack trailing under the clock line — and
   "only fills on number 5". Step 66 had measured only the
   void at a column's bottom; Step 67's audit measures EVERY
   internal gap (step67-stepper-compact/audit.py: any gap
   between consecutive content blocks, or slack inside a
   container, over 32px is a defect). The mechanism, measured
   before the fix at 1440: the panel stretched both columns
   to the taller one, and inside the stretched window the
   last card grew and distributed its children (answer-card
   gaps 34.4/34.5px against natural 16/20), the points
   distributed inside their card (57.8px against a natural
   12), and the shorter caption trailed 69.4/93.5px of slack
   under its clock line (stages 1–2). The fix is geometry,
   not content:
   - the two space-between distribution rules are deleted
     and the window chain no longer grows — every card and
     row sits at its natural spacing;
   - the panel CENTRES the shorter column (align-items:
     center on .hw-panel): each column is one compact
     natural block, breathing room split above/below it,
     never interleaved between its elements;
   - stage 5, naturally full on both sides, keeps its
     content and panel height; its points take the natural
     12px rhythm like every other row.
   The same owner's-eye pass caught the hero's three-clock
   strip wrapping 2+1 (a flex row at natural widths inside
   the 912px hero measure: 300 + 24 + 343 > 912 for the
   third). It is now a 3-column grid — equal columns, aligned
   starts, at every width above 640px — and a one-column
   stack on phones. Never a 2+1 wrap at any width.
   Behaviour (per-stage internal gaps at 1440/403/390, column
   centring, the stack gap on phones, clock geometry at
   1440/1024/768/641/403, the Step 66 glide re-proof,
   reduced motion, the JS-off stack, zero console errors)
   is pinned by the Playwright audit kept with the report
   in step67-stepper-compact/audit.py.
   Usage: node test-step67.js   (exit 0 = all pass) */
const fs = require("fs");
const path = require("path");

const D = path.join(__dirname, "..", "website") + path.sep;
const read = (f) => fs.readFileSync(D + f, "utf8");
const css = read("styles.css");

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; }
  else { fail++; console.log("FAIL " + name + (detail ? " — " + detail : "")); }
}

const block = (css.match(/\/\* -+ Step 63[\s\S]*?(?=\/\* Step 53)/) || [""])[0];

/* ---------- 1. The panel: compact columns, shorter centred ---------- */
{
  // Step 72 re-pin: the panel's columns are TOP-aligned now, not
  // centred. Step 67's compactness law (nothing grows, nothing
  // distributes — the checks below) is untouched; only the compact
  // blocks' placement changed, on the owner's alignment order, so
  // the window and the caption share one top edge at every stage
  // and stepping never moves either column's top.
  check("compact: the panel top-aligns its two compact columns (Step 72 placement; Step 67 compactness unchanged)",
    /\.hw-panel \{[^}]*align-items: start;/.test(block));
  check("compact: nothing in the window chain grows",
    block.includes(".hw-panel .app-window { display: flex; flex-direction: column; }")
    && block.includes(".hw-panel .app-window-body { display: flex; flex-direction: column; }")
    && !block.includes(".hw-panel .app-window { flex: 1 1 auto;")
    && !block.includes(".hw-panel .app-window-body { flex: 1 1 auto;"));
  check("compact: the distribution rules are gone (last card, points)",
    !block.includes(".hw-panel .app-card:last-of-type")
    && !block.includes("align-content: space-between")
    && !block.includes(".hw-panel .hw-bullets { flex: 1 1 auto;"));
  check("compact: cards still stack as flex columns at natural spacing",
    block.includes(".hw-panel .app-card { display: flex; flex-direction: column; }")
    && block.includes(".hw-bullets { display: grid; gap: 12px; }"));
}

/* ---------- 2. The hero clock strip: a grid, never a 2+1 wrap ---------- */
{
  check("clocks: a 3-column grid with equal columns (not a wrapping flex row)",
    block.includes(".hw-clocks { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px 24px;")
    && !block.includes(".hw-clocks { display: flex"));
  const phone = block.slice(block.lastIndexOf("@media (max-width: 640px)"));
  check("clocks: phones stack it — one column, one caption per line",
    phone.includes(".hw-clocks { grid-template-columns: minmax(0, 1fr); }"));
  check("clocks: the strip keeps its house frame (24px above, hairline, 20px pad)",
    block.includes("margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border); }"));
}

/* ---------- 3. Sheet-wide law still holds ---------- */
{
  check("law: still exactly 3 reduced-motion blocks in the whole sheet",
    (css.match(/@media \(prefers-reduced-motion: reduce\)/g) || []).length === 3);
  check("law: no 999px anywhere in the Step 63 block (radius family intact)",
    !block.includes("999px"));
}

console.log(`test-step67: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
