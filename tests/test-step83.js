/* Step 83 — the two-box window: the site window mirrors the REAL
   app's layout (owner order, 2026-11-23): a compact QUESTION card
   and a dominant ANSWER card, separate full-width dark cards inside
   the window body, small muted label inside each at top-left,
   content below, a 10px gap between them. Geometry is taken from
   the app itself (read-only reference clone):
   - MainWindow.xaml: body grid Margin 14,4,14,8; QuestionCard
     (Style=Card) with Margin 0,0,0,10; answer Border Style=Card,
     Padding 20,16, star height.
   - Theme.xaml: Card = Surface #161920 on Bg #0F1115, Border
     #2A303C 1px, CornerRadius 12, Padding 18,14; T.Label = 11px
     SemiBold TextFaint #8B92A0 (caps are the string, no tracking).
   - AppSettings.cs: QuestionFontSize Normal = 16; the answer runs
     at AnswerFontSize x 1.42 line height (MainViewModel).
   - MainViewModel.cs L117: the answer card's label reads "COACH"
     in Coach view (LAnswer) — the site mirrors that: the label
     itself switches, in the demo, the story and the features Live
     window.
   The amber Offline banner in the owner's app screenshot is a
   transient app state, excluded on his instruction — it is not
   mirrored anywhere (pinned below).
   Where a site token conflicted, the app's form won for the window
   (standards/SPACING.md, Step 83 exemption). */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "website");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const css = read("styles.css");
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
const js = read("app.js");
const demo = read("demo.html");
const index = read("index.html");
const features = read("features.html");
const hw = read("how-it-works.html");

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, detail ? "— " + detail : ""); }
}

/* ---------- 1. Window geometry is the app's ---------- */
check("body inset is the app's 14px (LiveBody Margin 14,4,14,8)",
  /\.app-window-body \{[^}]*padding: 14px;/.test(clean) &&
  /\.demo-body \{[^}]*padding: 14px;/.test(clean));
check("cards: Card padding 18,14 / answer 20,16 / gap 10 / radius 12 / surface fill",
  /\.app-card \{[^}]*background: var\(--app-surface\);[^}]*border-radius: 12px;[^}]*padding: 14px 18px;[^}]*margin-bottom: 10px;/.test(clean) &&
  /\.app-card--answer \{[^}]*padding: 16px 20px;/.test(clean) &&
  /\.app-card:last-child \{ margin-bottom: 0; \}/.test(clean));
check("card label: 11px, no tracking (the app's caps are the string itself)",
  /\.app-card-label \{[^}]*font-size: 11px;[^}]*letter-spacing: 0;/.test(clean));
check("question size is the app's 16px in every form",
  /\.app-question \{[^}]*font-size: 16px;/.test(clean) &&
  /\.demo-question \{[^}]*font-size: 16px;/.test(clean) &&
  /\.call-main \.demo-question \{[^}]*font-size: 16px;/.test(clean));
check("answer line height is the app's 1.42 factor",
  /\.app-answer li \{[^}]*line-height: 1.42;/.test(clean) &&
  /\.demo-answer li \{[^}]*line-height: 1.42;/.test(clean));
