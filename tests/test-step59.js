/* Step 59 suite — Features page, Concept F "One Window, Five
   Chapters" (owner-approved masterplan, all defaults). Static pins:
   the chapter structure and the mechanics' markup contracts, the
   honesty law on this page (no printed price, simulated labelling,
   proof lines), the stepper's fifteen stages pinned verbatim
   against the pre-Step-59 page's pipe-list, the Live/Languages
   layer texts pinned against the demo's real SAMPLES/INT data in
   app.js, the datasheet's shared rows pinned against pricing.html's
   own table, the sticky-rail CSS law and the module's discipline.
   Usage: node test-step59.js   (exit 0 = all pass) */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const D = path.join(__dirname, "..", "website") + path.sep;
const read = (f) => fs.readFileSync(D + f, "utf8");
const html = read("features.html");
const pricing = read("pricing.html");
const css = read("styles.css");
const js = read("app.js");
/* Visible content only: the shared JSON-LD (identical on all 11
   pages, pinned by test-step6) carries the sandbox-reference Offer
   as structured data — the blueprint's law is about what the page
   PRINTS, so price checks run on the page minus its scripts. */
const visible = html.replace(/<script[\s\S]*?<\/script>/g, "");

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; }
  else { fail++; console.log("FAIL " + name + (detail ? " — " + detail : "")); }
}
const unesc = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&#39;/g, "'").replace(/&quot;/g, '"');

/* ---------- 1. Structure: hero, stat strip, chapter nav ---------- */
check("hero: H1 is the evidence promise, verbatim",
  html.includes("<h1>Everything it does, and the evidence for each claim.</h1>"));
check("hero: the window is labelled a simulated preview; Replay starts hidden",
  html.includes("Simulated preview of the Windows app.")
  && /id="feat-replay"[^>]*hidden/.test(html));
{
  const stats = [...html.matchAll(/<div class="feat-stat">\s*<dt>([^<]+)<\/dt>\s*<dd>([^<]+)<\/dd>/g)]
    .map((m) => m[2] + "|" + unesc(m[1]));
  /* Step 60 re-pin (owner-directed): the languages stat no longer
     names the Arabic & Persian pair — the claim is the ten
     languages; FA/AR are the worked RTL example in the chapter. */
  check("stat strip: 3 points · 50–150 questions · 10 languages · 30 trial minutes",
    JSON.stringify(stats) === JSON.stringify([
      "3|speakable points, one at a time", "50–150|questions built per interview",
      "10|languages, right-to-left included", "30|live minutes on the free Trial"]),
    JSON.stringify(stats));
}
{
  /* Step 60 re-pin: the glance band moved from below the chapters
     to directly under the chapter nav (it is the page's map, and
     at ~70% depth it could only recap). Nav order follows. */
  const ids = ["glance", "prepare", "live", "languages", "report", "privacy", "compare"];
  const pos = ids.map((id) => html.indexOf('id="' + id + '"'));
  check("sections exist in Step 60 order (glance map first, datasheet last)",
    pos.every((p) => p > -1) && pos.every((p, i) => i === 0 || p > pos[i - 1]));
  const nav = (html.match(/<nav class="feat-nav"[\s\S]*?<\/nav>/) || [""])[0];
  const hrefs = [...nav.matchAll(/href="#([a-z]+)"/g)].map((m) => m[1]);
  check("chapter nav links glance + every chapter + compare, in order",
    JSON.stringify(hrefs) === JSON.stringify(ids));
}

/* ---------- 2. Honesty law on this page ---------- */
check("no printed price (no 19.99, no $ amount in visible content)",
  !visible.includes("19.99") && !/\$\s?\d/.test(visible));
check("generated answers are never labelled with the forbidden word (zero occurrences)",
  !/\bAI\b/.test(visible));
check("simulated/sample labelling on the performing windows",
  html.includes("Simulated preview of the Windows app.")
  && html.includes("Sample facts and a sample answer.")
  && html.includes("Sample report — simulated data.")
  /* Step 62 re-pin: the card now shows all ten languages, so the
     labelling line says so. */
  && html.includes("All ten of the app’s languages, shown with the demo’s sample question."));
/* Step 62 re-pin (owner-directed): the list IS printed now — Step 62
   established it from the app's own language registry (Windows
   LanguageRegistry.cs + the 10 × 1,166-key i18n tables, mirrored in
   the Android port), retiring the Step 59 "unsourced, do not print"
   rule. The pin flips: exactly the registry's ten are named, and no
   language outside the registry is. Full contract: test-step62.js. */
