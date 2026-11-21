#!/usr/bin/env node
/* Step 76 — Avatar Step B: the interviewer actually speaks.
   The persona (p1) gets REAL lip-synced speaking renders for the
   demo's five fixed lines, produced in-house with MuseTalk
   (MIT) from the same 720x900 base canvas as the Step A presence
   loops, driven by HER OWN voice clips (the Step 74 scene voice,
   Helio, is a middle-aged man's voice and does not fit her; the
   Helio clips stay untouched for the no-avatar fallback path).
   The scene engine marks each spoken beat on the call stage
   (data-speak-key / data-speak-dur); avatar.js — the single
   speaking signal — plays the matching render in sync with the
   audio element, swaps the scene's clips to her voice at
   takeover, and never leaves a frozen frame: a finished or
   failed render falls back to the listening presence loop.
   The greeting now completes before the first question in
   visitor-started runs (Step A's cut-off note, fixed).
   Behaviour + parity numbers are measured by the Playwright
   audit kept with the report (step76-avatar-stepB/audit-step76.py)
   and the offline sync measurement (work/sync-measure.py). */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const js = fs.readFileSync(path.join(ROOT, "website", "app.js"), "utf8");
const av = fs.readFileSync(path.join(ROOT, "website", "avatar.js"), "utf8");
const demoJs = js.split("Step 21 — hero")[0];

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log("PASS " + name); }
  else { fail++; console.log("FAIL " + name + (detail ? " :: " + detail : "")); }
}

const KEYS = ["tell", "follow", "story", "why", "thanks"];

/* ---------- 1. The speaking renders + her voice ship with the site ---------- */
check("all five speaking renders ship as WebM + MP4, audio-stripped and small",
  KEYS.every(function (k) {
    const w = path.join(ROOT, "website", "avatar", "p1-speaking-" + k + ".webm");
    const m = path.join(ROOT, "website", "avatar", "p1-speaking-" + k + ".mp4");
    return fs.existsSync(w) && fs.statSync(w).size > 10000 && fs.statSync(w).size < 400000 &&
           fs.existsSync(m) && fs.statSync(m).size > 10000 && fs.statSync(m).size < 600000;
  }));
check("the persona's own voice clips ship for all five lines",
  KEYS.every(function (k) {
    const f = path.join(ROOT, "website", "avatar", "p1-voice-" + (k === "follow" ? "followup" : k) + ".mp3");
    return fs.existsSync(f) && fs.statSync(f).size > 3000 && fs.statSync(f).size < 30000;
  }));
check("the original scene clips remain for the no-avatar fallback path",
  ["tell", "followup", "story", "why", "thanks"].every(function (k) {
    return fs.existsSync(path.join(ROOT, "website", "audio", "scene-" + k + ".mp3"));
  }));

/* ---------- 2. The driver's speaking contract ---------- */
check("SPEAK map binds every scene key to its render, scene clip and her voice",
  KEYS.every(function (k) {
    return av.includes('file: "avatar/p1-speaking-' + k + '"') &&
           av.includes('"avatar/p1-voice-' + (k === "follow" ? "followup" : k) + '.mp3"');
  }) &&
  av.includes('clipFile: "scene-followup.mp3"') && av.includes('clipFile: "scene-tell.mp3"'));
check("the stage's data-speak-key is the single speaking signal (MutationObserver)",
  av.includes('new MutationObserver') && av.includes('getAttribute("data-speak-key")') &&
  av.includes("function startSpeaking(key)"));
check("voiced runs guard lip sync against the live audio clock (120ms snap)",
  av.includes("function startSync(key)") && av.includes("Math.abs(d) > 0.12") &&
  av.includes("probe.sync"));
check("silent runs rate-fit the render to the beat's staged duration",
  av.includes('getAttribute("data-speak-dur")') && av.includes("renderDur"));
check("a finished or failed render never freezes the frame (listening fallback)",
  av.includes("speakFailed") && av.includes('setState("listening")'));
check("takeover swaps the scene clips to her voice; failure keeps the scene voice",
  av.includes("probe.voice") && /function swapVoice\(\)/.test(av));

/* ---------- 3. The engine side: beat marks + greeting protection ---------- */
check("sceneAsk marks the spoken beat on the call stage",
  demoJs.includes('callStageEl.setAttribute("data-speak-key", opts.clip || "");') &&
  demoJs.includes('callStageEl.setAttribute("data-speak-dur", String(Math.round(speech * 100) / 100));'));
check("the thanks beat is marked as a spoken beat too",
  demoJs.includes('callStageEl.setAttribute("data-speak-key", "thanks");'));
check("turning speech off clears the beat mark",
  demoJs.includes('if (!on && callStageEl) { callStageEl.removeAttribute("data-speak-key"); }'));
check("visitor-started runs hold the first question for the greeting (2.75s)",
  demoJs.includes("window.__avatarStepA.active) ? 2.75 : 0.3") &&
  demoJs.includes("playScene({ voice: true, greet: true })") &&
  demoJs.includes("playScene({ greet: true })"));

console.log(`\nStep 76: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
