/* Step 63 suite — How It Works, "One Question, Traced" (Concept 1,
   owner-approved, with Concept 3's myth strip as the opening and
   Concept 2's clock discipline in the captions).
   Contract pinned here: the trace's data is the demo's canonical
   sample data — the stage-5 points are SAMPLES.tell.answer verbatim
   (extracted from app.js, not retyped), the faded frames are the
   INT concise/rapid sets verbatim; the bullet<->fact mapping is
   exactly {b1:[f1,f2], b2:[f4], b3:[f5]}, bidirectionally
   consistent, with fact 3 honestly unmapped (it stands behind the
   bank's second question, SAMPLES.story.q — also pinned verbatim);
   the three myths and their one-breath refutations; the
   no-duplication contract (the old page's double telling — timeline
   + expanded cards, ~59% of it — is gone, classes included); the
   prediction mechanic (exactly one correct option); the boundary
   numbers (30 / 600 minutes, 14 / 365 days, no scores); hotkeys
   canonical here; NO speed or latency claims anywhere; every frame
   labelled simulated; stage captions within the 40-word discipline;
   the CSS law for the Step 63 block (spacing scale, motion scale,
   overflow-anchor, no 999px, still exactly 3 reduced-motion blocks
   sheet-wide); and the JS module's discipline (guarded, after the
   hero IIFE, no scrolling, no focus moves, no timers). Behaviour
   (stepping, highlighting, prediction, heights, scroll timelines,
   contrast, JS-off, reduced motion) is pinned by sim-step63 and by
   the Playwright audit kept with the report in
   step63-howitworks/audit.py.
   Usage: node test-step63.js   (exit 0 = all pass) */
const fs = require("fs");
const path = require("path");

const D = path.join(__dirname, "..", "website") + path.sep;
const read = (f) => fs.readFileSync(D + f, "utf8");
const html = read("how-it-works.html");
const css = read("styles.css");
const js = read("app.js");
const visible = html.replace(/<script[\s\S]*?<\/script>/g, "");
const strip = (s) => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; }
  else { fail++; console.log("FAIL " + name + (detail ? " — " + detail : "")); }
}

