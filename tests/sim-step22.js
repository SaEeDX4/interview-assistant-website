#!/usr/bin/env node
/* Step 22 DOM-shim simulation (local-only, never pushed as a suite — it is a
   verification harness, not a repo test): extracts the REAL story IIFE from
   website/app.js and runs it against a minimal DOM shim, in desktop, mobile
   player, and reduced-motion modes.
   Usage: node tests/sim-step22.js [--mobile] [--reduced]
   Exit 0 when every check passes. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const appJs = fs.readFileSync(path.join(ROOT, "website", "app.js"), "utf8");
const start = appJs.indexOf("/* Steps 21");
const end = appJs.indexOf("/* Step 1 — scroll reveal");
if (start < 0 || end < 0 || end <= start) { console.error("story IIFE markers not found"); process.exit(2); }
const storyCode = appJs.slice(start, end);

const MOBILE = process.argv.includes("--mobile");
const REDUCED = process.argv.includes("--reduced");

let passed = 0, failed = 0;
function check(name, cond) {
  if (cond) { passed++; console.log("PASS " + name); }
  else { failed++; console.log("FAIL " + name); }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- minimal DOM shim ---------- */
class El {
  constructor(tag, id) {
    this.tagName = (tag || "div").toUpperCase();
    this.id = id || "";
    this.children = [];
    this._class = new Set();
    this._text = "";
    this.hidden = false;
    this.disabled = false;
    this.style = {};
    this.attrs = {};
    this.listeners = {};
    this._closestWindow = null;
    const self = this;
    this.classList = {
      add: (...c) => c.forEach((x) => self._class.add(x)),
      remove: (...c) => c.forEach((x) => self._class.delete(x)),
      toggle: (c, force) => {
        if (force === undefined) { self._class.has(c) ? self._class.delete(c) : self._class.add(c); }
        else if (force) { self._class.add(c); } else { self._class.delete(c); }
      },
      contains: (c) => self._class.has(c),
    };
  }
  get className() { return [...this._class].join(" "); }
  set className(v) { this._class = new Set(String(v).split(/\s+/).filter(Boolean)); }
  get textContent() { return this._text; }
  set textContent(v) { this._text = String(v); }
  get innerHTML() { return ""; }
  set innerHTML(v) { if (v === "") { this.children = []; } }
  appendChild(child) { child.parent = this; this.children.push(child); return child; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k] !== undefined ? this.attrs[k] : null; }
  removeAttribute(k) { delete this.attrs[k]; }
  addEventListener(type, fn) { (this.listeners[type] = this.listeners[type] || []).push(fn); }
  fire(type, event) { (this.listeners[type] || []).forEach((fn) => fn(event || {})); }
  querySelector(sel) {
    if (sel === "h3") { return this._h3 || null; }
    if (sel === "p") { return this._p || null; }
    return null;
  }
  closest(sel) {
    if (sel === ".story-window" && this._closestWindow) { return this._closestWindow; }
    return null;
  }
}

const STEP_TEXTS = [
  ["Before the interview — Prepare", "In Home, four steps get you ready: account, profile, interview, pre-interview check. Press Prepare and the app builds your 50–150 question bank in about a minute — fifteen stages, from verifying your profile to caching the answers."],
  ["Start listening", "Open the Live Assistant and press Start listening. The window stays on top, the status pill turns green, and the level meter moves as the interviewer speaks. Your microphone stays off."],
  ["The first question lands", "As the interviewer speaks, a live transcript grows in italics. When the question is detected it appears whole — then the app thinks (● ● ●) and the points stream in one at a time, until the pill reads Answer ready."],
  ["Interrupted? It adapts", "If the interviewer jumps in fast, a Concise badge appears and the next answer comes as three short bullets. A second fast follow-up steps down to Rapid — two bullets, direct answer first."],
  ["Coach Mode, one keypress away", "Ctrl+Alt+C swaps the answer area for keywords and a structure — EXPERIENCE · OUTCOME · FIT, then Present role → one result → why this role. Three keywords, one structure, nothing else on screen."],
  ["The second question remembers", "A new question arrives and the answer reaches for a fresh story — the app never repeats a story you used in your last two answers. The history counter reads 2 / 2, and ‹ › browses earlier questions."],
  ["Stop — and a report, not a score", "Press Stop and the report is saved at once: the questions asked, the suggestions shown, category counts — no scores, no hiring predictions, and never what you said. It lives in Home → Reports."],
];

