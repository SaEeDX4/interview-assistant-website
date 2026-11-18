#!/usr/bin/env node
/* Step 48 DOM-shim simulation: runs the REAL growth module from
   website/app.js against fixture /growth documents. Verifies
   placement routing, country targeting (display country from the
   Worker document), dismissal persistence, strict validation,
   XSS-inert rendering, and the fail-safe static floor.
   Usage: node tests/sim-step48-growth.js */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const appJs = fs.readFileSync(path.join(ROOT, "website", "app.js"), "utf8");
const start = appJs.indexOf("/* Step 48 — Growth & Campaigns");
const end = appJs.indexOf("/* Step 41 — download page");
if (start < 0 || end < 0) { console.error("markers not found"); process.exit(2); }
const MODULE = appJs.slice(start, end);

let passed = 0, failed = 0;
function check(name, cond) {
  if (cond) { passed++; console.log("PASS " + name); }
  else { failed++; console.log("FAIL " + name); }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class El {
  constructor(tag, id) {
    this.tagName = (tag || "div").toUpperCase();
    this.id = id || "";
    this.children = [];
    this._class = new Set();
    this._text = "";
    this.hidden = false;
    this.attrs = {};
    this.listeners = {};
    this.parentNode = null;
    const self = this;
    this.classList = {
      add: (...c) => c.forEach((x) => self._class.add(x)),
      contains: (c) => self._class.has(c),
    };
  }
  get className() { return [...this._class].join(" "); }
  set className(v) { this._class = new Set(String(v).split(/\s+/).filter(Boolean)); }
  get textContent() { return this._text + this.children.map((c) => c.textContent || "").join(""); }
  set textContent(v) { this._text = String(v); this.children = []; }
  set innerHTML(v) { if (v !== "") { throw new Error("shim only supports innerHTML = ''"); } this.children = []; this._text = ""; }
  get innerHTML() { return ""; }
  appendChild(child) { child.parentNode = this; this.children.push(child); return child; }
  removeChild(child) {
    const i = this.children.indexOf(child);
    if (i >= 0) { this.children.splice(i, 1); }
    child.parentNode = null;
    return child;
  }
  setAttribute(k, v) { this.attrs[k] = v; }
  addEventListener(ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); }
  click() { (this.listeners.click || []).forEach((f) => f({})); }
  querySelector(sel) {
    if (!sel.startsWith(".")) { return null; }
    const cls = sel.slice(1);
    const walk = (el) => {
      for (const c of el.children) {
        if (c._class && c._class.has(cls)) { return c; }
        const r = walk(c);
        if (r) { return r; }
      }
      return null;
    };
    return walk(this);
  }
  findAll(tag) {
    const out = [];
    const walk = (el) => { for (const c of el.children) { if (c.tagName === tag) { out.push(c); } walk(c); } };
    walk(this);
    return out;
  }
}

function makeWorld(docOrError, storage) {
  const els = {
    "ia-growth-bar": new El("div", "ia-growth-bar"),
    "ia-growth-home": new El("section", "ia-growth-home"),
    "ia-growth-home-inner": new El("div", "ia-growth-home-inner"),
    "ia-growth-pricing": new El("div", "ia-growth-pricing"),
  };
  els["ia-growth-bar"].hidden = true;
  els["ia-growth-home"].hidden = true;
  els["ia-growth-pricing"].hidden = true;
  els["ia-growth-home"].appendChild(els["ia-growth-home-inner"]);
  const store = Object.assign({}, storage || {});
  const localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
  };
  const document = {
    getElementById: (id) => els[id] || null,
    createElement: (tag) => new El(tag),
    createTextNode: (t) => { const n = new El("#text"); n._text = String(t); return n; },
  };
  const fetchFn = typeof docOrError === "function" ? docOrError
    : async () => ({ ok: true, json: async () => docOrError });
  const sandbox = { document, window: { localStorage }, localStorage, fetch: fetchFn, console };
  vm.createContext(sandbox);
  return { els, store, sandbox };
}

async function run(docOrError, storage) {
  const w = makeWorld(docOrError, storage);
  vm.runInContext(MODULE, w.sandbox);
  await sleep(20);
  return w;
}

const ANN = (over) => Object.assign({
  id: "cmp_1", type: "release", placement: "home_card",
  headline: "Version 2.0 is here", body: "Faster answers.",
  linkUrl: "", linkLabel: "", dismissible: true, countries: null, endsAt: null,
}, over || {});

