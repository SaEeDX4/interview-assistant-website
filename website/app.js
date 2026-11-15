/* Interview Assistant — demo logic (simulated, local only).
   No audio, no microphone, no network. Sample answers are illustrative:
   in the real app, points are built from the user's confirmed facts and
   their prepared question bank.
   Demo state machine: docs/frontend-website/25-DEMO-STATE-MACHINE.md
   - Answer mode inserts exactly 3 bullets one at a time (DOM insertion,
     not just a class animation), at 400 ms intervals.
   - Coach mode inserts 3 keywords, then 1 structure line.
   - Rapid clicks cancel previous timers (run token + clearTimers).
   - Reduced motion renders the full result immediately, nothing hidden.
   - The completed answer is announced once, via the status line. */

(function () {
  "use strict";

  var questionStack = document.getElementById("demo-question-stack");
  var answerStack = document.getElementById("demo-answer-stack");
  var statusEl = document.getElementById("demo-status");
  var sampleTagEl = document.getElementById("demo-sample-tag");
  var inputEl = document.getElementById("demo-input");
  var formEl = document.getElementById("demo-form");
  var modeAnswerBtn = document.getElementById("mode-answer");
  var modeCoachBtn = document.getElementById("mode-coach");

  // Guard against missing nodes: a missing demo must not throw on load.
  if (!questionStack || !answerStack || !statusEl || !inputEl || !formEl ||
      !modeAnswerBtn || !modeCoachBtn) {
    return;
  }
  // The static "tell" question + answer stay in the HTML as layer 0
  // (the no-JS demo); the rest of the layers are built by JS.
  var staticQuestionEl = document.getElementById("demo-question");
  var staticAnswerEl = document.getElementById("demo-answer");
  if (!staticQuestionEl || !staticAnswerEl) { return; }

  // Step 23 — fixed stage: the sample tag is hidden with visibility, not
  // display, so its space is reserved from the first paint. It starts as
  // `hidden` in the HTML (no-JS keeps it out of flow entirely); convert
  // here, before the first paint.
  if (sampleTagEl.hidden) {
    sampleTagEl.hidden = false;
    sampleTagEl.classList.add("is-hidden");
  }

  var mode = "answer"; // "answer" | "coach" — persists across questions.
  var currentKey = "tell";
  var currentQuestion = "Tell me about yourself.";
  var timers = [];
  var runId = 0; // Increments on every new question/mode; stale timers bail out.

  // Sample content. Grounded in the app's core question bank (intro,
  // why-hire, weakness, behavioural story, five years). Bullets are
  // illustrative samples, not the user's own facts — the page labels
  // them as such, persistently, in #demo-sample-tag.
  var SAMPLES = {
    tell: {
      q: "Tell me about yourself.",
      answer: [
        "Five years building web products — most recently leading a small team on a customer-facing tool.",
        "I start from the outcome, then the trade-off I made to get there.",
        "What draws me here is this team’s focus on honest, useful software."
      ],
      coach: {
        keys: ["EXPERIENCE", "OUTCOME", "FIT"],
        structure: "Present role → one result → why this role"
      }
    },
    hire: {
      q: "Why should we hire you?",
      answer: [
        "I’ve done this work before — shipping the same kind of product, under the same constraints.",
        "I bring the two things this role asks for most: the technical depth, and the calm under pressure.",
        "And I’ll be honest about what I’m still learning — here’s how I’m closing that gap."
      ],
      coach: {
        keys: ["PROOF", "FIT", "HONESTY"],
        structure: "Evidence → role fit → gap, handled honestly"
      }
    },
    weakness: {
      q: "What is your biggest weakness?",
      answer: [
        "I used to over-polish work before asking for feedback.",
        "Now I share a rough version early — here’s one time that changed the outcome.",
        "It’s still a habit I watch, and this is how I keep it in check."
      ],
      coach: {
        keys: ["REAL GAP", "CHANGE", "PROOF"],
        structure: "Honest weakness → what changed → evidence it works"
      }
    },
    story: {
      q: "Tell me about a time you led a difficult project.",
      answer: [
        "The project was behind schedule, and two teams disagreed on the approach.",
        "I got everyone into one room, named the trade-off, and we chose the simpler plan together.",
        "We shipped two weeks later — and the team kept the decision log we started that day."
      ],
      coach: {
        keys: ["SITUATION", "ACTION", "RESULT"],
        structure: "Situation → your action → result, with numbers"
      }
    },
    five: {
      q: "Where do you see yourself in five years?",
      answer: [
        "Doing this work at a deeper level — owning a product area, not just tasks.",
        "I want to be the person others come to for the hard trade-offs.",
        "That’s why a team that reviews honestly and ships carefully matters to me."
      ],
      coach: {
        keys: ["DEPTH", "OWNERSHIP", "FIT"],
        structure: "Direction → contribution → why here"
      }
    },
    fa: {
      q: "درباره خودتان بگویید.",
      rtl: true,
      lang: "fa",
      answer: [
        "با نقش فعلی‌ام شروع می‌کنم و یک نتیجه مشخص را می‌گویم.",
        "بعد یک مثال واقعی از تجربه‌ام می‌آورم، نه حرف کلی.",
        "در پایان می‌گویم چرا این نقش برایم مناسب است."
      ],
      coach: {
        keys: ["تجربه", "نتیجه", "تناسب"],
        structure: "نقش فعلی ← یک نتیجه ← چرا این نقش"
      }
    },
    ar: {
      q: "حدّثني عن نفسك.",
      rtl: true,
      lang: "ar",
      answer: [
        "أبدأ بدوري الحالي وأذكر نتيجة محددة حققتها.",
        "ثم أذكر مثالاً حقيقياً من تجربتي، لا كلاماً عاماً.",
        "وأختم بتوضيح سبب ملاءمة هذا الدور لي."
      ],
      coach: {
        keys: ["الخبرة", "النتيجة", "الملاءمة"],
        structure: "الدور الحالي ← نتيجة واحدة ← لماذا هذا الدور"
      }
    },
    salary: {
      q: "What salary are you expecting?",
      answer: [
        "I’d rather anchor on the range for this role — what I’ve seen is around this level, for this scope.",
        "What matters most to me is the full picture: the work, the growth, and the total package.",
        "I’m flexible on the number if the role and the package are right — here’s the range I had in mind."
      ],
      coach: {
        keys: ["RANGE", "PACKAGE", "FLEXIBLE"],
        structure: "Market range → full package → your range, flexibly"
      }
    },
    conflict: {
      q: "Tell me about a conflict with a coworker.",
      answer: [
        "We disagreed on the approach — I wanted the simpler plan, they wanted the thorough one.",
        "I asked for their reasoning first, then named the trade-off openly instead of arguing past each other.",
        "We shipped the simpler plan, and we kept the decision log — the relationship was stronger afterwards."
      ],
      coach: {
        keys: ["DISAGREEMENT", "LISTENED", "RESOLVED"],
        structure: "Disagreement → what you did → outcome, with the relationship intact"
      }
    },
    why: {
      q: "Why do you want to work here?",
      answer: [
        "This team ships carefully and reviews honestly — that is the environment I do my best work in.",
        "The product itself matters to me: it helps people at a moment that actually counts.",
        "And the role fits what I do well — here is the one result that shows it."
      ],
      coach: {
        keys: ["TEAM", "PRODUCT", "FIT"],
        structure: "Why this team → why this product → why you fit"
      }
    }
  };

  // Generic fallback for typed questions: teach the *shape* of an answer,
  // never invent a fake specific answer.
  var FALLBACK = {
    answer: [
      "Start with the outcome — the result, in one sentence.",
      "Give one concrete example from your own experience.",
      "Close by connecting it to this role."
    ],
    coach: {
      keys: ["OUTCOME", "EXAMPLE", "FIT"],
      structure: "Outcome → example → connection to this role"
    }
  };

  var STAGE_MS = 400; // Interval between staged bullet insertions.

  function isReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function clearTimers() {
    timers.forEach(function (t) { clearTimeout(t); });
    timers = [];
  }

  function setStatus(text) { statusEl.textContent = text; }

  // Step 2 — reveal the demo next-step card once an answer has completed.
  // Copy is mode-aware: Coach mode shows keywords, not 3 points.
  // Step 5 — the card is the demo-to-plan handoff: the 3 points took
  // about 2 minutes, and the Trial's 30 lifetime minutes buy about 15
  // answers like this one. It also surfaces the bounded-memory story:
  // the app remembers the stories already used, so the next answer
  // reaches for a fresh one (source: docs/v2/LIVE_MEMORY.md).
  var nextEl = document.getElementById("demo-next");
  // Step 23: reserve the card's space from the first paint (see above).
  if (nextEl && nextEl.hidden) {
    nextEl.hidden = false;
    nextEl.classList.add("is-hidden");
  }
  function showDemoNext() {
    if (!nextEl) { return; }
    var titleEl = document.getElementById("demo-next-title");
    var textEl = document.getElementById("demo-next-text");
    if (titleEl) {
      titleEl.textContent = mode === "coach"
        ? "Those Coach keywords took about a minute — here\u2019s what 30 trial minutes buys."
        : "Those 3 points took about 2 minutes — here\u2019s what 30 trial minutes buys.";
    }
    if (textEl) {
      textEl.textContent = mode === "coach"
        ? "The Trial gives you 30 lifetime live minutes — about 15 answers like this one. In the real app, the same Coach keywords and structure are built from your confirmed resume facts and your prepared question bank — and it remembers the stories you already used, so the next answer reaches for a fresh one."
        : "The Trial gives you 30 lifetime live minutes — about 15 answers like this one. In the real app, the same three points are built from your confirmed resume facts and your prepared question bank — and it remembers the stories you already used, so the next answer reaches for a fresh one.";
    }
    nextEl.classList.remove("is-hidden");
  }

  function makeBullet(text, i) {
    var li = document.createElement("li");
    var dot = document.createElement("span");
    dot.className = "app-dot";
    dot.setAttribute("aria-hidden", "true");
    li.appendChild(dot);
    var span = document.createElement("span");
    span.textContent = text;
    li.appendChild(span);
    return li;
  }

  // Step 23 — fixed stage: every sample is a pre-rendered layer, so the
  // demo window is always as tall as its tallest sample and nothing below
  // it moves when a sample is picked or a point lands. Question layers:
  // one per sample (SAMPLE_KEYS order) + 1 fallback for typed questions
  // (index 10). Answer layers: 2 per sample (answer, then coach) + 2
  // fallback (indices 20, 21). The static "tell" question + answer stay
  // in the HTML as layer 0, so no-JS still shows the demo.
  var SAMPLE_KEYS = ["tell", "hire", "weakness", "story", "five", "fa", "ar", "salary", "conflict", "why"];
  var questionLayers = [];
  var answerLayers = [];
  var intLayers = [];
  var currentAnswerLayer = null;

  function hideAllLayers(layers) {
    layers.forEach(function (layer) { layer.classList.add("is-hidden"); });
  }
  function showLayer(layers, i) {
    hideAllLayers(layers);
    layers[i].classList.remove("is-hidden");
    return layers[i];
  }
  function hideRows(layer) {
    Array.prototype.forEach.call(layer.querySelectorAll("li"), function (li) {
      li.classList.add("is-hidden");
      li.classList.remove("is-new");
    });
  }
  function makeRow(text, isKeys) {
    var li = document.createElement("li");
    var dot = document.createElement("span");
    dot.className = "app-dot";
    dot.setAttribute("aria-hidden", "true");
    li.appendChild(dot);
    var span = document.createElement("span");
    if (isKeys) { span.className = "coach-keys"; }
    span.textContent = text;
    li.appendChild(span);
    li.classList.add("is-hidden");
    return li;
  }
  function buildAnswerLayer(items, rtl, lang) {
    var ul = document.createElement("ul");
    ul.className = "demo-answer";
    ul.setAttribute("aria-busy", "false");
    ul.dir = rtl ? "rtl" : "ltr";
    ul.lang = lang || (rtl ? "fa" : "en");
    items.forEach(function (text) {
      var li = makeBullet(text);
      li.classList.add("is-hidden");
      ul.appendChild(li);
    });
    ul.classList.add("is-hidden");
    return ul;
  }
  function buildCoachLayer(coach, rtl, lang) {
    var ul = document.createElement("ul");
    ul.className = "demo-answer coach";
    ul.setAttribute("aria-busy", "false");
    ul.dir = rtl ? "rtl" : "ltr";
    ul.lang = lang || (rtl ? "fa" : "en");
    ul.appendChild(makeRow(coach.keys.join(" · "), true));
    ul.appendChild(makeRow(coach.structure, false));
    ul.classList.add("is-hidden");
    return ul;
  }
  function buildDemoLayers() {
    // Questions: adopt the static "tell" question as layer 0.
    questionLayers.push(staticQuestionEl);
    SAMPLE_KEYS.slice(1).forEach(function (key) {
      var sample = SAMPLES[key];
      var p = document.createElement("p");
      p.className = "demo-question";
      p.textContent = "“" + sample.q + "”";
      p.dir = sample.rtl ? "rtl" : "ltr";
      p.lang = sample.lang || "en";
      p.classList.add("is-hidden");
      questionStack.appendChild(p);
      questionLayers.push(p);
    });
    // Fallback question layer (typed questions): text set on submit.
    var fallbackQ = document.createElement("p");
    fallbackQ.className = "demo-question";
    fallbackQ.classList.add("is-hidden");
    questionStack.appendChild(fallbackQ);
    questionLayers.push(fallbackQ);

    // Answers: adopt the static "tell" answer as layer 0, build the
    // tell coach layer as layer 1, then answer + coach per sample.
    Array.prototype.forEach.call(staticAnswerEl.querySelectorAll("li"), function (li) {
      li.classList.add("is-hidden");
    });
    answerLayers.push(staticAnswerEl);
    var tellCoach = buildCoachLayer(SAMPLES.tell.coach, false, "en");
    answerStack.appendChild(tellCoach);
    answerLayers.push(tellCoach);
    SAMPLE_KEYS.slice(1).forEach(function (key) {
      var sample = SAMPLES[key];
      var a = buildAnswerLayer(sample.answer, sample.rtl, sample.lang);
      answerStack.appendChild(a);
      answerLayers.push(a);
      var c = buildCoachLayer(sample.coach, sample.rtl, sample.lang);
      answerStack.appendChild(c);
      answerLayers.push(c);
    });
    var fbA = buildAnswerLayer(FALLBACK.answer, false, "en");
    answerStack.appendChild(fbA);
    answerLayers.push(fbA);
    var fbC = buildCoachLayer(FALLBACK.coach, false, "en");
    answerStack.appendChild(fbC);
    answerLayers.push(fbC);
  }

  // Reveal a layer's rows one at a time (400ms apart), then done().
  // Reduced motion: all at once. The rows are pre-rendered hidden, so
  // the layer — and the window — never change height while they land.
  function revealRows(layer, list, isStale, done) {
    var rows = Array.prototype.slice.call(layer.querySelectorAll("li"));
    if (isReducedMotion()) {
      rows.forEach(function (li) {
        li.classList.remove("is-hidden");
        li.classList.remove("is-new");
      });
      done();
      return;
    }
    rows.forEach(function (li, i) {
      list.push(setTimeout(function () {
        if (isStale()) { return; }
        li.classList.remove("is-hidden");
        li.classList.add("is-new");
        if (i === rows.length - 1) { done(); }
      }, i * STAGE_MS));
    });
  }

  function finishRender(myRun, statusText) {
    if (myRun !== runId) { return; }
    if (currentAnswerLayer) {
      currentAnswerLayer.setAttribute("aria-busy", "false");
    }
    setStatus(statusText);
    showDemoNext();
  }

  // Step 23: renderBullets / renderCoach are retired — the layers are
  // built once by buildDemoLayers and revealed by revealRows, so no
  // bullet is ever inserted during a play (the old DOM-insertion +
  // skeleton placeholders are what grew the window by 170px).

  // Step 23: switch layers, then reveal the active layer's rows one at
  // a time. Nothing is emptied, inserted or replaced during a play —
  // the window is at its final height before the first point lands.
  function showAnswer(key, questionText, sample) {
    clearTimers();
    var myRun = ++runId;
    currentKey = key;
    currentQuestion = questionText;
    var idx = SAMPLE_KEYS.indexOf(key);
    if (idx < 0) { idx = SAMPLE_KEYS.length; } // "typed" -> fallback layer
    var questionLayer = questionLayers[idx];
    if (key === "typed") {
      questionLayer.textContent = "“" + questionText + "”";
    }
    showLayer(questionLayers, idx);
    var layer = showLayer(answerLayers, idx * 2 + (mode === "coach" ? 1 : 0));
    currentAnswerLayer = layer;
    hideRows(layer);
    layer.setAttribute("aria-busy", "true");
    if (sample) {
      sampleTagEl.textContent = "Illustrative sample — in the real app, points come from your confirmed facts.";
      sampleTagEl.classList.remove("is-hidden");
    } else {
      sampleTagEl.classList.add("is-hidden");
    }
    setStatus("Preparing your points…");
    var delay = isReducedMotion() ? 0 : 120;
    timers.push(setTimeout(function () {
      if (myRun !== runId) { return; }
      revealRows(layer, timers, function () { return myRun !== runId; }, function () {
        finishRender(myRun, mode === "coach" ? "Coach points ready." : "3 points ready.");
      });
      if (!sample) {
        // Generic structure only — announced once, with the render.
        timers.push(setTimeout(function () {
          if (myRun !== runId) { return; }
          setStatus("Sample structure — in the real app, points come from your confirmed facts.");
        }, mode === "coach" ? STAGE_MS : (FALLBACK.answer.length - 1) * STAGE_MS));
      }
    }, delay));
  }

  function setMode(next) {
    if (next === mode) { return; }
    mode = next;
    var coach = next === "coach";
    modeAnswerBtn.classList.toggle("is-active", !coach);
    modeCoachBtn.classList.toggle("is-active", coach);
    modeCoachBtn.classList.toggle("is-coach-active", coach);
    modeAnswerBtn.setAttribute("aria-pressed", String(!coach));
    modeCoachBtn.setAttribute("aria-pressed", String(coach));
    // Focus stays on the toggle; only the answer re-renders, in the new mode.
    var sample = SAMPLES[currentKey] || null;
    showAnswer(currentKey, currentQuestion, sample);
  }

  modeAnswerBtn.addEventListener("click", function () { setMode("answer"); });
  modeCoachBtn.addEventListener("click", function () { setMode("coach"); });

  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      var key = chip.getAttribute("data-q");
      var sample = SAMPLES[key];
      if (sample) { showAnswer(key, sample.q, sample); }
      inputEl.value = "";
      inputEl.removeAttribute("aria-invalid");
    });
  });

  formEl.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = inputEl.value.trim();
    if (!text) {
      setStatus("Type a question, or pick a sample below.");
      inputEl.setAttribute("aria-invalid", "true");
      inputEl.focus();
      return;
    }
    inputEl.removeAttribute("aria-invalid");
    // No sample match: show the honest generic structure, not a fake answer.
    showAnswer("typed", text, null);
  });

  inputEl.addEventListener("input", function () {
    inputEl.removeAttribute("aria-invalid");
  });

  // Interruption simulator (demo.html only): same follow-up question at
  // three lengths — Normal (3 points), Concise (2 short points), Rapid
  // (1 line). Simulated; in the real app the shortening is automatic.
  var intAnswer = document.getElementById("int-answer");
  var intStatus = document.getElementById("int-status");
  var intState = document.getElementById("int-state");
  var intBtns = ["int-normal", "int-concise", "int-rapid"].map(function (id) {
    return document.getElementById(id);
  });
  if (intAnswer && intStatus && intBtns.every(Boolean)) {
    var INT = {
      normal: ["Five years building web products — most recently leading a small team on a customer-facing tool.",
        "I start from the outcome, then the trade-off I made to get there.",
        "What draws me here is this team’s focus on honest, useful software."],
      concise: ["Five years building web products, most recently leading a small team.",
        "Drawn here by this team’s focus on honest, useful software."],
      rapid: ["Five years building web products — and this team’s focus is why I’m here."]
    };
    // Step 23: stack the three lengths (Normal / Concise / Rapid) so the
    // simulator never changes height when the length changes. The static
    // <ul> is the Normal layer; Concise + Rapid are built here.
    var intStack = document.getElementById("int-answer-stack");
    if (intStack) {
      Array.prototype.forEach.call(intAnswer.querySelectorAll("li"), function (li) {
        li.classList.add("is-hidden");
      });
      intLayers.push(intAnswer);
      ["concise", "rapid"].forEach(function (key) {
        var ul = buildAnswerLayer(INT[key], false, "en");
        intStack.appendChild(ul);
        intLayers.push(ul);
      });
    }
    var intTimers = [];
    var intRun = 0;
    function showInt(key, label) {
      intTimers.forEach(function (t) { clearTimeout(t); });
      intTimers = [];
      var myRun = ++intRun;
      var layer = showLayer(intLayers, ["normal", "concise", "rapid"].indexOf(key));
      hideRows(layer);
      intStatus.textContent = "Preparing the shorter version…";
      var items = INT[key];
      intBtns.forEach(function (b, i) {
        b.setAttribute("aria-pressed", String(["normal", "concise", "rapid"][i] === key));
      });
      if (intState) { intState.textContent = label.replace(" (", " — ").replace(")", ""); }
      revealRows(layer, intTimers, function () { return myRun !== intRun; }, function () {
        intStatus.textContent = label + " ready — simulated.";
      });
    }
    intBtns[0].addEventListener("click", function () { showInt("normal", "Normal (3 points)"); });
    intBtns[1].addEventListener("click", function () { showInt("concise", "Concise (2 points)"); });
    intBtns[2].addEventListener("click", function () { showInt("rapid", "Rapid (1 line)"); });
    showInt("normal", "Normal (3 points)");
  }

  // Initial state: build the layers, then the default sample, staged on load.
  buildDemoLayers();
  showAnswer("tell", SAMPLES.tell.q, SAMPLES.tell);
})();

