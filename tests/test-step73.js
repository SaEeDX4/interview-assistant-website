#!/usr/bin/env node
/* Step 73 — Demo Phase 1, "The Interview, Live" (Concept A from the
   demo ideation). The demo window becomes a staged video call: a
   LIVE bar with a running clock, the interviewer speaking, the
   question arriving word by word as a provisional transcript under
   a Listening pill, "Question detected", the three points landing,
   then an ambush follow-up that shortens itself twice. Above the
   stage, the preparation band shows the chain the answers come
   from (resume + job description + completed profile -> confirmed
   facts + question bank). Also pinned: the honesty-copy fixes (no
   "no network" claim — typed questions ARE sent to the answer
   service; the ~2-minute claim replaced by the measured ~30
   seconds), the demo-next card gated on a real visitor interaction,
   typed questions matching local SAMPLES before any proxy call, the
   client-side Persian/Arabic language guard, and demo.html's CTAs
   never self-linking. Behaviour is pinned by the Playwright audit
   kept with the report (demo-phase1/audit.py). */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const demo = fs.readFileSync(path.join(ROOT, "website", "demo.html"), "utf8");
const index = fs.readFileSync(path.join(ROOT, "website", "index.html"), "utf8");
const js = fs.readFileSync(path.join(ROOT, "website", "app.js"), "utf8");
const css = fs.readFileSync(path.join(ROOT, "website", "styles.css"), "utf8");
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
// The demo IIFE only (up to the Step 21 hero section).
const demoJs = js.split("Step 21 — hero")[0];

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log("PASS " + name); }
  else { fail++; console.log("FAIL " + name + (detail ? " :: " + detail : "")); }
}

/* ---------- the preparation band: shown, not told ---------- */
check("prep band present with its title",
  demo.includes('class="prep-band"') && demo.includes("Before the interview — done once"));
check("prep band names the three sources",
  demo.includes("<strong>Your resume</strong>") &&
  demo.includes("<strong>The job description</strong>") &&
  demo.includes("<strong>Your profile</strong>"));
check("prep band shows the profile's own questions (the hobby example)",
  demo.includes("What are your hobbies?"));
check("prep band's output tile: confirmed facts + the 50–150 bank, approved by the visitor",
  demo.includes("Confirmed facts + a 50–150 question bank") &&
  demo.includes("every fact approved by you"));

/* ---------- the call stage ---------- */
check("call stage with a LIVE bar, a running clock and the call-bar furniture (Step 90 re-pin, annotated: the bar's right side no longer reads 'Video call — simulated' — on the owner's order (addendum E1) it carries real-call furniture, the meeting title + a participants mark; the simulated disclosure stands in the eyebrow directly above the stage and in the honesty copy under it)",
  demo.includes('id="call-stage"') && demo.includes('class="live-chip"') &&
  demo.includes('id="scene-clock"') && demo.includes("Final-round interview") &&
  demo.includes("Live demo — simulated") && !demo.includes("Video call — simulated"));
check("webcam marker REMOVED entirely (owner decision 2026-11-22: pill, bezel strip and notch all rejected on his phone — no label in any form. Owner clarification the same night: the under-the-webcam FEELING is staged instead — a hardware lens in the frame's bezel (.call-bezel/.call-lens, no text) and the window hanging beneath it; the marker's absence asserted here is unchanged)",
  !demo.includes('class="call-cam"') && !demo.includes("call-cam-lens") &&
  !demo.includes("call-cam-text"));
check("interviewer tile: name plate (name + role), speaking marker, no meter",
  /* Step 89 re-pin (annotated): the owner ordered the
     "AI interviewer — simulated" plate deleted — the tile now
     carries a believable participant name + role (avatar.js
     writes the chosen persona's identity into #call-name /
     #call-role; the honesty wording stays in the call header
     and the page copy). The chip's 3-dot meter is deleted with
     it — the owner stared at it and could not tell what it
     meant; the speaking signal is the frame's halo alone. */
  demo.includes('id="call-tile"') && demo.includes('id="call-name"') && demo.includes('id="call-role"') &&
  demo.includes('id="call-speaking"') && !demo.includes('id="call-dots"') && !demo.includes("AI interviewer") && !demo.includes('id="call-wave"'));
