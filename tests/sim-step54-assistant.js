#!/usr/bin/env node
/* Step 54 DOM-shim simulation for the support assistant: runs the
   REAL Step 54 module from website/app.js against a minimal DOM
   shim and drives it the way a visitor does — typing questions,
   tapping topic chips and branch choices, running the system
   check against stubbed fetches. Pins the routing (EN + curated
   FA/AR), the never-a-dead-end ladder, the diagnostics checklist
   including our-side failure attribution and the re-check loop,
   and the email handoff's composed body.
   Usage: node tests/sim-step54-assistant.js
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

function buildDom() {
  const byId = {};
  function reg(el) { byId[el.id] = el; return el; }
  const root = reg(new El("div", "support-assistant")); root.className = "sa";
  const head = new El("div"); head.className = "sa-head";
  const checkBtn = reg(new El("button", "sa-check-btn")); checkBtn.textContent = "Run system check";
  head.appendChild(checkBtn);
  const log = reg(new El("div", "sa-log"));
  const greet = new El("div"); greet.className = "sa-msg sa-msg-bot";
  const gb = new El("div"); gb.className = "sa-bubble";
  const gp = new El("p"); gp.textContent = "Hi — I walk you through the common problems.";
  gb.appendChild(gp); greet.appendChild(gb); log.appendChild(greet);
  const topics = reg(new El("div", "sa-topics"));
  const CHIPS = [["audio-none", "No audio"], ["signin", "Sign-in"], ["minutes", "Minutes"],
    ["download", "Download"], ["demo", "Demo help"], ["pricing", "Pricing"],
    ["privacy", "Privacy"], ["human", "Talk to a person"]];
  for (const [id, label] of CHIPS) {
    const b = new El("button"); b.className = "sa-chip";
    b.setAttribute("data-sa-topic", id); b.textContent = label;
    topics.appendChild(b);
  }
  const form = reg(new El("form", "sa-form"));
  const input = reg(new El("input", "sa-input"));
  form.appendChild(input);
  root.appendChild(head); root.appendChild(log); root.appendChild(topics); root.appendChild(form);
  const document = {
    getElementById: (id) => byId[id] || null,
    createElement: (tag) => new El(tag),
  };
  return { byId, document, log, form, input, topics, checkBtn };
}

function findAll(node, pred, out) {
  out = out || [];
  (node.children || []).forEach((c) => { if (pred(c)) { out.push(c); } findAll(c, pred, out); });
  return out;
}
const choiceBtn = (log, label) => findAll(log,
  (c) => c.tagName === "BUTTON" && c._class.has("sa-choice") && c.textContent === label)[0];
const mailLink = (log) => findAll(log,
  (c) => c.tagName === "A" && (c.getAttribute("href") || "").startsWith("mailto:"))[0];

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
  const dom = buildDom();
  const sandbox = {
    console, setTimeout, clearTimeout, AbortController,
    document: dom.document,
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
function submit(dom, text) {
  dom.input.value = text;
  (dom.form.listeners.submit || []).forEach((fn) => fn({ preventDefault() {} }));
}
async function clickChoice(dom, label) {
  const b = choiceBtn(dom.log, label);
  if (!b) { throw new Error("choice not found: " + label); }
  b.click();
  await sleep(10);
}

(async function main() {
  /* S1 — EN audio routing, walked to a resolution. */
  {
    const dom = await runScenario({});
    submit(dom, "I can't hear the interviewer — no audio at all");
    check("S1 audio question routes to the audio procedure",
      dom.log.textContent.includes("WASAPI loopback"));
    await clickChoice(dom, "That fixed it");
    check("S1 resolution exit confirms and closes the procedure",
      dom.log.textContent.includes("that is what the playbook is for"));
  }

  /* S2 — pricing routes, branches into minutes, Trial node. */
  {
    const dom = await runScenario({});
    submit(dom, "how much does Pro cost?");
    check("S2 pricing question routes to pricing with the honest sandbox note",
      dom.log.textContent.includes("$19.99") && dom.log.textContent.includes("sandbox reference"));
    await clickChoice(dom, "How do minutes work?");
    check("S2 branch jumps to the minutes procedure's plan question",
      dom.log.textContent.includes("Which plan are you on?"));
    await clickChoice(dom, "Trial");
    check("S2 Trial node states the 30 lifetime minutes",
      dom.log.textContent.includes("30 lifetime live minutes"));
  }

  /* S3 — close call offers both playbooks as choices, then walks one. */
  {
    const dom = await runScenario({});
    submit(dom, "I hear music instead of the interviewer");
    check("S3 ambiguous input offers matching playbooks, no dead end",
      !!choiceBtn(dom.log, "The app hears the wrong app")
      && !!choiceBtn(dom.log, "Email the developer"));
    await clickChoice(dom, "The app hears the wrong app");
    check("S3 the picked playbook opens",
      dom.log.textContent.includes("it is in the stream"));
  }

  /* S4 — gibberish still lands somewhere useful. */
  {
    const dom = await runScenario({});
    submit(dom, "zxqw blorp fnord");
    check("S4 unmatched input gets the ladder: topics + check + email",
      !!choiceBtn(dom.log, "Run the system check")
      && !!choiceBtn(dom.log, "Email the developer")
      && !!choiceBtn(dom.log, "No audio — nothing is transcribed"));
    check("S4 the fallback never claims ignorance",
      !/don'?t know/i.test(dom.log.textContent));
  }

  /* S5 — curated Persian routes to audio with the FA lead, RTL-marked. */
  {
    const dom = await runScenario({});
    submit(dom, "صدا نمیاد، هدفون وصله ولی چیزی شنیده نمیشه");
    const lead = findAll(dom.log, (c) => c._class && c._class.has("sa-rtl"))[0];
    check("S5 Persian audio question routes to the audio procedure",
      dom.log.textContent.includes("WASAPI loopback"));
    check("S5 the Persian lead renders in an RTL block tagged lang=fa",
      !!lead && lead.getAttribute("lang") === "fa"
      && lead.textContent.includes("قدم‌به‌قدم"));
  }

  /* S6 — curated Arabic routes to audio with the AR lead. */
  {
    const dom = await runScenario({});
    submit(dom, "لا يوجد صوت في السماعات");
    const lead = findAll(dom.log, (c) => c._class && c._class.has("sa-rtl"))[0];
    check("S6 Arabic audio question routes with the Arabic lead",
      dom.log.textContent.includes("WASAPI loopback")
      && !!lead && lead.getAttribute("lang") === "ar");
  }

  /* S7 — diagnostics, everything reachable. */
  {
    const dom = await runScenario({});
    dom.checkBtn.click();
    await sleep(30);
    check("S7 all four checks settle as reachable",
      (dom.log.textContent.match(/reachable/g) || []).length >= 4
      && !dom.log.textContent.includes("not responding"));
    check("S7 the summary clears our side",
      dom.log.textContent.includes("not a service outage on our side"));
    check("S7 the check button is re-enabled after the run",
      dom.checkBtn.disabled === false);
  }

  /* S8 — our-side failure is attributed to us; re-check shows the fix. */
  {
    let growthDown = true;
    const map = Object.assign({}, ALL_OK, {
      growth: () => (growthDown ? Promise.reject(new Error("down")) : okJson()),
    });
    const dom = await runScenario({ fetchImpl: fetchRouter(map) });
    dom.checkBtn.click();
    await sleep(30);
    check("S8 a failed announcements service is reported as not responding",
      dom.log.textContent.includes("Announcements service") && dom.log.textContent.includes("not responding"));
    check("S8 the failure is attributed to our side, not the visitor",
      dom.log.textContent.includes("This part is on our side"));
    growthDown = false;
    await clickChoice(dom, "Check again");
    await sleep(30);
    check("S8 the re-check shows the recovered state",
      dom.log.textContent.includes("not a service outage on our side"));
  }

  /* S9 — the email handoff carries question, playbook, check, context. */
  {
    const dom = await runScenario({});
    submit(dom, "where is the installer? the download does nothing");
    dom.checkBtn.click();
    await sleep(30);
    await clickChoice(dom, "Email the developer");
    const a = mailLink(dom.log);
    check("S9 the handoff renders a real mailto link", !!a);
    const href = a ? a.getAttribute("href") : "";
    const body = decodeURIComponent(href.split("&body=")[1] || "");
    check("S9 subject follows the Step 53 convention for downloads",
      href.includes("subject=" + encodeURIComponent("Interview Assistant — download question")));
    check("S9 body carries the question, the playbook and the check results",
      body.includes("where is the installer")
      && body.includes("Download problems")
      && body.includes("Release service: reachable")
      && body.includes("Browser:"));
  }

  /* S10 — Persian privacy question routes to the runbook. */
  {
    const dom = await runScenario({});
    submit(dom, "چطور اطلاعاتم را حذف کنم؟");
    check("S10 Persian privacy question routes to the privacy procedure",
      dom.log.textContent.includes("runbook")
      && !!findAll(dom.log, (c) => c._class && c._class.has("sa-rtl"))[0]);
  }

  /* S11 — offline: the assistant says so instead of blaming services. */
  {
    const dom = await runScenario({
      onLine: false,
      fetchImpl: () => Promise.reject(new Error("offline")),
    });
    dom.checkBtn.click();
    await sleep(30);
    check("S11 offline state is named honestly with a way forward",
      dom.log.textContent.includes("reports this device is offline")
      && !!choiceBtn(dom.log, "Check again"));
  }

  /* S12 — a topic chip opens its procedure directly. */
  {
    const dom = await runScenario({});
    const chip = dom.topics.children.find((c) => c.getAttribute("data-sa-topic") === "privacy");
    chip.click();
    await sleep(10);
    check("S12 the Privacy chip opens the privacy procedure",
      dom.log.textContent.includes("Privacy request — export or delete my data"));
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
