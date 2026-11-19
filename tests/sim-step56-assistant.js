#!/usr/bin/env node
/* Step 56 DOM-shim simulation for the support upgrade pass:
   drives the REAL Step 54+55+56 module from website/app.js
   against a DOM shaped like the upgraded page — state strip
   (resume chip + services status), symptom cards, APG combobox
   results with answer previews — and pins the new behaviours:
   symptom routing, the resume-chip lifecycle, the
   resolution-confirmation loop (silence is never success), the
   quiet-probe status chip, quick-answer previews, combobox
   keyboard operation, and the no-result recovery whose email
   carries the visitor's query.
   Usage: node tests/sim-step56-assistant.js
   Exit 0 when every check passes. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const appJs = fs.readFileSync(path.join(ROOT, "website", "app.js"), "utf8");
const modStart = appJs.indexOf("/* Step 54");
if (modStart < 0) { console.error("Step 54 module not found"); process.exit(2); }
const MODULE = appJs.slice(modStart);
const PRELUDE = 'var IA_RELEASES_ENDPOINT = "https://svc.test/manifest";\n'
  + 'var IA_AI_ENDPOINT = "https://ai.test/";\n';

let passed = 0, failed = 0;
function check(name, cond) {
  if (cond) { passed++; console.log("PASS " + name); }
  else { failed++; console.log("FAIL " + name); }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- minimal DOM shim (house pattern, extended) ---------- */
class El {
  constructor(tag, id) {
    this.tagName = (tag || "div").toUpperCase();
    this.id = id || "";
    this.children = [];
    this._class = new Set();
    this._text = "";
    this.hidden = false;
    this.disabled = false;
    this.value = "";
    this.attrs = {};
    this.listeners = {};
    this.parent = null;
    this.scrollTop = 0;
    this.scrollHeight = 0;
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
  get textContent() { return this._text + this.children.map((c) => c.textContent || "").join(""); }
  set textContent(v) { this._text = String(v); if (v === "") { this.children = []; } }
  appendChild(child) {
    if (child.parent) { child.parent.children = child.parent.children.filter((c) => c !== child); }
    child.parent = this; this.children.push(child); return child;
  }
  removeChild(child) {
    this.children = this.children.filter((c) => c !== child);
    if (child.parent === this) { child.parent = null; }
    return child;
  }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k] !== undefined ? this.attrs[k] : null; }
  addEventListener(type, fn) { (this.listeners[type] = this.listeners[type] || []).push(fn); }
  focus() {}
  click() { (this.listeners.click || []).forEach((fn) => fn({ target: this })); }
}

function chip(id, label) {
  const b = new El("button");
  b.className = "sa-chip";
  b.setAttribute("data-sa-topic", id);
  b.textContent = label;
  return b;
}
function tile(id, label, title, desc) {
  const b = new El("button");
  b.className = "topic-tile";
  b.setAttribute("data-sa-topic", id);
  b.setAttribute("data-sa-label", label);
  const t = new El("span"); t.className = "topic-tile-title"; t.textContent = title;
  const d = new El("span"); d.className = "topic-tile-desc"; d.textContent = desc;
  b.appendChild(t); b.appendChild(d);
  return b;
}
function symptom(id, label) {
  const b = new El("button");
  b.className = "symptom-card";
  b.setAttribute("data-sa-topic", id);
  b.setAttribute("data-sa-label", label);
  b.textContent = label;
  return b;
}
function makeStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    _map: m,
  };
}

const SYMPTOMS = [
  ["audio-none", "I can’t hear the interviewer"],
  ["audio-wrong", "It transcribes the wrong conversation"],
  ["signin", "Sign-in keeps looping"],
  ["minutes", "My minutes ran out"],
  ["download", "The download won’t start"],
  ["demo", "The demo gives no answer"],
  ["ethics", "It answers with facts I never gave"],
];

