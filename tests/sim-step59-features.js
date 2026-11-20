/* Step 59 behavioural sim — runs the real Step 59 module from
   app.js against a DOM shim and exercises every chapter mechanic:
   fact-confirm really strikes clauses and rewrites the sources
   line, the stepper steps/plays/suspends/stops, the Coach toggle
   and the interrupt stepper swap the Live window's layers, the
   language switcher swaps EN/FA/AR, the hero plays the MOTION §5
   cadence once and offers Replay (never under reduced motion),
   the scroll-spy moves, and the bento meter follows visibility.
   Usage: node sim-step59-features.js   (exit 0 = all pass) */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const js = fs.readFileSync(path.join(__dirname, "..", "website", "app.js"), "utf8");
const MOD = js.slice(js.indexOf("/* Step 59"));

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; }
  else { fail++; console.log("FAIL " + name + (detail ? " — " + detail : "")); }
}

/* ---------------- DOM shim ---------------- */
function makeEl(tag, cls) {
  const el = {
    tagName: (tag || "div").toUpperCase(),
    children: [],
    parentNode: null,
    attrs: {},
    hidden: false,
    disabled: false,
    checked: false,
    style: {},
    _text: "",
    _listeners: {},
    _classes: new Set(cls ? cls.split(" ") : []),
  };
  el.classList = {
    add: (c) => el._classes.add(c),
    remove: (c) => el._classes.delete(c),
    contains: (c) => el._classes.has(c),
    toggle: (c, force) => {
      const on = force === undefined ? !el._classes.has(c) : !!force;
      if (on) el._classes.add(c); else el._classes.delete(c);
      return on;
    },
  };
  Object.defineProperty(el, "textContent", {
    get() { return el._text; },
    set(v) { el._text = String(v); el.children = []; },
  });
  Object.defineProperty(el, "offsetWidth", { get() { return 0; } });
  el.getAttribute = (n) => (n in el.attrs ? el.attrs[n] : null);
  el.setAttribute = (n, v) => { el.attrs[n] = String(v); };
  el.removeAttribute = (n) => { delete el.attrs[n]; };
  el.addEventListener = (t, fn) => { (el._listeners[t] = el._listeners[t] || []).push(fn); };
  el.fire = (t, ev) => {
    (el._listeners[t] || []).forEach((fn) => fn(ev || {
      preventDefault() { this._pd = true; }, key: "",
    }));
  };
  const walk = (node, out) => { node.children.forEach((c) => { out.push(c); walk(c, out); }); return out; };
  el.querySelectorAll = (sel) => {
    const all = walk(el, []);
    if (sel.startsWith(".")) return all.filter((c) => c._classes.has(sel.slice(1)));
    return all.filter((c) => c.tagName === sel.toUpperCase());
  };
  el.querySelector = (sel) => el.querySelectorAll(sel)[0] || null;
  el.append = (child) => { child.parentNode = el; el.children.push(child); return child; };
  return el;
}

