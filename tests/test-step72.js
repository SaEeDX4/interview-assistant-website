/* Step 72 — alignment, paraphrase, mobile shortening and the
   motion pilot for the How It Works page.
   - Alignment: the hero scenes' cards flex so the two scene
     captions share one top line; the trace panel's columns are
     top-aligned (the placement re-pin lives in test-step67).
   - Paraphrase: the page's own prose is shorter; the shortened
     strings are present, the long ones are gone, and a static
     word count over the prose elements is ceiling-pinned.
   - Mobile: the hero scenes' resting rows sit behind a labelled
     disclosure (checkbox pair, armed only at <=640px); the
     verdict artefacts rest on phones; boundary cards tighten.
   - Motion: the MOTION.md tokens exist with the standard values,
     the hw-enter entrance and the reveal/respond pilot wiring
     are in place, and the reduced-motion count is untouched. */
"use strict";
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..", "website");
const html = fs.readFileSync(path.join(root, "how-it-works.html"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const js = fs.readFileSync(path.join(root, "app.js"), "utf8");
const motion = fs.readFileSync(path.join(__dirname, "..", "standards", "MOTION.md"), "utf8");

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log("  ok  " + name); }
  else { fail++; console.log("  FAIL " + name + (detail ? " — " + detail : "")); }
}

const block = (css.match(/\/\* -+ Step 63[\s\S]*?(?=\/\* Step 53)/) || [""])[0];
const band640 = block.slice(block.lastIndexOf("@media (max-width: 640px)"));

/* ---------- 1. Alignment ---------- */
{
  check("align: hero scene cards flex, so scenes 1–2 captions share one top line",
    block.includes(".hw-hw-scene .app-card { margin-bottom: 0; flex: 1 1 auto; }"));
  check("align: the trace panel top-aligns its columns (Step 72 placement)",
    /\.hw-panel \{[^}]*align-items: start;/.test(block));
}

/* ---------- 2. Paraphrase ---------- */
{
  const gone = [
    "out the other side as a spoken point",
    "as far as the app is concerned",
    "that is the whole design",
    "the same channel your meeting app plays through",
    "is compiled from what actually happened",
    "the same question bank and the same answer shapes as the live mode",
    "only live listening sessions do",
  ];
  check("prose: the long phrasings are gone", gone.every((s) => !html.includes(s)),
    gone.filter((s) => html.includes(s)).join(" | "));
  const kept = [
    "The demo’s sample candidate: five confirmed facts.",
    "Only approved facts exist to the app.",
    "Nothing here is invented: if a fact was never confirmed, no point can stand on it.",
    "Minutes run only while you listen live.",
    "The questions you struggled with are the ones to fold into your next preparation run.",
  ];
  check("prose: the shortened phrasings are in (pinned facts untouched)",
    kept.every((s) => html.includes(s)), kept.filter((s) => !html.includes(s)).join(" | "));

  const wordsOf = (frag) => {
    const t = frag.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return t ? t.split(" ").length : 0;
  };
  const all = (re) => [...html.matchAll(re)].map((m) => m[1]);
  let total = 0;
  const add = (frags) => { total += frags.reduce((s, f) => s + wordsOf(f), 0); };
  add(all(/<p class="hw-thread-kicker">([\s\S]*?)<\/p>/g));
  add(all(/<section class="section" id="myths"[\s\S]*?<p class="section-intro">([\s\S]*?)<\/p>/g));
  add(all(/<p class="hw-myth-truth">([\s\S]*?)<\/p>/g));
  add(all(/<section[^>]*id="trace"[\s\S]*?<p class="section-intro">([\s\S]*?)<\/p>/g));
  add(all(/<p class="hw-cap-body">([\s\S]*?)<\/p>/g));
  add(all(/<p class="hw-cap-fear">([\s\S]*?)<\/p>/g));
  add(all(/<p class="hw-cap-clock">([\s\S]*?)<\/p>/g));
  add(all(/<p class="hw-proof">([\s\S]*?)<\/p>/g));
  add(all(/<section class="section" id="faded"[\s\S]*?<p class="section-intro">([\s\S]*?)<\/p>/g));
  add(all(/<p class="hw-faded-feedback"[^>]*>([\s\S]*?)<\/p>/g));
  add(all(/<p class="hw-faded-note">([\s\S]*?)<\/p>/g));
  add([...html.matchAll(/<article class="hw-bound">[\s\S]*?<\/article>/g)]
    .map((m) => [...m[0].matchAll(/<p>([\s\S]*?)<\/p>/g)].map((x) => x[1]).join(" ")));
  add(all(/<section class="next-band"[\s\S]*?<p>([\s\S]*?)<\/p>/g));
  /* Ceiling: the Step 72 paraphrase measured 735 static words over
     this element set (the same elements held 807 before the
     paraphrase, measured with this extractor on a reconstruction
     of the pre-Step-72 file; the Playwright JS-off rendered count
     over the audit's wider set went 906 -> 825). The ceiling is
     the measured value so the prose cannot quietly grow back. */
  check("prose: static word count over the prose elements stays at the Step 72 measure (735)",
    total <= 735, "total=" + total);
  console.log("  info  static prose total = " + total);
}

