#!/usr/bin/env node
/* Step 77 — Avatar Excellence Round. The owner's live verdict on
   Steps A+B was rejection, on his real phone: (D1) NO SOUND AT
   ALL, (D2) the head never moved during speech — mouth opens and
   closes on a frozen head, (D3) no persona rotation. This step:
   D1 — the voiced path is rebuilt on ONE Web Audio context
   created/resumed inside the Start gesture, all five lines
   pre-decoded to buffers (persona voice -> Step 74 scene clips
   -> staged pacing), an AnalyserNode on the graph, a visible
   honest sound state, and the silent full-arc autoplay is gone:
   the stage opens READY and the interview runs when started.
   D2 — speaking renders are produced by MuseTalk driven by a
   living performance take (breathing, sway, blinks), so the head
   lives through the line: measured max head-frozen run 0ms,
   where the Step 76 still-driven render froze for 1,320ms of a
   1,360ms line. D3 — the full pool of six personas, each with
   portrait, own voice, presence loops and speaking renders;
   random per session, never the same twice in a row.
   (Step 79 superseded the per-session selection with per-load
   rotation — the owner's refresh never left the session. See §2.)
   Behaviour is measured by the Playwright probes kept with the
   report (step77-avatar-excellence/work/probe-d1*.py) and the
   offline frame analysis (work/compare_d2.py). */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const js = fs.readFileSync(path.join(ROOT, "website", "app.js"), "utf8");
const av = fs.readFileSync(path.join(ROOT, "website", "avatar.js"), "utf8");
const demo = fs.readFileSync(path.join(ROOT, "website", "demo.html"), "utf8");

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log("PASS " + name); }
  else { fail++; console.log("FAIL " + name + (detail ? " :: " + detail : "")); }
}

const POOL = ["p1", "p2", "p3", "p4", "p5", "p6"];
const KEYS = ["tell", "follow", "story", "why", "thanks"];
const STEM = { tell: "tell", follow: "followup", story: "story", why: "why", thanks: "thanks" };
const STATES = ["idle", "listening", "thinking", "greeting"];

/* ---------- 1. The full pool ships, complete per persona ---------- */
POOL.forEach(function (pid) {
  check(pid + ": poster + presence loops (WebM+MP4) + speaking renders + own voice all ship",
    fs.existsSync(path.join(ROOT, "website", "avatar", pid + "-poster.webp")) &&
    STATES.every(function (s) {
      return ["webm", "mp4"].every(function (e) {
        const f = path.join(ROOT, "website", "avatar", pid + "-" + s + "." + e);
        return fs.existsSync(f) && fs.statSync(f).size > 5000;
      });
    }) &&
    KEYS.every(function (k) {
      const w = path.join(ROOT, "website", "avatar", pid + "-speaking-" + k + ".webm");
      const m = path.join(ROOT, "website", "avatar", pid + "-speaking-" + k + ".mp4");
      const v = path.join(ROOT, "website", "avatar", pid + "-voice-" + STEM[k] + ".mp3");
      return fs.existsSync(w) && fs.statSync(w).size > 10000 &&
             fs.existsSync(m) && fs.statSync(m).size > 10000 &&
             fs.existsSync(v) && fs.statSync(v).size > 3000;
    }));
});
check("per-persona media stays within the session budget (only one persona loads)",
  POOL.every(function (pid) {
    let total = 0;
    const dir = path.join(ROOT, "website", "avatar");
    fs.readdirSync(dir).forEach(function (f) {
      if (f.indexOf(pid + "-") === 0) { total += fs.statSync(path.join(dir, f)).size; }
    });
    return total < 3.2 * 1024 * 1024;
  }));

/* ---------- 2. Rotation: per load, never the same as the last load ----------
   Step 79 re-pin (annotated): Step 77 selected per SESSION
   (sessionStorage) with the last persona excluded across loads.
   The owner's phone refresh stays inside the same tab session, so
   his refreshes never changed the face; he ordered per-load
   rotation. The sessionStorage layer is gone — the localStorage
   last-persona exclusion below is now the whole mechanism, and
   within one load the pick is fixed (the code picks once, at
   driver init, and publishes it). */