function buildWorld(reduced) {
  const byId = {};
  const all = [];
  const reg = (el, id) => { if (id) { el.attrs.id = id; el.id = id; byId[id] = el; } all.push(el); return el; };

  /* nav + sections */
  const nav = reg(makeEl("nav", "feat-nav"), "feat-nav");
  /* Step 60: the shim mirrors the page's new section order (the
     glance band now sits directly under the chapter nav). */
  const chapterIds = ["glance", "prepare", "live", "languages", "report", "privacy", "compare"];
  const links = chapterIds.map((id) => {
    const a = makeEl("a", "feat-nav-link");
    a.attrs.href = "#" + id;
    nav.append(a);
    return a;
  });
  const sections = {};
  chapterIds.forEach((id) => { sections[id] = reg(makeEl("section"), id); });

  /* hero */
  const pill = reg(makeEl("p", "app-pill"), "feat-pill");
  const pillText = reg(makeEl("span"), "feat-pill-text");
  pillText._text = "Answer ready";
  reg(makeEl("span"), "feat-start-label")._text = "Start listening";
  const icoPlay = reg(makeEl("span"), "feat-ico-play");
  const icoPause = reg(makeEl("span"), "feat-ico-pause");
  icoPause.hidden = true;
  reg(makeEl("p"), "feat-question");
  reg(makeEl("p"), "feat-transcript");
  reg(makeEl("div"), "feat-thinking");
  const answer = reg(makeEl("ul"), "feat-answer");
  for (let i = 0; i < 3; i++) answer.append(makeEl("li"));
  reg(makeEl("span"), "feat-meta")._text = "prepared";
  const replay = reg(makeEl("button"), "feat-replay");
  replay.hidden = true;

  /* facts */
  const FACTS = ["Five years building web products", "Led a small team on a customer-facing tool",
    "Rescued a slipping launch with staged rollouts", "Works outcome-first; trade-offs written down"];
  const boxes = FACTS.map((f) => {
    const label = makeEl("label", "feat-fact");
    const box = makeEl("input", "feat-fact-box");
    box.checked = true;
    const span = makeEl("span");
    span._text = f;
    label.append(box); label.append(span);
    all.push(box);
    return box;
  });
  const clauses = FACTS.map(() => { const s = makeEl("span", "feat-clause"); all.push(s); return s; });
  const sources = reg(makeEl("p"), "feat-sources");
  const count = reg(makeEl("p"), "feat-count");

  /* stepper */
  const stepper = reg(makeEl("div", "feat-stepper"), "feat-stepper");
  const NAMES = ["Verify profile", "JD extraction", "Candidate↔role match map", "Gap analysis",
    "Terminology", "Company/product context", "Story ranking by role relevance", "Likely questions",
    "Fast answers", "Coach keywords/structure", "Playbook", "Truth policy", "Difficult questions",
    "Questions to ask", "Runtime cache"];
  const numsWrap = makeEl("div", "feat-step-nums");
  stepper.append(numsWrap);
  const nums = NAMES.map((n, i) => {
    const b = makeEl("button", "feat-step-num" + (i === 0 ? " is-active" : ""));
    numsWrap.append(b);
    return b;
  });
  const stage = reg(makeEl("div", "feat-step-stage"), "feat-step-stage");
  stepper.append(stage);
  const panels = NAMES.map((n) => {
    const p = makeEl("div", "feat-step-panel");
    const name = makeEl("p", "feat-step-name");
    name._text = n;
    p.append(name);
    stage.append(p);
    return p;
  });
  const prev = reg(makeEl("button"), "feat-step-prev");
  const next = reg(makeEl("button"), "feat-step-next");
  const play = reg(makeEl("button"), "feat-step-play");
  play._text = "Play all";
  play.attrs["aria-pressed"] = "false";
  const stepLive = reg(makeEl("p"), "feat-step-live");

  /* live */
  const modeAnswer = reg(makeEl("button", "mode-btn is-active"), "feat-mode-answer");
  const modeCoach = reg(makeEl("button", "mode-btn"), "feat-mode-coach");
  const layers = {};
  [["normal", 3], ["concise", 2], ["rapid", 1], ["coach", 0]].forEach(([k, n]) => {
    const l = reg(makeEl("ul"), "feat-live-" + k);
    if (k !== "normal") l._classes.add("is-hidden");
    for (let i = 0; i < n; i++) l.append(makeEl("li"));
    layers[k] = l;
  });
  const intBtns = {};
  ["normal", "concise", "rapid"].forEach((k) => { intBtns[k] = reg(makeEl("button", "seg-btn"), "feat-int-" + k); });
  const intState = reg(makeEl("strong"), "feat-int-state");
  const liveStatus = reg(makeEl("p"), "feat-live-status");

  /* languages */
  const chips = ["en", "fa", "ar"].map((k) => {
    const c = makeEl("button", "chip feat-lang-chip");
    c.attrs["data-lang"] = k;
    c.attrs["aria-pressed"] = k === "en" ? "true" : "false";
    all.push(c);
    return c;
  });
  const langLayers = ["en", "fa", "ar"].map((k) => {
    const l = makeEl("div", "feat-lang-layer" + (k === "en" ? "" : " is-hidden"));
    l.attrs["data-layer"] = k;
    all.push(l);
    return l;
  });

  const tilePill = reg(makeEl("p", "app-pill"), "feat-tile-pill");

  const document = {
    getElementById: (id) => byId[id] || null,
    querySelectorAll: (sel) => {
      if (!sel.startsWith(".")) return [];
      return all.filter((e) => e._classes.has(sel.slice(1)));
    },
  };

  /* timers + observers */
  const timeouts = [];
  const intervals = new Map();
  let tid = 1;
  const ioInstances = [];
  class IO {
    constructor(cb, opts) { this.cb = cb; this.opts = opts; this.observed = []; ioInstances.push(this); }
    observe(el) { this.observed.push(el); }
    disconnect() { this.observed = []; }
  }
  const sandbox = {
    console,
    document,
    IntersectionObserver: IO,
    setTimeout: (fn, ms) => { const id = tid++; timeouts.push({ id, fn, ms, cleared: false }); return id; },
    clearTimeout: (id) => { const t = timeouts.find((x) => x.id === id); if (t) t.cleared = true; },
    setInterval: (fn, ms) => { const id = tid++; intervals.set(id, { fn, ms }); return id; },
    clearInterval: (id) => { intervals.delete(id); },
  };
  sandbox.window = { matchMedia: () => ({ matches: reduced }) };
  vm.createContext(sandbox);
  vm.runInContext(MOD, sandbox);

  const runTimeouts = () => {
    let guard = 0;
    for (;;) {
      const t = timeouts.find((x) => !x.cleared && !x.fired);
      if (!t || guard++ > 500) break;
      t.fired = true;
      t.fn();
    }
  };
  return { byId, links, sections, boxes, clauses, sources, count, stepper, stage, numsWrap, nums, panels,
    prev, next, play, stepLive, modeAnswer, modeCoach, layers, intBtns, intState,
    liveStatus, chips, langLayers, tilePill, timeouts, intervals, ioInstances, runTimeouts,
    pill, pillText, replay };
}