check("the demo's old flat-panel label rules are gone",
  !/\.demo-label \{/.test(clean) && !/\.call-main \.demo-label \{/.test(clean));

/* ---------- 2. The demo window (flagship): two cards, right homes ---------- */
const sliceBody = (html, endMarker) => {
  const a = html.indexOf('<div class="demo-body">');
  const b = html.indexOf(endMarker, a);
  return a >= 0 && b > a ? html.slice(a, b + 200) : "";
};
const demoBody = sliceBody(demo, 'id="coach-flip"');
check("demo window: QUESTION card wraps the question stack",
  demoBody.includes('<section class="app-card">') &&
  /<section class="app-card">[\s\S]*?id="demo-question-stack"/.test(demoBody));
check("demo window: ANSWER card wraps stack, status, sample tag and flip — in that order",
  /<section class="app-card app-card--answer">[\s\S]*?id="demo-answer-stack"[\s\S]*?id="demo-status"[\s\S]*?id="demo-sample-tag"[\s\S]*?id="coach-flip"/.test(demoBody));
check("demo window: labels are Question / Answer (the app's strings), no Interviewer panel label",
  demoBody.includes('<span class="app-card-label">Question</span>') &&
  demoBody.includes('id="demo-answer-label">Answer</span>') &&
  !demoBody.includes("demo-label") && !demoBody.includes(">Interviewer<"));
check("demo window: the question card carries the app's status detail line",
  demoBody.includes("Listening to system audio · microphone off"));

/* ---------- 3. The home demo panel: same two cards ---------- */
const homeBody = sliceBody(index, 'id="demo-sample-tag"');
check("home demo: QUESTION card + ANSWER card with the same contents and order",
  /<section class="app-card">[\s\S]*?id="demo-question-stack"/.test(homeBody) &&
  /<section class="app-card app-card--answer">[\s\S]*?id="demo-answer-stack"[\s\S]*?id="demo-status"[\s\S]*?id="demo-sample-tag"/.test(homeBody) &&
  homeBody.includes('id="demo-answer-label">Answer</span>'));

/* ---------- 4. Coach view: the answer card's label switches (LAnswer) ---------- */
check("demo module syncs the card label from the view (Answer <-> Coach)",
  /function syncAnswerLabel\(\) \{\s*if \(answerLabelEl\) \{\s*answerLabelEl\.textContent = mode === "coach" \? "Coach" : "Answer";/.test(js) &&
  (js.match(/syncAnswerLabel\(\);/g) || []).length >= 3);
check("features Live syncs its card label the same way",
  /var liveLabel = document\.getElementById\("feat-live-label"\);/.test(js) &&
  /liveLabel\.textContent = mode === "coach" \? "Coach" : "Answer";/.test(js) &&
  features.includes('id="feat-live-label">Answer</span>'));
check("story syncs its card label per layer (layer 3 is Coach)",
  /var answerLabelEl = document\.getElementById\("story-answer-label"\);/.test(js) &&
  /answerLabelEl\.textContent = i === 3 \? "Coach" : "Answer";/.test(js) &&
  index.includes('id="story-answer-label">Answer</span>'));
check("the story's static Coach snapshot carries the Coach label on its card",
  /<span class="app-card-label">Coach<\/span>/.test(index));

/* ---------- 5. Every window accounted for ---------- */
const count = (html) => [...html.matchAll(/class="([^"]*)"/g)]
  .filter((m) => m[1].split(/\s+/).includes("app-window")).length;
check("24 .app-window instances across the four pages (9/5/9/1)",
  count(index) === 9 && count(features) === 5 && count(hw) === 9 && count(demo) === 1,
  [count(index), count(features), count(hw), count(demo)].join("/"));
check("how-it-works faded trace frames carry both cards (Question + Answer)",
  (hw.match(/Can you give me the shorter version\?/g) || []).length === 2 &&
  (hw.match(/app-card app-card--answer/g) || []).length >= 2);
check("features at-a-glance mini window is two mini cards",
  /<span class="feat-mini-card">\s*<span class="app-card-label feat-mini-label">Question<\/span>/.test(features) &&
  /<span class="feat-mini-card">\s*<span class="app-card-label feat-mini-label">Answer<\/span>/.test(features) &&
  /\.feat-mini-card \{[^}]*background: var\(--app-surface\);/.test(clean));
check("features Report window's lines live in a card",
  /<section class="app-card">\s*<div class="app-card-head"><span class="app-card-label">Report<\/span>/.test(features));

/* ---------- 6. Compact states protected ---------- */
check("no 240px answer floor inside the call stage, the demo panels or the faded frames",
  /\.call-main \.app-card--answer \{ min-height: 0; \}/.test(clean) &&
  /\.demo-body \.app-card--answer \{ min-height: 0; \}/.test(clean) &&
  /\.hw-faded-frames \.app-card--answer \{ min-height: 0; \}/.test(clean));
check("call field re-sized for the two-box window (720px, headroom restored)",
  /\.call-main \{[^}]*min-height: 720px;/.test(clean));

/* ---------- 7. The excluded banner stays excluded ---------- */
check("the app's transient Offline banner is not mirrored anywhere",
  !/Offline — prepared answers/.test(demo + index + features + hw));

console.log(`\ntest-step83: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
