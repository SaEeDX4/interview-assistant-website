#!/usr/bin/env node
/* Step 23 DOM-shim simulation for the demo (local-only, never pushed as a
   suite — it is a verification harness, not a repo test): extracts the REAL
   demo IIFE from website/app.js and runs it against a minimal DOM shim,
   in animated and reduced-motion modes. The story has sim-step22.js; the
   demo has this one, because the demo's layer model (22 answer layers)
   is the part the static suites cannot execute.
   Usage: node tests/sim-step23-demo.js [--reduced]
   Exit 0 when every check passes. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const appJs = fs.readFileSync(path.join(ROOT, "website", "app.js"), "utf8");
const start = appJs.indexOf("/* Interview Assistant — demo logic");
const end = appJs.indexOf("/* Download buttons (draft)");
if (start < 0 || end < 0 || end <= start) { console.error("demo IIFE markers not found"); process.exit(2); }
const demoCode = appJs.slice(start, end);

const REDUCED = process.argv.includes("--reduced");

let passed = 0, failed = 0;
function check(name, cond) {
  if (cond) { passed++; console.log("PASS " + name); }
  else { failed++; console.log("FAIL " + name); }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- minimal DOM shim (same shape as sim-step22.js) ---------- */
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
  querySelector(sel) { return null; }
  querySelectorAll(sel) {
    if (sel === "li") { return this.children.filter((c) => c.tagName === "LI"); }
    return [];
  }
  focus() {}
}

function makeLi(text) {
  const li = new El("li");
  const dot = new El("span");
  dot.className = "app-dot";
  dot.setAttribute("aria-hidden", "true");
  li.appendChild(dot);
  const span = new El("span");
  span.textContent = text;
  li.appendChild(span);
  return li;
}

const els = {};
function mk(tag, id) { const el = new El(tag, id); if (id) { els[id] = el; } return el; }
const questionStackEl = mk("div", "demo-question-stack");
const answerStackEl = mk("div", "demo-answer-stack");
const intStackEl = mk("div", "int-answer-stack");
const staticQuestionEl = mk("p", "demo-question");
staticQuestionEl.textContent = "“Tell me about yourself.”";
const staticAnswerEl = mk("ul", "demo-answer");
staticAnswerEl.setAttribute("aria-busy", "false");
[
  "Five years building web products — most recently leading a small team on a customer-facing tool.",
  "I start from the outcome, then the trade-off I made to get there.",
  "What draws me here is this team’s focus on honest, useful software.",
].forEach((t) => staticAnswerEl.appendChild(makeLi(t)));
questionStackEl.appendChild(staticQuestionEl);
answerStackEl.appendChild(staticAnswerEl);
const staticIntEl = mk("ul", "int-answer");
[
  "Five years building web products — most recently leading a small team on a customer-facing tool.",
  "I start from the outcome, then the trade-off I made to get there.",
  "What draws me here is this team’s focus on honest, useful software.",
].forEach((t) => staticIntEl.appendChild(makeLi(t)));
intStackEl.appendChild(staticIntEl);
[
  ["p", "demo-status"], ["p", "demo-sample-tag"], ["input", "demo-input"],
  ["form", "demo-form"], ["button", "mode-answer"], ["button", "mode-coach"],
  ["div", "demo-next"], ["strong", "demo-next-title"], ["p", "demo-next-text"],
  ["p", "int-status"], ["strong", "int-state"],
].forEach(([tag, id]) => mk(tag, id));
els["demo-status"].textContent = "3 points ready — sample.";
els["demo-sample-tag"].hidden = true;
els["demo-input"].value = "";
els["demo-next"].hidden = true;
els["mode-answer"].classList.add("is-active");
els["mode-answer"].setAttribute("aria-pressed", "true");
els["mode-coach"].setAttribute("aria-pressed", "false");
els["int-status"].textContent = "Normal — 3 points ready — simulated.";
els["int-state"].textContent = "Normal — 3 points";
const CHIP_KEYS = ["tell", "hire", "weakness", "story", "five", "fa", "ar", "salary", "conflict", "why"];
const chips = CHIP_KEYS.map((key) => {
  const b = new El("button");
  b.className = "chip";
  b.setAttribute("data-q", key);
  return b;
});
const intBtns = ["int-normal", "int-concise", "int-rapid"].map((id) => {
  const b = mk("button", id);
  b.className = "seg-btn";
  return b;
});
intBtns[0].setAttribute("aria-pressed", "true");

function matchMedia(q) {
  return { matches: q.includes("prefers-reduced-motion") ? REDUCED : false,
    addEventListener: function () {}, addListener: function () {} };
}

const sandbox = {
  console, setTimeout, clearTimeout,
  document: {
    createElement: (tag) => new El(tag),
    getElementById: (id) => els[id] || null,
    querySelector: () => null,
    querySelectorAll: (sel) => (sel === ".chip" ? chips : []),
    addEventListener: () => {},
    hidden: false,
  },
  window: { matchMedia, addEventListener: () => {} },
};
vm.createContext(sandbox);
vm.runInContext(demoCode, sandbox);

