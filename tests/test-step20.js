/* Step 21 — faithful hero. Run: node tests/test-step20.js
   (from ~/workspace/interview-assistant-website).
   Step 20's living hero is superseded: the typing effect, the waveform,
   the silence beat and the Coach bar were inventions. The hero mockup now
   plays the real app's moment (transcript grows -> question appears whole
   -> thinking -> points stream in -> Answer ready), once, then only on
   Replay. Enforces the hooks, the play-once rule, the real status words,
   the level meter, the two labelled cards, the dot bullets, the blue
   window, and the unchanged sample text. */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "website");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const js = fs.readFileSync(path.join(root, "app.js"), "utf8");
let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");

// 1. Replay button: real button, labelled, hidden until the moment plays.
check("hero Replay button exists, type=button, labelled, starts hidden",
  /<button type="button" class="hero-replay" id="hero-replay" aria-label="[^"]+" hidden>/.test(html));

// 2. Player hooks exist in the mockup (pill + transcript + thinking).
check("hero player hooks present (#mock-pill, #mock-question, #mock-transcript, #mock-thinking, #mock-answer, #mock-meta)",
  ["mock-pill", "mock-pill-text", "mock-start", "mock-question", "mock-transcript",
    "mock-thinking", "mock-answer", "mock-meta"].every((id) => new RegExp('id="' + id + '"').test(html)));

// 3. The sample text is unchanged (same question, same three points).
const QUESTION = "Tell me about yourself.";
const POINTS = [
  "Five years building web products — most recently leading a small team.",
  "I start from the outcome, then the trade-off I made to get there.",
  "What draws me here is this team’s focus on honest, useful software."
];
check("hero question + three points unchanged",
  js.includes('var QUESTION = "' + QUESTION + '"') &&
  POINTS.every((p) => js.includes('"' + p + '"')));

