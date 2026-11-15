/* Step 20 — living hero. Run: node tests/test-step20.js
   (from ~/workspace/interview-assistant-website).
   The hero mockup plays one staged moment (type → listen → silence →
   points → Coach flip), once, then only on Replay. Enforces the hooks,
   the play-once rule, the gated waveform, the Coach flip, the Replay
   button (44px target), and the unchanged sample text. */
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

// 2. Player hooks exist in the mockup.
check("hero player hooks present (#mock-wave, #mock-question, #mock-coach)",
  /id="mock-wave"/.test(html) && /id="mock-question"/.test(html) && /id="mock-coach"/.test(html));

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

// 5. Sequence: typing uses QUESTION.slice, timings are the documented ones.
check("hero sequence timings documented (type 45, silence 700, stage 450, coach 400)",
  /var TYPE_MS = 45;/.test(js) && /var SILENCE_MS = 700;/.test(js) &&
  /var STAGE_MS = 450;/.test(js) && /var COACH_MS = 400;/.test(js) &&
  js.includes("QUESTION.slice(0, typed)"));

// 6. Waveform gated: eq runs only under .is-live; resting bars sit flat.
check("waveform gated by .is-live (eq 1.1s), resting bars flat at scaleY(.25)",
  /\.app-wave\.is-live i \{\s*animation: eq 1\.1s ease-in-out infinite alternate;\s*\}/.test(clean) &&
  /\.app-wave i \{[\s\S]*?transform: scaleY\(\.25\);[\s\S]*?\}/.test(clean) &&
  !/\.app-wave i \{[^}]*animation:/.test(clean));

// 7. Coach bar: hidden while playing, flips in with the 250ms rise.
check("Coach bar hidden while playing, flips in with rise .25s",
  /\.app-window\.hero-playing \.app-coach-mini:not\(\.is-new\) \{\s*opacity: 0;\s*\}/.test(clean) &&
  /\.app-coach-mini\.is-new \{\s*animation: rise \.25s cubic-bezier\(\.2,\.7,\.3,1\) both;\s*\}/.test(clean));

// 8. Replay button: 44px target, spacing-scale margins, [hidden] respected.
check("Replay button is a 44px target (min-height 44px, padding 12px 16px)",
  /\.hero-replay \{[\s\S]*?min-height: 44px;[\s\S]*?padding: 12px 16px;/.test(clean));
check("Replay button honours [hidden] (display none)",
  /\.hero-replay\[hidden\] \{\s*display: none;\s*\}/.test(clean));

// 9. Reduced motion: full static state, no Replay button shown.
check("reduced motion renders the full state statically and never shows Replay",
  /if \(reduced\) \{ renderAll\(\); return; \}/.test(js) &&
  (js.match(/replayBtn\.hidden = false/g) || []).length === 1);

// 10. No new off-standard motion: the two new transitions are 250ms/150ms.
check("new transitions use standard durations only",
  /\.app-coach-mini \{[^}]*transition: opacity \.25s ease;/.test(clean) &&
  /\.hero-replay \{[^}]*transition: color \.15s ease, border-color \.15s ease;/.test(clean));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
