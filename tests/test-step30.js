#!/usr/bin/env node
/* Step 30 — the hero becomes a working preview. Locks in:
   - the shared prepared bank at file scope (SAMPLES + FALLBACK +
     IA_VARIANTS + IA_AI_ENDPOINT), shared by the demo and the hero;
   - every variant conforming to the source app's style specs
     (AnswerStyleSpec): Shorter = VeryShort (2-3 bullets, 8-16 words
     each, 25-45 total), Technical (3-4 bullets, 12-24 each, 50-90),
     Example (exactly 3, 12-22 each, 40-80), Full (one paragraph,
     90-130 words), Regenerate alternates (Balanced: exactly 3,
     10-22 each, 35-75). English is enforced exactly; Persian/Arabic
     are enforced structurally (word counts run looser in those
     scripts, so shapes and floors are checked instead);
   - the hero markup: real chip buttons + a real message box, the
     window no longer role="img", the visual cards aria-hidden
     individually, a live region for announcements;
   - the hero JS: a random sample per load, the variant mechanism
     mirroring the app's RequestVariantAsync, typed-question matching,
     the guidance fallback, and the AI path gated on IA_AI_ENDPOINT;
   - no key material anywhere: the endpoint points at the deployed
     proxy and no OpenAI key pattern appears in the client code;
   - the CSS: 44px chip/send targets, the selected state, press
     scales, hover gated behind (hover: hover) and (pointer: fine),
     the Replay glyph spin, the answer-zone glide. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const js = fs.readFileSync(path.join(ROOT, "website", "app.js"), "utf8");
const css = fs.readFileSync(path.join(ROOT, "website", "styles.css"), "utf8");
const html = fs.readFileSync(path.join(ROOT, "website", "index.html"), "utf8");
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
const heroJs = (js.split("Step 21 — hero")[1] || "").split("Steps 21–22 — scroll story")[0];
const heroHtml = (html.split("<!-- APP PREVIEW")[1] || "").split('class="hero-stats"')[0];

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log("PASS " + name); }
  else { fail++; console.log("FAIL " + name); }
}

/* ---------- the shared bank, evaluated ---------- */
const dataStart = js.indexOf("var SAMPLES = {");
const dataEnd = js.indexOf("(function () {");
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(js.slice(dataStart, dataEnd), sandbox);
const SAMPLES = sandbox.SAMPLES, FALLBACK = sandbox.FALLBACK;
const IA_VARIANTS = sandbox.IA_VARIANTS, IA_AI_ENDPOINT = sandbox.IA_AI_ENDPOINT;

check("shared bank at file scope (SAMPLES, FALLBACK, IA_VARIANTS, IA_AI_ENDPOINT)",
  !!SAMPLES && !!FALLBACK && !!IA_VARIANTS && typeof IA_AI_ENDPOINT === "string" &&
  dataStart > 0 && dataStart < js.indexOf("/* Interview Assistant — demo logic") + 4000);
check("the bank holds exactly the ten prepared samples",
  Object.keys(SAMPLES).length === 10 &&
  ["tell", "hire", "weakness", "story", "five", "fa", "ar", "salary", "conflict", "why"]
    .every((k) => SAMPLES[k] && SAMPLES[k].q && SAMPLES[k].answer.length === 3 && SAMPLES[k].coach));
check("every sample has a full variant set",
  Object.keys(SAMPLES).every((k) => {
    const v = IA_VARIANTS[k];
    return v && Array.isArray(v.shorter) && Array.isArray(v.technical) &&
      Array.isArray(v.example) && typeof v.full === "string" && Array.isArray(v.regen);
  }));
check("the endpoint is the deployed Cloudflare Worker and no key material exists client-side",
  IA_AI_ENDPOINT === "https://interview-assistant-ai-website.saeed-sharifzadeh91.workers.dev" &&
  !/sk-[A-Za-z0-9]/.test(js) && !/api\.openai\.com/.test(js + html));

