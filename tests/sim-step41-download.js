#!/usr/bin/env node
/* Step 41 DOM-shim simulation for the download page: runs the REAL
   data block + download IIFE from website/app.js against a minimal
   DOM shim and fixture manifests. Verifies the owner's ordering rule
   (detected platform first only if released, else Windows first),
   the honest static floor (no endpoint / failed fetch / invalid
   manifest), card + recommendation rendering, the Beta rule, the
   post-click panel and SHA copy.
   Usage: node tests/sim-step41-download.js
   Exit 0 when every check passes. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const appJs = fs.readFileSync(path.join(ROOT, "website", "app.js"), "utf8");
const dataStart = appJs.indexOf("var SAMPLES = {");
const dataEnd = appJs.indexOf("(function () {");
const dlStart = appJs.indexOf("/* Step 41 — download page");
const dlEnd = appJs.indexOf("/* Step 25 — chip-row fade edge");
if (dataStart < 0 || dlStart < 0 || dlEnd < 0) { console.error("markers not found"); process.exit(2); }
const DATA = appJs.slice(dataStart, dataEnd);
const IIFE = appJs.slice(dlStart, dlEnd);

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
  get textContent() {
    return this._text + this.children.map((c) => c.textContent || "").join("");
  }
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

function buildDom() {
  const byId = {};
  const docListeners = {};
  function reg(el) { byId[el.id] = el; return el; }
  const rec = reg(new El("div", "dl-rec"));
  reg(new El("p", "dl-rec-label"));
  reg(new El("h2", "dl-rec-title"));
  const status = reg(new El("p", "dl-rec-status"));
  const detected = reg(new El("p", "dl-rec-detected")); detected.hidden = true;
  const recLive = reg(new El("div", "dl-rec-live")); recLive.hidden = true;
  const actions = reg(new El("p", "dl-rec-actions"));
  const inst = reg(new El("button", "dl-installer")); inst.disabled = true;
  const port = reg(new El("button", "dl-portable")); port.disabled = true;
  actions.appendChild(inst); actions.appendChild(port);
  reg(new El("p", "download-note"));
  const after = reg(new El("div", "dl-after")); after.hidden = true;
  reg(new El("p", "dl-after-text"));
  reg(new El("div", "dl-after-sha"));
  const grid = reg(new El("div", "dl-platforms"));
  const cards = {};
  ["windows", "android", "ios", "mac"].forEach((p) => {
    const card = new El("article");
    card.className = "card dl-card";
    card.setAttribute("data-platform", p);
    const req = new El("p"); req.className = "dl-card-req";
    const st = new El("p"); st.className = "dl-card-status";
    const live = new El("div"); live.className = "dl-card-live"; live.hidden = true;
    card.appendChild(req); card.appendChild(st); card.appendChild(live);
    grid.appendChild(card);
    cards[p] = { card, req, st, live };
  });
  const whats = reg(new El("section", "dl-whatsnew")); whats.hidden = true;
  reg(new El("h2", "dl-whatsnew-title"));
  reg(new El("div", "dl-whatsnew-body"));
  const all = reg(new El("section", "dl-all")); all.hidden = true;
  reg(new El("div", "dl-all-body"));
  const document = {
    getElementById: (id) => byId[id] || null,
    createElement: (tag) => new El(tag),
    createTextNode: (t) => { const n = new El("#text"); n._text = String(t); return n; },
    addEventListener: (type, fn) => { (docListeners[type] = docListeners[type] || []).push(fn); },
  };
  return { byId, document, cards, grid, status, detected, recLive, actions, after, docListeners };
}

const SHA = "a".repeat(64);
const SHA2 = "b".repeat(64);
function manifest(releases) { return { generatedAt: "2026-11-17T00:00:00Z", releases }; }
function winRelease(extra) {
  return Object.assign({
    platform: "windows", version: "1.0.0", channel: "stable",
    publishedAt: "2026-11-17", notes: "First signed release.\n\nPrepare, practise, go live.",
    minRequirement: "Windows 10 or 11, 64-bit",
    files: [
      { kind: "installer", name: "InterviewAssistant-Setup.exe", label: "Download the installer", url: "https://dl.example.test/win/setup.exe", size: 48211302, sha256: SHA },
      { kind: "portable", name: "InterviewAssistant-Portable.zip", label: "Portable ZIP", url: "https://dl.example.test/win/portable.zip", size: 47185920, sha256: SHA2 },
    ],
  }, extra || {});
}
function androidRelease() {
  return {
    platform: "android", version: "0.9.0", channel: "stable",
    publishedAt: "2026-11-17", notes: "", minRequirement: "Android 12 or later",
    files: [{ kind: "apk", name: "InterviewAssistant.apk", label: "Download for Android", url: "https://dl.example.test/android/app.apk", size: 20971520, sha256: SHA }],
  };
}

async function runScenario(opts) {
  const dom = buildDom();
  const clipboard = [];
  const sandbox = {
    console, setTimeout, clearTimeout,
    document: dom.document,
    navigator: {
      userAgent: opts.ua || "",
      userAgentData: opts.uadPlatform ? { platform: opts.uadPlatform } : undefined,
      clipboard: { writeText: (t) => { clipboard.push(t); return Promise.resolve(); } },
    },
    fetch: opts.fetchImpl || (() => Promise.reject(new Error("no fetch in scenario"))),
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  const code = DATA + (opts.endpoint ? '\nIA_RELEASES_ENDPOINT = "https://dl.example.test/manifest.json";\n' : "\n") + IIFE;
  vm.runInContext(code, sandbox);
  await sleep(30);
  return { dom, clipboard, sandbox };
}

function findAll(node, pred, out) {
  out = out || [];
  (node.children || []).forEach((c) => { if (pred(c)) { out.push(c); } findAll(c, pred, out); });
  return out;
}
const isDlLink = (c) => c.tagName === "A" && c.attrs["data-dl-file"] !== undefined;

(async function main() {
  /* S1 — no endpoint, Windows UA: the static floor stands. */
  {
    const { dom } = await runScenario({ ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" });
    check("S1 static floor: status visible, live hidden",
      dom.status.hidden === false && dom.recLive.hidden === true);
    check("S1 static floor: detected line stays hidden on Windows",
      dom.detected.hidden === true);
    check("S1 static floor: card order untouched",
      dom.grid.children.map((c) => c.getAttribute("data-platform")).join(",") === "windows,android,ios,mac");
  }

  /* S2 — Windows release, Android visitor: Windows recommended,
     detected line shown, cards filled, order keeps Windows first. */
  {
    const fetchImpl = () => Promise.resolve({ ok: true, json: () => Promise.resolve(manifest([winRelease()])) });
    const { dom, clipboard } = await runScenario({
      ua: "Mozilla/5.0 (Linux; Android 14; Pixel 8)", endpoint: true, fetchImpl,
    });
    check("S2 detected line names the visitor's platform",
      dom.detected.hidden === false && dom.detected.textContent.includes("You are on Android"));
    check("S2 recommendation is Windows with a real link",
      dom.recLive.hidden === false &&
      findAll(dom.recLive, isDlLink).some((a) => a.getAttribute("href") === "https://dl.example.test/win/setup.exe"));
    check("S2 static buttons hidden once live",
      dom.actions.hidden === true && dom.status.hidden === true);
    check("S2 windows card filled with version + sha",
      dom.cards.windows.live.hidden === false &&
      dom.cards.windows.live.textContent.includes("Version 1.0.0") &&
      dom.cards.windows.live.textContent.includes(SHA));
    check("S2 android card stays a status card",
      dom.cards.android.live.hidden === true && dom.cards.android.st.hidden === false);
    check("S2 what's new + all downloads shown",
      dom.byId["dl-whatsnew"].hidden === false &&
      dom.byId["dl-whatsnew-body"].textContent.includes("First signed release") &&
      findAll(dom.byId["dl-all-body"], isDlLink).length === 2);
    /* post-click panel */
    const link = findAll(dom.recLive, isDlLink)[0];
    dom.docListeners.click.forEach((fn) => fn({ target: link }));
    check("S2 post-click panel opens with the file name",
      dom.after.hidden === false &&
      dom.byId["dl-after-text"].textContent.includes("InterviewAssistant-Setup.exe"));
    /* copy button */
    const copyBtn = findAll(dom.recLive, (c) => c._class && c._class.has("dl-sha-copy"))[0];
    dom.docListeners.click.forEach((fn) => fn({ target: copyBtn }));
    await sleep(5);
    check("S2 copy button writes the sha to the clipboard",
      clipboard.length === 1 && clipboard[0] === SHA);
  }

  /* S3 — Android released + Android visitor: Android leads. */
  {
    const fetchImpl = () => Promise.resolve({ ok: true, json: () => Promise.resolve(manifest([winRelease(), androidRelease()])) });
    const { dom } = await runScenario({
      ua: "Mozilla/5.0 (Linux; Android 14; Pixel 8)", endpoint: true, fetchImpl,
    });
    check("S3 detected+released platform leads the grid",
      dom.grid.children[0].getAttribute("data-platform") === "android" &&
      dom.grid.children[1].getAttribute("data-platform") === "windows");
    check("S3 recommendation is Android",
      dom.byId["dl-rec-label"].textContent === "Recommended — Android" &&
      findAll(dom.recLive, isDlLink).some((a) => (a.getAttribute("href") || "").includes("/android/")));
  }

  /* S4 — fetch fails: the static floor stands. */
  {
    const { dom } = await runScenario({
      ua: "Mozilla/5.0 (Windows NT 10.0)", endpoint: true,
      fetchImpl: () => Promise.reject(new Error("offline")),
    });
    check("S4 failed fetch leaves the honest static page",
      dom.status.hidden === false && dom.recLive.hidden === true &&
      dom.cards.windows.live.hidden === true);
  }

  /* S5 — invalid manifest entries are dropped (http URL, bad sha). */
  {
    const bad = winRelease();
    bad.files = [{ kind: "installer", name: "x.exe", url: "http://evil.test/x.exe", size: 10, sha256: SHA },
      { kind: "portable", name: "y.zip", url: "https://dl.example.test/y.zip", size: 10, sha256: "not-a-sha" }];
    const fetchImpl = () => Promise.resolve({ ok: true, json: () => Promise.resolve(manifest([bad])) });
    const { dom } = await runScenario({ ua: "Mozilla/5.0 (Windows NT 10.0)", endpoint: true, fetchImpl });
    check("S5 manifest with no valid file changes nothing",
      dom.recLive.hidden === true && dom.status.hidden === false);
  }

  /* S6 — Beta-only Mac + macOS UA data: Mac leads, badged Beta. */
  {
    const macBeta = {
      platform: "mac", version: "0.5.0", channel: "beta", publishedAt: "2026-11-17",
      notes: "", minRequirement: "macOS 13 or later",
      files: [{ kind: "dmg", name: "InterviewAssistant.dmg", label: "Download for Mac", url: "https://dl.example.test/mac/app.dmg", size: 31457280, sha256: SHA }],
    };
    const fetchImpl = () => Promise.resolve({ ok: true, json: () => Promise.resolve(manifest([macBeta])) });
    const { dom } = await runScenario({ ua: "", uadPlatform: "macOS", endpoint: true, fetchImpl });
    check("S6 beta-only released platform leads and is badged",
      dom.grid.children[0].getAttribute("data-platform") === "mac" &&
      dom.recLive.textContent.includes("Beta") &&
      dom.byId["dl-rec-label"].textContent === "Recommended — Mac");
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