/* helpers: the visible layer is the one without .is-hidden; a row counts
   only once revealed (no .is-hidden on the <li>). */
function visibleChild(stackEl) { return stackEl.children.find((c) => !c.classList.contains("is-hidden")) || null; }
function rows(layer) {
  if (!layer) { return []; }
  return layer.querySelectorAll("li").filter((li) => !li.classList.contains("is-hidden"))
    .map((li) => li.children[1] ? li.children[1].textContent : "");
}
function questionText() {
  const layer = visibleChild(questionStackEl);
  return layer ? layer.textContent : "";
}
function answerLayer() { return visibleChild(answerStackEl); }

(async function main() {
  console.log("== demo sim" + (REDUCED ? " + reduced motion" : "") + " ==");

  check("layers built once (11 question, 22 answer, 3 int)",
    questionStackEl.children.length === 11
    && answerStackEl.children.length === 22
    && intStackEl.children.length === 3);
  check("static tell content adopted as layer 0 (no-JS demo intact)",
    questionStackEl.children[0] === staticQuestionEl
    && answerStackEl.children[0] === staticAnswerEl
    && intStackEl.children[0] === staticIntEl);

  if (!REDUCED) {
    await sleep(250);
    check("initial play mid-stream: 1 of 3 bullets revealed, status Preparing",
      rows(answerLayer()).length === 1 && els["demo-status"].textContent === "Preparing your points…");
    await sleep(1200);
    check("initial play final: 3 bullets, status ready, tag + next card visible",
      rows(answerLayer()).length === 3
      && els["demo-status"].textContent === "3 points ready."
      && !els["demo-sample-tag"].classList.contains("is-hidden")
      && !els["demo-next"].classList.contains("is-hidden")
      && els["demo-next-title"].textContent.includes("30 trial minutes"));
    chips[8].fire("click"); // conflict
    await sleep(1400);
    check("sample switch to conflict: question + 3 long bullets, status ready",
      questionText().includes("conflict with a coworker")
      && rows(answerLayer()).length === 3
      && rows(answerLayer())[0].includes("We disagreed on the approach")
      && els["demo-status"].textContent === "3 points ready.");
    check("sample switch did not rebuild the stacks",
      questionStackEl.children.length === 11 && answerStackEl.children.length === 22);
    els["mode-coach"].fire("click");
    await sleep(1200);
    check("coach mode: keys + structure rows, status Coach points ready",
      rows(answerLayer()).length === 2
      && rows(answerLayer())[0].includes("DISAGREEMENT")
      && els["demo-status"].textContent === "Coach points ready.");
    els["mode-answer"].fire("click");
    await sleep(1200);
    check("back to answer mode: 3 bullets again",
      rows(answerLayer()).length === 3 && els["demo-status"].textContent === "3 points ready.");
    els["demo-input"].value = "What is your greatest achievement?";
    els["demo-form"].fire("submit", { preventDefault: function () {} });
    await sleep(1400);
    check("typed question: fallback question + generic structure, tag hidden (space reserved)",
      questionText().includes("greatest achievement")
      && rows(answerLayer()).length === 3
      && rows(answerLayer())[0].includes("Start with the outcome")
      && els["demo-status"].textContent.startsWith("Sample structure")
      && els["demo-sample-tag"].classList.contains("is-hidden"));
    intBtns[1].fire("click"); // concise
    await sleep(1200);
    check("interrupt concise: 2 short bullets, status ready — simulated",
      rows(visibleChild(intStackEl)).length === 2
      && els["int-status"].textContent === "Concise (2 points) ready — simulated.");
    intBtns[2].fire("click"); // rapid
    await sleep(800);
    check("interrupt rapid: 1 line, status ready — simulated",
      rows(visibleChild(intStackEl)).length === 1
      && els["int-status"].textContent === "Rapid (1 line) ready — simulated.");
  }

  if (REDUCED) {
    // The 0ms staging timer still needs one tick to fire.
    await sleep(50);
    check("reduced: initial play renders all 3 bullets at once, status ready",
      rows(answerLayer()).length === 3 && els["demo-status"].textContent === "3 points ready.");
    chips[8].fire("click");
    await sleep(50);
    check("reduced: sample switch renders final at once",
      questionText().includes("conflict with a coworker")
      && rows(answerLayer()).length === 3 && els["demo-status"].textContent === "3 points ready.");
    els["mode-coach"].fire("click");
    await sleep(50);
    check("reduced: coach mode renders keys + structure at once",
      rows(answerLayer()).length === 2 && els["demo-status"].textContent === "Coach points ready.");
    intBtns[1].fire("click");
    check("reduced: interrupt concise renders 2 bullets at once",
      rows(visibleChild(intStackEl)).length === 2
      && els["int-status"].textContent === "Concise (2 points) ready — simulated.");
  }

  console.log("\n" + passed + " passed, " + failed + " failed");
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error("SIM ERROR", e); process.exit(2); });