/* ---------------- A. Fact-confirm ---------------- */
{
  const w = buildWorld(false);
  w.boxes[1].checked = false;
  w.boxes[1].fire("change");
  check("facts: unchecking strikes exactly that clause",
    w.clauses[1].classList.contains("is-off") && !w.clauses[0].classList.contains("is-off")
    && !w.clauses[2].classList.contains("is-off"));
  check("facts: the source disappears from the sources line",
    w.sources.textContent === "Sources used by this answer: Five years building web products · Rescued a slipping launch with staged rollouts · Works outcome-first; trade-offs written down");
  check("facts: the counter follows (3 of 4)",
    w.count.textContent === "3 of 4 facts confirmed — the app uses only confirmed facts.");
  w.boxes.forEach((b) => { b.checked = false; });
  w.boxes[3].fire("change");
  check("facts: nothing confirmed → no invented answer (the none line)",
    w.sources.textContent === "Sources used by this answer: none — with nothing confirmed, the app builds no answer from guesses."
    && w.count.textContent === "0 of 4 facts confirmed — the app uses only confirmed facts.");
  w.boxes[0].checked = true;
  w.boxes[0].fire("change");
  check("facts: re-checking restores the clause, the source and the count",
    !w.clauses[0].classList.contains("is-off")
    && w.sources.textContent.includes("Five years building web products")
    && w.count.textContent.startsWith("1 of 4"));
}

