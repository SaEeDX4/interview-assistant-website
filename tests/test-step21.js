/* Step 21 — scroll story + faithful mockup. Run: node tests/test-step21.js
   (from ~/workspace/interview-assistant-website).
   The scroll story pins one faithful app window through seven beats
   (Prepare -> Start -> Q1 -> interruption -> Coach -> Q2 -> Stop/report),
   with static snapshots per beat at <=860px and under reduced motion. Also
   enforces the demo alignment (dot bullets, blue Coach keywords) and the
   must-not-invent checklist from the Step 21 research spec. */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "website");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const demoHtml = fs.readFileSync(path.join(root, "demo.html"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const js = fs.readFileSync(path.join(root, "app.js"), "utf8");
let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
const heroHtml = html.split('id="story"')[0];
const storyHtml = html.split('id="story"')[1] || "";

// 1. Seven beats, in order (the story steps; the player segments below the
// layout carry their own data-beat and are not counted here).
const beats = [...html.matchAll(/<li class="story-step" data-beat="(\d)">/g)].map((m) => m[1]);
check("story has seven beats 0-6 in order",
  beats.join(",") === "0,1,2,3,4,5,6");

// 2. Pinned window: sticky, two-column layout on desktop.
check("story window is sticky (top 100px) in a two-column layout",
  /\.story-window \{\s*position: sticky; top: 100px;\s*\}/.test(clean) &&
  /\.story-layout \{[^}]*grid-template-columns: minmax\(0, 1\.05fr\) minmax\(0, \.95fr\);/.test(clean));

// 3. Story window hooks exist (pill, views, prepare, coach, report).
// Step 23: the question/answer/caption are stacks (layers built by JS),
// so the hooks are the stack containers + the live region, not the old
// single question/answer elements.
check("story window hooks present (all story-* ids)",
  ["story-pill", "story-pill-text", "story-badge", "story-start", "story-start-label",
    "story-home-header", "story-live-header", "story-home", "story-live",
    "story-report", "story-prepare-bar", "story-prepare-stage", "story-open-live",
    "story-question-stack", "story-transcript", "story-context", "story-thinking",
    "story-answer-stack", "story-meta", "story-coach", "story-history",
    "story-history-text", "story-caption-stack", "story-caption-live"].every((id) => new RegExp('id="' + id + '"').test(html)));

// 4. Beat content is grounded in the real app.
const STAGES = ["Verify profile", "JD extraction", "Candidate–role match map",
  "Gap analysis", "Terminology", "Company/product context", "Story ranking",
  "Likely questions", "Fast answers", "Coach keywords & structure", "Playbook",
  "Truth policy", "Difficult questions", "Questions to ask", "Runtime cache"];
check("Prepare stages are the 15 verbatim pipeline names",
  STAGES.every((s) => js.includes('"' + s + '"')));
check("story questions + Concise + Coach + memory + report present",
  js.includes('var Q1 = "Tell me about yourself."') &&
  js.includes('var Q2 = "Tell me about a time you led a difficult project."') &&
  js.includes('var Q3 = "Why should we hire you?"') &&
  /badge\.textContent = "Concise"/.test(js) &&
  /EXPERIENCE · OUTCOME · FIT|Experience · Outcome · Fit/.test(html) &&
  /Present role → one result → why this role/.test(html) &&
  /historyText\.textContent = "2 \/ 2"/.test(js) &&
  /Questions asked<\/span><span>2<\/span>/.test(html) &&
  /No scores\. No hiring predictions\./.test(html));

// 5. No invented scores: the report states what it does NOT contain, and
// no numeric score or grade appears anywhere in the story.
check("no scores or grades invented (report is explicit about it)",
  /No scores\. No hiring predictions\. The report records questions and suggestions — not what you said\./.test(html) &&
  !/\b\d+\s*\/\s*100\b|score:\s*\d|grade\s*[A-F]\b|out of 10/i.test(storyHtml));

// 6. Mobile / reduced-motion fallback: one static snapshot per beat, and
// the live window hides while the snapshots show.
check("seven static snapshots, one per beat",
  (html.match(/class="story-snap"/g) || []).length === 7);
check("live window hidden at <=860px and under reduced motion; snapshots shown",
  /@media \(max-width: 860px\) \{[\s\S]*?\.story-window \{\s*display: none;\s*\}[\s\S]*?\.story-snap \{\s*display: block;/.test(clean) &&
  /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\.story-window \{\s*display: none;\s*\}[\s\S]*?\.story-snap \{\s*display: block;/.test(clean));

// 7. Activation: centre band, timed beats play once, finals render fully.
check("beats activate at the viewport centre band, timed beats play once",
  /rootMargin: "-40% 0px -40% 0px", threshold: 0/.test(js) &&
  /var playedBeats = \{\};/.test(js) &&
  /if \(beat === 0 && !playedBeats\[0\]\)/.test(js) &&
  /if \(beat === 2 && !playedBeats\[2\]\)/.test(js) &&
  /var finals = \{/.test(js));
check("every beat renders its complete state (no partial renders)",
  ["finals = {", "showView(\"home\")", "showView(\"live\")", "showView(\"report\")"]
    .every((s) => js.includes(s)) &&
  (js.match(/setPill\("/g) || []).length >= 8);

// 8. Header chrome: the hero sheds controls (narrow window), the story
// window shows the full set — as the real app does below/above 580px.
check("hero header sheds controls (Start + Stop + close only)",
  !/id="mock-start"[\s\S]{0,400}app-icon-btn/.test(heroHtml) &&
  (heroHtml.match(/class="app-win-btn"/g) || []).length === 1);
check("story header shows the full control set (? + … + min/max/close)",
  (storyHtml.match(/class="app-icon-btn"/g) || []).length >= 2 &&
  (storyHtml.match(/class="app-win-btn"/g) || []).length >= 3);

// 9. Demo alignment: dot bullets (no numbers), blue Coach keywords,
// real 16/22 sizes (Step 83 re-pin: the demo question was 17px, a
// panel-only size; every window's question is now the app's
// QuestionFontSize 16 — one window, one question size).
const demoLists = [...html.matchAll(/<ul class="demo-answer"[^>]*>[\s\S]*?<\/ul>/g)].map((m) => m[0])
  .concat([...demoHtml.matchAll(/<ul class="demo-answer"[^>]*>[\s\S]*?<\/ul>/g)].map((m) => m[0]));
check("demo bullets are blue dots, not numbered cards",
  // Step 73: 4 lists — the scene's follow-up Rapid list joins the
  // three pre-rendered ones, in the same dot-bullet form.
  // Step 74 re-pin: 3 static lists — the Rapid list is now built
  // by JS from the canonical INT strings (same dot form, asserted
  // by the app-dot builder clause below).
  demoLists.length === 3 &&
  demoLists.every((ul) => !ul.includes('class="num"') && ul.includes('class="app-dot"')) &&
  /dot\.className = "app-dot";/.test(js) &&
  /\.demo-answer li \{[^}]*font-size: 22px;/.test(clean) &&
  /\.demo-question \{[^}]*font-size: 16px;/.test(clean));
/* Step 82 re-pin (annotated, Step 29 precedent): the demo's Coach
   layers no longer carry a demo-only .coach-keys span — they are
   built in the product's canonical labelled form, so the keys line
   is the shared .app-coach-keys (accent, semibold) and the old
   .demo-answer .coach-keys rule is deleted. The intent of the
   original check — Coach keywords read accent-blue and semibold,
   never amber, and never as a bullet row beside the points — is
   preserved against the canonical classes. */
check("demo Coach keywords are blue semibold, not amber",
  /\.app-coach-keys \{[^}]*font-weight: 600;[^}]*color: var\(--app-accent\);/.test(clean) &&
  !/\.demo-answer \.coach-keys/.test(clean) &&
  /buildCoachLine\("Keywords", coach\.keys\.join\(" · "\), "app-coach-keys"\)/.test(js));

// 10. Must-not-invent checklist: no waveform, no typed question, no
// "3 points ready", no numbers in the hero/story, coach never beside bullets.
const heroAnswer = (html.match(/<ul class="app-answer" id="mock-answer"><\/ul>/) || [""])[0];
// Step 23: the story answer is a stack of pre-rendered layers (one per
// live beat) built from the POINTS arrays; the coach markup is layer 3.
// The demo keeps its own "3 points ready" status (labelled sample), so the
// invented-status check is scoped to the app-window depictions (hero + story).
const heroStoryHtml = (html.match(/aria-label="Preview of the Interview Assistant app window[\s\S]*?class="hero-stats"/) || [""])[0]
  + (html.split('id="story"')[1] || "").split("<!-- LIVE DEMO")[0];
const heroStoryJs = (js.replace(/\/\*[\s\S]*?\*\//g, "").split("Step 21 — hero")[1] || "");
check("must-not-invent checklist holds (hero + story)",
  !/mock-wave|app-wave|@keyframes eq/.test(html + clean + js) &&
  !/TYPE_MS|QUESTION\.slice\(0, typed\)/.test(js) &&
  !/3 points ready/.test(heroStoryHtml + heroStoryJs) &&
  !heroAnswer.includes('class="num"') &&
  /id="story-answer-stack"/.test(html) && /id="story-coach"/.test(html) &&
  /setAnswerLayer\(3\)/.test(js) &&
  /points\.forEach\(function \(text\) \{\s*var li = makeBullet\(text\);/.test(js));

// 11. Reduced motion gates all three animation paths (demo + hero + story).
check("JS gates demo, hero and story on prefers-reduced-motion (>= 3)",
  (js.match(/matchMedia\("\(prefers-reduced-motion: reduce\)"\)/g) || []).length >= 3);

// 12. Regressions: the hero mockup still has its Replay + stats strip.
// The installer mockup retired in Step 41 by design (the download
// page's real recommendation panel replaced the picture of an
// installer); the download page now carries that panel instead.
check("hero Replay + stats strip still present; download panel present",
  /id="hero-replay"/.test(html) && /class="hero-stats"/.test(html) &&
  fs.readFileSync(path.join(root, "download.html"), "utf8").includes('id="dl-rec"'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
