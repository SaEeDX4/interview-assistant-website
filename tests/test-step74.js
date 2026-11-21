#!/usr/bin/env node
/* Step 74 — expand the demo idea + ONE WINDOW EVERYWHERE.
   Workstream 1 (unification): every depiction of the product
   window is the same window — the shared .app-window shell
   (radius 14, app tokens), the Live window's top strip is the
   canonical .app-header with the canonical .app-pill, the Home
   window's top strip is the canonical .app-window-bar with the
   app name alone, and ALL window controls are the shared SVG
   glyph family (the font-glyph —▢✕ rendering is gone). The
   demo window, the one outlier, now wears the Live header.
   Workstream 2 (the arc): the scene grows from one question to
   a full interview — warm-up, ambush follow-up, a deeper
   behavioural exchange, a closing question, the interviewer's
   thanks — with the candidate visibly answering between
   exchanges, one window holding one height through it all.
   Pass 3: the interviewer speaks (pre-generated clips, voiced
   runs start only on a gesture) and the "You" tile offers the
   visitor's own camera (opt-in, local-only). Behaviour is pinned
   by the Playwright audits kept with the report
   (step74-demo-expand/audit-windows.py, audit-arc.py,
   audit-pass3.py, audit-final.py). */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const demo = fs.readFileSync(path.join(ROOT, "website", "demo.html"), "utf8");
const index = fs.readFileSync(path.join(ROOT, "website", "index.html"), "utf8");
const features = fs.readFileSync(path.join(ROOT, "website", "features.html"), "utf8");
const hiw = fs.readFileSync(path.join(ROOT, "website", "how-it-works.html"), "utf8");
const js = fs.readFileSync(path.join(ROOT, "website", "app.js"), "utf8");
const css = fs.readFileSync(path.join(ROOT, "website", "styles.css"), "utf8");
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
const allHtml = demo + index + features + hiw;
const demoJs = js.split("Step 21 — hero")[0];

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log("PASS " + name); }
  else { fail++; console.log("FAIL " + name + (detail ? " :: " + detail : "")); }
}

/* ---------- 1. One window everywhere: the chrome ---------- */
check("no font-glyph window controls anywhere in the site",
  !allHtml.includes("<i>—</i><i>▢</i><i>✕</i>"));
check("every window bar's controls are the shared SVG glyphs",
  (allHtml.match(/<span class="app-controls"[^>]*><i><svg viewBox="0 0 16 16"/g) || []).length >= 8 &&
  !/app-controls[^>]*><i>—<\/i>/.test(allHtml));
check("the HIW hero bar carries the canonical title alone (no slogan tail)",
  hiw.includes('<span class="app-window-title">Interview Assistant</span>') &&
  !allHtml.includes("hw-hw-title-tail"));
check("the HIW hero's simulated label lives in the window's foot strip",
  hiw.includes('<div class="hw-hw-foot"><p class="hw-thread-line">') &&
  hiw.includes('<span class="hw-hw-tag">Simulated · sample data</span>'));
check("the viz fragment wears the canonical .app-window shell",
  hiw.includes('<div class="hw-viz-window app-window">') &&
  clean.includes(".hw-viz-window { overflow: hidden; box-shadow: none; }"));
check("the demo window's top strip is the canonical Live header",
  demo.includes('<div class="app-header">') &&
  demo.includes('<p class="app-pill" id="scene-pill">') &&
  demo.includes('<span class="app-start-label">Start listening</span>') &&
  !demo.includes('<div class="app-window-bar">'));

/* ---------- 2. The arc ---------- */
check("arc constants present: the follow-up line and the thanks line",
  js.includes('var FOLLOW_Q = "Can you give me the shorter version?"') &&
  js.includes('var THANKS_LINE = "That’s everything I need. Thank you."'));