/* Download buttons (draft): no installer yet — say so, don't 404.
   Own IIFE: these buttons live on download.html, which has no demo, so
   they must not sit behind the demo guard above. (The buttons are
   currently disabled, so this never fires — it stays for the first
   signed release, when they are enabled.) */
(function () {
  "use strict";
  var note = document.getElementById("download-note");
  ["dl-installer", "dl-portable"].forEach(function (id) {
    var btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener("click", function () {
        if (note) {
          note.textContent = "Downloads open with the first signed release — this draft has no installer yet. Check back soon.";
          if (note.focus) { note.focus(); }
        }
      });
    }
  });
})();

/* Mobile nav. Own IIFE (Step 4 fix): this used to live inside the demo
   IIFE after its early-return guard, so the nav toggle was dead on every
   page without a demo. It must bind on all 10 pages. */
(function () {
  "use strict";
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (!toggle || !nav) { return; }
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
})();

/* Step 21 — hero app-window player: the faithful moment. One staged
   moment, played once when the hero is first seen, then only on Replay.
   It follows the real app, not the Step 20 invention: the interviewer
   speaks (the live transcript grows in italics), the question appears
   whole, the app thinks (● ● ● + a faded pending bullet), the three
   points stream in one at a time, and the pill reads Answer ready. No
   waveform (the app has only a 48x4 level meter inside the pill), no
   typed question, no "3 points ready". Reduced motion: the full final
   state renders statically, no Replay button. */