const els = {};
function mk(tag, id) { const el = new El(tag, id); if (id) { els[id] = el; } return el; }
const htmlEl = new El("html");
const storyWindowEl = mk("div");
const storyAnswerStackEl = mk("div", "story-answer-stack");
storyAnswerStackEl._closestWindow = storyWindowEl;
[
  ["p", "story-pill"], ["span", "story-pill-text"], ["span", "story-badge"],
  ["span", "story-start"], ["span", "story-start-label"],
  ["div", "story-home-header"], ["div", "story-live-header"],
  ["div", "story-home"], ["div", "story-live"], ["div", "story-report"],
  ["i", "story-prepare-bar"], ["p", "story-prepare-stage"], ["a", "story-open-live"],
  ["div", "story-question-stack"], ["p", "story-transcript"], ["p", "story-context"],
  ["p", "story-thinking"], ["span", "story-meta"], ["div", "story-coach"],
  ["span", "story-history"], ["span", "story-history-text"],
  ["div", "story-caption-stack"], ["p", "story-caption-live"], ["span", "story-count"],
].forEach(([tag, id]) => mk(tag, id));
els["story-pill-text"].textContent = "Not listening";
els["story-badge"].hidden = true;
els["story-home-header"].classList.add("is-hidden");
els["story-home"].classList.add("is-hidden");
els["story-report"].classList.add("is-hidden");
els["story-open-live"].classList.add("is-hidden");
els["story-context"].classList.add("is-hidden");
els["story-thinking"].classList.add("is-hidden");
els["story-coach"].classList.add("is-hidden");
els["story-history"].hidden = true;
els["story-count"].textContent = "1 / 7";
const segWrapEl = mk("div");
const snapProbeEl = mk("div");
const segBtns = STEP_TEXTS.map((t, i) => {
  const b = new El("button");
  b.setAttribute("data-beat", String(i));
  b.textContent = ["Prepare", "Start", "Q1", "Concise", "Coach", "Q2", "Report"][i];
  if (i === 0) { b.classList.add("is-active"); b.setAttribute("aria-current", "true"); }
  return b;
});
const prevBtn = mk("button");
prevBtn.disabled = true;
const nextBtn = mk("button");
const steps = STEP_TEXTS.map((t, i) => {
  const li = new El("li");
  li.setAttribute("data-beat", String(i));
  li._h3 = new El("h3"); li._h3.textContent = t[0];
  li._p = new El("p"); li._p.textContent = t[1];
  return li;
});

/* matchMedia (only prefers-reduced-motion is queried now) + a mutable
   narrow flag standing in for the CSS breakpoint: the probe's computed
   display is block at <=860px, none on desktop. setMobile flips it and
   fires the window resize listeners, like a fold/unfold or rotate. */
let mobileNow = MOBILE;
const winListeners = {};
function setMobile(v) {
  mobileNow = v;
  (winListeners.resize || []).forEach((fn) => fn());
}
const mqStore = {};
function matchMedia(q) {
  if (!mqStore[q]) {
    mqStore[q] = { matches: q.includes("prefers-reduced-motion") ? REDUCED : false,
      addEventListener: function () {}, addListener: function () {} };
  }
  return mqStore[q];
}

const observers = [];
class FakeIO {
  constructor(cb) { this.cb = cb; observers.push(this); }
  observe() {}
  unobserve() {}
}

const sandbox = {
  console, setTimeout, clearTimeout,
  document: {
    documentElement: htmlEl,
    createElement: (tag) => new El(tag),
    getElementById: (id) => els[id] || null,
    querySelector: (sel) => {
      if (sel === ".story-segments") { return segWrapEl; }
      if (sel === ".story-snap") { return snapProbeEl; }
      if (sel === ".story-prev") { return prevBtn; }
      if (sel === ".story-next") { return nextBtn; }
      return null;
    },
    querySelectorAll: (sel) => {
      if (sel === ".story-step") { return steps; }
      if (sel === ".story-seg") { return segBtns; }
      return [];
    },
    addEventListener: () => {},
    hidden: false,
  },
  window: {
    matchMedia,
    addEventListener: (t, fn) => { (winListeners[t] = winListeners[t] || []).push(fn); },
    innerWidth: MOBILE ? 390 : 1280,
    scrollY: 0,
    localStorage: { getItem: () => null, setItem: () => {} },
    IntersectionObserver: FakeIO,
  },
  IntersectionObserver: FakeIO,
  getComputedStyle: (el) => ({
    display: el === snapProbeEl ? (mobileNow ? "block" : "none")
      : el === storyWindowEl ? ((mobileNow && !htmlEl.classList.contains("story-player")) ? "none" : "block")
      : "block",
  }),
};
vm.createContext(sandbox);
vm.runInContext(storyCode, sandbox);

