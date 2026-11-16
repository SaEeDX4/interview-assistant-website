#!/usr/bin/env node
/* Step 30 DOM-shim simulation for the hero (local-only verification
   harness): extracts the REAL shared bank + hero IIFE from
   website/app.js and runs them against a minimal DOM shim. Verifies
   the behaviour the static suites cannot execute: the staged play of
   a randomly loaded sample, the five chips reworking the answer
   (variant layers, meta words, selected state, Regenerate cycling),
   the Full paragraph swap, typed questions (matched sample, guidance
   fallback, chips disabled), and Replay for both sources.
   Usage: node tests/sim-step30-hero.js [--reduced] [--fa]
   Exit 0 when every check passes. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const appJs = fs.readFileSync(path.join(ROOT, "website", "app.js"), "utf8");
const dataStart = appJs.indexOf("var SAMPLES = {");
const dataEnd = appJs.indexOf("(function () {");
const heroStart = appJs.indexOf("/* Step 21 — hero app-window player");
const heroEnd = appJs.indexOf("/* Steps 21–22 — scroll story");
if (dataStart < 0 || heroStart < 0 || heroEnd < 0) { console.error("markers not found"); process.exit(2); }
const code = appJs.slice(dataStart, dataEnd) + "\n" + appJs.slice(heroStart, heroEnd);

const REDUCED = process.argv.includes("--reduced");
const FA = process.argv.includes("--fa");

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
    this.parent = null;
    this.value = "";
    this.dir = "";
    this.lang = "";
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
  get parentNode() { return this.parent; }
  get className() { return [...this._class].join(" "); }
  set className(v) { this._class = new Set(String(v).split(/\s+/).filter(Boolean)); }
  get textContent() { return this._text; }
  set textContent(v) { this._text = String(v); if (v === "") { this.children = []; } }
  appendChild(child) { child.parent = this; this.children.push(child); return child; }
  removeChild(child) { this.children = this.children.filter((c) => c !== child); child.parent = null; return child; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k] !== undefined ? this.attrs[k] : null; }
  hasAttribute(k) { return this.attrs[k] !== undefined; }
  removeAttribute(k) { delete this.attrs[k]; }
  addEventListener(type, fn) { (this.listeners[type] = this.listeners[type] || []).push(fn); }
  fire(type, event) { (this.listeners[type] || []).forEach((fn) => fn(event || { preventDefault() {} })); }
  closest(sel) {
    let node = this;
    const cls = sel.replace(".", "");
    while (node) { if (node._class && node._class.has(cls)) { return node; } node = node.parent; }
    return null;
  }
  get offsetHeight() { return 200; }
  get scrollHeight() { return 200; }
  focus() {}
}

function buildDom() {
  const byId = {};
  function reg(el) { byId[el.id] = el; return el; }
  const heroVisual = new El("div"); heroVisual.className = "hero-visual";
  const win = new El("div"); win.className = "app-window";
  const body = new El("div"); body.className = "app-window-body";
  const pill = reg(new El("p", "mock-pill"));
  const pillText = reg(new El("span", "mock-pill-text"));
  pill.appendChild(pillText);
  const start = reg(new El("span", "mock-start"));
  const startLabel = reg(new El("span", "mock-start-label"));
  start.appendChild(startLabel);
  const question = reg(new El("p", "mock-question"));
  const transcript = reg(new El("p", "mock-transcript"));
  const thinking = reg(new El("p", "mock-thinking"));
  thinking.className = "app-thinking is-hidden";
  const meta = reg(new El("span", "mock-meta"));
  const zone = reg(new El("div", "mock-answer-zone"));
  const stack = reg(new El("div", "mock-answer-stack"));
  const full = reg(new El("p", "mock-full"));
  full.hidden = true;
  zone.appendChild(stack); zone.appendChild(full);
  const replay = reg(new El("button", "hero-replay"));
  replay.className = "app-replay is-hidden";
  const live = reg(new El("span", "hero-live"));
  const form = reg(new El("form", "hero-manual-form"));
  const input = reg(new El("input", "hero-manual-input"));
  const send = reg(new El("button", "hero-manual-send"));
  form.appendChild(input); form.appendChild(send);
  const chips = ["shorter", "technical", "example", "full", "regen"].map((v) => {
    const b = new El("button");
    b.className = "app-chip-btn";
    b.setAttribute("data-variant", v);
    if (v !== "regen") { b.setAttribute("aria-pressed", "false"); }
    b.disabled = true;
    return b;
  });
  body.appendChild(question); body.appendChild(transcript); body.appendChild(thinking);
  body.appendChild(meta); body.appendChild(zone); body.appendChild(replay);
  body.appendChild(form); body.appendChild(live);
  chips.forEach((c) => body.appendChild(c));
  win.appendChild(body);
  heroVisual.appendChild(win);
  return { byId, chips, replay, form, input, stack, full, zone, pillText, question, meta, live };
}

async function run() {
  const dom = buildDom();
  let ioCallback = null;
  const documentShim = {
    getElementById: (id) => dom.byId[id] || null,
    querySelectorAll: (sel) => (sel === ".app-chip-btn" ? dom.chips : []),
    createElement: (tag) => new El(tag),
    addEventListener: () => {},
  };
  const sandbox = {
    document: documentShim,
    window: null,
    Math: Object.create(Math),
    setTimeout, clearTimeout, console,
    // The endpoint is configured now; the sim runs offline, so fetch
    // rejects and askAI must land on the guidance fallback (the same
    // path a real network failure takes).
    fetch: () => Promise.reject(new Error("sim offline")),
    IntersectionObserver: class { constructor(cb) { ioCallback = cb; } observe() {} },
  };
  sandbox.window = {
    matchMedia: (q) => ({ matches: REDUCED && q.includes("prefers-reduced-motion"), addEventListener() {} }),
    IntersectionObserver: sandbox.IntersectionObserver,
  };
  sandbox.Math.random = FA ? () => 0.55 : () => 0; // tell (index 0) or fa (index 5)
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);

  const stack = dom.stack;
  const layers = () => stack.children.filter((c) => c.tagName === "UL");
  const visibleLayer = () => layers().find((ul) => !ul.classList.contains("is-hidden"));
  const visibleTexts = (ul) => ul.children.filter((li) => !li.classList.contains("is-hidden")).map((li) => li.children[1].textContent);
  const chip = (v) => dom.chips.find((c) => c.getAttribute("data-variant") === v);
  const bank = sandbox.IA_VARIANTS;
  const key = FA ? "fa" : "tell";

  // Layers are pre-built at load: base + 3 styles + regen sets.
  check("layers pre-built at load (base, shorter, technical, example, regen x" + bank[key].regen.length + ")",
    layers().length === 4 + bank[key].regen.length);
  if (!REDUCED) {
    check("chips start disabled before the first answer", dom.chips.every((c) => c.disabled));
  }

  if (REDUCED) {
    check("reduced: final state rendered at load (base bullets visible)",
      visibleLayer() && visibleTexts(visibleLayer()).length === 3);
    check("reduced: meta prepared, pill Answer ready, Replay stays hidden",
      dom.meta.textContent === "prepared" && dom.pillText.textContent === "Answer ready" &&
      dom.replay.classList.contains("is-hidden"));
    check("reduced: chips enabled (variants exist)", dom.chips.every((c) => !c.disabled));
    chip("shorter").fire("click");
    await sleep(60);
    check("reduced: Shorter switches instantly (2 bullets, meta shorter)",
      visibleTexts(visibleLayer()).join("|") === bank[key].shorter.join("|") && dom.meta.textContent === "shorter");
    console.log(`\n${passed} passed, ${failed} failed`);
    process.exit(failed ? 1 : 0);
  }

  // Fire the intersection: the staged play runs (~4.3s for tell).
  ioCallback([{ isIntersecting: true }]);
  await sleep(5600);
  check("play completes: pill Answer ready, meta prepared",
    dom.pillText.textContent === "Answer ready" && dom.meta.textContent === "prepared");
  check("play completes: base layer shows the sample's 3 points",
    visibleLayer() && visibleTexts(visibleLayer()).join("|") === sandbox.SAMPLES[key].answer.join("|"));
  check("play completes: Replay visible, chips enabled",
    !dom.replay.classList.contains("is-hidden") && dom.chips.every((c) => !c.disabled));
  check("question card shows the sample question",
    dom.question.textContent === "“" + sandbox.SAMPLES[key].q + "”");

  // Technical variant.
  chip("technical").fire("click");
  await sleep(450 + 4 * 250 + 500);
  check("Technical: layer swaps, meta 'technical', chip pressed",
    visibleTexts(visibleLayer()).join("|") === bank[key].technical.join("|") &&
    dom.meta.textContent === "technical" && chip("technical").getAttribute("aria-pressed") === "true" &&
    chip("shorter").getAttribute("aria-pressed") === "false");
  check("Technical: live region announced", dom.live.textContent === "Technical answer shown.");

  // Full paragraph.
  chip("full").fire("click");
  await sleep(1000);
  check("Full: paragraph shown, stack display none, meta 'full'",
    dom.full.hidden === false && dom.stack.style.display === "none" &&
    dom.meta.textContent === "full" && dom.full.textContent === bank[key].full);

  // Shorter, back from Full.
  chip("shorter").fire("click");
  await sleep(450 + 2 * 250 + 500);
  check("Shorter (from Full): stack back, 2 bullets, meta 'shorter'",
    dom.stack.style.display === "" && dom.full.hidden === true &&
    visibleTexts(visibleLayer()).join("|") === bank[key].shorter.join("|") &&
    dom.meta.textContent === "shorter");

  // Regenerate cycles the alternates; meta returns to 'prepared'.
  chip("regen").fire("click");
  await sleep(450 + 3 * 250 + 500);
  check("Regenerate 1: first alternate, meta 'prepared', no chip pressed",
    visibleTexts(visibleLayer()).join("|") === bank[key].regen[0].join("|") &&
    dom.meta.textContent === "prepared" &&
    dom.chips.every((c) => c.getAttribute("aria-pressed") !== "true"));
  if (bank[key].regen.length > 1) {
    chip("regen").fire("click");
    await sleep(450 + 3 * 250 + 500);
    check("Regenerate 2: second alternate",
      visibleTexts(visibleLayer()).join("|") === bank[key].regen[1].join("|"));
  }

  // Typed question that matches a sample (weakness).
  dom.input.value = "What is your biggest weakness?";
  dom.form.fire("submit");
  await sleep(500 + 3 * 250 + 600);
  check("typed match: question card shows the typed text, weakness base answer, meta 'prepared'",
    dom.question.textContent === "“What is your biggest weakness?”" &&
    visibleTexts(visibleLayer()).join("|") === sandbox.SAMPLES.weakness.answer.join("|") &&
    dom.meta.textContent === "prepared" && dom.chips.every((c) => !c.disabled));

  // Typed question with no match: guidance fallback, chips disabled.
  dom.input.value = "How do I bake sourdough bread at home?";
  dom.form.fire("submit");
  await sleep(500 + 3 * 250 + 600);
  check("typed fallback: guidance bullets, meta 'guidance', chips disabled",
    visibleTexts(visibleLayer()).join("|") === sandbox.FALLBACK.answer.join("|") &&
    dom.meta.textContent === "guidance" && dom.chips.every((c) => c.disabled));

  // Replay replays the typed flow.
  dom.replay.fire("click");
  check("Replay click: glyph spin class applied", dom.replay.classList.contains("is-spinning"));
  await sleep(500 + 3 * 250 + 600);
  check("Replay (typed): the fallback answer replays, meta 'guidance'",
    visibleTexts(visibleLayer()).join("|") === sandbox.FALLBACK.answer.join("|") &&
    dom.meta.textContent === "guidance");

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

run().catch((e) => { console.error(e); process.exit(2); });