/* ---------- 3. Mobile shortening ---------- */
{
  check("mobile: both disclosure toggles exist, labelled, inside the hero window",
    html.includes('<input class="hw-fold-toggle" type="checkbox" id="hw-fold-facts">')
    && html.includes('<label class="hw-fold-btn" for="hw-fold-facts">All five facts')
    && html.includes('<input class="hw-fold-toggle" type="checkbox" id="hw-fold-questions">')
    && html.includes('<label class="hw-fold-btn" for="hw-fold-questions">All five questions'));
  check("mobile: the toggle pair is inert outside the phone band",
    block.includes(".hw-fold-toggle, .hw-fold-btn { display: none; }"));
  check("mobile: at <=640 the label arms and the checkbox restores rows 4–5 in place",
    band640.includes(".hw-fold-btn { display: inline-flex;")
    && band640.includes(".hw-hw-scene:has(.hw-fold-toggle:checked) .hw-hw-crop { display: flex; }")
    && band640.includes(".hw-fold-toggle:focus-visible + .hw-fold-btn"));
  check("mobile: the resting rows are still exactly four (2 scenes x 2 rows)",
    (html.match(/hw-hw-crop/g) || []).length === 4);
  check("mobile: verdict artefacts rest on phones; links take the vacated row",
    band640.includes(".hw-verdict .hw-myth-viz { display: none; }")
    && band640.includes(".hw-verdict .hw-myth-links { grid-row: 2; }"));
  check("mobile: boundary cards take the tighter phone padding",
    band640.includes(".hw-bound { padding: 20px; }"));
}

/* ---------- 4. Motion system pilot ---------- */
{
  check("motion: the tokens exist with the MOTION.md values",
    css.includes("--motion-1: 150ms;") && css.includes("--motion-2: 250ms;")
    && css.includes("--motion-3: 300ms;")
    && css.includes("--motion-ease: cubic-bezier(.2,.7,.3,1);"));
  check("motion: MOTION.md names the tokens, the primitives and the new keyframe",
    motion.includes("--motion-1") && motion.includes("hw-enter")
    && motion.includes("**Entrance**") && motion.includes("**Reveal**") && motion.includes("**Respond**"));
  check("motion: the hero entrance starts at the reveal floor (.85 / 6px), never from invisible",
    block.includes("@keyframes hw-enter { from { opacity: .85; transform: translateY(6px); }")
    && block.includes("animation: hw-enter .3s cubic-bezier(.2,.7,.3,1) both;"));
  check("motion: the entrance stagger is delays only (40ms steps, no new durations)",
    block.includes("body:has(.hw-trace) .hw-herowindow { animation-delay: .12s; }")
    && block.includes("body:has(.hw-trace) .hw-clocks { animation-delay: .16s; }"));
  check("motion: the reveal pilot classes are in the Step 1 module's list (this page only)",
    js.includes('".hw-trace, .hw-faded, .hw-bound"'));
  check("motion: the static-top discipline survives — JS still never names the hero or verdict blocks",
    !js.includes("hw-verdict") && !js.includes("hw-hw-") && !js.includes("hw-herowindow"));
  check("motion: respond primitive on the verdict links (colour, 150ms, ease)",
    block.includes(".hw-myth-links a { transition: color .15s ease; }"));
  check("motion: still exactly 3 reduced-motion blocks in the sheet",
    (css.match(/@media \(prefers-reduced-motion: reduce\)/g) || []).length === 3);
  check("motion: no new JS module was needed — app.js gained no hw- strings (Steps 68/69/71 discipline)",
    !js.includes("hw-fold") && !js.includes("hw-enter"));
}

console.log(`test-step72: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