(function () {
  "use strict";
  var pill = document.getElementById("mock-pill");
  var pillText = document.getElementById("mock-pill-text");
  var startEl = document.getElementById("mock-start");
  var startLabelEl = document.getElementById("mock-start-label");
  var questionEl = document.getElementById("mock-question");
  var transcriptEl = document.getElementById("mock-transcript");
  var thinkingEl = document.getElementById("mock-thinking");
  var list = document.getElementById("mock-answer");
  var metaEl = document.getElementById("mock-meta");
  var replayBtn = document.getElementById("hero-replay");
  var appWindow = list && list.closest ? list.closest(".app-window") : null;
  if (!pill || !pillText || !startEl || !startLabelEl || !questionEl || !transcriptEl || !thinkingEl || !list || !metaEl || !replayBtn || !appWindow) { return; }

  var QUESTION = "Tell me about yourself.";
  var POINTS = [
    "Five years building web products — most recently leading a small team.",
    "I start from the outcome, then the trade-off I made to get there.",
    "What draws me here is this team’s focus on honest, useful software."
  ];
  // The live transcript, growing word by word while the interviewer speaks.
  var TRANSCRIPT = ["Tell", "Tell me", "Tell me about", "Tell me about yourself."];
  var START_MS = 300;  // press Start after the window is seen
  var HEAR_MS = 600;   // Listening -> Hearing audio
  var TRANS_MS = 600;  // Hearing audio -> Transcribing
  var WORD_MS = 160;   // per transcript word
  var DETECT_MS = 300; // transcript done -> question detected
  var THINK_MS = 500;  // Question detected -> Preparing answer
  var STAGE_MS = 450;  // interval between points (same as the demo)
  var END_MS = 400;    // last point -> Replay appears
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var timers = [];
  var played = false; // auto-play runs once; after that, only Replay
  var shown = 0; // points rendered in the current play

  // Step 23 — fixed stage: the three points are built once, at load,
  // hidden (so they reserve their space). Plays only toggle classes on
  // them, never rebuild — the card is at its final height from the first
  // paint, so nothing below the window moves while it plays.
  POINTS.forEach(function (text) {
    var li = makeBullet(text);
    li.classList.add("is-hidden");
    list.appendChild(li);
  });
  function setBulletsHidden(hidden) {
    for (var i = 0; i < list.children.length; i++) {
      var li = list.children[i];
      li.classList.toggle("is-hidden", hidden);
      li.classList.remove("is-pending");
      li.classList.remove("is-new");
    }
  }

  // Clear every pending mockup timer. A play must never run twice at
  // once: without this, a visibilitychange back to visible would start
  // a second sequence alongside the first and every point would render
  // twice.
  function clearTimers() {
    timers.forEach(function (t) { clearTimeout(t); });
    timers = [];
  }

  // The pill's state: text + colour class. is-listening = green (with
  // pulsing dot), is-thinking = amber (with pulsing dot), no class =
  // faint grey. is-live runs the level meter while audio is coming in.
  function setPill(text, state, live) {
    pillText.textContent = text;
    pill.classList.toggle("is-listening", state === "listening");
    pill.classList.toggle("is-thinking", state === "thinking");
    pill.classList.toggle("is-live", !!live);
  }

  function makeBullet(text) {
    var li = document.createElement("li");
    var dot = document.createElement("span");
    dot.className = "app-dot";
    dot.setAttribute("aria-hidden", "true");
    li.appendChild(dot);
    var span = document.createElement("span");
    span.textContent = text;
    li.appendChild(span);
    return li;
  }

  function renderAll() {
    clearTimers();
    setPill("Answer ready", "listening", false);
    startLabelEl.textContent = "Pause";
    questionEl.textContent = "“" + QUESTION + "”";
    questionEl.classList.remove("is-empty");
    transcriptEl.textContent = "";
    thinkingEl.classList.add("is-hidden");
    setBulletsHidden(false);
    metaEl.textContent = "prepared";
  }

  if (reduced) { renderAll(); return; }

  // Finish: the moment is over — Replay shown. Used both at the end of
  // play() and when pausing after all three points are already on screen,
  // so a scroll-away in the last 400ms can never leave the mockup
  // finished-looking with no Replay button.
  function finish() {
    setPill("Answer ready", "listening", false);
    replayBtn.classList.remove("is-hidden");
    played = true;
  }

  // Pause: stop the timers and settle the meter. Called when the hero
  // scrolls out of view or the tab hides mid-play; the sequence restarts
  // from the beginning on return (played stays false until it completes).
  // Exception: if all three points are already shown, the moment is
  // over — finish it instead of restarting from scratch on return.
  function pause() {
    clearTimers();
    pill.classList.remove("is-live");
    if (shown === 3) { finish(); }
  }

  function play() {
    clearTimers();
    shown = 0;
    setPill("Not listening", "", false);
    startLabelEl.textContent = "Start listening";
    questionEl.textContent = "Waiting for the interviewer…";
    questionEl.classList.add("is-empty");
    transcriptEl.textContent = "";
    thinkingEl.classList.add("is-hidden");
    setBulletsHidden(true);
    metaEl.textContent = "";
    replayBtn.classList.add("is-hidden");
    timers.push(setTimeout(function () {
      // Start pressed: the session begins, the meter runs.
      startLabelEl.textContent = "Pause";
      setPill("Listening", "listening", true);
      timers.push(setTimeout(function () {
        setPill("Hearing audio", "listening", true);
        timers.push(setTimeout(function () {
          setPill("Transcribing", "listening", true);
          // The live transcript grows word by word; the question itself
          // never types — it appears whole when detected.
          TRANSCRIPT.forEach(function (words, i) {
            timers.push(setTimeout(function () {
              transcriptEl.textContent = words;
            }, i * WORD_MS));
          });
          timers.push(setTimeout(function () {
            transcriptEl.textContent = "";
            questionEl.textContent = "“" + QUESTION + "”";
            questionEl.classList.remove("is-empty");
            setPill("Question detected", "thinking", true);
            timers.push(setTimeout(function () {
              setPill("Preparing answer", "thinking", false);
              thinkingEl.classList.remove("is-hidden");
              // The bullet being written shows faded until it lands: it is
              // the pre-rendered first bullet, revealed faded.
              var pending = list.children[0];
              pending.classList.remove("is-hidden");
              pending.classList.add("is-pending");
              POINTS.forEach(function (text, i) {
                timers.push(setTimeout(function () {
                  var li = list.children[i];
                  li.classList.remove("is-hidden");
                  li.classList.remove("is-pending");
                  li.classList.add("is-new");
                  shown++;
                  if (i === 0) {
                    thinkingEl.classList.add("is-hidden");
                    metaEl.textContent = "prepared";
                  }
                  if (i === POINTS.length - 1) {
                    timers.push(setTimeout(function () { finish(); }, END_MS));
                  }
                }, i * STAGE_MS));
              });
            }, THINK_MS));
          }, TRANSCRIPT.length * WORD_MS + DETECT_MS));
        }, TRANS_MS));
      }, HEAR_MS));
    }, START_MS));
  }

  replayBtn.addEventListener("click", function () { play(); });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      pause();
    } else if (!played) {
      play();
    }
  });

  // Pause when scrolled off-screen; play once when first seen.
  var visual = list.closest ? list.closest(".hero-visual") : null;
  if (visual && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        if (!played) { play(); }
      } else {
        pause();
      }
    }, { threshold: 0 }).observe(visual);
  } else {
    play();
  }
})();