(async () => {
  /* 1 — placement routing */
  let w = await run({ version: 1, displayCountry: "", announcements: [
    ANN({ id: "a1", placement: "bar", headline: "Site-wide news" }),
    ANN({ id: "a2", placement: "home_card" }),
    ANN({ id: "a3", placement: "pricing_callout", headline: "Pricing note" }),
  ] });
  check("bar slot renders the bar announcement", !w.els["ia-growth-bar"].hidden &&
    w.els["ia-growth-bar"].textContent.includes("Site-wide news"));
  check("home slot renders the update card with its type label", !w.els["ia-growth-home"].hidden &&
    w.els["ia-growth-home"].textContent.includes("Version 2.0 is here") &&
    w.els["ia-growth-home"].textContent.includes("New release"));
  check("pricing slot renders the callout", !w.els["ia-growth-pricing"].hidden &&
    w.els["ia-growth-pricing"].textContent.includes("Pricing note"));

  /* 2 — one bar only */
  w = await run({ version: 1, displayCountry: "", announcements: [
    ANN({ id: "b1", placement: "bar", headline: "First bar" }),
    ANN({ id: "b2", placement: "bar", headline: "Second bar" }),
  ] });
  check("only the first bar announcement renders",
    w.els["ia-growth-bar"].textContent.includes("First bar") &&
    !w.els["ia-growth-bar"].textContent.includes("Second bar"));

  /* 3 — country targeting */
  const deDoc = (country) => ({ version: 1, displayCountry: country, announcements: [
    ANN({ id: "de1", placement: "bar", headline: "Nur fuer Deutschland", countries: ["DE"] }),
  ] });
  w = await run(deDoc("FR"));
  check("country-targeted announcement is hidden from other countries", w.els["ia-growth-bar"].hidden);
  w = await run(deDoc("DE"));
  check("country-targeted announcement renders for its country", !w.els["ia-growth-bar"].hidden);
  w = await run(deDoc(""));
  check("unknown display country gets no targeted announcements", w.els["ia-growth-bar"].hidden);

  /* 4 — dismissal */
  w = await run({ version: 1, displayCountry: "", announcements: [ANN({ id: "d1", placement: "bar", headline: "Dismiss me" })] });
  const btn = w.els["ia-growth-bar"].findAll("BUTTON")[0];
  check("dismiss button exists for a dismissible bar", !!btn);
  btn.click();
  check("dismissing hides the bar and persists the id",
    w.els["ia-growth-bar"].hidden === true &&
    JSON.parse(w.store.ia_growth_dismissed || "[]").includes("d1"));
  w = await run({ version: 1, displayCountry: "", announcements: [ANN({ id: "d1", placement: "bar", headline: "Dismiss me" })] },
    { ia_growth_dismissed: JSON.stringify(["d1"]) });
  check("a previously dismissed announcement never renders again", w.els["ia-growth-bar"].hidden);
  w = await run({ version: 1, displayCountry: "", announcements: [
    ANN({ id: "d2", placement: "bar", headline: "Sticky", dismissible: false })] });
  check("a non-dismissible announcement has no dismiss button",
    w.els["ia-growth-bar"].findAll("BUTTON").length === 0 && !w.els["ia-growth-bar"].hidden);

  /* 5 — validation + XSS */
  w = await run({ version: 1, displayCountry: "", announcements: [
    ANN({ id: "x1", placement: "bar", headline: "x".repeat(141) }),
    ANN({ id: "x2", placement: "bar", headline: "Bad link", linkUrl: "http://evil.test", linkLabel: "go" }),
    ANN({ id: "x3", placement: "bar", headline: "<img src=x onerror=alert(1)>" }),
  ] });
  check("over-long headline and http link are dropped; the XSS headline renders as inert text",
    w.els["ia-growth-bar"].textContent.includes("<img src=x onerror=alert(1)>") &&
    w.els["ia-growth-bar"].findAll("IMG").length === 0 &&
    !w.els["ia-growth-bar"].textContent.includes("Bad link"));

  /* 6 — fail-safe floor */
  w = await run(async () => { throw new Error("network down"); });
  check("fetch failure leaves every slot hidden",
    w.els["ia-growth-bar"].hidden && w.els["ia-growth-home"].hidden && w.els["ia-growth-pricing"].hidden);
  w = await run({ nope: true });
  check("a malformed document renders nothing", w.els["ia-growth-bar"].hidden);
  w = await run({ version: 1, displayCountry: "", announcements: [] });
  check("an empty document renders nothing", w.els["ia-growth-bar"].hidden && w.els["ia-growth-home"].hidden);

  /* 6b — a cached document must not resurrect an ended announcement */
  const past = Math.floor(Date.now() / 1000) - 60;
  w = await run({ version: 1, displayCountry: "", announcements: [
    ANN({ id: "e0", placement: "bar", headline: "Already over", endsAt: past })] });
  check("an announcement whose end passed inside a cached document does not render",
    w.els["ia-growth-bar"].hidden);

  /* 7 — end date line, no countdown */
  const future = Math.floor(Date.now() / 1000) + 86400 * 10;
  w = await run({ version: 1, displayCountry: "", announcements: [
    ANN({ id: "e1", placement: "bar", headline: "Maintenance window", type: "maintenance", endsAt: future })] });
  check("an end date renders as a plain Until line (no ticking countdown)",
    /Until [A-Z][a-z]+ \d{1,2}, \d{4}\./.test(w.els["ia-growth-bar"].textContent));

  console.log("\n" + passed + " passed, " + failed + " failed");
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