/* helpers to drive the story */
// Step 23 layer model: the visible layer is the one without .is-hidden;
// a bullet counts only once revealed (no .is-hidden on the <li>).
function visibleChild(stackEl) { return stackEl.children.find((c) => !c.classList.contains("is-hidden")) || null; }
function bullets() {
  const layer = visibleChild(els["story-answer-stack"]);
  if (!layer) { return []; }
  const ul = layer.children.find((c) => c.tagName === "UL");
  if (!ul) { return []; }
  return ul.children.filter((li) => !li.classList.contains("is-hidden"))
    .map((li) => li.children[1] ? li.children[1].textContent : "");
}
function allBullets() {
  const out = [];
  els["story-answer-stack"].children.forEach((layer) => {
    const ul = layer.children.find((c) => c.tagName === "UL");
    if (ul) { ul.children.forEach((li) => out.push(li)); }
  });
  return out;
}
function questionText() {
  const layer = visibleChild(els["story-question-stack"]);
  return layer ? layer.textContent : "";
}
function captionTitle() {
  const item = visibleChild(els["story-caption-stack"]);
  if (!item) { return ""; }
  const h3 = item.children.find((c) => c.tagName === "H3");
  return h3 ? h3.textContent : "";
}
function captionBody() {
  const item = visibleChild(els["story-caption-stack"]);
  if (!item) { return ""; }
  const p = item.children.find((c) => c.tagName === "P");
  return p ? p.textContent : "";
}
function pillText() { return els["story-pill-text"].textContent; }
function ioDrive(beat) {
  observers.forEach((o) => o.cb([{ isIntersecting: true, target: steps[beat] }]));
}
function segActive() { return segBtns.findIndex((b) => b.classList.contains("is-active")); }
function swipe(x0, x1) {
  storyWindowEl.fire("touchstart", { changedTouches: [{ clientX: x0 }] });
  storyWindowEl.fire("touchend", { changedTouches: [{ clientX: x1 }] });
}