/* Steps 21–22 — scroll story: one interview, start to finish. Two modes,
   one window, one set of beat states. Desktop: the pinned window renders
   the beat that crosses the middle of the viewport (IntersectionObserver
   with a centre band). Mobile (<=860px, Step 22): one swipeable player —
   segments, arrows, swipe, keyboard — driving the same window. Every beat
   sets the window's complete state, so scrolling fast never strands a half
   state. Beats 0 (Prepare stages) and 2 (the first question) play a short
   timed sequence the first time they activate; later activations render
   the final state at once. Reduced motion: finals render at once, no
   timers. No IO on desktop: the static HTML (Beat 1) stays and the
   snapshots carry the story. */
(function () {
  "use strict";
  var steps = Array.prototype.slice.call(document.querySelectorAll(".story-step"));
  if (!steps.length) { return; }
  var pill = document.getElementById("story-pill");
  var pillText = document.getElementById("story-pill-text");
  var badge = document.getElementById("story-badge");
  var startEl = document.getElementById("story-start");
  var startLabelEl = document.getElementById("story-start-label");
  var homeHeader = document.getElementById("story-home-header");
  var liveHeader = document.getElementById("story-live-header");
  var homeView = document.getElementById("story-home");
  var liveView = document.getElementById("story-live");
  var reportView = document.getElementById("story-report");
  var prepareBar = document.getElementById("story-prepare-bar");
  var prepareStage = document.getElementById("story-prepare-stage");
  var openLive = document.getElementById("story-open-live");
  var questionStack = document.getElementById("story-question-stack");
  var transcriptEl = document.getElementById("story-transcript");
  var contextEl = document.getElementById("story-context");
  var thinkingEl = document.getElementById("story-thinking");
  var answerStack = document.getElementById("story-answer-stack");
  var metaEl = document.getElementById("story-meta");
  var coachEl = document.getElementById("story-coach");
  var historyEl = document.getElementById("story-history");
  var historyText = document.getElementById("story-history-text");
  var storyWindow = answerStack && answerStack.closest ? answerStack.closest(".story-window") : null;
  var segWrap = document.querySelector(".story-segments");
  var snapProbe = document.querySelector(".story-snap");
  var segBtns = Array.prototype.slice.call(document.querySelectorAll(".story-seg"));
  var captionStack = document.getElementById("story-caption-stack");
  var captionLive = document.getElementById("story-caption-live");
  var countEl = document.getElementById("story-count");
  var prevBtn = document.querySelector(".story-prev");
  var nextBtn = document.querySelector(".story-next");
  if (!pill || !pillText || !badge || !startEl || !startLabelEl || !homeHeader || !liveHeader || !homeView || !liveView
      || !reportView || !prepareBar || !prepareStage || !openLive || !questionStack || !transcriptEl
      || !contextEl || !thinkingEl || !answerStack || !metaEl || !coachEl || !historyEl || !historyText
      || !captionStack || !storyWindow) { return; }
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  var Q1 = "Tell me about yourself.";
  var Q1_POINTS = [
    "Five years building web products — most recently leading a small team.",
    "I start from the outcome, then the trade-off I made to get there.",
    "What draws me here is this team’s focus on honest, useful software."
  ];
  var Q2 = "Tell me about a time you led a difficult project.";
  var Q2_POINTS = [
    "I led a rebuild of our checkout while the old one stayed live.",
    "I split the work into weekly slices the team could review.",
    "We shipped on time, and checkout errors fell by half."
  ];
  var Q3 = "Why should we hire you?";
  var Q3_POINTS = [
    "I ship real products — five years, most recently leading a small team.",
    "I start from the outcome, then the trade-off I made.",
    "I learn a team’s stack fast and contribute in week one."
  ];
  var TRANSCRIPT = ["Tell", "Tell me", "Tell me about", "Tell me about yourself."];
  // The 15 Prepare stages, verbatim (source: docs/v2/PREPARATION_PIPELINE.md).
  var STAGES = ["Verify profile", "JD extraction", "Candidate–role match map",
    "Gap analysis", "Terminology", "Company/product context", "Story ranking",
    "Likely questions", "Fast answers", "Coach keywords & structure", "Playbook",
    "Truth policy", "Difficult questions", "Questions to ask", "Runtime cache"];
  // Step 23 — the live beats' questions and answers, as layer data. Index
  // 0-4 = live beats 1-5. Answer layer 3 is Coach (no bullets): its markup
  // is the #story-coach node, already sitting in the answer stack.
  var READY_TEXT = "Ready when you are — start listening when the interview begins.";
  var QUESTION_TEXTS = [READY_TEXT, "“" + Q1 + "”", "“" + Q3 + "”", "“" + Q1 + "”", "“" + Q2 + "”"];
  var ANSWER_POINTS = [[], Q1_POINTS, Q3_POINTS, null, Q2_POINTS];
  var WORD_MS = 160;   // per transcript word
  var DETECT_MS = 300; // transcript done -> question detected
  var THINK_MS = 500;  // Question detected -> Preparing answer
  var STAGE_MS = 450;  // interval between points (same as the demo)
  var PREP_MS = 150;   // interval between Prepare stages
  var timers = [];
  var playedBeats = {}; // beats whose timed sequence already ran once

  function clearTimers() {
    timers.forEach(function (t) { clearTimeout(t); });
    timers = [];
  }

  function setPill(text, state, live) {
    pillText.textContent = text;
    pill.classList.toggle("is-listening", state === "listening");
    pill.classList.toggle("is-thinking", state === "thinking");
    pill.classList.toggle("is-live", !!live);
  }

  function makeBullet(text) {
    var li = document.createElement("li");
    var dot = document.createElement("span");
    dot.className = "app-dot";
    dot.setAttribute("aria-hidden", "true");
    li.appendChild(dot);
    var span = document.createElement("span");
    span.textContent = text;
    li.appendChild(span);
    return li;
  }

  // Step 23 — fixed stage: every beat's question, answer and caption is
  // pre-rendered once, as a layer in one grid cell, and switching beats
  // reveals a layer instead of rebuilding content. The cell is always as
  // tall as its tallest layer, so the window — and everything below it —
  // never moves, at any width, zoom or font.
  var questionLayers = []; // one <p class="app-question"> per live beat
  var answerLayers = [];   // one layer per live beat; [3] is the coach node
  var answerBullets = [];  // per answer layer: its <li> bullets (coach: [])
  var captionItems = [];   // one <div class="story-caption-item"> per beat
  var captionTexts = [];   // per beat: { title, text } for the live region

  function hideAll(layers) {
    layers.forEach(function (el) { el.classList.add("is-hidden"); });
  }
  function showLayer(layers, i) {
    hideAll(layers);
    if (layers[i]) { layers[i].classList.remove("is-hidden"); }
  }

  function buildLayers() {
    QUESTION_TEXTS.forEach(function (text, i) {
      var p = document.createElement("p");
      p.className = "app-question" + (i === 0 ? " is-empty" : "");
      p.textContent = text;
      p.classList.add("is-hidden");
      questionStack.appendChild(p);
      questionLayers.push(p);
    });
    ANSWER_POINTS.forEach(function (points, i) {
      var layer;
      if (points === null) {
        // Coach beat: the coach markup is already in the stack (HTML); it
        // becomes layer 3 as-is — its visibility is the layer's.
        layer = coachEl;
        layer.classList.add("app-answer-layer");
        answerBullets.push([]);
      } else {
        layer = document.createElement("div");
        layer.className = "app-answer-layer";
        var ul = document.createElement("ul");
        ul.className = "app-answer";
        var lis = [];
        points.forEach(function (text) {
          var li = makeBullet(text);
          li.classList.add("is-hidden");
          ul.appendChild(li);
          lis.push(li);
        });
        layer.appendChild(ul);
        answerBullets.push(lis);
      }
      layer.classList.add("is-hidden");
      answerStack.appendChild(layer);
      answerLayers.push(layer);
    });
    steps.forEach(function (step) {
      var item = document.createElement("div");
      item.className = "story-caption-item is-hidden";
      var h3 = step.querySelector("h3");
      var p = step.querySelector("p");
      var title = h3 ? h3.textContent : "";
      var text = p ? p.textContent : "";
      var h = document.createElement("h3");
      h.textContent = title;
      item.appendChild(h);
      var t = document.createElement("p");
      t.textContent = text;
      item.appendChild(t);
      captionStack.appendChild(item);
      captionItems.push(item);
      captionTexts.push({ title: title, text: text });
    });
  }

  // The window has three bodies: Home (Beat 0), Live (Beats 1-5), Report
  // (Beat 6). The header follows: Home has a titled bar, Live/Report have
  // the status pill bar.
  // Step 23: views and headers are layers in a grid cell — toggling
  // visibility keeps the cell at its tallest height, so the window never
  // resizes when the beat changes.
  function showView(name) {
    homeHeader.classList.toggle("is-hidden", name !== "home");
    liveHeader.classList.toggle("is-hidden", name === "home");
    homeView.classList.toggle("is-hidden", name !== "home");
    liveView.classList.toggle("is-hidden", name !== "live");
    reportView.classList.toggle("is-hidden", name !== "report");
  }

  // A live beat is two layers: its question and its answer. Both are
  // pre-rendered; activating a beat shows its layers, nothing is rebuilt.
  function setQuestionLayer(i) { showLayer(questionLayers, i); }
  function setAnswerLayer(i) { showLayer(answerLayers, i); }

  // One bullet's state: "hidden" (reserved, not yet shown), "pending" (the
  // bullet being written — visible, faded), "new" (just landed, rises in),
  // anything else (settled, visible).
  function setBulletState(layerIdx, i, state) {
    var li = (answerBullets[layerIdx] || [])[i];
    if (!li) { return; }
    li.classList.toggle("is-hidden", state === "hidden");
    li.classList.toggle("is-pending", state === "pending");
    li.classList.toggle("is-new", state === "new");
  }
  function revealAllBullets(layerIdx) {
    (answerBullets[layerIdx] || []).forEach(function (li) {
      li.classList.remove("is-hidden");
      li.classList.remove("is-pending");
      li.classList.remove("is-new");
    });
  }

  function setLiveBase() {
    showView("live");
    startLabelEl.textContent = "Pause";
    badge.hidden = true;
    transcriptEl.textContent = "";
    contextEl.classList.add("is-hidden");
    thinkingEl.classList.add("is-hidden");
    hideAll(questionLayers);
    hideAll(answerLayers);
  }

  // Beat finals: each renders the beat's complete end state at once.
  var finals = {
    0: function () {
      showView("home");
      prepareBar.style.width = "100%";
      prepareStage.textContent = "Done — question bank ready (50–150 questions).";
      openLive.classList.remove("is-hidden");
    },
    1: function () {
      setLiveBase();
      setPill("Listening", "listening", true);
      setQuestionLayer(0);
      setAnswerLayer(0);
      metaEl.textContent = "";
      historyEl.hidden = true;
    },
    2: function () {
      setLiveBase();
      setPill("Answer ready", "listening", false);
      setQuestionLayer(1);
      setAnswerLayer(1);
      revealAllBullets(1);
      metaEl.textContent = "prepared";
      historyEl.hidden = false;
      historyText.textContent = "1 / 1";
    },
    3: function () {
      setLiveBase();
      setPill("Answer ready", "listening", false);
      badge.hidden = false;
      badge.textContent = "Concise";
      setQuestionLayer(2);
      setAnswerLayer(2);
      revealAllBullets(2);
      metaEl.textContent = "Concise";
      historyEl.hidden = false;
      historyText.textContent = "1 / 1";
    },
    4: function () {
      setLiveBase();
      setPill("Answer ready", "listening", false);
      setQuestionLayer(1);
      setAnswerLayer(3);
      metaEl.textContent = "Coach";
      historyEl.hidden = false;
      historyText.textContent = "1 / 1";
    },
    5: function () {
      setLiveBase();
      setPill("Answer ready", "listening", false);
      setQuestionLayer(4);
      contextEl.classList.remove("is-hidden");
      setAnswerLayer(4);
      revealAllBullets(4);
      metaEl.textContent = "prepared";
      historyEl.hidden = false;
      historyText.textContent = "2 / 2";
    },
    6: function () {
      showView("report");
      setPill("Stopped", "", false);
      startLabelEl.textContent = "Start listening";
      badge.hidden = true;
    }
  };

  // Beat 0, first activation: the fifteen Prepare stages tick by.
  function playPrepare() {
    showView("home");
    prepareBar.style.width = "0";
    openLive.classList.add("is-hidden");
    STAGES.forEach(function (name, i) {
      timers.push(setTimeout(function () {
        prepareStage.textContent = "Stage " + (i + 1) + " of 15 — " + name + "…";
        prepareBar.style.width = Math.round(((i + 1) / STAGES.length) * 100) + "%";
        if (i === STAGES.length - 1) {
          prepareStage.textContent = "Done — question bank ready (50–150 questions).";
          openLive.classList.remove("is-hidden");
        }
      }, i * PREP_MS));
    });
  }

  // Beat 2, first activation: the first question, live — transcript grows,
  // the question appears whole, the app thinks, the points stream in.
  function playQuestion() {
    setLiveBase();
    setPill("Listening", "listening", true);
    setQuestionLayer(0);
    setAnswerLayer(0);
    metaEl.textContent = "";
    historyEl.hidden = true;
    TRANSCRIPT.forEach(function (words, i) {
      timers.push(setTimeout(function () {
        transcriptEl.textContent = words;
      }, i * WORD_MS));
    });
    timers.push(setTimeout(function () {
      transcriptEl.textContent = "";
      setQuestionLayer(1);
      setPill("Question detected", "thinking", true);
      timers.push(setTimeout(function () {
        setPill("Preparing answer", "thinking", false);
        thinkingEl.classList.remove("is-hidden");
        setAnswerLayer(1);
        // The bullet being written shows faded until it lands: it is the
        // pre-rendered first bullet, revealed faded.
        setBulletState(1, 0, "pending");
        Q1_POINTS.forEach(function (text, i) {
          timers.push(setTimeout(function () {
            setBulletState(1, i, "new");
            if (i === 0) {
              thinkingEl.classList.add("is-hidden");
              metaEl.textContent = "prepared";
              historyEl.hidden = false;
              historyText.textContent = "1 / 1";
            }
            if (i === Q1_POINTS.length - 1) {
              setPill("Answer ready", "listening", false);
            }
          }, i * STAGE_MS));
        });
      }, THINK_MS));
    }, TRANSCRIPT.length * WORD_MS + DETECT_MS));
  }

  buildLayers();

  var currentBeat = 0;
  var playerOn = false;
  var desktopSetup = false;
  var playerSetup = false;

  // One beat's render: its final state, or its timed play the first time.
  function renderBeat(beat) {
    if (reduced) { finals[beat](); }
    else if (beat === 0 && !playedBeats[0]) { playedBeats[0] = true; playPrepare(); }
    else if (beat === 2 && !playedBeats[2]) { playedBeats[2] = true; playQuestion(); }
    else { finals[beat](); }
  }

  // Player only (Step 24): glide the window's height to the new beat's
  // natural height (300ms, the standard curve). The window is fluid in
  // player mode (inactive views are display:none), so its height is the
  // active view's height. The render + measure happen synchronously
  // before the next paint, so the user never sees the intermediate
  // states — only the smooth glide. The inline height is cleared after
  // the transition so the window is fluid again (robust to font swap /
  // resize / zoom). Desktop keeps the fixed stage: no height animation
  // on scroll, where a shift would count as layout shift.
  var glideToken = 0;
  function glideRender(beat) {
    if (!storyWindow) { renderBeat(beat); return; }
    var token = ++glideToken;
    var h0 = storyWindow.offsetHeight;
    storyWindow.style.transition = "none";
    renderBeat(beat);
    var h1 = storyWindow.offsetHeight;
    if (h1 === h0) {
      // Same height: no animation, and no inline height to keep.
      storyWindow.style.height = "";
      storyWindow.style.transition = "";
      return;
    }
    storyWindow.style.height = h0 + "px";
    void storyWindow.offsetHeight; // register the starting height
    storyWindow.style.transition = "";
    storyWindow.style.height = h1 + "px";
    setTimeout(function () {
      if (token !== glideToken) { return; } // superseded by a newer glide
      storyWindow.style.height = "";
    }, 350);
  }

  function activate(beat) {
    clearTimers();
    // The window only renders while it is displayed (desktop, motion ok,
    // or the mobile player); otherwise the snapshots carry the story.
    if (storyWindow && getComputedStyle(storyWindow).display === "none") { return; }
    currentBeat = beat;
    steps.forEach(function (s) {
      s.classList.toggle("is-active", Number(s.getAttribute("data-beat")) === beat);
    });
    if (playerOn && !reduced) { glideRender(beat); }
    else { renderBeat(beat); }
    if (playerOn) { setPlayerUI(beat); }
  }

  // The player chrome mirrors the current beat: segments, caption, counter.
  function setPlayerUI(beat) {
    segBtns.forEach(function (btn, i) {
      btn.classList.toggle("is-active", i === beat);
      btn.classList.toggle("is-done", i < beat);
      if (i === beat) { btn.setAttribute("aria-current", "true"); }
      else { btn.removeAttribute("aria-current"); }
    });
    showLayer(captionItems, beat);
    var caption = captionTexts[beat];
    if (captionLive && caption) {
      captionLive.textContent = caption.title + (caption.text ? " " + caption.text : "");
    }
    if (countEl) { countEl.textContent = (beat + 1) + " / " + steps.length; }
    if (prevBtn) { prevBtn.disabled = beat === 0; }
    if (nextBtn) { nextBtn.disabled = beat === steps.length - 1; }
  }

  function goBeat(i) {
    if (i < 0) { i = 0; }
    if (i > steps.length - 1) { i = steps.length - 1; }
    activate(i);
  }

  // Desktop: a beat activates as it crosses the middle 20% of the viewport.
  function setupDesktop() {
    if (desktopSetup || reduced || !hasIO) { return; }
    desktopSetup = true;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          activate(Number(entry.target.getAttribute("data-beat")));
        }
      });
    }, { rootMargin: "-40% 0px -40% 0px", threshold: 0 });
    steps.forEach(function (s) { io.observe(s); });
  }

  // Mobile (Step 22): the swipeable player. Tap a segment, tap ‹ ›, swipe
  // the window, or use arrow keys on the segments. Vertical swipes scroll
  // the page (the window has touch-action: pan-y); only a horizontal swipe
  // past 40px changes the beat. Direction-locked, no scroll-jacking.
  function setupPlayer() {
    if (playerSetup) { return; }
    playerSetup = true;
    segBtns.forEach(function (btn, i) {
      btn.addEventListener("click", function () { goBeat(i); });
    });
    if (prevBtn) { prevBtn.addEventListener("click", function () { goBeat(currentBeat - 1); }); }
    if (nextBtn) { nextBtn.addEventListener("click", function () { goBeat(currentBeat + 1); }); }
    if (segWrap) {
      segWrap.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") { goBeat(currentBeat - 1); }
        if (e.key === "ArrowRight") { goBeat(currentBeat + 1); }
      });
    }
    var touchX = null;
    storyWindow.addEventListener("touchstart", function (e) {
      if (!playerOn || !e.changedTouches || !e.changedTouches.length) { return; }
      touchX = e.changedTouches[0].clientX;
    }, { passive: true });
    storyWindow.addEventListener("touchend", function (e) {
      if (!playerOn || touchX === null || !e.changedTouches || !e.changedTouches.length) { return; }
      var dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) > 40) { goBeat(currentBeat + (dx < 0 ? 1 : -1)); }
    }, { passive: true });
  }

  // Narrow mode is read from the CSS, not from a width in JS: the snapshots
  // are display:none on desktop and display:block at <=860px, so the probe's
  // computed display IS the breakpoint (Step 15: JS has no width logic).
  // A resize re-reads it (fold/unfold, rotate).
  function isNarrow() {
    return !!snapProbe && getComputedStyle(snapProbe).display !== "none";
  }

  // One story, two modes: the player on narrow screens, the scroll story
  // on wide ones. Switching (fold/unfold, rotate, resize) keeps the beat.
  function applyMode() {
    if (isNarrow()) {
      if (!playerOn) {
        playerOn = true;
        document.documentElement.classList.add("story-player");
        setupPlayer();
        activate(currentBeat);
      }
    } else {
      if (playerOn) {
        playerOn = false;
        document.documentElement.classList.remove("story-player");
      }
      setupDesktop();
    }
  }
  window.addEventListener("resize", applyMode);
  applyMode();
})();