check("the 10-language list is printed, exactly the registry's ten (Step 62)",
  html.includes("English, Spanish, French, German, Portuguese, Italian, Arabic, Persian, Chinese (Simplified) and Hindi")
  && !/Japanese|Korean|Turkish|Russian|Dutch/.test(visible));
{
  const proofs = [
    "Where this comes from: the source product’s preparation pipeline — all fifteen stages, in order.",
    "Simulated from the app’s real answer sets — the same samples the demo uses. In the app, this runs on your confirmed facts, not samples.",
    "Sample texts are the demo’s; in the app, answers are built from your confirmed facts in the interviewer’s language.",
    "Retention and contents as implemented in the source product.",
    "Full policy: <a href=\"privacy.html\">the privacy page</a> — this section summarises; it does not replace it."];
  check("all five per-chapter proof lines are present, verbatim",
    proofs.every((p) => html.includes(p)));
}

/* ---------- 3. Prepare: fact-confirm + the 15-stage stepper ---------- */
{
  const inputs = (html.match(/<input type="checkbox" class="feat-fact-box" checked>/g) || []).length;
  const clauses = (html.match(/<span class="feat-clause">/g) || []).length;
  check("fact-confirm: 4 checked facts, 4 answer clauses (index-wired 1:1)",
    inputs === 4 && clauses === 4);
  check("fact-confirm: sources line + counter start at the all-confirmed state",
    html.includes("Sources used by this answer: Five years building web products · Led a small team on a customer-facing tool · Rescued a slipping launch with staged rollouts · Works outcome-first; trade-offs written down")
    && html.includes("4 of 4 facts confirmed — the app uses only confirmed facts."));
}
/* The fifteen stages, verbatim from the pre-Step-59 page's pipe-list
   (the old features.html, remote head f0a20d8) — name + one-liner. */