/* ---------- 1. The trace data IS the demo's canonical sample data ---------- */
{
  const tellBlock = js.slice(js.indexOf("tell: {"), js.indexOf("hire: {"));
  const samples = [...tellBlock.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  const sampleQ = samples[0];
  const sampleAnswer = samples.slice(1, 4);
  const bulletTexts = [...html.matchAll(/<span class="hw-bullet-text">([^<]+)<\/span>/g)].map((m) => m[1]);
  check("data: the three stage-5 points are SAMPLES.tell.answer verbatim, in order",
    JSON.stringify(bulletTexts) === JSON.stringify(sampleAnswer),
    JSON.stringify(bulletTexts));
  check("data: the stage-3 question is SAMPLES.tell.q verbatim",
    sampleQ === "Tell me about yourself." && html.includes("“" + sampleQ + "”"));
  const storyQ = (js.match(/story: \{\s*q: "([^"]+)"/) || [])[1];
  check("data: the bank's second question is SAMPLES.story.q verbatim (fact 3's home)",
    storyQ === "Tell me about a time you led a difficult project."
    && html.includes("“" + storyQ + "”") && html.includes("Verified · Fact 3"));
  const intBlock = js.slice(js.indexOf("var INT = {"), js.indexOf("};", js.indexOf("var INT = {")));
  const grab = (key) => {
    const seg = intBlock.slice(intBlock.indexOf(key + ":"));
    return [...seg.matchAll(/"([^"]+)"/g)].map((m) => m[1])
      .slice(0, key === "concise" ? 2 : 1);
  };
  const faded = html.slice(html.indexOf('id="hw-faded"'), html.indexOf('id="boundaries"'));
  const frameTexts = [...faded.matchAll(/<li><span class="app-dot"><\/span><span>([^<]+)<\/span><\/li>/g)].map((m) => m[1]);
  check("data: the faded frames are the INT concise + rapid sets verbatim",
    JSON.stringify(frameTexts) === JSON.stringify([...grab("concise"), ...grab("rapid")]),
    JSON.stringify(frameTexts));
}

/* ---------- 2. The bullet<->fact mapping (the trace itself) ---------- */
{
  const bullets = [...html.matchAll(/<button type="button" class="hw-bullet" data-bullet="(b\d)" data-facts="([^"]*)"/g)]
    .map((m) => [m[1], m[2] ? m[2].split(" ") : []]);
  const facts = [...html.matchAll(/<button type="button" class="hw-fact" data-fact="(f\d)" data-bullets="([^"]*)"/g)]
    .map((m) => [m[1], m[2] ? m[2].split(" ") : []]);
  const bMap = Object.fromEntries(bullets);
  const fMap = Object.fromEntries(facts);
  check("mapping: exactly 3 points and 5 facts wired",
    bullets.length === 3 && facts.length === 5);
  check("mapping: bullet->fact is exactly {b1:[f1,f2], b2:[f4], b3:[f5]}",
    JSON.stringify(bMap) === JSON.stringify({ b1: ["f1", "f2"], b2: ["f4"], b3: ["f5"] }),
    JSON.stringify(bMap));
  check("mapping: fact->bullet is the exact inverse, fact 3 honestly empty",
    JSON.stringify(fMap) === JSON.stringify({ f1: ["b1"], f2: ["b1"], f3: [], f4: ["b2"], f5: ["b3"] }),
    JSON.stringify(fMap));
  const consistent = bullets.every(([b, fs_]) => fs_.every((f) => (fMap[f] || []).includes(b)))
    && facts.every(([f, bs]) => bs.every((b) => (bMap[b] || []).includes(f)));
  check("mapping: bidirectionally consistent (every link answers back)", consistent);
  check("mapping: the printed source lines tell the same mapping",
    html.includes("Built from facts 1 + 2") && html.includes("Built from fact 4")
    && html.includes("Built from fact 5")
    && html.includes("Fact 3 stands behind the bank’s second question; it is simply not in this answer."));
  const factTexts = [...html.matchAll(/<button type="button" class="hw-fact" data-fact="f\d" data-bullets="[^"]*" aria-pressed="false"><span class="hw-fact-num">\d<\/span><span>([^<]+)<\/span><\/button>/g)]
    .map((m) => m[1]);
  check("mapping: the five facts are the Features Prepare facts + the fit fact",
    JSON.stringify(factTexts) === JSON.stringify([
      "Five years building web products",
      "Led a small team on a customer-facing tool",
      "Rescued a slipping launch with staged rollouts",
      "Works outcome-first; trade-offs written down",
      "Drawn to teams that ship carefully and review honestly",
    ]), JSON.stringify(factTexts));
}

/* ---------- 3. Stepper structure + caption discipline ---------- */
{
  const names = [...html.matchAll(/<span class="hw-node-name">([^<]+)<\/span>/g)].map((m) => m[1]);
  check("stepper: five nodes, in the thread's order",
    JSON.stringify(names) === JSON.stringify(
      ["Fact confirmed", "Bank built", "Question asked", "Pause detected", "Three points, sourced"]));
  const panels = [...html.matchAll(/<section class="hw-panel" data-panel="\d" aria-label="Stage \d: [^"]+">/g)];
  check("stepper: five pre-rendered panels with stage labels", panels.length === 5);
  check("stepper: progress line + both live announcers + prev/next present",
    html.includes('<p class="hw-progress" id="hw-progress">Stage 1 of 5 — Fact confirmed</p>')
    && html.includes('id="hw-live"') && html.includes('id="hw-trace-live"')
    && html.includes('id="hw-prev"') && html.includes('id="hw-next"'));
  const bodies = [...html.matchAll(/<p class="hw-cap-body">([^<]+)<\/p>/g)].map((m) => m[1]);
  check("captions: five stage captions, each within the 40-word discipline",
    bodies.length === 5 && bodies.every((b) => b.split(/\s+/).length <= 40),
    bodies.map((b) => b.split(/\s+/).length).join(","));
  check("captions: every stage carries its fear line and its clock line",
    (html.match(/class="hw-cap-fear"/g) || []).length === 5
    && (html.match(/class="hw-cap-clock"/g) || []).length === 5);
  check("thread: the marker rides the traced fact (stage 1 row + stage 2 question)",
    html.includes('<div class="hw-factrow is-thread">')
    && html.includes("The thread") && (html.match(/class="hw-diamond"/g) || []).length >= 3);
}

/* ---------- 4. The myth strip (Concept 3 graft) ---------- */
{
  const says = [...html.matchAll(/<p class="hw-myth-say">([^<]+)<\/p>/g)].map((m) => m[1]);
  check("myths: the three arrivals fears, named verbatim",
    JSON.stringify(says) === JSON.stringify(
      ["“It records me.”", "“It invents answers.”", "“It hides and works in secret.”"]));
  // Step 68 re-pin: Concept A compressed each refutation to a
  // one-line truth (the paragraphs became verdict cards). The
  // check pins the new truth lines verbatim, plus the stage-5
  // fear line that now carries the "nothing to invent from"
  // fact the second card's line no longer spells out — the
  // preservation map is in step68-hero-fears-ideation/
  // report.md (items M2-1 and M2-5).
  check("myths: each refuted in one breath, from sourced product facts (Step 68 one-line truths)",
    html.includes("Never your microphone. Never stored.")
    && html.includes("only the interviewer — through your headset, only while you listen.")
    && html.includes("Built only from your confirmed facts and your bank — an unconfirmed fact is never used.")
    && html.includes("Small, visible, never hides itself.")
    && html.includes("Nothing here is invented: if a fact was never confirmed, no point can stand on it"));
  check("myths: each card routes onward (trace / privacy / controls)",
    (html.match(/class="hw-myth-links"/g) || []).length === 3
    && html.includes('href="#trace"') && html.includes('href="#first-run"'));
}

/* ---------- 5. The faded prediction ---------- */
{
  const opts = [...html.matchAll(/<button type="button" class="hw-opt" data-correct="(true|false)"/g)].map((m) => m[1]);
  check("faded: three predictions, exactly one correct (the shortening)",
    opts.length === 3 && opts.filter((o) => o === "true").length === 1
    && html.includes("A shorter answer — fewer points, tighter lines"));
  check("faded: the static reveal carries the honest default verdict",
    html.includes("The next answer shortens — first Concise, then Rapid")
    && html.includes('id="hw-reveal-btn"') && html.includes('id="hw-faded-feedback"'));
}

/* ---------- 6. Boundaries + first run (told once) ---------- */
{
  check("boundaries: the minutes law (Trial 30 once / Pro 600 per period / practise free)",
    html.includes("The Trial gives you 30 live minutes, once, for the life of the account.")
    && html.includes("Pro gives you 600 per billing period.")
    && html.includes("Practise and preparation never touch them."));
  check("boundaries: the report law (on your PC, 14 / 365 days, no scores)",
    html.includes("It stays on your PC by default, kept 14 days on Trial and 365 on Pro.")
    && html.includes("no scores, no hiring predictions"));
  check("boundaries: stopping is the user's, and the record stays honest",
    html.includes("press stop and the app stops listening, there and then")
    && html.includes("a short interview is still a complete record"));
  check("first run: the pinned practise sentence survives (test-step7's pin, kept)",
    html.includes("The questions you struggled with are the ones to fold into your next preparation run."));
  const firstRun = html.slice(html.indexOf('id="first-run"'), html.indexOf('class="next-band"'));
  check("first run: before-the-day x5 + on-the-day x2, numbered once",
    (firstRun.match(/<li><strong>/g) || []).length === 7);
}

/* ---------- 7. No-duplication contract + honesty law ---------- */
{
  check("dedup: the old double telling is gone (timeline, expanded cards, first hour)",
    !html.includes("steps-expanded") && !html.includes('class="timeline"')
    && !html.includes("Your first hour with the app") && !html.includes('class="tl-item"'));
  check("honesty: no speed or latency claim anywhere on the page",
    !/under a second|split second|instant|millisecond|real-time|in real time/i.test(visible));
  check("honesty: every frame labelled simulated (proof line, intro, faded note)",
    (visible.match(/simulat/gi) || []).length >= 5
    && html.includes("Simulated from the demo’s own sample data"));
  check("honesty: no 'AI' label for answers anywhere on the page",
    !/\bAI\b/.test(visible));
  // Step 68 re-pin: Ctrl+Alt+Space now appears twice — the
  // canonical telling in the first-run hotkey list, plus the
  // aria-hidden window-bar replica in myth card 3, which
  // pictures the key rather than defining it a second time.
  // L and C stay at exactly once; R in its three honest places.
  check("hotkeys: canonical here — L and C exactly once, R in its three honest places, Space in the list + the Step 68 replica",
    (html.match(/Ctrl\+Alt\+L/g) || []).length === 1
    && (html.match(/Ctrl\+Alt\+C/g) || []).length === 1
    && (html.match(/Ctrl\+Alt\+R/g) || []).length === 3
    && (html.match(/Ctrl\+Alt\+Space/g) || []).length === 2);
  check("hotkeys: no orphaned period after </kbd> (the Step 6 law)",
    !html.includes("</kbd>."));
}

/* ---------- 8. CSS law for the Step 63 block ---------- */
{
  const block = (css.match(/\/\* -+ Step 63[\s\S]*?(?=\/\* Step 53)/) || [""])[0];
  check("css63: block exists, placed before the Step 53 block (outside every bounded slice)",
    block.length > 4000, String(block.length));
  check("css63: scroll anchoring off for this page only (the Step 58/61 pattern)",
    block.includes("body:has(.hw-trace) { overflow-anchor: none; }"));
  check("css63: the trace states exist (lit / dim / chosen / correct / wrong / armed / revealed)",
    [".hw-bullet.is-lit", ".hw-bullet.is-dim", ".hw-fact.is-lit", ".hw-opt.is-chosen",
     ".hw-faded.is-revealed .hw-opt[data-correct=\"true\"]",
     ".hw-faded.is-revealed .hw-opt.is-chosen[data-correct=\"false\"]",
     ".hw-faded.is-armed .hw-reveal"].every((s) => block.includes(s)));
  check("css63: no 999px, no capsule in the block; reveal button honours [hidden]",
    !block.includes("999px") && block.includes("#hw-reveal-btn[hidden] { display: none; }"));
  // Step 83 re-pin (annotated): "10px" joins the local scale for one
  // value — the app inter-card gap (.hw-hw-scene .app-card + .app-card
  // margin-top), from MainWindow.xaml (QuestionCard margin 0,0,0,10).
  // Inside the window the app's form wins over the site scale
  // (standards/SPACING.md, Step 83 exemption).
  const SCALE = new Set(["0", "4px", "8px", "10px", "12px", "16px", "20px", "24px", "28px",
    "32px", "40px", "48px", "56px", "64px", "72px", "96px", "auto"]);
  let spacingOk = block.length > 0;
  for (const m of block.matchAll(/(?:margin|padding)(?:-[a-z]+)?\s*:\s*([^;]+);/g)) {
    for (const v of m[1].trim().split(/\s+/)) if (!SCALE.has(v)) spacingOk = false;
  }
  check("css63: every margin/padding value is on the Step 9 scale (auto = the house right-align)", spacingOk);
  let transOk = true;
  for (const m of block.matchAll(/transition:[^;]*?(\d*\.?\d+)s/g)) {
    if (![0.15, 0.25, 0.3].includes(parseFloat(m[1]))) transOk = false;
  }
  const beziers = block.match(/cubic-bezier\([^)]*\)/g) || [];
  check("css63: transitions stay inside the motion scale (.15/.25/.3), house easing only",
    transOk && beziers.length > 0 && beziers.every((b) => b === "cubic-bezier(.2,.7,.3,1)"));
  check("css63: still exactly 3 reduced-motion blocks in the whole sheet",
    (css.match(/@media \(prefers-reduced-motion: reduce\)/g) || []).length === 3);
  check("css63: the retired mini/timeline family stays retired (Step 6/7 re-pins)",
    !/\.mini-tag\s*\{/.test(css) && !/\.steps-expanded\s*\{/.test(css) && !/\.tl-dot\s*\{/.test(css));
}

/* ---------- 9. JS module discipline ---------- */
{
  const start = js.indexOf("/* Step 63");
  const mod = start === -1 ? "" : js.slice(start);
  check("js63: module exists and sits after the hero IIFE (the Step 30 trap)",
    start > js.indexOf("(function () {") && mod.includes('getElementById("hw-trace")'));
  check("js63: the stepper, the bidirectional trace and the prediction are all wired",
    mod.includes('getElementById("hw-prev")') && mod.includes('getElementById("hw-next")')
    && mod.includes('getAttribute("data-facts")') && mod.includes('getAttribute("data-bullets")')
    && mod.includes('getElementById("hw-faded")') && mod.includes('data-correct'));
  check("js63: the Step 58 law — no scrolling, no focus moves, no timers in the module",
    !mod.includes("scrollIntoView") && !mod.includes(".focus(") && !mod.includes("setTimeout")
    && !mod.includes("setInterval") && !mod.includes("scrollTo"));
  // Step 65 re-pin: the module's reduceMotion variable was defined but
  // never read — dead code, removed in the Step 65 final review. The
  // module's motion is CSS-only and the global reduced-motion rule
  // stills it (Step 65 S4 audit measured 0s durations), so the true
  // invariant is stronger: no matchMedia call in the module at all.
  check("js63: no matchMedia call in the module (Step 65 re-pin: CSS-only motion, global reduced-motion rule stills it)",
    (mod.match(/matchMedia\(/g) || []).length === 0);
  check("js63: announcements are words, not silence (stage + mapping + verdict)",
    mod.includes('"Stage "') && mod.includes('" stands on "') && mod.includes('" stands behind "')
    && mod.includes('"Exactly right. "') && mod.includes('"Not quite. "'));
}

console.log(`test-step63: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