/* Step 1 — scroll reveal + header shadow. Elements get .reveal via JS
   (no-JS keeps everything visible); reduced motion shows all at once.
   Fixed after live-browser re-check: the old reveal started at opacity
   .35 with a .45s transition and up to 140ms stagger, so sections sat
   visibly dimmed for seconds after scrolling in. The new reveal starts
   at .85, runs .25s, staggers at most 40ms, triggers earlier, and the
   hero is never dimmed at all — it must be fully bright on first paint. */
(function () {
  "use strict";
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) { header.classList.toggle("is-scrolled", window.scrollY > 8); }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js");
  // Hero (.hero-copy, .hero-visual) is deliberately NOT a reveal target:
  // it must be fully bright on load, with no dim phase at all.
  var targets = document.querySelectorAll(
    ".card, .callout, .table-wrap, .ethics-strip, " +
    ".pipe-list li, .tl-item, .acc-item, .trouble-card, .vs-col, .roadmap-node, " +
    ".flow-node, .flow-break, .meter-card, .installer, .lang-card, .req-item"
  );
  if (!targets.length) { return; }
  if (reduced || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }
  function show(el) {
    el.classList.add("is-visible");
    // Hand control back to the element's own hover transition once done.
    // Transition is .25s + at most 40ms stagger, so 400ms is ample.
    setTimeout(function () {
      el.classList.remove("reveal");
      el.style.transitionDelay = "";
    }, 400);
  }
  // Stagger siblings: at most 2 steps of 40 ms, so the last element in a
  // row is fully bright within ~0.3s of entering view.
  var groups = {};
  targets.forEach(function (el) {
    var parent = el.parentElement;
    var key = parent.tagName + ":" + Array.prototype.indexOf.call(parent.parentElement ? parent.parentElement.children : [], parent);
    if (!groups[key]) { groups[key] = 0; }
    el.style.transitionDelay = (groups[key] % 2) * 40 + "ms";
    groups[key]++;
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        show(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: "0px 0px -16px 0px" });
  targets.forEach(function (el) {
    el.classList.add("reveal");
    // Already in view on load: show in the same tick, before first paint,
    // so there is no dim flash while waiting for the observer's first
    // (async) callback.
    var r = (typeof el.getBoundingClientRect === "function")
      ? el.getBoundingClientRect() : null;
    if (r && r.top < window.innerHeight && r.bottom > 0) {
      show(el);
    } else {
      io.observe(el);
    }
  });
})();