const STAGES = [
  ["Verify profile", "at least one confirmed fact required; unconfirmed facts raise a warning."],
  ["JD extraction", "multilingual headings; injection lines removed."],
  ["Candidate↔role match map", "token overlap per requirement."],
  ["Gap analysis", "the gaps between your profile and the role, named so they can be bridged honestly."],
  ["Terminology", "acronyms and capitalised terms, preserved verbatim across languages."],
  ["Company/product context", "from your sources only, labelled as such, plus domain playbooks."],
  ["Story ranking by role relevance", "your strongest stories, ranked for this role."],
  ["Likely questions", "the questions this interview is most likely to ask."],
  ["Fast answers", "verified answers shown instantly."],
  ["Coach keywords/structure", "three keywords and a one-line structure per question."],
  ["Playbook", "the interview playbook for this role."],
  ["Truth policy", "verified, hypothetical, or bridge; a guess is never shown as a fact."],
  ["Difficult questions", "the hard ones, prepared in advance."],
  ["Questions to ask", "at least ten questions for the interviewer."],
  ["Runtime cache", "the compact pack the live engine actually uses."]];
{
  const nums = [...html.matchAll(/<button type="button" class="feat-step-num[^"]*"[^>]*aria-label="Stage \d+: ([^"]+)">/g)]
    .map((m) => m[1]);
  check("stepper: 15 numbered buttons whose labels name the original stages",
    nums.length === 15 && nums.every((n, i) => n === STAGES[i][0]),
    JSON.stringify(nums));
  const chunks = html.split('<div class="feat-step-panel"').slice(1);
  let ok = chunks.length === 15;
  chunks.forEach((c, i) => {
    const name = (c.match(/feat-step-name">([^<]+)</) || [])[1];
    const desc = (c.match(/feat-step-desc">([^<]+)</) || [])[1] || "";
    const count = (c.match(/feat-step-count">([^<]+)</) || [])[1];
    if (name !== STAGES[i][0]) ok = false;
    if (desc.charAt(0).toLowerCase() + desc.slice(1) !== STAGES[i][1]) ok = false;
    if (count !== "Stage " + (i + 1) + " of 15") ok = false;
  });
  check("stepper: 15 panels carry the original names + one-liners verbatim (first letter cased)", ok);
  check("stepper: controls + polite live region exist",
    html.includes('id="feat-step-prev"') && html.includes('id="feat-step-next"')
    && html.includes('id="feat-step-play"') && html.includes('aria-pressed="false"')
    && html.includes('id="feat-step-live"'));
}

/* ---------- 4. Live: layers pinned to the demo's real data ---------- */
const dataSlice = js.slice(js.indexOf("var SAMPLES = {"), js.indexOf("(function () {"));
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(dataSlice + "\n;this.__S = SAMPLES;", sandbox);
const S = sandbox.__S;
const intSlice = js.slice(js.indexOf("var INT = {"), js.indexOf("var INT = {") + 700);
const intArr = (key) => {
  const m = intSlice.match(new RegExp(key + ": \\[([\\s\\S]*?)\\]"));
  return m ? [...m[1].matchAll(/"([^"]*)"/g)].map((x) => x[1]) : [];
};
const layerSeg = (id) => {
  const i = html.indexOf('id="' + id + '"');
  if (i < 0) return "";
  const next = html.indexOf('id="feat-live-', i + 10);
  return html.slice(i, next > -1 ? next : i + 1600);
};
const bullets = (seg) => [...seg.matchAll(/<li><span class="app-dot"><\/span><span>([^<]*)<\/span><\/li>/g)]
  .map((m) => unesc(m[1]));
{
  check("live: Normal layer is SAMPLES.tell.answer, verbatim",
    JSON.stringify(bullets(layerSeg("feat-live-normal"))) === JSON.stringify(S.tell.answer),
    JSON.stringify(bullets(layerSeg("feat-live-normal"))));
  check("live: Concise layer is the demo's INT concise set, verbatim",
    JSON.stringify(bullets(layerSeg("feat-live-concise"))) === JSON.stringify(intArr("concise")));
  check("live: Rapid layer is the demo's INT rapid set, verbatim",
    JSON.stringify(bullets(layerSeg("feat-live-rapid"))) === JSON.stringify(intArr("rapid")));
  const coach = layerSeg("feat-live-coach");
  check("live: Coach layer carries SAMPLES.tell.coach keys + structure",
    coach.toUpperCase().includes(S.tell.coach.keys.join(" · "))
    && coach.includes(S.tell.coach.structure));
  check("live: mode + interrupt controls with honest initial state",
    html.includes('id="feat-mode-answer" aria-pressed="true"')
    && html.includes('id="feat-mode-coach" aria-pressed="false"')
    && html.includes('id="feat-int-normal" aria-pressed="true"')
    && html.includes('id="feat-live-status" role="status">Normal (3 points) ready — simulated.<'));
  check("live: the memory visual sets the two oldest exchanges aside, keeps the newest",
    (html.match(/feat-memory-item/g) || []).length === 3
    && (html.match(/feat-memory-item is-set-aside/g) || []).length === 2);
}

/* ---------- 5. Languages: switcher pinned to SAMPLES fa/ar ---------- */
{
  /* Step 62 re-pin: ten chips in global-speaker order (the main five,
     then the five behind the phone toggle); English pressed at rest.
     The full list/layer contract lives in test-step62.js. */
  check("languages: ten chips, English pressed at rest (Step 62)",
    html.includes('class="chip feat-lang-chip" data-lang="en" aria-pressed="true"')
    && html.includes('data-lang="fa" aria-pressed="false"')
    && html.includes('data-lang="ar" aria-pressed="false"')
    && (html.match(/chip feat-lang-chip/g) || []).length === 10);
  const langSeg = (lang) => {
    const i = html.indexOf('data-layer="' + lang + '"');
    if (i < 0) return "";
    const next = html.indexOf('data-layer="', i + 12);
    return html.slice(i, next > -1 ? next : i + 2400);
  };
  const langBullets = (seg) => [...seg.matchAll(/<li><span class="num">\d<\/span><span>([^<]*)<\/span><\/li>/g)]
    .map((m) => unesc(m[1]));
  check("languages: English layer is SAMPLES.tell (answer + coach line)",
    JSON.stringify(langBullets(langSeg("en"))) === JSON.stringify(S.tell.answer)
    && langSeg("en").includes(S.tell.coach.keys.join(" · ") + " — " + S.tell.coach.structure));
  check("languages: Persian layer is SAMPLES.fa, with the pinned tag + coach line",
    langSeg("fa").includes('Answer · Persian — <span lang="fa">فارسی</span>')
    && langSeg("fa").includes("«" + S.fa.q + "»")
    && JSON.stringify(langBullets(langSeg("fa"))) === JSON.stringify(S.fa.answer)
    && langSeg("fa").includes(S.fa.coach.keys.join(" · ") + " — " + S.fa.coach.structure));
  check("languages: Arabic layer is SAMPLES.ar, with its tag + coach line",
    langSeg("ar").includes('Answer · Arabic — <span lang="ar">العربية</span>')
    && langSeg("ar").includes("«" + S.ar.q + "»")
    && JSON.stringify(langBullets(langSeg("ar"))) === JSON.stringify(S.ar.answer)
    && langSeg("ar").includes(S.ar.coach.keys.join(" · ") + " — " + S.ar.coach.structure));
  check("languages: both RTL answer lists flip with lang + dir=rtl",
    (html.match(/<ul class="a" lang="(fa|ar)" dir="rtl">/g) || []).length === 2);
}

/* ---------- 6. Report + Privacy: honest statics ---------- */
check("report: miniature carries retention truth + the no-score line leads",
  html.includes("On your PC, by default") && html.includes("Trial keeps reports")
  && html.includes("Pro keeps reports") && html.includes("14 days") && html.includes("365 days")
  && html.includes("There is no score, no grade, no pass/fail")
  && html.includes('id="feat-never-panel"') && html.includes('aria-controls="feat-never-panel"'));
/* Step 60 re-pin: the Privacy chapter card's pill row repeated its
   own checklist's first three items verbatim in the same viewport
   and was removed; the pills remain only in the bento tile (3). */
check("privacy: the never list (5 items) + never pills in the bento tile only",
  html.includes("<strong>Never hidden</strong>") && html.includes("<strong>Never records</strong>")
  && html.includes("<strong>Never stores audio</strong>") && html.includes("<strong>Encrypted workspace</strong>")
  && html.includes("<strong>Payments stay with Paddle</strong>")
  && (html.match(/<span class="pill">Never /g) || []).length === 3);

/* ---------- 7. Bento: 7 anchor tiles, no operable controls ---------- */
{
  const bento = (html.match(/<div class="feat-bento">([\s\S]*?)<\/section>/) || [])[1] || "";
  const hrefs = [...bento.matchAll(/<a class="feat-tile[^"]*" href="#([a-z]+)"/g)].map((m) => m[1]);
  check("bento: exactly 7 tiles anchoring chapters in blueprint order",
    JSON.stringify(hrefs) === JSON.stringify(
      ["live", "prepare", "languages", "live", "prepare", "report", "privacy"]),
    JSON.stringify(hrefs));
  check("bento: no operable controls inside any tile",
    bento.length > 0 && !/<button|<input|<select|<textarea/.test(bento));
  const dots = (bento.match(/feat-frag-dots"[^>]*>([\s\S]*?)<\/span>/) || [])[1] || "";
  check("bento: pipeline fragment carries all 15 dots; anchor tile has the ambient pill",
    (dots.match(/<i><\/i>/g) || []).length === 15 && bento.includes('id="feat-tile-pill"'));
}

/* ---------- 8. Datasheet: numbers pinned against pricing.html ---------- */
{
  const rowsOf = (doc) => {
    const out = {};
    for (const m of doc.matchAll(/<tr><td>([^<]+)<\/td><td data-label="[^"]*">(?:<strong>)?([^<]+?)(?:<\/strong>)?<\/td><td data-label="[^"]*">(?:<strong>)?([^<]+?)(?:<\/strong>)?<\/td><\/tr>/g)) {
      out[m[1]] = [m[2], m[3]];
    }
    return out;
  };
  const feat = rowsOf(html), price = rowsOf(pricing);
  /* Bucket-A fix run re-pin (annotated): the shared row's label is
     "Reports kept" on both pages now — the finalized Terms §2's own
     wording, which Pricing adopted in Step 96; Features' older
     "Report retention" label was the divergence the 2026-11-25
     audit caught as A3. The values never diverged (14 / 365). */
  const shared = ["Live minutes", "Preparation runs / month", "Reports kept", "Coach Mode", "10 languages, incl. RTL"];
  check("matrix: every row shared with pricing.html matches pricing's values exactly",
    shared.every((k) => feat[k] && price[k] && feat[k][0] === price[k][0] && feat[k][1] === price[k][1]),
    JSON.stringify({ feat, price }));
  check("matrix: the headline numbers (30 vs 600, 2 vs 20, 14 vs 365)",
    feat["Live minutes"] && feat["Live minutes"][0].includes("30") && feat["Live minutes"][1].includes("600")
    && feat["Preparation runs / month"][0] === "2" && feat["Preparation runs / month"][1] === "20"
    && feat["Reports kept"][0] === "14 days" && feat["Reports kept"][1] === "365 days");
  check("datasheet: shortcuts + evidence with caveats + requirements",
    html.includes("Ctrl+Alt+C") && html.includes("Ctrl+Alt+R")
    && html.includes("201 / 201") && html.includes("44 / 44") && html.includes("28 / 28")
    && html.includes("Real-EXE smoke startup") && html.includes("1.3 s")
    && html.includes("We label them as tested evidence, not as a guarantee of what you will experience on your machine.")
    && html.includes("Windows 10 or 11 · a headset (the app hears the interviewer through it) · interviews where assistance is permitted."));
  check("decision band: demo first, download second, the honest line",
    html.includes("The honest way to judge it is to use it.")
    && html.includes('<a class="btn btn-primary" href="demo.html">Try the simulated demo</a>')
    && html.includes('<a class="btn btn-secondary" href="download.html">Download for Windows</a>'));
}

/* ---------- 9. CSS law for the Step 59 block ---------- */
{
  const block = (css.match(/\/\* -+ Step 59[\s\S]*$/) || [""])[0];
  check("css59: block exists; nav + rail are sticky at the measured offsets",
    block.length > 0
    && /\.feat-nav \{ position: sticky; top: 64px;/.test(block)
    && /\.feat-rail \{ position: sticky; top: 136px;/.test(block)
    // Step 61 re-pin (deliberate): the margin was 12px ("84 + 12 = the
    // intended 96px") until the Step 61 audit measured the stuck chrome
    // at 132.8px desktop / 129.1px phone — chapters landed with the
    // eyebrow behind the nav. 64px restores the intent (148px landing).
    && block.includes("body:has(.feat-nav) section[id] { scroll-margin-top: 64px; }")
    && block.includes("84 + 64 = a 148px landing"));
  check("css59: no capsule radius, no 999px, dots are 4px on 8px boxes",
    block.length > 0 && !block.includes("999px") && !block.includes("border-radius: 50%")
    && block.includes(".feat-frag-dots i { width: 8px; height: 8px; border-radius: 4px;"));
  const SCALE = new Set(["0", "4px", "8px", "12px", "16px", "20px", "24px", "28px",
    "32px", "40px", "48px", "56px", "64px", "72px", "96px"]);
  let spacingOk = block.length > 0;
  for (const m of block.matchAll(/(?:margin|padding)(?:-[a-z]+)?\s*:\s*([^;]+);/g)) {
    /* Step 90 annotation: the scan runs from the Step 59 marker
       to the end of the sheet, which now also holds Step 90's
       demo-head toolbar rule (margin-left: auto). "auto" is an
       alignment keyword, not a spacing length — the base sheet's
       own auto margins (.scene-note and others) were never
       lengths either — so it is exempt from the length scale. */
    for (const v of m[1].trim().split(/\s+/)) if (v !== "auto" && !SCALE.has(v)) spacingOk = false;
  }
  check("css59: every margin/padding value is on the Step 9 scale", spacingOk);
  let transOk = true;
  for (const m of block.matchAll(/transition:[^;]*?(\d*\.?\d+)s/g)) {
    if (![0.15, 0.25, 0.3].includes(parseFloat(m[1]))) transOk = false;
  }
  check("css59: transitions stay inside the motion scale (.15/.25/.3)", transOk);
  check("css59: still exactly 3 reduced-motion blocks; tile hover killed inside one",
    (css.match(/@media \(prefers-reduced-motion: reduce\)/g) || []).length === 3
    && css.includes(".feat-tile:hover { transform: none; }"));
  check("css59: tile hover lives in the existing (hover: hover) and (pointer: fine) block",
    css.includes("/* Step 59: the features bento tiles lift on hover (fine pointers only). */"));
  /* Step 93 re-pin: five since the Terms contents-bar block joined
     the admitted 1024px width (see test-step26's note). */
  check("css59: no new breakpoint family (1024px blocks: five since Step 93)",
    (css.match(/@media \(max-width: 1024px\) \{/g) || []).length === 5);
}

/* ---------- 10. JS module discipline ---------- */
{
  const mod = js.slice(js.indexOf("/* Step 59"));
  check("module: appended at the end of app.js, after the first IIFE literal",
    js.indexOf("/* Step 59") > js.indexOf("(function () {"));
  check("module: textContent-only (no innerHTML), no scrollIntoView, no focus calls",
    !mod.includes("innerHTML") && !mod.includes("scrollIntoView") && !mod.includes(".focus("));
  check("module: no global Ctrl+Alt handler (the datasheet documents the APP's shortcuts only)",
    !mod.includes("ctrlKey"));
  check("module: reduced-motion + IntersectionObserver are guarded",
    mod.includes('window.matchMedia("(prefers-reduced-motion: reduce)")')
    && mod.includes('typeof IntersectionObserver === "function"'));
  check("module: stepper play-all interval is the specified 1600ms",
    mod.includes("1600"));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
