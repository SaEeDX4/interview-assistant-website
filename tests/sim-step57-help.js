#!/usr/bin/env node
/* Step 57 DOM-shim simulation for the contextual help entries:
   three parts, each running the REAL module it covers from
   website/app.js against a minimal DOM shim.
     A — the support assistant's deep-link arrival
         (support.html?topic=demo|download|pricing): expansion,
         procedure seeding, origin in the diagnostics context
         and in the prepared email; unknown/absent topics keep
         the rest state.
     B — the download page's help-block state line, driven by
         the manifest result on every branch.
     C — the demo page's help-block flag, set only when a typed
         question's live answer genuinely fails and the demo
         falls back to the sample structure.
   Usage: node tests/sim-step57-help.js
   Exit 0 when every check passes. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const appJs = fs.readFileSync(path.join(ROOT, "website", "app.js"), "utf8");

let passed = 0, failed = 0;
function check(name, cond) {
  if (cond) { passed++; console.log("PASS " + name); }
  else { failed++; console.log("FAIL " + name); }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function findAll(node, pred, out) {
  out = out || [];
  (node.children || []).forEach((c) => { if (pred(c)) { out.push(c); } findAll(c, pred, out); });
  return out;
}

/* ================= Part A — assistant deep links =================
   Harness shape follows sim-step55-assistant.js, extended with
   location.search. */