/* Step 2 — plan finder (pricing.html only). Recommends Trial or Pro from
   the real plan limits only: Trial 30 lifetime minutes / 1 profile /
   2 preparation runs a month / 1 device; Pro 600 minutes per billing
   period / 3 profiles / 20 preparation runs a month / 2 devices.
   Pro's USD 19.99/month is a Paddle sandbox reference price. */
(function () {
  "use strict";
  var form = document.getElementById("plan-finder");
  var result = document.getElementById("finder-result");
  if (!form || !result) { return; }

  function val(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : null;
  }

  function update() {
    var interviews = val("pf-interviews");
    var profiles = val("pf-profiles");
    var devices = val("pf-devices");
    var prep = val("pf-prep");
    if (!interviews || !profiles || !devices || !prep) {
      result.innerHTML = "<p>Answer all four questions to see a recommendation.</p>";
      return;
    }
    var reasons = [];
    var plan = "trial";
    if (interviews === "2-4") {
      plan = "pro";
      reasons.push("<strong>2–4 interviews a month</strong> will use the Trial\u2019s 30 lifetime minutes quickly — those minutes are lifetime, not monthly.");
    } else if (interviews === "5+") {
      plan = "pro";
      reasons.push("<strong>5 or more interviews a month</strong> will use the Trial\u2019s 30 lifetime minutes in the first month or two.");
    }
    if (profiles === "2-3") {
      plan = "pro";
      reasons.push("<strong>You need 2–3 profiles</strong> — Trial allows 1, Pro allows 3.");
    } else if (profiles === "4+") {
      plan = "pro";
      reasons.push("<strong>You need 4 or more profiles</strong> — neither plan covers that; Pro allows 3, Trial allows 1. Pro is the closest fit.");
    }
    if (devices === "2") {
      plan = "pro";
      reasons.push("<strong>You need 2 devices</strong> — Trial allows 1, Pro allows 2.");
    }
    // Step 5 — preparation runs are their own quota: a light interviewer
    // who prepares heavily hits the Trial's 2 runs a month fast.
    if (prep === "3-20") {
      plan = "pro";
      reasons.push("<strong>3–20 preparation runs a month</strong> — Trial allows 2, Pro allows 20.");
    } else if (prep === "21+") {
      plan = "pro";
      reasons.push("<strong>21 or more preparation runs a month</strong> — neither plan covers that; Pro allows 20, Trial allows 2. Pro is the closest fit.");
    }
    if (plan === "trial") {
      reasons.push("<strong>0–1 interviews a month</strong> — 30 lifetime minutes should last a while.");
      reasons.push("<strong>1 profile</strong> — Trial allows 1.");
      reasons.push("<strong>1 device</strong> — Trial allows 1.");
      reasons.push("<strong>0–2 preparation runs a month</strong> — Trial allows 2.");
      result.innerHTML =
        "<h3>Trial fits you — for now</h3>" +
        "<ul><li>" + reasons.join("</li><li>") + "</li></ul>" +
        "<p>Try the live demo to see it work, and start free in the app when " +
        "the installer ships — the Trial is included. Move to Pro when you need " +
        "more minutes, profiles, preparation runs, or a second device — Pro is " +
        "USD 19.99/month, sandbox reference price, final live price to be confirmed.</p>";
    } else {
      result.innerHTML =
        "<h3>Pro fits you</h3>" +
        "<ul><li>" + reasons.join("</li><li>") + "</li></ul>" +
        "<p>Pro gives you 600 live minutes per billing period, 3 profiles, " +
        "20 preparation runs a month, and 2 devices. Pro is USD 19.99/month — " +
        "a Paddle sandbox reference price; the final live price will be " +
        "confirmed before paid checkout opens, and there is no checkout on " +
        "this website yet.</p>";
    }
  }

  form.addEventListener("change", update);
  update();
})();

