/* Step 63 behavioural sim — runs the real Step 63 module from
   app.js against a DOM shim and exercises every mechanic on the
   rebuilt How It Works page: the trace stepper steps by buttons,
   nodes and arrow keys (progress line, announcers, node states,
   fill), the stage-5 trace closes its loop both ways (point ->
   facts light, fact -> points light, fact 3 honestly unmapped,
   re-tap lets go), and the faded prediction arms, waits for a
   choice, then delivers the right verdict for a right and a wrong
   prediction. A reduced-motion world proves the mechanics are
   class swaps, not animation-dependent. There are no timers in
   the module; the sandbox still provides them so an accidental
   one would surface as behaviour, and test-step63 pins their
   absence statically.
   Usage: node sim-step63-howitworks.js   (exit 0 = all pass) */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const js = fs.readFileSync(path.join(__dirname, "..", "website", "app.js"), "utf8");
const MOD = js.slice(js.indexOf("/* Step 63"));

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; }
  else { fail++; console.log("FAIL " + name + (detail ? " — " + detail : "")); }
}

/* ---------------- DOM shim (the sim-step59 pattern) ---------------- */
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

const NAMES = ["Fact confirmed", "Bank built", "Question asked", "Pause detected", "Three points, sourced"];
const DEFAULT_FEEDBACK = "The next answer shortens — first Concise, then Rapid — so a fast follow-up never leaves you reading a long answer while the interviewer is already talking.";

function buildWorld(reduced) {
  const byId = {};
  const all = [];
  const reg = (el, id) => { if (id) { el.attrs.id = id; el.id = id; byId[id] = el; } all.push(el); return el; };

  /* the trace */
  const trace = reg(makeEl("div", "hw-trace"), "hw-trace");
  const nodesWrap = makeEl("div", "hw-nodes");
  trace.append(nodesWrap);
  const fill = reg(makeEl("span", "hw-nodes-fill"), "hw-nodes-fill");
  nodesWrap.append(fill);
  const nodes = NAMES.map((n, i) => {
    const b = makeEl("button", "hw-node" + (i === 0 ? " is-active" : ""));
    const name = makeEl("span", "hw-node-name");
    name._text = n;
    b.append(name);
    if (i === 0) b.attrs["aria-current"] = "true";
    nodesWrap.append(b);
    all.push(b);
    return b;
  });
  const stage = makeEl("div", "hw-stage");
  trace.append(stage);
  const panels = NAMES.map(() => {
    const p = makeEl("section", "hw-panel");
    stage.append(p);
    all.push(p);
    return p;
  });
  /* stage 5's trace pair lives inside the last panel */
  const BMAP = { b1: "f1 f2", b2: "f4", b3: "f5" };
  const bullets = Object.keys(BMAP).map((b) => {
    const btn = makeEl("button", "hw-bullet");
    btn.attrs["data-bullet"] = b;
    btn.attrs["data-facts"] = BMAP[b];
    btn.attrs["aria-pressed"] = "false";
    panels[4].append(btn);
    all.push(btn);
    return btn;
  });
  const FMAP = { f1: "b1", f2: "b1", f3: "", f4: "b2", f5: "b3" };
  const facts = Object.keys(FMAP).map((f) => {
    const btn = makeEl("button", "hw-fact");
    btn.attrs["data-fact"] = f;
    btn.attrs["data-bullets"] = FMAP[f];
    btn.attrs["aria-pressed"] = "false";
    panels[4].append(btn);
    all.push(btn);
    return btn;
  });
  const prev = reg(makeEl("button"), "hw-prev");
  const next = reg(makeEl("button"), "hw-next");
  const progress = reg(makeEl("p"), "hw-progress");
  progress._text = "Stage 1 of 5 — Fact confirmed";
  const live = reg(makeEl("span"), "hw-live");
  const traceLive = reg(makeEl("span"), "hw-trace-live");
  trace.append(prev); trace.append(next);

  /* the faded prediction */
  const faded = reg(makeEl("div", "hw-faded"), "hw-faded");
  const opts = ["false", "true", "false"].map((c) => {
    const b = makeEl("button", "hw-opt");
    b.attrs["data-correct"] = c;
    b.attrs["aria-pressed"] = "false";
    faded.append(b);
    all.push(b);
    return b;
  });
  const revealBtn = reg(makeEl("button"), "hw-reveal-btn");
  const feedback = reg(makeEl("p"), "hw-faded-feedback");
  feedback._text = DEFAULT_FEEDBACK;
  faded.append(revealBtn); faded.append(feedback);

  const document = {
    getElementById: (id) => byId[id] || null,
    querySelectorAll: (sel) => {
      if (!sel.startsWith(".")) return [];
      return all.filter((e) => e._classes.has(sel.slice(1)));
    },
  };
  const sandbox = {
    console,
    document,
    setTimeout: () => 0,
    clearTimeout: () => {},
    setInterval: () => 0,
    clearInterval: () => {},
  };
  sandbox.window = { matchMedia: () => ({ matches: reduced }) };
  vm.createContext(sandbox);
  vm.runInContext(MOD, sandbox);
  return { trace, nodes, panels, bullets, facts, prev, next, progress, live, traceLive, fill, faded, opts, revealBtn, feedback };
}

