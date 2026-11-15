/* Interview Assistant — demo logic (simulated, local only).
   No audio, no microphone, no network. Sample answers are illustrative:
   in the real app, points are built from the user's confirmed facts and
   their prepared question bank. */

(function () {
  "use strict";

  var answerEl = document.getElementById("demo-answer");
  var questionEl = document.getElementById("demo-question");
  var statusEl = document.getElementById("demo-status");
  var inputEl = document.getElementById("demo-input");
  var formEl = document.getElementById("demo-form");
  var modeAnswerBtn = document.getElementById("mode-answer");
  var modeCoachBtn = document.getElementById("mode-coach");

  var mode = "answer"; // "answer" | "coach"
  var currentKey = "tell";
  var currentQuestion = "Tell me about yourself.";
  var timers = [];

  // Sample content. Grounded in the app's core question bank (intro,
  // why-hire, weakness, behavioural story, five years). Bullets are
  // illustrative samples, not the user's own facts.
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
      answer: [
        "با نقش فعلی‌ام شروع می‌کنم و یک نتیجه مشخص را می‌گویم.",
        "بعد یک مثال واقعی از تجربه‌ام می‌آورم، نه حرف کلی.",
        "در پایان می‌گویم چرا این نقش برایم مناسب است."
      ],
      coach: {
        keys: ["تجربه", "نتیجه", "تناسب"],
        structure: "نقش فعلی ← یک نتیجه ← چرا این نقش"
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

  function clearTimers() {
    timers.forEach(function (t) { clearTimeout(t); });
    timers = [];
  }

  function setStatus(text) { statusEl.textContent = text; }

  function renderBullets(items, isCoach, rtl) {
    answerEl.innerHTML = "";
    answerEl.classList.toggle("coach", !!isCoach);
    answerEl.dir = rtl ? "rtl" : "ltr";
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    items.forEach(function (text, i) {
      var li = document.createElement("li");
      if (!reduced) {
        // Stagger: bullets appear one at a time, like the real app.
        timers.push(setTimeout(function () {
          li.classList.add("is-new");
        }, i * 180));
      }
      var num = document.createElement("span");
      num.className = "num";
      num.setAttribute("aria-hidden", "true");
      num.textContent = String(i + 1);
      li.appendChild(num);
      var span = document.createElement("span");
      span.textContent = text;
      li.appendChild(span);
      answerEl.appendChild(li);
    });
  }

  function renderCoach(coach, rtl) {
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
    answerEl.innerHTML = "";
    answerEl.classList.add("coach");
    answerEl.dir = rtl ? "rtl" : "ltr";
    answerEl.appendChild(keys);
    answerEl.appendChild(structure);
  }

  function showAnswer(key, questionText, sample) {
    clearTimers();
    currentKey = key;
    currentQuestion = questionText;
    questionEl.textContent = "“" + questionText + "”";
    questionEl.dir = sample && sample.rtl ? "rtl" : "ltr";
    questionEl.lang = sample && sample.rtl ? "fa" : "en";
    answerEl.innerHTML = "";
    setStatus("Preparing your points…");
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var delay = reduced ? 0 : 600;
    timers.push(setTimeout(function () {
      setStatus("");
      if (mode === "coach") {
        var coach = sample ? sample.coach : FALLBACK.coach;
        renderCoach(coach, !!(sample && sample.rtl));
      } else {
        var items = sample ? sample.answer : FALLBACK.answer;
        renderBullets(items, false, !!(sample && sample.rtl));
      }
      if (!sample) {
        setStatus("Sample structure — in the real app, points come from your confirmed facts.");
      }
    }, delay));
  }

  function setMode(next) {
    mode = next;
    var coach = next === "coach";
    modeAnswerBtn.classList.toggle("is-active", !coach);
    modeCoachBtn.classList.toggle("is-active", coach);
    modeCoachBtn.classList.toggle("is-coach-active", coach);
    modeAnswerBtn.setAttribute("aria-pressed", String(!coach));
    modeCoachBtn.setAttribute("aria-pressed", String(coach));
    var sample = SAMPLES[currentKey] || null;
    showAnswer(currentKey, currentQuestion, sample);
  }

  modeAnswerBtn.addEventListener("click", function () { setMode("answer"); });
  modeCoachBtn.addEventListener("click", function () { setMode("coach"); });

  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      var key = chip.getAttribute("data-q");
      var sample = SAMPLES[key];
      if (sample) showAnswer(key, sample.q, sample);
      inputEl.value = "";
    });
  });

  formEl.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = inputEl.value.trim();
    if (!text) {
      setStatus("Type a question, or pick a sample below.");
      inputEl.focus();
      return;
    }
    // No sample match: show the honest generic structure, not a fake answer.
    showAnswer("typed", text, null);
  });

  document.getElementById("try-demo-link").addEventListener("click", function () {
    setTimeout(function () { inputEl.focus(); }, 400);
  });

  // Download buttons (draft): no installer yet — say so, don't 404.
  var note = document.getElementById("download-note");
  ["dl-installer", "dl-portable"].forEach(function (id) {
    var btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener("click", function () {
        note.textContent = "Downloads open with the first signed release — this draft has no installer yet. Check back soon.";
        note.focus && note.focus();
      });
    }
  });

  // Notify-me form (draft): no backend — say so, don't silently discard.
  var notifyForm = document.getElementById("notify-form");
  var notifyNote = document.getElementById("notify-note");
  notifyForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = document.getElementById("notify-email").value.trim();
    if (!email) return;
    notifyNote.textContent = "Thanks — this is a demo form, so nothing was sent. The real waitlist opens at launch.";
  });

  // Mobile nav.
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
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

  // Initial state: default sample, bullets visible on load.
  showAnswer("tell", SAMPLES.tell.q, SAMPLES.tell);
})();