/* Step 2 — minutes calculator (pricing.html only). Interviews/month x
   average live minutes per interview, compared with the real limits:
   Trial 30 lifetime minutes; Pro 600 per billing period (assuming a
   monthly billing period). Preparation, practise and reports use no
   live minutes. Single live sessions are capped at 120 minutes. */
(function () {
  "use strict";
  var interviewsEl = document.getElementById("calc-interviews");
  var avgEl = document.getElementById("calc-minutes");
  var outI = document.getElementById("calc-interviews-out");
  var outA = document.getElementById("calc-minutes-out");
  var result = document.getElementById("calc-result");
  if (!interviewsEl || !avgEl || !outI || !outA || !result) { return; }

  function update() {
    var n = +interviewsEl.value;
    var m = +avgEl.value;
    outI.textContent = String(n);
    outA.textContent = String(m);
    var need = n * m;
    var html = "<p><strong>You would need about " + need +
      " live minutes a month</strong> (assuming a monthly billing period).</p>";
    if (need === 0) {
      html += "<p>The Trial\u2019s 30 lifetime live minutes cover that.</p>";
    } else {
      var trialFull = Math.floor(30 / m);
      if (trialFull < 1) {
        html += "<p><strong>Trial (30 lifetime minutes):</strong> covers less than one " +
          "full interview of " + m + " minutes — then live listening stops until " +
          "you move to Pro.</p>";
      } else {
        html += "<p><strong>Trial (30 lifetime minutes):</strong> covers about " +
          trialFull + " interview" + (trialFull === 1 ? "" : "s") + " of " + m +
          " minutes — then live listening stops until you move to Pro.</p>";
      }
      if (need <= 600) {
        html += "<p><strong>Pro (600 minutes per billing period):</strong> covers this " +
          "with " + (600 - need) + " minutes to spare.</p>";
      } else {
        html += "<p><strong>Pro (600 minutes per billing period):</strong> does not " +
          "cover " + need + " minutes a month — you would need to plan around " +
          "the 600-minute allowance.</p>";
      }
    }
    if (m >= 120) {
      html += "<p>Note: a single live session is capped at 120 minutes.</p>";
    }
    html += "<p class=\"calc-note\">Preparation, practise, and reading reports " +
      "use no live minutes.</p>";
    result.innerHTML = html;
  }

  interviewsEl.addEventListener("input", update);
  avgEl.addEventListener("input", update);
  update();
})();