/* ---------------- B. Stepper ---------------- */
{
  const w = buildWorld(false);
  check("stepper: init switches to stage mode, stage 1 shown, prev disabled",
    w.stepper.classList.contains("is-live")
    && w.panels[0].classList.contains("is-shown") && w.panels[1].classList.contains("is-hidden")
    && w.prev.disabled === true && w.next.disabled === false);
  w.next.fire("click");
  check("stepper: Next steps and announces politely",
    w.panels[1].classList.contains("is-shown")
    && w.stepLive.textContent === "Stage 2 of 15: JD extraction"
    && w.nums[1].getAttribute("aria-current") === "true");
  w.nums[14].fire("click");
  check("stepper: jumping to 15 clamps at the end (Next disabled)",
    w.panels[14].classList.contains("is-shown") && w.next.disabled === true
    && w.stepLive.textContent === "Stage 15 of 15: Runtime cache");
  let pd = false;
  w.stepper.fire("keydown", { key: "ArrowLeft", preventDefault() { pd = true; } });
  check("stepper: ArrowLeft steps back and swallows the key",
    pd && w.panels[13].classList.contains("is-shown"));
  w.nums[14].fire("click");
  w.play.fire("click");
  const iv = [...w.intervals.values()][0];
  check("stepper: Play all from the end restarts at 1, pressed, 1600ms interval",
    w.panels[0].classList.contains("is-shown")
    && w.play.getAttribute("aria-pressed") === "true" && w.play.textContent === "Pause"
    && !!iv && iv.ms === 1600);
  iv.fn(); iv.fn();
  check("stepper: the interval advances without touching the live region",
    w.panels[2].classList.contains("is-shown")
    && w.stepLive.textContent === "Stage 15 of 15: Runtime cache");
  w.stepper.fire("mouseenter");
  check("stepper: hovering the CONTROLS does not suspend (Play can always start)",
    w.intervals.size === 1);
  w.stage.fire("mouseenter");
  check("stepper: hovering the stage (reading) suspends the interval", w.intervals.size === 0);
  w.stage.fire("mouseleave");
  check("stepper: leaving the stage resumes it", w.intervals.size === 1);
  const iv2 = [...w.intervals.values()][0];
  let guard = 0;
  while (w.intervals.size && guard++ < 30) iv2.fn();
  check("stepper: play-all stops itself at stage 15 and announces the end",
    w.panels[14].classList.contains("is-shown")
    && w.play.getAttribute("aria-pressed") === "false" && w.play.textContent === "Play all"
    && w.stepLive.textContent === "Stage 15 of 15: Runtime cache");
}

/* ---------------- C. Live: Coach + interrupt stepper ---------------- */
{
  const w = buildWorld(false);
  check("live: Normal is the resting layer; the state label agrees",
    !w.layers.normal.classList.contains("is-hidden")
    && w.layers.coach.classList.contains("is-hidden")
    && w.intState.textContent === "Normal — 3 points");
  w.modeCoach.fire("click");
  check("live: Coach swaps the one window to the Coach layer + status",
    !w.layers.coach.classList.contains("is-hidden")
    && w.layers.normal.classList.contains("is-hidden")
    && w.modeCoach.getAttribute("aria-pressed") === "true"
    && w.modeCoach.classList.contains("is-coach-active")
    && w.liveStatus.textContent === "Coach Mode ready — simulated.");
  w.intBtns.rapid.fire("click");
  check("live: picking a length returns to Answer mode at that length",
    !w.layers.rapid.classList.contains("is-hidden")
    && w.layers.coach.classList.contains("is-hidden")
    && w.modeAnswer.getAttribute("aria-pressed") === "true"
    && w.intState.textContent === "Rapid — 1 line"
    && w.liveStatus.textContent === "Rapid (1 line) ready — simulated.");
  w.intBtns.concise.fire("click");
  check("live: Concise swaps to the 2-point layer",
    !w.layers.concise.classList.contains("is-hidden")
    && w.liveStatus.textContent === "Concise (2 points) ready — simulated.");
}

/* ---------------- D. Languages ---------------- */
{
  const w = buildWorld(false);
  w.chips[1].fire("click");
  check("languages: the Persian chip shows the Persian layer only, pressed states follow",
    !w.langLayers[1].classList.contains("is-hidden")
    && w.langLayers[0].classList.contains("is-hidden")
    && w.langLayers[2].classList.contains("is-hidden")
    && w.chips[1].getAttribute("aria-pressed") === "true"
    && w.chips[0].getAttribute("aria-pressed") === "false"
    && w.langLayers[1].classList.contains("is-shown"));
  w.chips[2].fire("click");
  check("languages: Arabic follows the same swap",
    !w.langLayers[2].classList.contains("is-hidden")
    && w.langLayers[1].classList.contains("is-hidden"));
}