check("the app window sits inside the call frame, below the LIVE bar (Step 73 pinned this against the webcam marker; the marker was removed 2026-11-22, so the bar is the anchor now)",
  demo.indexOf('class="call-bar"') < demo.indexOf('id="app-window"') &&
  demo.includes('class="app-window" id="app-window"'));
check("the window's canonical Live header carries the scene state pill",
  // Step 74 re-pin (One Window Everywhere): the demo window's top
  // strip is the Live window's .app-header with the canonical
  // .app-pill — the Step 73 Home-bar + site-pill hybrid is gone.
  // The static (settled) pill reads the app's own state word.
  demo.includes('class="app-pill" id="scene-pill"') && demo.includes('id="scene-pill-text"') &&
  demo.includes('<span id="scene-pill-text">Answer ready</span>') &&
  demo.includes("Live demo — simulated"));
check("settled scene is the static state: the warm-up question + its three points pre-rendered",
  // Step 74 re-pin: the settled state is the canonical layer-0
  // depiction (warm-up + points). The follow-up block is gone —
  // the arc's exchanges are scene layers built by JS into the
  // same stacks; the follow-up's strings live in app.js.
  !demo.includes('id="scene-followup"') &&
  demo.includes("“Tell me about yourself.”") &&
  demoJs.includes('var FOLLOW_Q = "Can you give me the shorter version?"') &&
  demoJs.includes("Five years building web products — and this team’s focus is why I’m here."));
check("scene controls exist but stay hidden without JS (no dead controls)",
  /<div class="scene-controls" id="scene-controls" hidden>/.test(demo) &&
  demo.includes('id="scene-replay"') && demo.includes('id="scene-skip"'));
check("stage caption states the delivery form factually (under the webcam, three short points)",
  demo.includes("sits under your webcam") && demo.includes("read three short points, speak"));
check("no undetectable/invisible guarantee claims anywhere on the page",
  !/undetectable|invisible to|nobody can tell/i.test(demo));

/* ---------- hero + honesty copy ---------- */
check("hero headline carries DURING (the five-second test)",
  demo.includes("Answers during the interview itself"));
check("hero lead names the preparation chain and the live moment",
  demo.includes("your resume, the job description and your answers to its profile questions") &&
  demo.includes("while the interview is actually happening"));
check("the false no-network claim is gone (hero + note)",
  !demo.includes("sends anything anywhere") && !demo.includes("no network"));
check("the note tells the truth about typed questions (sent to the answer service, answered live) (Step 90 re-pin, annotated: the panel was shortened on the owner's order (addendum G) — the disclosure survives in the new sentence's own words)",
  demo.includes("sent to our answer service and answered live"));
check("the 2-minute claim is retired everywhere (demo, index, app.js)",
  !demo.includes("took about 2 minutes") && !index.includes("took about 2 minutes") &&
  !js.includes("took about 2 minutes") &&
  demo.includes("take about 30 seconds to say"));
check("'Your turn' label introduces the typed path",
  demo.includes("Your turn — type any interview question"));

/* ---------- CTAs never self-link on demo.html ---------- */
check("no 'Try the live demo' CTA remains on demo.html",
  !demo.includes('href="demo.html">Try the live demo'));
check("header + menu CTAs point to the download",
  demo.includes('<a class="btn btn-primary btn-small" href="download.html">Download for Windows</a>') &&
  demo.includes('<a class="btn btn-primary nav-menu-cta" href="download.html">Download for Windows</a>'));
check("sticky bar: download primary, pricing secondary",
  demo.includes('<a class="btn btn-primary btn-small" href="download.html">Download for Windows</a>') &&
  demo.includes('<a class="btn btn-secondary btn-small" href="pricing.html">See pricing</a>'));

/* ---------- the scene engine (app.js, demo IIFE) ---------- */
check("scene state machine present (play / settle / cancel / layers)",
  // Step 74 re-pin: playScene takes an options argument (voice).
  /function playScene\(opts\)/.test(demoJs) && /function settleScene\(\)/.test(demoJs) &&
  /function cancelScene\(\)/.test(demoJs) && /function buildSceneLayers\(\)/.test(demoJs));
check("the scene's pill states are the product's own words",
  // Step 74 re-pin: the header pill carries the app's short state
  // words only (the long staging sentence was a site-pill text).
  demoJs.includes('setScenePill("Listening", "listening")') &&
  demoJs.includes("Question detected") && demoJs.includes("Answer ready") &&
  demoJs.includes('setScenePill("Not listening", "")'));