function buildDom() {
  const byId = {};
  function reg(el) { byId[el.id] = el; return el; }
  const root = reg(new El("div", "support-assistant")); root.className = "sa";
  const form = reg(new El("form", "sa-form"));
  const input = reg(new El("input", "sa-input"));
  input.setAttribute("role", "combobox");
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-expanded", "false");
  input.setAttribute("aria-controls", "sa-results");
  const state = reg(new El("div", "sa-state")); state.hidden = true;
  const resume = reg(new El("button", "sa-resume")); resume.hidden = true;
  const status = reg(new El("span", "sa-status")); status.hidden = true;
  state.appendChild(resume); state.appendChild(status);
  const results = reg(new El("div", "sa-results"));
  results.hidden = true;
  results.setAttribute("role", "listbox");
  const live = reg(new El("p", "sa-live"));
  live.setAttribute("role", "status");
  live.setAttribute("aria-live", "polite");
  const suggest = reg(new El("div", "sa-suggest"));
  for (const [id, label] of [["audio-none", "No audio"], ["signin", "Sign-in"],
    ["minutes", "Minutes"], ["download", "Download"]]) suggest.appendChild(chip(id, label));
  const checkBtn = reg(new El("button", "sa-check-btn")); checkBtn.textContent = "Run system check";
  form.appendChild(input); form.appendChild(state); form.appendChild(results);
  form.appendChild(live); form.appendChild(suggest); form.appendChild(checkBtn);
  const body = reg(new El("div", "sa-body")); body.hidden = true;
  const log = reg(new El("div", "sa-log"));
  const topics = reg(new El("div", "sa-topics"));
  for (const [id, label] of [["audio-none", "No audio"], ["signin", "Sign-in"], ["minutes", "Minutes"],
    ["download", "Download"], ["demo", "Demo help"], ["pricing", "Pricing"],
    ["privacy", "Privacy"], ["human", "Talk to a person"]]) topics.appendChild(chip(id, label));
  body.appendChild(log); body.appendChild(topics);
  const symptoms = reg(new El("div", "sa-symptoms"));
  for (const [id, label] of SYMPTOMS) symptoms.appendChild(symptom(id, label));
  const tiles = reg(new El("div", "sa-tiles"));
  tiles.appendChild(tile("audio-none", "No audio", "Audio & the interviewer’s voice", "Nothing is transcribed."));
  tiles.appendChild(tile("signin", "Sign-in", "Sign-in & account", "Browser sign-in."));
  tiles.appendChild(tile("minutes", "Minutes", "Trial & minutes", "How live minutes work."));
  tiles.appendChild(tile("download", "Download", "Download & install", "Installer status."));
  tiles.appendChild(tile("demo", "Demo help", "The demo", "Sample questions."));
  tiles.appendChild(tile("privacy", "Privacy", "Privacy & your data", "Export or delete."));
  const rbToggle = reg(new El("button", "runbook-toggle"));
  rbToggle.setAttribute("aria-expanded", "false");
  const rbWrap = reg(new El("div", "runbook-wrap")); rbWrap.hidden = true;
  root.appendChild(form); root.appendChild(body);
  const document = {
    getElementById: (id) => byId[id] || null,
    createElement: (tag) => new El(tag),
  };
  return { byId, document, root, form, input, state, resume, status, results, live,
    suggest, checkBtn, body, log, topics, symptoms, tiles, rbToggle, rbWrap };
}

function findAll(node, pred, out) {
  out = out || [];
  (node.children || []).forEach((c) => { if (pred(c)) { out.push(c); } findAll(c, pred, out); });
  return out;
}
const options = (dom) => dom.results.children.filter((c) => c.getAttribute("role") === "option");
const choiceBtn = (dom, label) => findAll(dom.log,
  (c) => c.tagName === "BUTTON" && c._class.has("sa-choice") && c.textContent === label)[0];
const userBubbles = (dom) => findAll(dom.log,
  (c) => c._class && c._class.has("sa-msg-user")).map((m) => m.textContent);