check("the driver carries the six-persona pool",
  av.includes('var POOL = ["p1", "p2", "p3", "p4", "p5", "p6"];'));
check("Step 79: selection is per load — no sessionStorage persona pin",
  !av.includes("window.sessionStorage") && !av.includes("ia-avatar-persona"));
check("Step 79: every load re-picks, excluding the previous load's persona",
  av.includes('lstoreSet("ia-avatar-last", pid);') &&
  av.includes("cands[Math.floor(Math.random() * cands.length)]"));
check("the last persona is excluded across loads (localStorage)",
  av.includes('lstore("ia-avatar-last")') &&
  av.includes("POOL.filter(function (p) { return p !== last; })"));
check("the chosen persona is published for the sound engine",
  av.includes("window.__avatarPersonaId = pid;"));
check("every asset path is built from the chosen persona only",
  av.includes('"avatar/" + pid + "-speaking-tell"') &&
  av.includes('"avatar/" + pid + "-idle"') &&
  av.includes('v.poster = "avatar/" + pid + "-poster.webp";') &&
  !/avatar\/p[2-6]-/.test(av));

/* ---------- 3. D1: the Web Audio sound engine ---------- */
check("one AudioContext is created/resumed inside the Start gesture",
  js.includes("function audioEnsure()") &&
  js.includes("window.AudioContext || window.webkitAudioContext") &&
  js.includes('audioCtx.state === "suspended"'));
check("lines are pre-decoded to buffers, persona voice first, scene clips as fallback",
  js.includes("function audioLoadBuffers()") &&
  js.includes('"avatar/" + pid + "-voice-" + CLIP_FILES[key] + ".mp3"') &&
  js.includes('"audio/scene-" + CLIP_FILES[key] + ".mp3"') &&
  js.includes("audioCtx.decodeAudioData(ab)"));
check("an AnalyserNode sits on the graph (sound is measurable, not assumed)",
  js.includes("audioCtx.createAnalyser()") && js.includes("window.__iaAudio"));
check("playback is a buffer source on the context, not a timed element play()",
  js.includes("audioCtx.createBufferSource()") && js.includes("src.connect(audioAnalyser)"));
check("the scene clock API reports the sounding beat for the avatar's sync",
  js.includes("window.__iaSceneClock = function ()") && js.includes('via: "webaudio"'));
check("mute drives the gain node (position keeps advancing)",
  js.includes("audioGain.gain.setValueAtTime(sceneMuted ? 0 : 1, audioCtx.currentTime)"));
check("total sound failure is surfaced, never silent-without-explanation",
  js.includes('document.getElementById("scene-sound-note")') &&
  js.includes("soundNote(!(haveBuf || haveEl));") &&
  demo.includes('id="scene-sound-note"'));
check("one element rejection no longer retires a clip for the session",
  js.includes("rec.playFails = (rec.playFails || 0) + 1;") &&
  js.includes("if (rec.playFails >= 2) { rec.failed = true; }"));

/* ---------- 4. The stage opens READY — no silent autoplay ---------- */
check("primeScene opens the stage ready instead of spending the arc silently",
  js.includes("function primeScene()") &&
  js.includes('setScenePill("Ready when you are", "");') &&
  js.includes("primeScene();"));
check("the silent run survives only as an explicit, labelled choice",
  demo.includes('id="scene-watch"') && demo.includes("Watch without sound") &&
  js.includes("playScene({ voice: false, greet: false })"));
check("replay keeps the run's own sound choice",
  js.includes("playScene({ greet: true, voice: sceneVoiced })"));

/* ---------- 5. The driver syncs to the sound clock ---------- */
check("the driver reads the scene clock when it exists (element clock as fallback)",
  av.includes("function beatClock(key)") && av.includes("window.__iaSceneClock()") &&
  av.includes("clipElFor(key)"));
check("the 120ms drift guard still governs the render sync",
  av.includes("Math.abs(d) > 0.12") && av.includes("probe.sync"));

console.log(`\nStep 77: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