check("the running clock is driven from the scene start",
  /function startSceneClock\(\)/.test(demoJs) && demoJs.includes('getElementById("scene-clock")'));
check("any visitor interaction cancels the scene (chip, mode, submit)",
  (demoJs.match(/cancelScene\(\);/g) || []).length >= 3);
check("reduced motion settles the scene instead of playing it",
  /if \(isReducedMotion\(\)\) \{\s*settleScene\(\);/.test(demoJs));
check("the scene is inert where the call stage does not exist (index.html)",
  demoJs.includes("var sceneOn = !!(callStageEl"));

/* ---------- demo-next gating ---------- */
check("the conversion card is gated on a real visitor interaction",
  demoJs.includes("var visitorActed = false;") &&
  demoJs.includes("if (visitorActed) { showDemoNext(); }") &&
  (demoJs.match(/visitorActed = true;/g) || []).length >= 3);

/* ---------- typed path: SAMPLES first, then the guarded live call ---------- */
check("typed questions match local SAMPLES first (ported matcher)",
  /function matchSample\(text\)/.test(demoJs) && /var MATCHERS =/.test(demoJs));
check("the submit path consults the matcher before the live call",
  demoJs.indexOf("var matched = matchSample(text);") >= 0 &&
  demoJs.indexOf("var matched = matchSample(text);") < demoJs.indexOf("showTypedAI(text);"));
check("Persian/Arabic guard: script detection + in-language instruction on the wire question",
  /function typedLang\(text\)/.test(demoJs) && /function wireQuestion\(text\)/.test(demoJs) &&
  demoJs.includes("(به فارسی پاسخ دهید)") && demoJs.includes("(أجب بالعربية)") &&
  demoJs.includes("iaFetchAI(wireQuestion(text), \"base\""));
check("the sample tag names the preparation chain",
  demoJs.includes("points are built from your confirmed facts: your resume, the job description, your profile."));

/* ---------- scene CSS ---------- */
check("call stage + LIVE pulse + speaking halo CSS present",
  /* Step 87 re-pin (annotated): the call-wave keyframes are
     deleted with the bars; the speaking CSS is the halo — the
     frame's box-shadow driven by the --lvl envelope scalar.
     Step 92 re-pin (annotated): the ring's amplitude rises to
     .20 + .50·lvl with the envelope's re-gaining (owner's
     order: the speaking motion must read clearly). */
  /\.call-stage \{/.test(clean) && /@keyframes live-pulse/.test(clean) &&
  /\.call-tile\.is-speaking \.avatar-frame \{[^}]*box-shadow: 0 0 0 2px rgba\(45, 212, 191, calc\(\.20 \+ \.50 \* var\(--lvl, 0\)\)\)/.test(clean)
  && !/@keyframes call-wave/.test(clean));
check("prep band CSS present",
  /\.prep-band \{/.test(clean) && /\.prep-list \{/.test(clean) && /\.prep-out \{/.test(clean));
check("the window hangs under the webcam on desktop (absolute, 432px, centred on the lens axis; re-pin 2026-11-22: top 52px -> 16px — the window now hangs from the call area's top under the bezel lens instead of sharing the participant's top line)",
  /\.call-main \.app-window \{[^}]*position: absolute; top: 16px;[^}]*width: 432px;/.test(clean));
check("on phones the window is compact in flow inside the frame",
  /@media \(max-width: 640px\) \{[\s\S]*?\.call-main \.app-window \{[^}]*position: relative;/.test(clean));
check("scene pill state styles present (the canonical app-pill states)",
  // Step 74 re-pin: the pill's states are the shared .app-pill
  // rules (is-listening tint, is-live meter animation).
  /\.app-pill\.is-listening \{/.test(clean) && /\.app-pill\.is-live \.app-meter i \{/.test(clean));
check("provisional transcript styling present (all scene questions)",
  // Step 74 re-pin: every exchange's question layer carries
  // .scene-q (the follow-up has no separate class any more).
  /\.scene-q\.is-provisional \.w/.test(clean) && !/\.scene-fq/.test(clean));
check("no new reduced-motion block was added (the count stays 3)",
  (css.match(/@media \(prefers-reduced-motion: reduce\)/g) || []).length === 3);

console.log(`\nStep 73: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