check("the arc is a beat runner, not one question",
  /function sceneAsk\(/.test(demoJs) && /function sceneYou\(/.test(demoJs) &&
  /function sceneShowAnswer\(/.test(demoJs) &&
  demoJs.includes("SAMPLES.story.q") && demoJs.includes("SAMPLES.why.q"));
check("the arc ends on Interview complete with a download anchor",
  demoJs.includes('setScenePill("Interview complete", "ready")') &&
  demo.includes('id="scene-download"') && demo.includes('href="download.html"'));
check("the candidate's tile carries a speaking state and the closing caption",
  demo.includes('id="call-self"') && demo.includes('class="call-self-wave"') &&
  demo.includes('id="call-caption"') &&
  clean.includes(".call-self.is-speaking .call-self-wave { display: inline-flex; }"));
check("scene-mode height reservations keep one window height",
  clean.includes(".call-stage.is-scene .demo-answer-stack { min-height: var(--scene-answer-min, 0px); }") &&
  clean.includes(".call-stage.is-scene .demo-question-stack { min-height: var(--scene-question-min, 0px); }") &&
  /function sceneReserveHeights\(\)/.test(demoJs) &&
  /function measureLayer\(el\)/.test(demoJs));
check("the follow-up block is gone — every exchange swaps the main stacks",
  !demo.includes('id="scene-followup"') && !demo.includes('id="scene-rapid"') &&
  !/\.scene-followup \{/.test(clean) && !/\.scene-fq/.test(clean));

/* ---------- 3. The spoken interviewer ---------- */
check("five pre-generated clips ship with the site, small",
  ["tell", "followup", "story", "why", "thanks"].every(function (k) {
    const f = path.join(ROOT, "website", "audio", "scene-" + k + ".mp3");
    return fs.existsSync(f) && fs.statSync(f).size < 20000;
  }));
check("clips are wired only on the demo page and only from the audio folder",
  demoJs.includes('"audio/scene-"') && demoJs.includes("if (sceneOn)") &&
  demoJs.includes('CLIP_FILES = { tell: "tell", follow: "followup"'));
check("a voiced run starts only on the Start gesture, with a mute state",
  demo.includes('id="scene-start"') && demo.includes('id="scene-mute"') &&
  /function sceneClipDuration\(/.test(demoJs) &&
  demoJs.includes('sceneMuteBtn.textContent = sceneMuted ? "Sound off" : "Sound on"'));
check("voice failure falls back to the staged pacing (no dead end)",
  /function sceneClipPlay\(key\)/.test(demoJs) && demoJs.includes("rec.failed = true"));
check("the honesty copy says the voice is a pre-recorded sample",
  demo.includes("The interviewer’s voice is a pre-recorded sample") &&
  !demo.includes("no audio, no microphone, no recording"));

/* ---------- 4. The visitor's own camera ---------- */
check("camera: opt-in button + video + privacy note in the self tile",
  demo.includes('id="cam-toggle"') && demo.includes('id="cam-video"') &&
  demo.includes('id="cam-note"') &&
  demo.includes("Use your camera"));
check("camera: video-only, front camera, local-only promise in words",
  demoJs.includes('navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })') &&
  demoJs.includes("Nothing is recorded, uploaded or sent anywhere") &&
  /nothing is\s+recorded, uploaded or sent anywhere/.test(demo));
check("camera: tracks stop on toggle-off, page hide and unload",
  /camStream\.getTracks\(\)\.forEach\(function \(tr\) \{ tr\.stop\(\); \}\)/.test(demoJs) &&
  demoJs.includes('document.addEventListener("visibilitychange"') &&
  demoJs.includes('window.addEventListener("pagehide"'));
check("camera: denial and no-camera fall back to the labelled tile",
  demoJs.includes('function camFail(message)') &&
  demoJs.includes("Camera is not available in this browser"));
check("camera: the toggle is hidden without JS (no dead control)",
  demo.includes('id="cam-toggle" aria-pressed="false"') && demo.includes('aria-label="Use your camera — your video tile" hidden') &&
  demoJs.includes("camToggleBtn.hidden = false"));

console.log(`\nStep 74: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