class ElA {
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

function buildDomA() {
  const byId = {};
  function reg(el) { byId[el.id] = el; return el; }
  function chip(id, label) {
    const b = new ElA("button");
    b.className = "sa-chip";
    b.setAttribute("data-sa-topic", id);
    b.textContent = label;
    return b;
  }
  const root = reg(new ElA("div", "support-assistant")); root.className = "sa";
  const form = reg(new ElA("form", "sa-form"));
  const input = reg(new ElA("input", "sa-input"));
  input.setAttribute("aria-expanded", "false");
  const results = reg(new ElA("div", "sa-results")); results.hidden = true;
  const suggest = reg(new ElA("div", "sa-suggest"));
  for (const [id, label] of [["audio-none", "No audio"], ["signin", "Sign-in"],
    ["minutes", "Minutes"], ["download", "Download"]]) suggest.appendChild(chip(id, label));
  const checkBtn = reg(new ElA("button", "sa-check-btn")); checkBtn.textContent = "Run system check";
  form.appendChild(input); form.appendChild(results); form.appendChild(suggest); form.appendChild(checkBtn);
  const body = reg(new ElA("div", "sa-body")); body.hidden = true;
  const log = reg(new ElA("div", "sa-log"));
  const greet = new ElA("div"); greet.className = "sa-msg sa-msg-bot";
  const gb = new ElA("div"); gb.className = "sa-bubble";
  const gp = new ElA("p"); gp.textContent = "Hi — I walk you through the common problems.";
  gb.appendChild(gp); greet.appendChild(gb); log.appendChild(greet);
  const topics = reg(new ElA("div", "sa-topics"));
  for (const [id, label] of [["audio-none", "No audio"], ["signin", "Sign-in"], ["minutes", "Minutes"],
    ["download", "Download"], ["demo", "Demo help"], ["pricing", "Pricing"],
    ["privacy", "Privacy"], ["human", "Talk to a person"]]) topics.appendChild(chip(id, label));
  body.appendChild(log); body.appendChild(topics);
  const tiles = reg(new ElA("div", "sa-tiles"));
  const rbToggle = reg(new ElA("button", "runbook-toggle"));
  rbToggle.setAttribute("aria-expanded", "false");
  const rbWrap = reg(new ElA("div", "runbook-wrap")); rbWrap.hidden = true;
  root.appendChild(form); root.appendChild(body);
  const document = {
    getElementById: (id) => byId[id] || null,
    createElement: (tag) => new ElA(tag),
  };
  return { byId, document, root, form, input, results, checkBtn, body, log };
}

const SA_START = appJs.indexOf("/* Step 54");
const SA_MODULE = appJs.slice(SA_START);
const SA_PRELUDE = 'var IA_RELEASES_ENDPOINT = "https://svc.test/manifest";\n'
  + 'var IA_AI_ENDPOINT = "https://ai.test/";\n';
function okJsonA() { return Promise.resolve({ ok: true, json: () => Promise.resolve({}) }); }
function fetchOkA(url) {
  if (url.includes("ai.test")) { return Promise.resolve({ ok: false }); }
  if (url.includes("demo.html")) { return Promise.resolve({ ok: true }); }
  return okJsonA();
}
async function runAssistant(opts) {
  opts = opts || {};
  const dom = buildDomA();
  const sandbox = {
    console, setTimeout, clearTimeout, AbortController,
    document: dom.document,
    location: { hash: "", search: opts.search || "" },
    navigator: {
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0 Safari/537.36",
      language: "en-US",
      onLine: true,
    },
    fetch: fetchOkA,
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(SA_PRELUDE + SA_MODULE, sandbox);
  await sleep(10);
  return dom;
}
const userBubblesA = (dom) => findAll(dom.log,
  (c) => c._class && c._class.has("sa-msg-user")).map((m) => m.textContent);
const choiceBtn = (dom, label) => findAll(dom.log,
  (c) => c.tagName === "BUTTON" && c._class.has("sa-choice") && c.textContent === label)[0];

async function partA() {
  /* A1 — ?topic=download: expanded on arrival, procedure open. */
  {
    const dom = await runAssistant({ search: "?topic=download" });
    check("A1 download arrival expands the assistant in place",
      dom.body.hidden === false);
    check("A1 the download procedure opens from its first node",
      dom.log.textContent.includes("no installer yet"));
    check("A1 the opening bubble carries the topic's label",
      userBubblesA(dom).some((t) => t === "Download problems"));
  }
  /* A2 — ?topic=demo. */
  {
    const dom = await runAssistant({ search: "?topic=demo" });
    check("A2 demo arrival opens the demo procedure",
      dom.body.hidden === false
      && dom.log.textContent.includes("is a simulation")
      && userBubblesA(dom).some((t) => t === "Demo help"));
  }
  /* A3 — ?topic=pricing, behind another parameter. */
  {
    const dom = await runAssistant({ search: "?x=1&topic=pricing" });
    check("A3 pricing arrival opens the pricing procedure (param found mid-query)",
      dom.body.hidden === false
      && dom.log.textContent.includes("$19.99")
      && userBubblesA(dom).some((t) => t === "Pricing"));
  }
  /* A4 — unknown topic: the rest state is untouched. */
  {
    const dom = await runAssistant({ search: "?topic=bogus" });
    check("A4 an unknown topic leaves the rest state untouched",
      dom.body.hidden === true && userBubblesA(dom).length === 0
      && !dom.log.textContent.includes("no installer yet"));
  }
  /* A5 — no parameter: the rest state is untouched. */
  {
    const dom = await runAssistant({ search: "" });
    check("A5 no parameter leaves the rest state untouched",
      dom.body.hidden === true && userBubblesA(dom).length === 0);
  }
  /* A6 — the email handoff names the origin page. */
  {
    const dom = await runAssistant({ search: "?topic=download" });
    const btn = choiceBtn(dom, "Email the developer");
    check("A6 the download procedure offers the email handoff", !!btn);
    btn.click();
    await sleep(10);
    const mail = findAll(dom.log, (c) => c.tagName === "A"
      && (c.getAttribute("href") || "").startsWith("mailto:"))[0];
    const body = mail ? decodeURIComponent(mail.getAttribute("href").split("&body=")[1] || "") : "";
    check("A6 the prepared email names the origin page and the covered playbook",
      body.includes("- Started from: download.html")
      && body.includes("Download problems"));
  }
  /* A7 — the diagnostics context names the origin page too. */
  {
    const dom = await runAssistant({ search: "?topic=pricing" });
    dom.checkBtn.click();
    await sleep(60);
    check("A7 the system-check context line names the origin page",
      dom.log.textContent.includes("Arrived from: pricing.html"));
  }
}

/* ================= Part B — download help state =================
   Harness shape follows sim-step41-download.js, extended with
   the help-block state line. */
class ElB {
  constructor(tag, id) {
    this.tagName = (tag || "div").toUpperCase();
    this.id = id || "";
    this.children = [];
    this._class = new Set();
    this._text = "";
    this.hidden = false;
    this.disabled = false;
    this.attrs = {};
    this.listeners = {};
    this.parent = null;
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
  get textContent() { return this._text + this.children.map((c) => c.textContent || "").join(""); }
  set textContent(v) { this._text = String(v); if (v === "") { this.children = []; } }
  appendChild(child) {
    if (child.parent) { child.parent.children = child.parent.children.filter((c) => c !== child); }
    child.parent = this; this.children.push(child); return child;
  }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k] !== undefined ? this.attrs[k] : null; }
  addEventListener(type, fn) { (this.listeners[type] = this.listeners[type] || []).push(fn); }
  querySelector(sel) {
    const cls = sel.replace(".", "");
    const walk = (node) => {
      for (const c of node.children) {
        if (c._class && c._class.has(cls)) { return c; }
        const hit = walk(c);
        if (hit) { return hit; }
      }
      return null;
    };
    return walk(this);
  }
  closest(sel) {
    let node = this;
    while (node) {
      if (sel === "a[data-dl-file]") {
        if (node.tagName === "A" && node.attrs["data-dl-file"] !== undefined) { return node; }
      } else if (node._class && node._class.has(sel.replace(".", ""))) { return node; }
      node = node.parent;
    }
    return null;
  }
}

function buildDomB() {
  const byId = {};
  const docListeners = {};
  function reg(el) { byId[el.id] = el; return el; }
  const rec = reg(new ElB("div", "dl-rec"));
  reg(new ElB("p", "dl-rec-label"));
  reg(new ElB("h2", "dl-rec-title"));
  reg(new ElB("p", "dl-rec-status"));
  const detected = reg(new ElB("p", "dl-rec-detected")); detected.hidden = true;
  const recLive = reg(new ElB("div", "dl-rec-live")); recLive.hidden = true;
  const actions = reg(new ElB("p", "dl-rec-actions"));
  const inst = reg(new ElB("button", "dl-installer")); inst.disabled = true;
  const port = reg(new ElB("button", "dl-portable")); port.disabled = true;
  actions.appendChild(inst); actions.appendChild(port);
  reg(new ElB("p", "download-note"));
  const after = reg(new ElB("div", "dl-after")); after.hidden = true;
  reg(new ElB("p", "dl-after-text"));
  reg(new ElB("div", "dl-after-sha"));
  const grid = reg(new ElB("div", "dl-platforms"));
  ["windows", "android", "ios", "mac"].forEach((p) => {
    const card = new ElB("article");
    card.className = "card dl-card";
    card.setAttribute("data-platform", p);
    const req = new ElB("p"); req.className = "dl-card-req";
    const st = new ElB("p"); st.className = "dl-card-status";
    const live = new ElB("div"); live.className = "dl-card-live"; live.hidden = true;
    card.appendChild(req); card.appendChild(st); card.appendChild(live);
    grid.appendChild(card);
  });
  const whats = reg(new ElB("section", "dl-whatsnew")); whats.hidden = true;
  reg(new ElB("h2", "dl-whatsnew-title"));
  reg(new ElB("div", "dl-whatsnew-body"));
  const all = reg(new ElB("section", "dl-all")); all.hidden = true;
  reg(new ElB("div", "dl-all-body"));
  const helpState = reg(new ElB("p", "dl-help-state")); helpState.hidden = true;
  const document = {
    getElementById: (id) => byId[id] || null,
    createElement: (tag) => new ElB(tag),
    createTextNode: (t) => { const n = new ElB("#text"); n._text = String(t); return n; },
    addEventListener: (type, fn) => { (docListeners[type] = docListeners[type] || []).push(fn); },
  };
  return { byId, document, helpState, recLive };
}

const DL_DATA = appJs.slice(appJs.indexOf("var SAMPLES = {"), appJs.indexOf("(function () {"));
const DL_IIFE = appJs.slice(appJs.indexOf("/* Step 41 — download page"),
  appJs.indexOf("/* Step 25 — chip-row fade edge"));
const SHA_B = "a".repeat(64);
function winReleaseB() {
  return {
    platform: "windows", version: "1.0.0", channel: "stable",
    publishedAt: "2026-11-17", notes: "First signed release.",
    minRequirement: "Windows 10 or 11, 64-bit",
    files: [{ kind: "installer", name: "InterviewAssistant-Setup.exe", label: "Download the installer",
      url: "https://dl.example.test/win/setup.exe", size: 48211302, sha256: SHA_B }],
  };
}
async function runDownload(opts) {
  const dom = buildDomB();
  const sandbox = {
    console, setTimeout, clearTimeout,
    document: dom.document,
    navigator: { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
  };
  if (!opts.noFetch) {
    sandbox.fetch = opts.fetchImpl || (() => Promise.reject(new Error("no fetch in scenario")));
  }
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(DL_DATA + DL_IIFE, sandbox);
  await sleep(30);
  return dom;
}

async function partB() {
  /* B1 — the manifest fetch fails: the state line appears. */
  {
    const dom = await runDownload({ fetchImpl: () => Promise.reject(new Error("offline")) });
    check("B1 a failed manifest fetch shows the no-release state line",
      dom.helpState.hidden === false);
  }
  /* B2 — the manifest answers but carries no releases. */
  {
    const dom = await runDownload({
      fetchImpl: () => Promise.resolve({ ok: true, json: () => Promise.resolve({ releases: [] }) }),
    });
    check("B2 an empty manifest shows the no-release state line",
      dom.helpState.hidden === false);
  }
  /* B3 — a real release renders: the line stays hidden. */
  {
    const dom = await runDownload({
      fetchImpl: () => Promise.resolve({ ok: true, json: () => Promise.resolve({ releases: [winReleaseB()] }) }),
    });
    check("B3 a published release renders and the state line stays hidden",
      dom.recLive.hidden === false && dom.helpState.hidden === true);
  }
  /* B4 — a manifest whose only file is invalid changes nothing. */
  {
    const bad = winReleaseB();
    bad.files = [{ kind: "installer", name: "x.exe", url: "http://evil.test/x.exe", size: 10, sha256: SHA_B }];
    const dom = await runDownload({
      fetchImpl: () => Promise.resolve({ ok: true, json: () => Promise.resolve({ releases: [bad] }) }),
    });
    check("B4 a manifest with no valid file shows the state line",
      dom.helpState.hidden === false);
  }
  /* B5 — no fetch at all (degraded browser): the page is in
     the no-release state, and the line says so. */
  {
    const dom = await runDownload({ noFetch: true });
    check("B5 with no fetch available the state line shows",
      dom.helpState.hidden === false);
  }
}

/* ================= Part C — demo help flag =================
   Harness mirrors sim-step23-demo.js (the stack-based demo
   DOM), extended with the help block and its note. */
class ElC {
  constructor(tag, id) {
    this.tagName = (tag || "div").toUpperCase();
    this.id = id || "";
    this.children = [];
    this._class = new Set();
    this._text = "";
    this.hidden = false;
    this.disabled = false;
    this.value = "";
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
  querySelector() { return null; }
  querySelectorAll(sel) {
    if (sel === "li") { return this.children.filter((c) => c.tagName === "LI"); }
    return [];
  }
  focus() {}
}

const DEMO_SLICE = appJs.slice(
  appJs.indexOf("/* Interview Assistant — demo logic"),
  appJs.indexOf("/* Download buttons (draft)")
);
function makeLiC(text) {
  const li = new ElC("li");
  const dot = new ElC("span");
  dot.className = "app-dot";
  dot.setAttribute("aria-hidden", "true");
  li.appendChild(dot);
  const span = new ElC("span");
  span.textContent = text;
  li.appendChild(span);
  return li;
}
function buildDemo(fetchImpl) {
  const els = {};
  function mk(tag, id) { const e = new ElC(tag, id); if (id) { els[id] = e; } return e; }
  const questionStack = mk("div", "demo-question-stack");
  const answerStack = mk("div", "demo-answer-stack");
  const intStack = mk("div", "int-answer-stack");
  const staticQ = mk("p", "demo-question");
  staticQ.textContent = "“Tell me about yourself.”";
  const staticA = mk("ul", "demo-answer");
  staticA.setAttribute("aria-busy", "false");
  ["Five years building web products.", "I start from the outcome.", "What draws me here is this team."]
    .forEach((t) => staticA.appendChild(makeLiC(t)));
  questionStack.appendChild(staticQ);
  answerStack.appendChild(staticA);
  const staticInt = mk("ul", "int-answer");
  ["Five years building web products.", "I start from the outcome.", "What draws me here is this team."]
    .forEach((t) => staticInt.appendChild(makeLiC(t)));
  intStack.appendChild(staticInt);
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
  const helpBlock = mk("div", "demo-help");
  helpBlock.className = "help-block";
  const helpNote = mk("p", "demo-help-note");
  helpNote.hidden = true;
  const chips = ["tell", "hire", "weakness", "story", "five", "fa", "ar", "salary", "conflict", "why"]
    .map((key) => {
      const b = new ElC("button");
      b.className = "chip";
      b.setAttribute("data-q", key);
      return b;
    });
  ["int-normal", "int-concise", "int-rapid"].forEach((id, i) => {
    const b = mk("button", id);
    b.className = "seg-btn";
    if (i === 0) { b.setAttribute("aria-pressed", "true"); }
  });
  const sandbox = {
    console, setTimeout, clearTimeout,
    document: {
      createElement: (tag) => new ElC(tag),
      getElementById: (id) => els[id] || null,
      querySelector: () => null,
      querySelectorAll: (sel) => (sel === ".chip" ? chips : []),
      addEventListener: () => {},
      hidden: false,
    },
    window: {
      matchMedia: (q) => ({ matches: false, addEventListener: () => {}, addListener: () => {} }),
      addEventListener: () => {},
    },
  };
  if (fetchImpl) { sandbox.fetch = fetchImpl; }
  vm.createContext(sandbox);
  vm.runInContext(DEMO_SLICE, sandbox);
  return { els, helpBlock, helpNote };
}
function submitTypedC(d, text) {
  d.els["demo-input"].value = text;
  d.els["demo-form"].fire("submit", { preventDefault: function () {} });
}

async function partC() {
  const QUESTION = "What is your greatest achievement?";
  /* C1 — the live answer genuinely fails: the demo falls back
     to the sample structure and the help block flags it. */
  {
    const d = buildDemo(() => Promise.reject(new Error("network down")));
    submitTypedC(d, QUESTION);
    await sleep(400);
    check("C1 a failed live answer flags the help block and shows its note",
      d.helpBlock.classList.contains("is-alert") && d.helpNote.hidden === false);
    await sleep(2200);
    check("C1 the demo still shows the honest sample-structure fallback",
      d.els["demo-status"].textContent.startsWith("Sample structure"));
  }
  /* C2 — the live answer succeeds: no flag is ever set. */
  {
    const d = buildDemo(() => Promise.resolve({
      ok: true, status: 200,
      json: () => Promise.resolve({ bullets: ["Point one.", "Point two.", "Point three."] }),
    }));
    submitTypedC(d, QUESTION);
    await sleep(1800);
    check("C2 a successful live answer never flags the help block",
      !d.helpBlock.classList.contains("is-alert") && d.helpNote.hidden === true);
    check("C2 the answer is labelled live, as always",
      d.els["demo-status"].textContent === "Live answer — generated for this question.");
  }
  /* C3 — no fetch at all: the local structure is a deliberate
     path, not a failure — no flag. */
  {
    const d = buildDemo(null);
    submitTypedC(d, QUESTION);
    await sleep(400);
    check("C3 the no-fetch local path does not flag the help block",
      !d.helpBlock.classList.contains("is-alert") && d.helpNote.hidden === true);
  }
}

(async () => {
  await partA();
  await partB();
  await partC();
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