(async function main() {
  console.log("== mode: " + (MOBILE ? "mobile player" : "desktop") + (REDUCED ? " + reduced motion" : "") + " ==");

  if (!MOBILE && !REDUCED) {
    // Desktop: IO drives beats; beat 0 plays Prepare, beat 2 plays Q1.
    check("desktop: story observer registered", observers.length === 1);
    check("desktop: layers built once (5 question, 5 answer, 7 caption)",
      els["story-question-stack"].children.length === 5
      && els["story-answer-stack"].children.length === 5
      && els["story-caption-stack"].children.length === 7);
    ioDrive(0);
    await sleep(2600);
    check("desktop beat 0: prepare done, open live visible",
      els["story-prepare-stage"].textContent.startsWith("Done —") && !els["story-open-live"].classList.contains("is-hidden"));
    check("desktop beat 0: step 0 active", steps[0].classList.contains("is-active"));
    check("desktop: answer bullets pre-rendered hidden (9 total, none revealed yet)",
      allBullets().length === 9 && allBullets().every((li) => li.classList.contains("is-hidden")));
    ioDrive(2);
    await sleep(600);
    check("desktop beat 2 mid-play: transcript growing", els["story-transcript"].textContent.length > 0);
    await sleep(2200);
    check("desktop beat 2 final: Answer ready, 3 bullets, history 1 / 1",
      pillText() === "Answer ready" && bullets().length === 3 && els["story-history-text"].textContent === "1 / 1");
    ioDrive(3);
    check("desktop beat 3: Concise badge + Q3 + meta Concise",
      !els["story-badge"].hidden && els["story-badge"].textContent === "Concise"
      && questionText().includes("Why should we hire you?")
      && els["story-meta"].textContent === "Concise");
    ioDrive(4);
    check("desktop beat 4: coach view shown, meta Coach",
      !els["story-coach"].classList.contains("is-hidden") && els["story-meta"].textContent === "Coach");
    ioDrive(6);
    check("desktop beat 6: report view shown, pill Stopped",
      !els["story-report"].classList.contains("is-hidden") && pillText() === "Stopped");
  }

  if (!MOBILE && REDUCED) {
    check("desktop reduced: no story observer (static HTML stays)", observers.length === 0);
    check("desktop reduced: pill still the static state", pillText() === "Not listening");
    check("desktop reduced: no step active", steps.every((s) => !s.classList.contains("is-active")));
  }

  if (MOBILE && !REDUCED) {
    check("mobile: story-player class set on <html>", htmlEl.classList.contains("story-player"));
    check("mobile: observer NOT driving (player mode)", observers.length === 0);
    check("mobile init: seg 0 active + aria-current, count 1 / 7, prev disabled",
      segActive() === 0 && segBtns[0].getAttribute("aria-current") === "true"
      && els["story-count"].textContent === "1 / 7" && prevBtn.disabled === true && nextBtn.disabled === false);
    check("mobile init: caption is beat 0 (visible layer + live region)",
      captionTitle() === STEP_TEXTS[0][0]
      && captionBody() === STEP_TEXTS[0][1]
      && els["story-caption-live"].textContent.startsWith(STEP_TEXTS[0][0]));
    await sleep(2600);
    check("mobile beat 0: prepare played in player",
      els["story-prepare-stage"].textContent.startsWith("Done —") && !els["story-open-live"].classList.contains("is-hidden"));
    segBtns[3].fire("click");
    check("mobile tap seg 3: Concise badge + Q3, caption beat 3, count 4 / 7",
      !els["story-badge"].hidden && questionText().includes("Why should we hire you?")
      && captionTitle() === STEP_TEXTS[3][0]
      && els["story-count"].textContent === "4 / 7" && segActive() === 3);
    check("mobile tap seg 3: exactly one caption item visible, and the stacks were not rebuilt",
      els["story-caption-stack"].children.filter((c) => !c.classList.contains("is-hidden")).length === 1
      && els["story-question-stack"].children.length === 5
      && els["story-answer-stack"].children.length === 5);
    check("mobile tap seg 3: segs 0-2 done, seg 3 active",
      segBtns[0].classList.contains("is-done") && segBtns[2].classList.contains("is-done")
      && !segBtns[4].classList.contains("is-done"));
    swipe(200, 100);
    check("mobile swipe left: beat 3 -> 4 coach view",
      segActive() === 4 && !els["story-coach"].classList.contains("is-hidden") && els["story-meta"].textContent === "Coach");
    swipe(100, 200);
    check("mobile swipe right: beat 4 -> 3 concise again",
      segActive() === 3 && els["story-badge"].textContent === "Concise");
    swipe(200, 180);
    check("mobile swipe under 40px: no beat change", segActive() === 3);
    nextBtn.fire("click");
    check("mobile next arrow: beat 3 -> 4", segActive() === 4);
    prevBtn.fire("click");
    check("mobile prev arrow: beat 4 -> 3", segActive() === 3);
    segWrapEl.fire("keydown", { key: "ArrowRight" });
    check("mobile ArrowRight on segments: beat 3 -> 4", segActive() === 4);
    segWrapEl.fire("keydown", { key: "ArrowLeft" });
    check("mobile ArrowLeft on segments: beat 4 -> 3", segActive() === 3);
    // Mode switch: unfold / resize to desktop — class removed, IO takes over.
    setMobile(false);
    check("mode switch to desktop: story-player class removed", !htmlEl.classList.contains("story-player"));
    check("mode switch to desktop: observer registered", observers.length === 1);
    ioDrive(2);
    await sleep(600);
    check("mode switch: desktop IO beat 2 mid-play (transcript growing)", els["story-transcript"].textContent.length > 0);
    await sleep(2200);
    check("mode switch: desktop IO beat 2 final", pillText() === "Answer ready" && bullets().length === 3);
  }

  if (MOBILE && REDUCED) {
    check("mobile reduced: story-player class set", htmlEl.classList.contains("story-player"));
    segBtns[2].fire("click");
    check("mobile reduced: tap seg 2 renders final at once (no timers)",
      pillText() === "Answer ready" && bullets().length === 3
      && els["story-history-text"].textContent === "1 / 1"
      && captionTitle() === STEP_TEXTS[2][0]
      && els["story-count"].textContent === "3 / 7");
    check("mobile reduced: beat 0 rendered final at once (Done, no staged timers)",
      els["story-prepare-stage"].textContent.startsWith("Done —"));
  }

  console.log("\n" + passed + " passed, " + failed + " failed");
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error("SIM ERROR", e); process.exit(2); });
