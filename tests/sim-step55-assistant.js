#!/usr/bin/env node
/* Step 55 DOM-shim simulation for the restructured support page:
   runs the REAL Step 54+55 modules from website/app.js against a
   DOM shaped like the redesigned page — single entry, collapsed
   conversation body, blended results list, suggestion chips,
   topic tiles, runbook disclosure — and drives it the way a
   visitor does. Pins the search → expansion flow, the tile path,
   staged Escape, the entry-point system check, FAQ results, the
   curated Persian path through the single entry, and the
   runbook toggle + #runbook deep link.
   Usage: node tests/sim-step55-assistant.js
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

function buildDom() {
  const byId = {};
  function reg(el) { byId[el.id] = el; return el; }
  const root = reg(new El("div", "support-assistant")); root.className = "sa";
  const form = reg(new El("form", "sa-form"));
  const input = reg(new El("input", "sa-input"));
  input.setAttribute("aria-expanded", "false");
  const results = reg(new El("div", "sa-results")); results.hidden = true;
  const suggest = reg(new El("div", "sa-suggest"));
  for (const [id, label] of [["audio-none", "No audio"], ["signin", "Sign-in"],
    ["minutes", "Minutes"], ["download", "Download"]]) suggest.appendChild(chip(id, label));
  const checkBtn = reg(new El("button", "sa-check-btn")); checkBtn.textContent = "Run system check";
  form.appendChild(input); form.appendChild(results); form.appendChild(suggest); form.appendChild(checkBtn);
  const body = reg(new El("div", "sa-body")); body.hidden = true;
  const log = reg(new El("div", "sa-log"));
  const greet = new El("div"); greet.className = "sa-msg sa-msg-bot";
  const gb = new El("div"); gb.className = "sa-bubble";
  const gp = new El("p"); gp.textContent = "Hi — I walk you through the common problems.";
  gb.appendChild(gp); greet.appendChild(gb); log.appendChild(greet);
  const topics = reg(new El("div", "sa-topics"));
  for (const [id, label] of [["audio-none", "No audio"], ["signin", "Sign-in"], ["minutes", "Minutes"],
    ["download", "Download"], ["demo", "Demo help"], ["pricing", "Pricing"],
    ["privacy", "Privacy"], ["human", "Talk to a person"]]) topics.appendChild(chip(id, label));
  body.appendChild(log); body.appendChild(topics);
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
  return { byId, document, root, form, input, results, suggest, checkBtn, body, log, topics, tiles, rbToggle, rbWrap };
}

function findAll(node, pred, out) {
  out = out || [];
  (node.children || []).forEach((c) => { if (pred(c)) { out.push(c); } findAll(c, pred, out); });
  return out;
}
const resultBtn = (dom, titlePart) => dom.results.children.find(
  (c) => c._class.has("sa-result") && c.textContent.includes(titlePart));
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
  const sandbox = {
    console, setTimeout, clearTimeout, AbortController,
    document: dom.document,
    location: { hash: opts.hash || "" },
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
  return dom;
}
function type(dom, text) {
  dom.input.value = text;
  (dom.input.listeners.input || []).forEach((fn) => fn({}));
}
function esc(dom) {
  (dom.root.listeners.keydown || []).forEach((fn) => fn({ key: "Escape" }));
}
function submit(dom, text) {
  dom.input.value = text;
  (dom.form.listeners.submit || []).forEach((fn) => fn({ preventDefault() {} }));
}

(async function main() {
  /* T1 — at rest: body and results collapsed, aria truthful. */
  {
    const dom = await runScenario({});
    check("T1 at rest the conversation body is collapsed",
      dom.body.hidden === true);
    check("T1 at rest the results list is hidden and the entry aria is false",
      dom.results.hidden === true && dom.input.getAttribute("aria-expanded") === "false");
  }

  /* T2 — typing blends results; picking the Guide expands in place. */
  {
    const dom = await runScenario({});
    type(dom, "how much does Pro cost");
    check("T2 typing shows blended results with the pricing Guide",
      dom.results.hidden === false && !!resultBtn(dom, "Price and plans"));
    check("T2 the final row offers the raw words to the assistant",
      !!resultBtn(dom, "Ask the assistant:"));
    resultBtn(dom, "Price and plans").click();
    await sleep(10);
    check("T2 picking the Guide expands the conversation in place",
      dom.body.hidden === false && dom.input.getAttribute("aria-expanded") === "true");
    check("T2 the procedure opens, seeded with the visitor's words",
      dom.log.textContent.includes("$19.99")
      && userBubbles(dom).some((t) => t.includes("how much does Pro cost")));
    check("T2 the results list closes after the pick",
      dom.results.hidden === true && dom.results.children.length === 0);
  }

  /* T3 — Escape collapses the expanded assistant back to rest. */
  {
    const dom = await runScenario({});
    submit(dom, "I can't hear the interviewer — no audio at all");
    check("T3 submit expands the conversation",
      dom.body.hidden === false);
    esc(dom);
    check("T3 Escape collapses the body and resets the entry aria",
      dom.body.hidden === true && dom.input.getAttribute("aria-expanded") === "false");
  }

  /* T4 — Escape is staged: results first, body untouched. */
  {
    const dom = await runScenario({});
    type(dom, "download");
    check("T4 results open on typing", dom.results.hidden === false);
    esc(dom);
    check("T4 first Escape closes only the results",
      dom.results.hidden === true && dom.body.hidden === true);
  }

  /* T5 — the tile path: no typing, short label in the bubble. */
  {
    const dom = await runScenario({});
    const t = dom.tiles.children.find((c) => c.getAttribute("data-sa-topic") === "minutes");
    t.click();
    await sleep(10);
    check("T5 a tile expands the assistant and starts its procedure",
      dom.body.hidden === false && dom.log.textContent.includes("Which plan are you on?"));
    check("T5 the bubble carries the tile's short label, not its full text",
      userBubbles(dom).some((x) => x === "Minutes"));
  }

  /* T6 — an FAQ result: question, answer, and a way forward. */
  {
    const dom = await runScenario({});
    type(dom, "cancel pro");
    const faqBtn = dom.results.children.find(
      (c) => c._class.has("sa-result") && c.textContent.includes("FAQ")
        && c.textContent.includes("How do I cancel Pro?"));
    check("T6 blended results include the FAQ entry, labelled FAQ", !!faqBtn);
    faqBtn.click();
    await sleep(10);
    check("T6 picking the FAQ expands and answers in the conversation",
      dom.body.hidden === false
      && dom.log.textContent.includes("no live subscription to cancel"));
    check("T6 the FAQ answer offers the ladder (check / email choices)",
      findAll(dom.log, (c) => c.tagName === "BUTTON" && c._class.has("sa-choice")
        && c.textContent === "Email the developer").length === 1);
  }

  /* T7 — a suggestion chip expands and starts its procedure. */
  {
    const dom = await runScenario({});
    const c = dom.suggest.children.find((x) => x.getAttribute("data-sa-topic") === "download");
    c.click();
    await sleep(10);
    check("T7 a suggestion chip expands and opens the download procedure",
      dom.body.hidden === false && dom.log.textContent.includes("no installer yet"));
  }

  /* T8 — the system check from rest expands and settles. */
  {
    const dom = await runScenario({});
    dom.checkBtn.click();
    await sleep(40);
    check("T8 the check button expands the conversation from rest",
      dom.body.hidden === false);
    check("T8 all four checks settle as reachable",
      (dom.log.textContent.match(/reachable/g) || []).length >= 4
      && dom.log.textContent.includes("not a service outage on our side"));
    check("T8 the check button is re-enabled after the run",
      dom.checkBtn.disabled === false);
  }

  /* T9 — the runbook disclosure: toggle truth, both ways. */
  {
    const dom = await runScenario({});
    check("T9 the runbook starts hidden with aria-expanded false",
      dom.rbWrap.hidden === true && dom.rbToggle.getAttribute("aria-expanded") === "false");
    dom.rbToggle.click();
    check("T9 the toggle opens the runbook and says so",
      dom.rbWrap.hidden === false && dom.rbToggle.getAttribute("aria-expanded") === "true");
    dom.rbToggle.click();
    check("T9 the toggle closes it again",
      dom.rbWrap.hidden === true && dom.rbToggle.getAttribute("aria-expanded") === "false");
  }

  /* T10 — the #runbook deep link opens the runbook on arrival. */
  {
    const dom = await runScenario({ hash: "#runbook" });
    check("T10 arriving via #runbook opens the runbook",
      dom.rbWrap.hidden === false && dom.rbToggle.getAttribute("aria-expanded") === "true");
  }

  /* T11 — Persian through the single entry: results, then the
     procedure with its RTL lead, all inside the expansion. */
  {
    const dom = await runScenario({});
    type(dom, "صدا نمیاد، هدفون وصله ولی چیزی شنیده نمیشه");
    const guide = resultBtn(dom, "No audio — nothing is transcribed");
    check("T11 a Persian query surfaces the audio Guide in results", !!guide);
    guide.click();
    await sleep(10);
    const lead = findAll(dom.log, (c) => c._class && c._class.has("sa-rtl"))[0];
    check("T11 picking it expands and routes with the Persian RTL lead",
      dom.body.hidden === false && dom.log.textContent.includes("WASAPI loopback")
      && !!lead && lead.getAttribute("lang") === "fa");
  }

  /* T12 — gibberish through the Ask row still lands on the ladder. */
  {
    const dom = await runScenario({});
    type(dom, "zxqw blorp fnord");
    const ask = resultBtn(dom, "Ask the assistant:");
    check("T12 an unmatched query still gets the Ask row", !!ask);
    ask.click();
    await sleep(10);
    check("T12 the Ask row expands into the never-a-dead-end ladder",
      dom.body.hidden === false
      && findAll(dom.log, (c) => c.tagName === "BUTTON" && c._class.has("sa-choice")
        && c.textContent === "Email the developer").length >= 1
      && !/don'?t know/i.test(dom.log.textContent));
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
