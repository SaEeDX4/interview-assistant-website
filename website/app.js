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

  var answerEl = document.getElementById("demo-answer");
  var questionEl = document.getElementById("demo-question");
  var statusEl = document.getElementById("demo-status");
  var sampleTagEl = document.getElementById("demo-sample-tag");
  var inputEl = document.getElementById("demo-input");
  var formEl = document.getElementById("demo-form");
  var modeAnswerBtn = document.getElementById("mode-answer");
  var modeCoachBtn = document.getElementById("mode-coach");

  // Guard against missing nodes: a missing demo must not throw on load.
  if (!answerEl || !questionEl || !statusEl || !inputEl || !formEl ||
      !modeAnswerBtn || !modeCoachBtn) {
    return;
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
  var nextEl = document.getElementById("demo-next");
  function showDemoNext() {
    if (!nextEl) { return; }
    var titleEl = document.getElementById("demo-next-title");
    var textEl = document.getElementById("demo-next-text");
    if (titleEl) {
      titleEl.textContent = mode === "coach"
        ? "You just saw the Coach keywords — now try it with your own resume."
        : "You just saw 3 points — now try it with your own resume.";
    }
    if (textEl) {
      textEl.textContent = mode === "coach"
        ? "The demo used sample answers. In the real app, the same Coach keywords and structure are built from your confirmed resume facts and your prepared question bank."
        : "The demo used sample answers. In the real app, the same three points are built from your confirmed resume facts and your prepared question bank.";
    }
    nextEl.hidden = false;
  }

  function makeBullet(text, i) {
    var li = document.createElement("li");
    var num = document.createElement("span");
    num.className = "num";
    num.setAttribute("aria-hidden", "true");
    num.textContent = String(i + 1);
    li.appendChild(num);
    var span = document.createElement("span");
    span.textContent = text;
    li.appendChild(span);
    return li;
  }

  function finishRender(myRun, statusText) {
    if (myRun !== runId) { return; }
    answerEl.setAttribute("aria-busy", "false");
    setStatus(statusText);
    showDemoNext();
  }

  // Answer mode: exactly 3 bullets, inserted one at a time into the DOM.
  // At t=0/400/800 ms after render starts, visible counts are 1/2/3.
  // Reduced motion: all three at once, nothing hidden.
  function renderBullets(items, rtl, lang, myRun) {
    answerEl.innerHTML = "";
    answerEl.classList.remove("coach");
    answerEl.dir = rtl ? "rtl" : "ltr";
    answerEl.lang = lang || (rtl ? "fa" : "en");
    answerEl.setAttribute("aria-busy", "true");
    if (isReducedMotion()) {
      items.forEach(function (text, i) {
        answerEl.appendChild(makeBullet(text, i));
      });
      finishRender(myRun, "3 points ready.");
      return;
    }
    items.forEach(function (text, i) {
      timers.push(setTimeout(function () {
        if (myRun !== runId) { return; }
        var li = makeBullet(text, i);
        li.classList.add("is-new");
        answerEl.appendChild(li);
        if (i === items.length - 1) {
          finishRender(myRun, "3 points ready.");
        }
      }, i * STAGE_MS));
    });
  }

  // Coach mode: exactly 3 keywords, then 1 structure line, staged.
  function renderCoach(coach, rtl, lang, myRun) {
    answerEl.innerHTML = "";
    answerEl.classList.add("coach");
    answerEl.dir = rtl ? "rtl" : "ltr";
    answerEl.lang = lang || (rtl ? "fa" : "en");
    answerEl.setAttribute("aria-busy", "true");

    var keys = document.createElement("li");
    var num = document.createElement("span");
    num.className = "num";
    num.setAttribute("aria-hidden", "true");
    num.textContent = "✓";
    keys.appendChild(num);
    var k = document.createElement("span");
    k.className = "coach-keys";
    k.textContent = coach.keys.join(" · ");
    keys.appendChild(k);

    var structure = document.createElement("li");
    var num2 = document.createElement("span");
    num2.className = "num";
    num2.setAttribute("aria-hidden", "true");
    num2.textContent = "→";
    structure.appendChild(num2);
    var s = document.createElement("span");
    s.textContent = coach.structure;
    structure.appendChild(s);

    if (isReducedMotion()) {
      answerEl.appendChild(keys);
      answerEl.appendChild(structure);
      finishRender(myRun, "Coach points ready.");
      return;
    }
    timers.push(setTimeout(function () {
      if (myRun !== runId) { return; }
      keys.classList.add("is-new");
      answerEl.appendChild(keys);
    }, 0));
    timers.push(setTimeout(function () {
      if (myRun !== runId) { return; }
      structure.classList.add("is-new");
      answerEl.appendChild(structure);
      finishRender(myRun, "Coach points ready.");
    }, STAGE_MS));
  }

  function showAnswer(key, questionText, sample) {
    clearTimers();
    var myRun = ++runId;
    currentKey = key;
    currentQuestion = questionText;
    questionEl.textContent = "“" + questionText + "”";
    questionEl.dir = sample && sample.rtl ? "rtl" : "ltr";
    questionEl.lang = sample && sample.lang ? sample.lang : "en";
    answerEl.innerHTML = "";
    answerEl.setAttribute("aria-busy", "true");
    // Lively staging state: three skeleton lines so the answer area never
    // looks dead while the first point is prepared. Reduced motion skips
    // the skeleton (the full answer renders immediately instead).
    if (!isReducedMotion()) {
      for (var s = 0; s < 3; s++) {
        var sk = document.createElement("li");
        sk.className = "skel";
        sk.setAttribute("aria-hidden", "true");
        answerEl.appendChild(sk);
      }
    }
    if (sample) {
      sampleTagEl.textContent = "Illustrative sample — in the real app, points come from your confirmed facts.";
      sampleTagEl.hidden = false;
    } else {
      sampleTagEl.hidden = true;
    }
    setStatus("Preparing your points…");
    var lang = sample && sample.lang ? sample.lang : "en";
    var delay = isReducedMotion() ? 0 : 120;
    timers.push(setTimeout(function () {
      if (myRun !== runId) { return; }
      if (mode === "coach") {
        var coach = sample ? sample.coach : FALLBACK.coach;
        renderCoach(coach, !!(sample && sample.rtl), lang, myRun);
      } else {
        var items = sample ? sample.answer : FALLBACK.answer;
        renderBullets(items, !!(sample && sample.rtl), lang, myRun);
      }
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
    var intTimers = [];
    var intRun = 0;
    function showInt(key, label) {
      intTimers.forEach(function (t) { clearTimeout(t); });
      intTimers = [];
      var myRun = ++intRun;
      intAnswer.innerHTML = "";
      intAnswer.classList.remove("coach");
      intStatus.textContent = "Preparing the shorter version…";
      var items = INT[key];
      intBtns.forEach(function (b, i) {
        b.setAttribute("aria-pressed", String(["normal", "concise", "rapid"][i] === key));
      });
      if (intState) { intState.textContent = label.replace(" (", " — ").replace(")", ""); }
      if (isReducedMotion()) {
        items.forEach(function (text, i) { intAnswer.appendChild(makeBullet(text, i)); });
        intStatus.textContent = label + " ready — simulated.";
        return;
      }
      items.forEach(function (text, i) {
        intTimers.push(setTimeout(function () {
          if (myRun !== intRun) { return; }
          var li = makeBullet(text, i);
          li.classList.add("is-new");
          intAnswer.appendChild(li);
          if (i === items.length - 1) {
            intStatus.textContent = label + " ready — simulated.";
          }
        }, i * STAGE_MS));
      });
    }
    intBtns[0].addEventListener("click", function () { showInt("normal", "Normal (3 points)"); });
    intBtns[1].addEventListener("click", function () { showInt("concise", "Concise (2 points)"); });
    intBtns[2].addEventListener("click", function () { showInt("rapid", "Rapid (1 line)"); });
    showInt("normal", "Normal (3 points)");
  }

  // Initial state: default sample, bullets staged on load.
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

/* Step 1 — hero app-window preview animator (visual only; the real
   interactive demo is the #demo panel). Cycles the three sample points
   one at a time, pauses, then replays. Reduced motion: static. */
(function () {
  "use strict";
  var list = document.getElementById("mock-answer");
  var status = document.getElementById("mock-status");
  if (!list || !status) { return; }

  var POINTS = [
    "Five years building web products — most recently leading a small team.",
    "I start from the outcome, then the trade-off I made to get there.",
    "What draws me here is this team’s focus on honest, useful software."
  ];
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var timers = [];

  // Clear every pending mockup timer. A cycle must never run twice at
  // once: without this, a visibilitychange back to visible started a
  // second cycle alongside the first and every point rendered twice
  // (rows numbered 1, 1, 2, 2, 3, 3), and both loops then replayed
  // forever because each cycle schedules its own next run.
  function clearTimers() {
    timers.forEach(function (t) { clearTimeout(t); });
    timers = [];
  }

  function makeBullet(text, i) {
    var li = document.createElement("li");
    var num = document.createElement("span");
    num.className = "num";
    num.setAttribute("aria-hidden", "true");
    num.textContent = String(i + 1);
    li.appendChild(num);
    var span = document.createElement("span");
    span.textContent = text;
    li.appendChild(span);
    return li;
  }

  function renderAll() {
    clearTimers();
    list.innerHTML = "";
    POINTS.forEach(function (text, i) { list.appendChild(makeBullet(text, i)); });
    status.textContent = "3 points ready — preview.";
  }

  if (reduced) { renderAll(); return; }

  function cycle() {
    clearTimers();
    list.innerHTML = "";
    status.textContent = "Listening…";
    POINTS.forEach(function (text, i) {
      timers.push(setTimeout(function () {
        var li = makeBullet(text, i);
        li.classList.add("is-new");
        list.appendChild(li);
        if (i === POINTS.length - 1) {
          status.textContent = "3 points ready — preview.";
        }
      }, 500 + i * 450));
    });
    timers.push(setTimeout(cycle, 500 + (POINTS.length - 1) * 450 + 4200));
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      clearTimers();
    } else {
      cycle();
    }
  });

  // Pause when scrolled off-screen: the mockup timer used to keep running
  // whenever the hero was out of view (only tab-visibility paused it).
  // IntersectionObserver pauses it and resumes the cycle on return.
  var visual = list.closest ? list.closest(".hero-visual") : null;
  if (visual && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        cycle();
      } else {
        clearTimers();
      }
    }, { threshold: 0 }).observe(visual);
  }

  cycle();
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
    ".card, .steps li, details, .callout, .table-wrap, .ethics-strip, " +
    ".pipe-phase, .tl-item, .acc-item, .trouble-card, .vs-col, .roadmap-node, " +
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
   1 device; Pro 600 minutes per billing period / 3 profiles / 2 devices.
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
    if (!interviews || !profiles || !devices) {
      result.innerHTML = "<p>Answer all three questions to see a recommendation.</p>";
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
    if (plan === "trial") {
      reasons.push("<strong>0–1 interviews a month</strong> — 30 lifetime minutes should last a while.");
      reasons.push("<strong>1 profile</strong> — Trial allows 1.");
      reasons.push("<strong>1 device</strong> — Trial allows 1.");
      result.innerHTML =
        "<h3>Trial fits you — for now</h3>" +
        "<ul><li>" + reasons.join("</li><li>") + "</li></ul>" +
        "<p>Start free in the app. Move to Pro when you need more minutes, " +
        "profiles, or a second device — Pro is USD 19.99/month, sandbox " +
        "reference price, final live price to be confirmed.</p>";
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
   hides while the download section is in view, dismissible for the
   session. Never shown on download.html (no bar markup there). No
   focus is stolen when it appears; reduced motion shows it statically. */
(function () {
  "use strict";
  var bar = document.getElementById("sticky-cta");
  if (!bar) { return; }
  var dismissed = false;
  try { dismissed = window.sessionStorage.getItem("ia-sticky-dismissed") === "1"; } catch (e) {}
  var downloadEl = document.getElementById("download");
  var downloadInView = false;
  if (downloadEl && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      downloadInView = entries[0].isIntersecting;
      update();
    }, { threshold: 0.05 }).observe(downloadEl);
  }
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
    var show = !dismissed && window.scrollY > 560 && !downloadInView && !footerInView;
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