const key = (k) => ({ key: k, preventDefault() { this._pd = true; } });

/* ---------------- World 1: the full journey ---------------- */
{
  const w = buildWorld(false);
  check("init: the stage goes live, stage 1 shown alone, prev disabled",
    w.trace._classes.has("is-live")
    && !w.panels[0]._classes.has("is-hidden") && w.panels[0]._classes.has("is-shown")
    && w.panels.slice(1).every((p) => p._classes.has("is-hidden"))
    && w.prev.disabled === true && w.next.disabled === false);
  check("init: progress reads stage 1, the fill is at zero",
    w.progress._text === "Stage 1 of 5 — Fact confirmed"
    && w.fill.style.transform === "scaleX(0)");
  check("init: the prediction is armed and Reveal waits for a choice",
    w.faded._classes.has("is-armed") && w.revealBtn.disabled === true);

  w.next.fire("click");
  check("step: Next moves to stage 2 and announces it",
    w.panels[1]._classes.has("is-shown") && w.panels[0]._classes.has("is-hidden")
    && w.progress._text === "Stage 2 of 5 — Bank built"
    && w.live._text === "Stage 2 of 5 — Bank built"
    && w.fill.style.transform === "scaleX(0.25)");
  check("step: node states follow (1 done, 2 current)",
    w.nodes[0]._classes.has("is-done") && !w.nodes[0]._classes.has("is-active")
    && w.nodes[1]._classes.has("is-active") && w.nodes[1].attrs["aria-current"] === "true"
    && !("aria-current" in w.nodes[0].attrs));

  w.nodes[4].fire("click");
  check("step: a node tap jumps to stage 5; Next rests, fill complete",
    w.panels[4]._classes.has("is-shown") && w.next.disabled === true
    && w.progress._text === "Stage 5 of 5 — Three points, sourced"
    && w.fill.style.transform === "scaleX(1)");

  w.trace.fire("keydown", key("ArrowLeft"));
  check("step: ArrowLeft steps back to stage 4",
    w.panels[3]._classes.has("is-shown") && w.progress._text === "Stage 4 of 5 — Pause detected");
  w.trace.fire("keydown", key("ArrowRight"));
  w.prev.fire("click");
  check("step: ArrowRight returns to 5, Prev steps back to 4",
    w.panels[3]._classes.has("is-shown") && w.progress._text === "Stage 4 of 5 — Pause detected");

  /* the trace moment: point -> facts */
  const [b1, b2, b3] = w.bullets;
  const [f1, f2, f3, f4, f5] = w.facts;
  b1.fire("click");
  check("trace: point 1 lights facts 1 + 2 and dims the rest of the card",
    b1._classes.has("is-active") && b1.attrs["aria-pressed"] === "true"
    && f1._classes.has("is-lit") && f2._classes.has("is-lit")
    && f3._classes.has("is-dim") && f4._classes.has("is-dim") && f5._classes.has("is-dim")
    && b2._classes.has("is-dim") && b3._classes.has("is-dim"));
  check("trace: the mapping is announced in words",
    w.traceLive._text === "Point 1 stands on facts 1 and 2.");
  b1.fire("click");
  check("trace: tapping the point again lets go completely",
    !b1._classes.has("is-active") && b1.attrs["aria-pressed"] === "false"
    && [...w.bullets, ...w.facts].every((e) => !e._classes.has("is-lit") && !e._classes.has("is-dim"))
    && w.traceLive._text === "");

  /* fact -> points */
  f4.fire("click");
  check("trace: fact 4 lights its point (point 2) and dims the other points",
    f4._classes.has("is-active") && b2._classes.has("is-lit")
    && b1._classes.has("is-dim") && b3._classes.has("is-dim")
    && w.traceLive._text === "Fact 4 stands behind point 2.");
  f4.fire("click");
  f3.fire("click");
  check("trace: fact 3 lights nothing — and says why, honestly",
    f3._classes.has("is-active")
    && w.bullets.every((b) => b._classes.has("is-dim") && !b._classes.has("is-lit"))
    && w.traceLive._text === "Fact 3 stands behind the bank's second question — it is not in this answer.");
  f3.fire("click");
  b3.fire("click");
  check("trace: point 3 stands on fact 5 alone",
    f5._classes.has("is-lit") && !f1._classes.has("is-lit")
    && w.traceLive._text === "Point 3 stands on fact 5.");

  /* the prediction: wrong option first, then the right one */
  w.revealBtn.fire("click");
  check("faded: Reveal before a choice is a no-op (button disabled, handler guarded)",
    !w.faded._classes.has("is-revealed"));
  w.opts[0].fire("click");
  check("faded: choosing arms Reveal and marks the choice",
    w.opts[0]._classes.has("is-chosen") && w.opts[0].attrs["aria-pressed"] === "true"
    && w.revealBtn.disabled === false);
  w.opts[1].fire("click");
  check("faded: changing your mind moves the choice",
    w.opts[1]._classes.has("is-chosen") && !w.opts[0]._classes.has("is-chosen")
    && w.opts[0].attrs["aria-pressed"] === "false");
  w.revealBtn.fire("click");
  check("faded: the right prediction earns 'Exactly right.' + the honest text",
    w.faded._classes.has("is-revealed")
    && w.feedback._text === "Exactly right. " + DEFAULT_FEEDBACK
    && w.opts.every((o) => o.disabled === true) && w.revealBtn.hidden === true);
}

/* ---------------- World 2: the wrong prediction ---------------- */
{
  const w = buildWorld(false);
  w.opts[2].fire("click");
  w.revealBtn.fire("click");
  check("faded: a wrong prediction earns 'Not quite.' + the same honest text",
    w.faded._classes.has("is-revealed")
    && w.feedback._text === "Not quite. " + DEFAULT_FEEDBACK);
  w.opts[1].fire("click");
  check("faded: after the reveal the options are locked",
    !w.opts[1]._classes.has("is-chosen") && w.feedback._text.startsWith("Not quite."));
}

/* ---------------- World 3: reduced motion ---------------- */
{
  const w = buildWorld(true);
  w.next.fire("click");
  w.bullets[0].fire("click");
  check("reduced motion: every mechanic still works (class swaps, not animation)",
    w.trace._classes.has("is-live") && w.panels[1]._classes.has("is-shown")
    && w.facts[0]._classes.has("is-lit")
    && w.progress._text === "Stage 2 of 5 — Bank built");
}

console.log(`sim-step63-howitworks: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