function okJson() { return Promise.resolve({ ok: true, json: () => Promise.resolve({}) }); }
function fetchRouter(map) {
  return (url) => {
    if (url.includes("manifest")) { return map.manifest(); }
    if (url.includes("growth")) { return map.growth(); }
    if (url.includes("ai.test")) { return map.ai(); }
    if (url.includes("demo.html")) { return map.demo(); }
    return Promise.reject(new Error("unexpected url " + url));
  };
}
const ALL_OK = { manifest: okJson, growth: okJson, ai: () => Promise.resolve({ ok: false }), demo: () => Promise.resolve({ ok: true }) };

async function runScenario(opts) {
  opts = opts || {};
  const dom = buildDom();
  const storage = opts.storage || makeStorage();
  const sandbox = {
    console, setTimeout, clearTimeout, AbortController,
    document: dom.document,
    location: { hash: "" },
    localStorage: storage,
    navigator: {
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0 Safari/537.36",
      language: "en-US",
      onLine: opts.onLine !== false,
    },
    fetch: opts.fetchImpl || fetchRouter(ALL_OK),
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(PRELUDE + MODULE, sandbox);
  await sleep(10);
  return { dom, storage };
}
function type(dom, text) {
  dom.input.value = text;
  (dom.input.listeners.input || []).forEach((fn) => fn({}));
}
function key(dom, k) {
  (dom.input.listeners.keydown || []).forEach((fn) => fn({ key: k, preventDefault() {} }));
}
function submit(dom, text) {
  dom.input.value = text;
  (dom.form.listeners.submit || []).forEach((fn) => fn({ preventDefault() {} }));
}
async function clickChoice(dom, label) {
  const b = choiceBtn(dom, label);
  if (!b) { throw new Error("choice not found: " + label); }
  b.click();
  await sleep(10);
}

(async function main() {
  /* U1 — a symptom card opens its procedure, no typing. */
  {
    const { dom } = await runScenario({});
    const card = dom.symptoms.children.find((c) => c.getAttribute("data-sa-topic") === "minutes");
    card.click();
    await sleep(10);
    check("U1 the minutes symptom card expands and starts the minutes procedure",
      dom.body.hidden === false && dom.log.textContent.includes("Which plan are you on?"));
    check("U1 the visitor's bubble is the symptom in their own words",
      userBubbles(dom).some((t) => t === "My minutes ran out"));
  }

  /* U2 — the facts symptom routes to the ethics procedure. */
  {
    const { dom } = await runScenario({});
    const card = dom.symptoms.children.find((c) => c.getAttribute("data-sa-topic") === "ethics");
    card.click();
    await sleep(10);
    check("U2 the facts symptom opens the ethics procedure with its core fact",
      dom.log.textContent.includes("only facts you confirmed are ever used"));
  }

  /* U3 — resume lifecycle: saved mid-procedure, offered on
     return, restored at the same node. */
  {
    const storage = makeStorage();
    const first = await runScenario({ storage });
    submit(first.dom, "sign in fails every time");
    await clickChoice(first.dom, "It still fails");
    const saved = JSON.parse(storage.getItem("ia-sa-resume") || "null");
    check("U3 an unfinished procedure persists id + node index",
      !!saved && saved.proc === "signin" && saved.node === 1);
    const second = await runScenario({ storage });
    check("U3 the return visit shows the resume chip naming the procedure",
      second.dom.resume.hidden === false && second.dom.state.hidden === false
      && second.dom.resume.textContent.includes("Sign-in problems"));
    second.dom.resume.click();
    await sleep(10);
    check("U3 the chip restores the procedure at the saved node",
      second.dom.body.hidden === false
      && second.dom.log.textContent.includes("cached entitlement"));
  }

  /* U4 — the resolution loop: ask, branch both ways, and only
     a confirmed Yes clears the saved state. */
  {
    const storage = makeStorage();
    const { dom } = await runScenario({ storage });
    submit(dom, "I can't hear the interviewer — no audio at all");
    await clickChoice(dom, "That fixed it");
    check("U4 a resolved exit asks for confirmation instead of assuming",
      dom.log.textContent.includes("Did that fix it?")
      && !!choiceBtn(dom, "Yes — fixed") && !!choiceBtn(dom, "Not yet"));
    check("U4 an unanswered confirmation leaves the resume state saved",
      storage.getItem("ia-sa-resume") !== null);
    await clickChoice(dom, "Not yet");
    check("U4 'Not yet' reopens the ladder (diagnostics + email)",
      !!choiceBtn(dom, "Run the system check") && !!choiceBtn(dom, "Email the developer"));
  }
  {
    const storage = makeStorage();
    const { dom } = await runScenario({ storage });
    submit(dom, "I can't hear the interviewer — no audio at all");
    await clickChoice(dom, "That fixed it");
    await clickChoice(dom, "Yes — fixed");
    check("U4 a confirmed Yes closes warmly and clears the resume state",
      dom.log.textContent.includes("Confirmed — glad it's sorted")
      && storage.getItem("ia-sa-resume") === null);
  }

  /* U5 — quick-answer previews ride the result rows. */
  {
    const { dom } = await runScenario({});
    type(dom, "how much does Pro cost");
    const row = options(dom).find((c) => c.textContent.includes("Price and plans"));
    check("U5 the pricing result carries its one-line answer preview",
      !!row && row.textContent.includes("Paddle sandbox reference"));
  }

  /* U6 — APG combobox: roles, activedescendant, keyboard. */
  {
    const { dom } = await runScenario({});
    type(dom, "how much does Pro cost");
    const opts = options(dom);
    check("U6 results are listbox options with stable ids",
      dom.results.getAttribute("role") === "listbox"
      && opts.length >= 2 && opts.every((o, i) => o.id === "sa-opt-" + i));
    key(dom, "ArrowDown");
    check("U6 ArrowDown activates the first option via aria-activedescendant",
      dom.input.getAttribute("aria-activedescendant") === "sa-opt-0"
      && opts[0].getAttribute("aria-selected") === "true"
      && opts[0]._class.has("sa-result-active"));
    key(dom, "ArrowDown");
    check("U6 ArrowDown moves the active option and the selection follows",
      dom.input.getAttribute("aria-activedescendant") === "sa-opt-1"
      && opts[0].getAttribute("aria-selected") === "false"
      && opts[1].getAttribute("aria-selected") === "true");
    key(dom, "ArrowUp");
    key(dom, "Enter");
    await sleep(10);
    check("U6 Enter activates the highlighted option (pricing opens)",
      dom.body.hidden === false && dom.log.textContent.includes("$19.99"));
    check("U6 the live region exists for result announcements",
      !!dom.live && dom.live.getAttribute("aria-live") === "polite");
  }

  /* U7 — no-result recovery: echo, ladder, and the query lands
     in the composed email body. */
  {
    const { dom } = await runScenario({});
    submit(dom, "zxqw blorp fnord");
    check("U7 the no-result reply echoes the visitor's own words",
      dom.log.textContent.includes("You asked: “zxqw blorp fnord”"));
    await clickChoice(dom, "Email the developer");
    const a = findAll(dom.log, (c) => c.tagName === "A"
      && (c.getAttribute("href") || "").startsWith("mailto:"))[0];
    const body = a ? decodeURIComponent(a.getAttribute("href").split("&body=")[1] || "") : "";
    check("U7 the prepared email body carries the unmatched query",
      !!a && body.includes("zxqw blorp fnord"));
  }

  /* U8 — the status chip is fed by real probes only: quiet on
     first interaction, and truthful when a service is down. */
  {
    const { dom } = await runScenario({});
    check("U8 before any probe the status chip does not exist",
      dom.status.hidden === true);
    type(dom, "download");
    await sleep(30);
    check("U8 the first interaction quietly probes and shows real status",
      dom.status.hidden === false && dom.status.textContent.includes("all reachable"));
  }
  {
    const down = { manifest: () => Promise.reject(new Error("down")), growth: okJson,
      ai: () => Promise.resolve({ ok: false }), demo: () => Promise.resolve({ ok: true }) };
    const { dom } = await runScenario({ fetchImpl: fetchRouter(down) });
    dom.checkBtn.click();
    await sleep(40);
    check("U8 a failed full check names the service on the chip, on our side",
      dom.status.textContent.includes("Release service")
      && dom.status.textContent.includes("on our side"));
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