// 4. Play-once: a played flag, Replay replays, no self-rescheduling loop.
check("hero plays once (played flag) and only Replay restarts it",
  /var played = false;/.test(js) &&
  /replayBtn\.addEventListener\("click", function \(\) \{ play\(\); \}\);/.test(js) &&
  !/setTimeout\(cycle/.test(js) && !/setTimeout\(play/.test(js));

// 5. Sequence: transcript grows word by word; timings are the documented ones.
check("hero sequence timings documented (start 300, hear 600, trans 600, word 160, detect 300, think 500, stage 450, end 400)",
  /var START_MS = 300;/.test(js) && /var HEAR_MS = 600;/.test(js) &&
  /var TRANS_MS = 600;/.test(js) && /var WORD_MS = 160;/.test(js) &&
  /var DETECT_MS = 300;/.test(js) && /var THINK_MS = 500;/.test(js) &&
  /var STAGE_MS = 450;/.test(js) && /var END_MS = 400;/.test(js) &&
  /TRANSCRIPT\.forEach\(function \(words, i\)/.test(js));

// 6. No waveform, no typed question, no "3 points ready" in the app-window
// depictions (hero + story). The demo keeps its own status wording —
// labelled "— sample." / "— simulated." — so the check is scoped, not global.
const heroStoryHtml = (html.match(/aria-label="Preview of the Interview Assistant app window[\s\S]*?id="hero-replay"/) || [""])[0]
  + (html.split('id="story"')[1] || "").split("<!-- LIVE DEMO")[0];
const heroStoryJs = (js.replace(/\/\*[\s\S]*?\*\//g, "").split("Step 21 — hero")[1] || "");
check("no waveform, no typing, no invented status (Step 20 retired)",
  !/mock-wave|app-wave|@keyframes eq/.test(html + clean + js) &&
  !/TYPE_MS|QUESTION\.slice\(0, typed\)/.test(js) &&
  !/3 points ready/.test(heroStoryHtml + heroStoryJs) &&
  !/app-coach-mini|mock-coach/.test(html + clean + js));

// 7. Level meter: 48x4 in the pill, gated by .is-live (meter 1.1s), resting 8%.
check("level meter in the pill, gated by .is-live (meter 1.1s), resting 8%",
  /<span class="app-meter" aria-hidden="true"><i><\/i><\/span>/.test(html) &&
  /\.app-meter i \{[^}]*width: 8%;/.test(clean) &&
  /\.app-pill\.is-live \.app-meter i \{\s*animation: meter 1\.1s ease-in-out infinite alternate;\s*\}/.test(clean) &&
  /@keyframes meter \{ from \{ width: 12%; \} to \{ width: 88%; \} \}/.test(clean));

// 8. Real status words, in order, set through one setPill helper.
check("real status words (Not listening / Listening / Hearing audio / Transcribing / Question detected / Preparing answer / Answer ready)",
  ["Not listening", "Listening", "Hearing audio", "Transcribing",
    "Question detected", "Preparing answer", "Answer ready"].every((w) => js.includes('"' + w + '"')) &&
  /function setPill\(text, state, live\)/.test(js));

// 9. Two labelled cards; dot bullets (no numbers); answer bigger than question.
check("two labelled cards QUESTION/ANSWER, dot bullets, answer 19px > question 15px",
  /<span class="app-card-label">Question<\/span>/.test(html) &&
  /<span class="app-card-label">Answer<\/span>/.test(html) &&
  /\.app-answer li \{[^}]*font-size: 19px;/.test(clean) &&
  /\.app-question \{[^}]*font-size: 15px;/.test(clean) &&
  /\.app-dot \{[^}]*width: 7px; height: 7px;[^}]*background: var\(--app-accent\);/.test(clean) &&
  !/id="mock-answer"[\s\S]*?class="num"/.test(html));

// 10. Blue window: app tokens, Segoe stack, radius 14, flat (no tilt, no glow).
check("faithful blue window (app tokens, Segoe, radius 14, no tilt/glow)",
  /--app-accent: #5B8DEF;/.test(css) && /--app-accent-strong: #3567D0;/.test(css) &&
  /\.app-window \{[^}]*font-family: "Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif;/.test(clean) &&
  /\.app-window \{[^}]*border-radius: 14px;/.test(clean) &&
  !/rotateY|perspective\(1400px\)|0 0 90px rgba\(124, 108, 255/.test(clean));

// 11. Thinking state: ● ● ● + a faded pending bullet while preparing.
check("thinking state present (● ● ● + is-pending faded bullet)",
  /id="mock-thinking" hidden>● ● ●<\/p>/.test(html) &&
  /\.app-thinking \{[^}]*animation: pulse \.9s/.test(clean) &&
  /\.app-answer li\.is-pending \{[^}]*opacity: \.45;/.test(clean) &&
  /pending\.classList\.add\("is-pending"\)/.test(js));

// 12. Replay button: 44px target, spacing-scale margins, [hidden] respected.
check("Replay button is a 44px target (min-height 44px, padding 12px 16px)",
  /\.hero-replay \{[\s\S]*?min-height: 44px;[\s\S]*?padding: 12px 16px;/.test(clean));
check("Replay button honours [hidden] (display none)",
  /\.hero-replay\[hidden\] \{\s*display: none;\s*\}/.test(clean));

// 13. Reduced motion: full static state, no Replay button shown.
check("reduced motion renders the full state statically and never shows Replay",
  /if \(reduced\) \{ renderAll\(\); return; \}/.test(js) &&
  (js.match(/replayBtn\.hidden = false/g) || []).length === 1);

// 14. Pause after all three points finishes the moment (no stranded
// final state: points + Answer ready visible, but no Replay button).
check("pause() finishes the moment once all 3 points are shown",
  /function finish\(\) \{/.test(js) &&
  /if \(shown === 3\) \{ finish\(\); \}/.test(js) &&
  (js.match(/finish\(\);/g) || []).length >= 2);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