/* ---------- the style specs (AnswerStyleSpec), English enforced ---------- */
function wc(s) { return s.trim().split(/\s+/).length; }
function inRange(v, lo, hi) { return v >= lo && v <= hi; }
function bulletsOk(set, countLo, countHi, wLo, wHi, tLo, tHi) {
  if (!inRange(set.length, countLo, countHi)) { return false; }
  const total = set.reduce((a, b) => a + wc(b), 0);
  return set.every((b) => inRange(wc(b), wLo, wHi)) && inRange(total, tLo, tHi);
}
const EN = ["tell", "hire", "weakness", "story", "five", "salary", "conflict", "why"];
check("Shorter variants meet the VeryShort spec (2-3 bullets, 8-16 words, 25-45 total)",
  EN.every((k) => bulletsOk(IA_VARIANTS[k].shorter, 2, 3, 8, 16, 25, 45)));
check("Technical variants meet the spec (3-4 bullets, 12-24 words, 50-90 total)",
  EN.every((k) => bulletsOk(IA_VARIANTS[k].technical, 3, 4, 12, 24, 50, 90)));
check("Example variants meet the spec (exactly 3 bullets, 12-22 words, 40-80 total)",
  EN.every((k) => bulletsOk(IA_VARIANTS[k].example, 3, 3, 12, 22, 40, 80)));
check("Full variants are one paragraph of 90-130 words, no bullet characters",
  EN.every((k) => inRange(wc(IA_VARIANTS[k].full), 90, 130) && !/•|\n/.test(IA_VARIANTS[k].full)));
check("Regenerate alternates meet the Balanced spec (2 sets of exactly 3, 10-22 words, 35-75 total)",
  EN.every((k) => IA_VARIANTS[k].regen.length === 2 &&
    IA_VARIANTS[k].regen.every((set) => bulletsOk(set, 3, 3, 10, 22, 35, 75))));
check("fa/ar variants are structurally complete (shapes + Full length floors)",
  ["fa", "ar"].every((k) => {
    const v = IA_VARIANTS[k];
    return v.shorter.length === 2 && v.technical.length === 3 && v.example.length === 3 &&
      v.regen.length >= 1 && v.regen.every((set) => set.length === 3) && wc(v.full) >= 60;
  }));

/* ---------- hero markup ---------- */
check("the hero window is no longer role=img (it holds real controls now)",
  !/class="app-window" role="img"/.test(heroHtml) && /<div class="app-window">/.test(heroHtml));
check("the visual cards are aria-hidden individually; the body as a whole is not",
  /<section class="app-card" aria-hidden="true">/.test(heroHtml) &&
  /<section class="app-card app-card--answer" aria-hidden="true">/.test(heroHtml) &&
  !/<div class="app-window-body" aria-hidden="true">/.test(heroHtml));
check("five chip buttons in order, modes with aria-pressed, all starting disabled (CanRework)",
  ["shorter", "technical", "example", "full"].every((v) =>
    new RegExp('data-variant="' + v + '" aria-pressed="false" disabled').test(heroHtml)) &&
  /data-variant="regen" disabled/.test(heroHtml) &&
  !/data-variant="regen"[^>]*aria-pressed/.test(heroHtml) &&
  (heroHtml.match(/class="app-chip-btn"/g) || []).length === 5);
check("the message box is a real labelled form (input + submit button)",
  /<form class="app-manual" id="hero-manual-form">/.test(heroHtml) &&
  /<label class="visually-hidden" for="hero-manual-input">/.test(heroHtml) &&
  /<input class="app-manual-input" id="hero-manual-input" type="text"/.test(heroHtml) &&
  /<button class="app-manual-send-btn" id="hero-manual-send" type="submit" aria-label="Ask the question">/.test(heroHtml));
check("a polite live region announces variant changes",
  /<span class="visually-hidden" id="hero-live" aria-live="polite"><\/span>/.test(heroHtml));
check("the answer zone holds the layer stack and the Full paragraph",
  /<div class="app-answer-zone" id="mock-answer-zone">/.test(heroHtml) &&
  /<div class="app-answer-stack" id="mock-answer-stack"><\/div>/.test(heroHtml) &&
  /<p class="app-full-answer" id="mock-full" hidden><\/p>/.test(heroHtml));