/* ---------------- E. Hero cadence + Replay ---------------- */
{
  const w = buildWorld(false);
  const heroIO = w.ioInstances.find((i) => i.opts && i.opts.threshold === 0.25);
  check("hero: observed once at threshold 0.25", !!heroIO && heroIO.observed[0] === w.pill);
  heroIO.cb([{ isIntersecting: true, target: w.pill }]);
  const delays = w.timeouts.filter((t) => !t.cleared).map((t) => t.ms);
  check("hero: play starts on the MOTION §5 cadence (300 → 600 → 600)",
    delays[0] === 300);
  w.runTimeouts();
  const all = w.timeouts.map((t) => t.ms);
  check("hero: word timers at 160ms steps, question at +940, thinking +500, settle at 1750",
    [0, 160, 320, 480].every((d) => all.includes(d)) && all.includes(940)
    && all.includes(500) && all.includes(1750),
    JSON.stringify(all));
  check("hero: the moment settles — Answer ready, prepared, Replay offered, icons restored",
    w.pillText.textContent === "Answer ready"
    && w.byId["feat-meta"].textContent === "prepared"
    && w.replay.hidden === false
    && w.byId["feat-ico-play"].hidden === false
    && w.byId["feat-ico-pause"].hidden === true
    && w.byId["feat-question"].textContent === "“Tell me about yourself.”");
  const before = w.timeouts.length;
  w.replay.fire("click");
  check("hero: Replay restages the moment", w.timeouts.length > before && w.replay.hidden === true);
  w.runTimeouts();
  check("hero: Replay settles again with Replay offered", w.replay.hidden === false);
}

/* ---------------- F. Reduced motion: nothing plays ---------------- */
{
  const w = buildWorld(true);
  check("reduced motion: no hero observer, no timers, Replay never appears",
    !w.ioInstances.some((i) => i.opts && i.opts.threshold === 0.25)
    && w.timeouts.length === 0 && w.replay.hidden === true
    && w.pillText.textContent === "Answer ready");
  w.chips[1].fire("click");
  check("reduced motion: the language swap still works, without the rise class",
    !w.langLayers[1].classList.contains("is-hidden")
    && !w.langLayers[1].classList.contains("is-shown"));
}

/* ---------------- G. Scroll-spy + tile meter ---------------- */
{
  const w = buildWorld(false);
  const spy = w.ioInstances.find((i) => i.opts && i.opts.rootMargin === "-40% 0px -40% 0px");
  check("spy: chapter observer uses the centre band", !!spy);
  /* Step 60 re-pin: link indices follow the new nav order
     (glance, prepare, live, languages, report, privacy, compare)
     — Live is links[2], Privacy is links[5]. */
  spy.cb([{ isIntersecting: true, target: w.sections.live }]);
  check("spy: the Live link lights with aria-current, others stay dark",
    w.links[2].classList.contains("is-active") && w.links[2].getAttribute("aria-current") === "true"
    && !w.links[0].classList.contains("is-active"));
  spy.cb([{ isIntersecting: true, target: w.sections.privacy }]);
  check("spy: the light moves to Privacy",
    w.links[5].classList.contains("is-active") && !w.links[2].classList.contains("is-active"));
  const tileIO = w.ioInstances.find((i) => i.opts && i.opts.threshold === 0.2);
  tileIO.cb([{ isIntersecting: true, target: w.tilePill }]);
  const on = w.tilePill.classList.contains("is-live");
  tileIO.cb([{ isIntersecting: false, target: w.tilePill }]);
  check("tile: the ambient meter runs only while the tile is on screen",
    on && !w.tilePill.classList.contains("is-live"));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