/* Step 2 — sticky CTA bar. Appears only after scrolling past the hero,
   dismissible for the session. Never shown on download.html (no bar markup
   there). No focus is stolen when it appears; reduced motion shows it
   statically. */
(function () {
  "use strict";
  var bar = document.getElementById("sticky-cta");
  if (!bar) { return; }
  var dismissed = false;
  try { dismissed = window.sessionStorage.getItem("ia-sticky-dismissed") === "1"; } catch (e) {}
  // Never cover the footer: hide the bar while the footer is in view.
  // (The body bottom-padding reserve alone was not enough when the bar
  // wrapped to two lines at narrower widths.)
  var footerEl = document.querySelector(".site-footer");
  var footerInView = false;
  if (footerEl && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      footerInView = entries[0].isIntersecting;
      update();
    }, { threshold: 0.05 }).observe(footerEl);
  }
  function update() {
    var show = !dismissed && window.scrollY > 560 && !footerInView;
    bar.hidden = !show;
    document.body.classList.toggle("cta-visible", show);
  }
  window.addEventListener("scroll", update, { passive: true });
  var close = document.getElementById("sticky-cta-close");
  if (close) {
    close.addEventListener("click", function () {
      dismissed = true;
      try { window.sessionStorage.setItem("ia-sticky-dismissed", "1"); } catch (e) {}
      update();
    });
  }
  update();
})();

/* Step 3 — FAQ accordion (support.html only). Smooth open/close with
   aria-expanded; keyboard accessible (native buttons). Progressive
   enhancement: without JS the panels stay visible (the js-acc class is
   only added by JS, and only then does CSS collapse the panels).
   Reduced motion: the global prefers-reduced-motion rule kills the
   grid-template-rows transition, so panels open instantly. */
(function () {
  "use strict";
  var items = document.querySelectorAll(".acc-item");
  if (!items.length) { return; }
  document.documentElement.classList.add("js-acc");
  items.forEach(function (item) {
    var btn = item.querySelector(".acc-btn");
    var panel = item.querySelector(".acc-panel");
    if (!btn || !panel) { return; }
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
  });
})();