/* ---------- hero JS ---------- */
check("typed questions: sample matching, then the AI endpoint, then the guidance fallback",
  /function matchSample\(text\)/.test(heroJs) &&
  /if \(matched\) \{/.test(heroJs) && /else if \(IA_AI_ENDPOINT\)/.test(heroJs) &&
  /prepareFallback/.test(heroJs) && /FALLBACK\.answer\.slice\(\)/.test(heroJs) &&
  /"guidance"/.test(heroJs) && /"prepared"/.test(heroJs) && /"AI"/.test(heroJs));
check("the AI path posts {question, style} and renders only validated bullets (max 4) or a full string",
  /fetch\(IA_AI_ENDPOINT, \{/.test(heroJs) &&
  /JSON\.stringify\(\{ question: questionText, style: styleName \|\| "base" \}\)/.test(heroJs) &&
  /\.slice\(0, 4\)/.test(heroJs) && /typeof data\.full === "string"/.test(heroJs));
check("chips are enabled only through canRework (the app's gate) when an answer completes",
  /function canRework\(\)/.test(heroJs) &&
  /setChipsEnabled\(canRework\(\)\)/.test(heroJs) &&
  /btn\.disabled = !on/.test(heroJs));
check("Regenerate cycles the prepared alternates and clears the selected chip (Balanced)",
  /lastRegen = \(lastRegen \+ 1\) % layers\.regen\.length;/.test(heroJs) &&
  /variant = "regen";\s*metaWord = "prepared";\s*selectChip\(null\);/.test(heroJs));
check("Replay spins the glyph on click and replays the sample play or the typed flow",
  /replayBtn\.classList\.add\("is-spinning"\)/.test(heroJs) &&
  /if \(source === "sample"\) \{\s*play\(\);/.test(heroJs) &&
  /typedFlow\(null, function \(\) \{/.test(heroJs));

/* ---------- CSS ---------- */
check("chip + send targets are 44px with smaller visual boxes (the A15 split)",
  /\.app-chip-btn \{\s*height: 44px;/.test(clean) &&
  /\.app-manual-send-btn \{\s*flex: none; width: 44px; height: 44px;/.test(clean) &&
  /place-items: center end;/.test(clean));
check("the selected chip state uses the app accent tokens (soft fill + accent border)",
  /\.app-chip-btn\[aria-pressed="true"\] \.app-chip \{ background: var\(--app-accent-soft\); border-color: var\(--app-accent\); color: var\(--app-text\); \}/.test(clean));
check("press feedback: chips scale .96, Replay and send scale .92, 150ms standard curve",
  /\.app-chip-btn:active \.app-chip \{ transform: scale\(\.96\); \}/.test(clean) &&
  /\.app-replay:active \.app-replay-box \{ transform: scale\(\.92\); \}/.test(clean) &&
  /\.app-manual-send-btn:active \.app-manual-send \{ transform: scale\(\.92\); \}/.test(clean));
check("hover states live only inside the (hover: hover) and (pointer: fine) gate",
  /@media \(hover: hover\) and \(pointer: fine\) \{\s*\.app-chip-btn:hover \.app-chip/.test(clean) &&
  /\.app-manual-send-btn:hover \.app-manual-send \{ background: var\(--app-accent\); \}/.test(clean) &&
  !/\.app-chip-btn:hover/.test(clean.replace(/@media \(hover: hover\) and \(pointer: fine\) \{[\s\S]*?\n\}/, "")));
check("the Replay glyph takes one full turn on click (300ms transition, -360deg)",
  /\.app-replay-box svg \{[^}]*transition: transform \.3s cubic-bezier\(\.2,\.7,\.3,1\);/.test(clean) &&
  /\.app-replay\.is-spinning \.app-replay-box svg \{ transform: rotate\(-360deg\); \}/.test(clean));
check("the answer zone glides height over 300ms and clips only while gliding",
  /\.app-answer-zone \{ transition: height \.3s cubic-bezier\(\.2,\.7,\.3,1\); \}/.test(clean) &&
  /\.app-answer-zone\.is-gliding \{ overflow: hidden; \}/.test(clean) &&
  /\.app-full-answer \{ font-size: 19px;/.test(clean));
check("the real input: inherited font, full-strength text, dim placeholder, accent focus border",
  /input\.app-manual-input \{ font: inherit; font-size: 13px; color: var\(--app-text\); \}/.test(clean) &&
  /input\.app-manual-input::placeholder \{ color: var\(--app-dim\); opacity: 1; \}/.test(clean) &&
  /input\.app-manual-input:focus \{ border-color: var\(--app-accent\); \}/.test(clean));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
