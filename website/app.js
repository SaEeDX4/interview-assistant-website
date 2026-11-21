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
   - The completed answer is announced once, via the status line.
   Scope note: this header documents the demo module. app.js also
   carries the hero and story players, pricing tools, sticky bar, FAQ,
   growth announcements, and the download module further down. */

/* Step 30 — shared prepared content, at file scope so the demo and the
   hero read the same bank. The samples are illustrative (built from the
   app's core question bank, never a real user's facts); the variants
   follow the app's own style specs (see IA_VARIANTS' header comment).
   Prepared content is the cost strategy: the ten questions, every chip
   variant and every Regenerate alternate are answered locally, with no
   AI call at all. The AI is spent only on a question nobody prepared. */
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

// The AI endpoint for typed questions that match no prepared sample:
// the deployed AI proxy (Step 30). If this were empty, those questions
// would get the guidance answer (FALLBACK) instead of a live answer.
// The OpenAI key lives ONLY in the proxy — never in this file, never
// in the browser.
var IA_AI_ENDPOINT = "https://interview-assistant-ai-website.saeed-sharifzadeh91.workers.dev";
var IA_RELEASES_ENDPOINT = "https://admin.cybervalida.online/manifest";

/* The one AI request core, shared by the demo and the hero (it
   replaces the two near-identical inline copies). One controller
   per request, captured at creation; a 15s timeout aborts through
   the capture; on settle the caller's handle is nulled only if it
   still points at this request — the Step 40 rule: a superseded
   request never nulls or aborts its successor's handle.
   getHandle/setHandle adapt each caller's own handle variable;
   onData/onFail keep each caller's rendering and its run/flow
   guard. A throw inside onData (the empty-bullets "shape" guard)
   lands in onFail, exactly as the inline chains behaved. */
function iaFetchAI(question, style, getHandle, setHandle, onData, onFail) {
  var ctl = ("AbortController" in window) ? new AbortController() : null;
  setHandle(ctl);
  var onTimeout = function () { ctl.abort(); };
  var timeout = ctl ? setTimeout(onTimeout, 15000) : null;
  function settle() {
    if (timeout) { clearTimeout(timeout); }
    if (getHandle() === ctl) { setHandle(null); }
  }
  function onRejected() {
    settle();
    onFail();
  }
  fetch(IA_AI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: question, style: style }),
    signal: ctl ? ctl.signal : undefined
  }).then(function (res) {
    if (!res.ok) { throw new Error("endpoint"); }
    return res.json();
  }).then(function (data) {
    settle();
    onData(data);
  }).catch(onRejected);
}

// Step 30 — prepared answer variants for the hero, authored to the source
// app's own style specs (AnswerStyleSpec): Shorter = VeryShort (2-3 bullets,
// 8-16 words each, 25-45 total); Technical = 3-4 bullets, 12-24 words each,
// 50-90 total, naming mechanisms; Example = 3 bullets, 12-22 words each,
// 40-80 total, ONE concrete example; Full = ONE spoken paragraph, 90-130
// words, no bullets; Regenerate = a fresh Balanced set (exactly 3 bullets,
// 10-22 words each, 35-75 total). Every bullet is one speakable first-person
// sentence, and every variant stays inside its sample's stated facts.
var IA_VARIANTS = {
  tell: {
    shorter: [
      "Five years building web products, most recently leading a small customer-facing team.",
      "I work outcome-first, trade-offs explicit — drawn to this team’s honest, useful software."
    ],
    technical: [
      "Five years building web products — currently leading a small team shipping a customer-facing tool on weekly releases.",
      "My loop is fixed: define the outcome, prototype behind a flag, measure against it, then harden what survives.",
      "Trade-offs get written down — latency against cost, scope against reliability — so the decision survives the meeting."
    ],
    example: [
      "Five years building web products — most recently leading a small team on a customer-facing tool.",
      "When its launch slipped, I split it into staged rollouts instead of one risky big-bang release.",
      "We shipped on the revised date, and the staged pattern became how the team releases now."
    ],
    full: "I’ve spent five years building web products, and most recently I’ve been leading a small team on a customer-facing tool. The thread through my work is starting from the outcome: before I argue for an approach, I want to know what success looks like and how we’ll measure it. From there I make the trade-off explicit — scope against reliability, speed against cost — and I write the decision down so the team can revisit it honestly. What draws me to this role is the same instinct: this team builds honest, useful software, and that’s the environment where my way of working fits best.",
    regen: [
      [
        "I build web products — five years of it, lately leading a small team on a customer-facing tool.",
        "My habit is to name the outcome first, then choose the trade-off that gets us there.",
        "This team’s focus on honest, useful software is exactly why the role caught my eye."
      ],
      [
        "For five years I’ve built web products; my current role leads a small team on a customer-facing tool.",
        "I decide by outcomes: agree the result first, then argue about the cheapest honest path to it.",
        "I’m here because this team ships software that’s honest about what it does — my kind of team."
      ]
    ]
  },
  hire: {
    shorter: [
      "I’ve shipped this exact kind of product, under the same constraints, before.",
      "Technical depth, calm under pressure — and honest about the gaps I’m closing."
    ],
    technical: [
      "I’ve shipped the same class of product under the same constraints — legacy surface, live users, no downtime window.",
      "My depth is in the unglamorous parts: data invariants, idempotent operations, and rollbacks that are tested, not hoped for.",
      "Under pressure I narrow scope to the invariant that must hold, and I say early what will slip."
    ],
    example: [
      "I’ve done this work before — shipping the same kind of product, under the same constraints.",
      "On my last release the deadline halved mid-flight; I cut scope to the core flow and we shipped on time.",
      "That’s the pattern you’d get: honest scope, early warnings, and a calm hand when the plan breaks."
    ],
    full: "Hire me because I’ve already done the core of this job: shipping the same kind of product, under the same constraints, with live users depending on it. The two things this role asks for most are the two I bring — real technical depth in the parts that break quietly, and a calm, explicit way of working when the plan stops holding. I’d rather tell you in week one what will slip than surprise you in week six. And I’ll be straight about the edge of my experience: there are things I’m still learning, and I can show you exactly how I’m closing those gaps.",
    regen: [
      [
        "Because this role is the work I’ve been doing: same product shape, same constraints, same stakes.",
        "I bring depth where it breaks quietly, and I stay calm and explicit when plans change.",
        "Where I’m still growing, I’m direct about it — and I can show you the gap closing."
      ],
      [
        "I’ve shipped this kind of product before, under these constraints — the learning curve here is short.",
        "Depth plus steadiness: I go deep on the hard parts and keep the team informed early.",
        "I won’t oversell the rest — my gaps are named, and each one has a plan attached."
      ]
    ]
  },
  weakness: {
    shorter: [
      "I used to over-polish before asking for feedback — it slowed everything down.",
      "Now I share rough versions early — and I still watch the habit daily."
    ],
    technical: [
      "My weakness was a process flaw: I’d polish in private until feedback could only arrive late and expensive.",
      "The fix is mechanical: a rough draft goes out at fifty percent, before I’ve defended any of it.",
      "I track it like a metric — if a week passes with nothing shared early, the old habit is back."
    ],
    example: [
      "I used to over-polish work before asking for feedback — feedback arrived too late to help.",
      "On one project I shared a rough draft early; a reviewer caught a wrong assumption in minutes.",
      "That single catch saved the whole design — it’s why early sharing is now my default."
    ],
    full: "My biggest weakness used to be over-polishing: I’d keep work private until it felt finished, which meant feedback arrived late, when changing direction was expensive. I noticed the pattern after one review where a wrong assumption had survived for weeks simply because nobody had seen the draft. So I changed the mechanism, not just the intention: now I share a rough version early, on purpose, while it’s still cheap to be wrong. It still takes discipline — the instinct to polish first hasn’t vanished — but the habit is visible and checkable, and the work has been better for it every time since.",
    regen: [
      [
        "Honestly: I over-polished. Work stayed with me until it felt safe to show.",
        "These days a rough version goes out early — feedback is cheaper before I’ve committed.",
        "It’s a watched habit, not a cured one — and I can show you the checks I use."
      ],
      [
        "I used to keep work back until it was polished — and feedback came too late.",
        "Now the rough draft is the first thing people see; being wrong early is the point.",
        "I still catch the old instinct weekly — the difference is the system that catches it."
      ]
    ]
  },
  story: {
    shorter: [
      "The project was behind schedule and two teams were split on approach.",
      "One room, the trade-off named, the simpler plan chosen — shipped two weeks later."
    ],
    technical: [
      "The project was behind schedule, and the two teams were defending incompatible architectures with no shared criteria.",
      "I forced the decision onto invariants: what must stay true for users, for data, and for the deadline.",
      "Against those, the simpler plan won on every axis — and we logged the decision and its reversal cost."
    ],
    example: [
      "The project was behind schedule, and two teams disagreed on the approach — loudly, in separate documents.",
      "I booked one room, put both plans side by side, and made us name the trade-off out loud.",
      "We chose the simpler plan together, shipped two weeks later, and kept the decision log ever since."
    ],
    full: "The project was behind schedule, and two teams had settled into defending different approaches — mostly in separate documents, which meant the disagreement never actually met itself. I got everyone into one room and put both plans side by side. Then I made us name the trade-off out loud: what the thorough plan protected, what it cost, and what the simpler plan risked. Once the trade-off was explicit, the decision almost made itself — we chose the simpler plan together, which mattered, because a decision people help make is a decision they defend. We shipped two weeks later, and the team kept the decision log we started that day.",
    regen: [
      [
        "A late project, two teams, two plans — and the argument happening in separate documents.",
        "I put both plans in one room and made the trade-off explicit before we voted.",
        "The simpler plan won, we shipped two weeks later, and the decision log outlived the project."
      ],
      [
        "We were behind schedule because two teams couldn’t agree on the approach.",
        "My move was simple: one room, both plans visible, the trade-off named in plain words.",
        "We picked the simpler plan together — shipped two weeks later, decision log still in use."
      ]
    ]
  },
  five: {
    shorter: [
      "Owning a product area at depth — not just tasks, the hard trade-offs too.",
      "On a team that reviews honestly and ships carefully — like this one."
    ],
    technical: [
      "In five years I want depth with evidence: one product area whose systems I can reason about end to end.",
      "That means owning the invariants and the failure modes, not just shipping features against a roadmap.",
      "The milestone I track is trust: being the person called when a trade-off has no clean answer."
    ],
    example: [
      "Doing this work at a deeper level — owning a product area, not just tasks.",
      "Concretely: when a hard trade-off lands, I’m the person who frames it, decides, and documents why.",
      "That’s why a team that reviews honestly matters — depth like that only grows where review is real."
    ],
    full: "In five years I see myself doing this same work at a deeper level: owning a product area rather than a list of tasks, and being accountable for its hard decisions. I want to be the person a team comes to when a trade-off has no clean answer — not because I always win the argument, but because I frame the choice honestly and stand behind the outcome. Getting there means choosing environments that review honestly and ship carefully, because depth doesn’t grow where feedback is polite and vague. It’s why this team’s way of working matters to me as much as the role itself.",
    regen: [
      [
        "Deeper, not just higher: owning a product area and its hardest decisions.",
        "I want to be the person people find when a trade-off needs an honest call.",
        "Teams that review honestly and ship carefully are where that growth actually happens."
      ],
      [
        "In five years: this work, at depth — an area I own, not tasks I complete.",
        "Known for the hard trade-offs: framing them clearly and standing behind the call.",
        "That’s why the team’s honesty in review matters to me — it’s the growth condition."
      ]
    ]
  },
  salary: {
    shorter: [
      "I’d anchor on this role’s range — around this level, for this scope.",
      "The full package matters more than the number; I’m flexible if both fit."
    ],
    technical: [
      "My expectation is built from the market band for this scope, not a single number plucked from my current pay.",
      "The variables I’d weigh are total compensation: base, bonus structure, equity, and the review cycle that moves them.",
      "Within the band for this role, I’m flexible — the fit of the work moves me more than the last increment."
    ],
    example: [
      "I’d rather anchor on the range for this role — what I’ve seen is around this level, for this scope.",
      "Last time I changed roles, the headline number moved less than the package — and the package was the right call.",
      "So I’m flexible on the number itself, if the role and the total package are right."
    ],
    full: "I’d rather anchor this on the range for the role than negotiate from a single number. From what I’ve seen, roles of this scope sit around a particular level, and my expectation is in that band — but the number is honestly not the part I weigh most. The full picture matters more: the work itself, the room to grow, and the total package, including how and when it’s reviewed. If the role is right and the package is fair, I’m flexible on the exact figure, and I’d rather we spend the conversation on the work than on the last increment of salary.",
    regen: [
      [
        "Let’s anchor on the band for this role — my expectation sits inside it for this scope.",
        "What I weigh is the whole package: the work, the growth, and how it’s reviewed.",
        "Get those right and the number is flexible — I’ll share the range I have in mind."
      ],
      [
        "My expectation follows the market for this scope — around this level, from what I’ve seen.",
        "The total package matters more to me than any single line in it.",
        "So I’m flexible on the figure itself when the role and package are right."
      ]
    ]
  },
  conflict: {
    shorter: [
      "We disagreed — simpler plan versus thorough one — and argued past each other first.",
      "I asked their reasoning, named the trade-off — we shipped simpler, stayed close."
    ],
    technical: [
      "The conflict was architectural: I wanted the simpler plan, they wanted the thorough one, and neither had stated criteria.",
      "I asked for their reasoning first, then put the trade-off in measurable terms — risk, reversibility, and time to signal.",
      "On those terms the simpler plan won; we logged the decision so the disagreement stayed on paper, not between us."
    ],
    example: [
      "We disagreed on the approach — I wanted the simpler plan, they wanted the thorough one.",
      "In one meeting I stopped defending mine and asked them to walk me through theirs, step by step.",
      "Hearing it fully changed the shape of the argument — we shipped simpler, and stayed genuinely close."
    ],
    full: "The conflict was about approach: I wanted the simpler plan, a coworker wanted the thorough one, and for a while we were arguing past each other — each defending a conclusion without exposing the reasoning under it. What changed it was a deliberate move on my side: I asked them to walk me through their reasoning first, fully, before I said another word for mine. Hearing it properly, I could name the actual trade-off between us instead of the caricature I’d been arguing against. We chose the simpler plan, kept a decision log so the reasoning stayed visible, and — the part I care about — the working relationship came out stronger, not just intact.",
    regen: [
      [
        "A real disagreement: my simpler plan against their thorough one, both of us dug in.",
        "I listened first — their full reasoning — then named the trade-off we were actually making.",
        "We shipped the simpler plan, logged the decision, and the relationship strengthened from it."
      ],
      [
        "We clashed on approach — I pushed simple, they pushed thorough, neither budging.",
        "Asking for their reasoning before defending mine turned an argument into a comparison.",
        "Simpler plan shipped, decision logged — and we worked better together after that."
      ]
    ]
  },
  why: {
    shorter: [
      "This team ships carefully and reviews honestly — that’s where I do my best work.",
      "The product helps people when it counts, and the role fits my strengths."
    ],
    technical: [
      "I read how this team works before applying: careful releases, honest reviews, decisions written down — that’s a system, not a slogan.",
      "The product’s value is measurable at a moment that counts for its users — that’s the kind of feedback loop I trust.",
      "And the role maps to my strongest evidence: owning trade-offs on a customer-facing product, end to end."
    ],
    example: [
      "This team ships carefully and reviews honestly — that is the environment I do my best work in.",
      "A team that would pull a feature back openly when the data says wait — that’s the standard I want.",
      "And the role fits what I do well — here is the one result that shows it."
    ],
    full: "I want to work here for three reasons that compound. First, the environment: this team ships carefully and reviews honestly, and that is simply where I do my best work — careful shipping keeps promises to users, and honest review is the only way I know to keep getting better. Second, the product: it helps people at a moment that actually counts, and work with real stakes is easier to care about on the hard days. Third, the fit: this role asks for exactly what my experience evidences — owning trade-offs on a customer-facing product and standing behind the result. Put together, it’s the rare case where the team, the product, and the role all point the same way.",
    regen: [
      [
        "Because of how this team works: careful shipping, honest reviews — my best environment, full stop.",
        "Because the product matters at a moment that counts for the people using it.",
        "And because the role fits my evidence — one result in particular shows how."
      ],
      [
        "The honest answer is the team’s standards: ship carefully, review honestly, write decisions down.",
        "The product helps people when it matters — work like that is easy to commit to.",
        "And my strongest experience maps straight onto this role — I can point to the result."
      ]
    ]
  },
  fa: {
    shorter: [
      "با نقش فعلی و یک نتیجه مشخص شروع می‌کنم.",
      "بعد یک مثال واقعی می‌آورم و می‌گویم چرا این نقش مناسب من است."
    ],
    technical: [
      "شروع من ساختار مشخصی دارد: نقش فعلی، یک نتیجه قابل اندازه‌گیری، بعد دلیل تناسب با این نقش.",
      "هر ادعا را به یک مثال واقعی از تجربه‌ام وصل می‌کنم تا حرفم قابل بررسی باشد.",
      "از حرف کلی و تعریف از خودم پرهیز می‌کنم؛ فقط چیزی را می‌گویم که شاهد دارد."
    ],
    example: [
      "با نقش فعلی‌ام شروع می‌کنم و یک نتیجه مشخص را می‌گویم.",
      "مثلاً از پروژه‌ای می‌گویم که در آن با یک تصمیم مشخص، نتیجه کار بهتر شد.",
      "در پایان می‌گویم چرا این نقش برایم مناسب است."
    ],
    full: "با نقش فعلی‌ام شروع می‌کنم: چه کاری انجام می‌دهم و چه مسئولیتی دارم. بعد یک نتیجه مشخص از کارم را می‌گویم، نه یک ادعای کلی، و برایش یک مثال واقعی از تجربه‌ام می‌آورم تا روشن شود آن نتیجه چطور به دست آمده است. در ادامه کوتاه می‌گویم در چه کاری قوی‌ترم و روش کارم چیست: از نتیجه شروع می‌کنم و تصمیم‌ها را شفاف می‌گیرم. در پایان هم می‌گویم چرا این نقش و این تیم برایم مناسب است و چرا فکر می‌کنم تجربه‌ام دقیقاً به همین کار می‌خورد. هدفم این است که در زمانی کوتاه، تصویری دقیق و واقعی از خودم بدهم، نه فهرستی از تعریف‌ها.",
    regen: [
      [
        "از نقش فعلی‌ام می‌گویم و یک نتیجه مشخص را جلو می‌گذارم.",
        "برای هر حرفم یک مثال واقعی از تجربه‌ام دارم، نه ادعای کلی.",
        "آخر سر می‌گویم چرا این نقش، قدم طبیعی بعدی من است."
      ]
    ]
  },
  ar: {
    shorter: [
      "أبدأ بذكر دوري الحالي ونتيجة محددة حققتها في عملي.",
      "ثم مثال حقيقي من تجربتي، وأختم بسبب ملاءمة هذا الدور لي."
    ],
    technical: [
      "أتبع بنية ثابتة: الدور الحالي، ثم نتيجة قابلة للقياس، ثم سبب الملاءمة لهذا الدور.",
      "أربط كل ادعاء بمثال حقيقي من تجربتي حتى يكون كلامي قابلاً للتحقق.",
      "أتجنب الكلام العام والمدح الذاتي؛ لا أقول إلا ما له شاهد من عملي."
    ],
    example: [
      "أبدأ بدوري الحالي وأذكر نتيجة محددة حققتها.",
      "مثلاً أذكر مشروعاً غيّرت فيه قراراً واحداً فتحسّنت نتيجة العمل بوضوح.",
      "وأختم بتوضيح سبب ملاءمة هذا الدور لي."
    ],
    full: "أبدأ بدوري الحالي: ما الذي أفعله وما مسؤوليتي فيه. ثم أذكر نتيجة محددة من عملي، لا ادعاءً عاماً، وأدعمها بمثال حقيقي من تجربتي يوضح كيف تحققت تلك النتيجة. بعد ذلك أتحدث باختصار عن نقاط قوتي وطريقتي في العمل: أبدأ من النتيجة المطلوبة وأتخذ القرارات بشفافية. وفي الختام أوضح سبب ملاءمة هذا الدور وهذا الفريق لي، ولماذا أرى أن تجربتي تناسب هذا العمل تحديداً. وأحرص على أن تكون كل جملة أقولها مدعومة بتجربة حقيقية، لأن الصدق في التفاصيل هو ما يجعل الإجابة مقنعة. هدفي أن أقدم في وقت قصير صورة دقيقة وصادقة عن نفسي، لا قائمة من عبارات المدح.",
    regen: [
      [
        "أبدأ من دوري الحالي وأضع نتيجة محددة في المقدمة.",
        "لكل ما أقوله مثال حقيقي من تجربتي، لا ادعاءات عامة.",
        "وأختم بأن هذا الدور هو الخطوة الطبيعية التالية بالنسبة لي."
      ]
    ]
  }
};

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
  var demoFetchCtl = null; // In-flight AI request for a typed question.
  var dynAnswerLayer = null; // The dynamic layer a live AI answer lands in.


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
  // Step 5 — the card is the demo-to-plan handoff: the 3 points take
  // about 30 seconds to say, and the Trial's 30 lifetime minutes buy
  // about 15 answers like this one. It also surfaces the bounded-memory
  // story: the app remembers the stories already used, so the next
  // answer reaches for a fresh one (source: docs/v2/LIVE_MEMORY.md).
  // Step 73 — the card is earned, never ambient: it reveals only after
  // the visitor's own interaction (a chip, a typed question, a mode
  // switch), never on the auto-played scene or sample. visitorActed is
  // set by the handlers below; finishRender consults it.
  var visitorActed = false;
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
        ? "That Coach structure takes about 30 seconds to say — here\u2019s what 30 trial minutes buys."
        : "Those 3 points take about 30 seconds to say — here\u2019s what 30 trial minutes buys.";
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
    // One dynamic layer for a live AI answer to a typed question
    // (Step 30 completion): built empty, filled only when the proxy
    // answers; every pre-rendered index above stays untouched.
    dynAnswerLayer = buildAnswerLayer([], false, "en");
    answerStack.appendChild(dynAnswerLayer);
    answerLayers.push(dynAnswerLayer);
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
    if (visitorActed) { showDemoNext(); }
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
    if (demoFetchCtl) { demoFetchCtl.abort(); demoFetchCtl = null; }
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
      sampleTagEl.textContent = "Illustrative sample — in the real app, points are built from your confirmed facts: your resume, the job description, your profile.";
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

  // A typed question, answered live by the AI proxy (Step 30
  // completion — the hero's message box got the same path in Step
  // 30). The proxy returns speakable points, so this runs in Answer
  // mode only; Coach keeps the generic structure. Any failure lands
  // on exactly the pre-AI behaviour: the honest generic structure.
  /* Step 57 — the demo page's contextual help block reflects
     the live-answer state. Only the genuine failure path sets
     it: a typed question whose live answer could not be fetched
     (or came back empty) and fell back to the sample structure.
     Coach mode and the no-fetch local path are deliberate, not
     failures, and never set it; a later successful live answer
     clears it. A border colour and one quiet line — the block
     never pops up, moves, or expands itself. */
  function setDemoHelpFlag(on) {
    var block = document.getElementById("demo-help");
    if (!block) { return; }
    if (on) { block.classList.add("is-alert"); }
    else { block.classList.remove("is-alert"); }
    var note = document.getElementById("demo-help-note");
    if (note) { note.hidden = !on; }
  }

  // Step 73 — a typed question that matches a prepared sample is
  // answered from that sample: locally, instantly, at zero AI cost
  // (the hero's Step 31 matcher, ported — the demo used to spend a
  // live call on "Tell me about yourself" typed verbatim). The
  // visitor's own wording stays in the question layer; the answer is
  // the sample's, labelled as a sample like every prepared answer.
  var MATCHERS = [
    ["tell", ["about yourself", "introduce yourself", "خودتان", "نفسك"]],
    ["hire", ["hire you", "why you", "should we hire"]],
    ["weakness", ["weakness", "improvement area", "weak point"]],
    ["story", ["difficult project", "led a", "lead a", "challenging project"]],
    ["five", ["five years", "5 years", "see yourself"]],
    ["salary", ["salary", "compensation", "pay are you", "pay do you", "expecting"]],
    ["conflict", ["conflict", "coworker", "co-worker", "disagreement", "disagreed"]],
    ["why", ["work here", "work for us", "join us", "join our", "this company", "our company"]]
  ];
  function matchSample(text) {
    var norm = " " + text.toLowerCase().replace(/[?.!,;:'"“”]/g, " ") + " ";
    for (var k = 0; k < SAMPLE_KEYS.length; k++) {
      if (norm.indexOf(" " + SAMPLES[SAMPLE_KEYS[k]].q.toLowerCase().replace(/[?.!]/g, "") + " ") >= 0) { return SAMPLE_KEYS[k]; }
    }
    for (var i = 0; i < MATCHERS.length; i++) {
      for (var j = 0; j < MATCHERS[i][1].length; j++) {
        if (norm.indexOf(MATCHERS[i][1][j]) >= 0) { return MATCHERS[i][0]; }
      }
    }
    return null;
  }

  function showTypedMatch(key, text) {
    clearTimers();
    if (demoFetchCtl) { demoFetchCtl.abort(); demoFetchCtl = null; }
    var myRun = ++runId;
    currentKey = key;
    currentQuestion = text;
    var qLayer = questionLayers[SAMPLE_KEYS.length];
    qLayer.textContent = "“" + text + "”";
    qLayer.dir = /[\u0600-\u06FF]/.test(text) ? "rtl" : "ltr";
    qLayer.lang = typedLang(text) || "en";
    showLayer(questionLayers, SAMPLE_KEYS.length);
    var idx = SAMPLE_KEYS.indexOf(key);
    var layer = showLayer(answerLayers, idx * 2 + (mode === "coach" ? 1 : 0));
    currentAnswerLayer = layer;
    hideRows(layer);
    layer.setAttribute("aria-busy", "true");
    sampleTagEl.textContent = "Illustrative sample — in the real app, points are built from your confirmed facts: your resume, the job description, your profile.";
    sampleTagEl.classList.remove("is-hidden");
    setStatus("Preparing your points…");
    var delay = isReducedMotion() ? 0 : 120;
    timers.push(setTimeout(function () {
      if (myRun !== runId) { return; }
      revealRows(layer, timers, function () { return myRun !== runId; }, function () {
        finishRender(myRun, mode === "coach" ? "Coach points ready." : "3 points ready.");
      });
    }, delay));
  }

  // Step 73 — language guard for the typed path (client side; the
  // proxy-side guard is Phase 2). The proxy has no language field —
  // its only input is the question — so for Arabic-script questions
  // the instruction rides inside the question text, in the question's
  // own language. Verified live 2026-11-21: without it, a Persian
  // question was answered in English; with it, two Persian questions
  // answered fully in Persian and an Arabic one fully in Arabic (the
  // proxy prompt's own "same language" rule is followed weakly until
  // the instruction is explicit). The page displays the visitor's own
  // words; the instruction is a client directive on the wire only.
  function typedLang(text) {
    if (!/[\u0600-\u06FF]/.test(text)) { return null; }
    return /[\u067E\u0686\u0698\u06AF\u06A9\u06CC]/.test(text) ? "fa" : "ar";
  }
  function wireQuestion(text) {
    var lang = typedLang(text);
    if (lang === "fa") { return text + " (به فارسی پاسخ دهید)"; }
    if (lang === "ar") { return text + " (أجب بالعربية)"; }
    return text;
  }

  function showTypedAI(text) {
    clearTimers();
    if (demoFetchCtl) { demoFetchCtl.abort(); demoFetchCtl = null; }
    var myRun = ++runId;
    currentKey = "typed";
    currentQuestion = text;
    var idx = SAMPLE_KEYS.length;
    var questionLayer = questionLayers[idx];
    questionLayer.textContent = "“" + text + "”";
    showLayer(questionLayers, idx);
    dynAnswerLayer.textContent = "";
    dynAnswerLayer.dir = /[\u0600-\u06FF]/.test(text) ? "rtl" : "ltr";
    dynAnswerLayer.lang = typedLang(text) || "en";
    var layer = showLayer(answerLayers, answerLayers.indexOf(dynAnswerLayer));
    currentAnswerLayer = layer;
    layer.setAttribute("aria-busy", "true");
    sampleTagEl.classList.add("is-hidden");
    setStatus("Preparing your points…");
    iaFetchAI(wireQuestion(text), "base",
      function () { return demoFetchCtl; },
      function (c) { demoFetchCtl = c; },
      function (data) {
      if (myRun !== runId) { return; }
      var bullets = (data && Array.isArray(data.bullets)) ? data.bullets.filter(function (b) { return typeof b === "string" && b; }).slice(0, 4) : [];
      if (!bullets.length) { throw new Error("shape"); }
      setDemoHelpFlag(false);
      bullets.forEach(function (b) {
        var li = makeBullet(b);
        li.classList.add("is-hidden");
        dynAnswerLayer.appendChild(li);
      });
      revealRows(layer, timers, function () { return myRun !== runId; }, function () {
        finishRender(myRun, "Live answer — generated for this question.");
      });
      },
      function () {
      if (myRun !== runId) { return; }
      showAnswer("typed", text, null);
      setDemoHelpFlag(true);
      });
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

  modeAnswerBtn.addEventListener("click", function () { cancelScene(); visitorActed = true; setMode("answer"); });
  modeCoachBtn.addEventListener("click", function () { cancelScene(); visitorActed = true; setMode("coach"); });

  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      cancelScene();
      visitorActed = true;
      var key = chip.getAttribute("data-q");
      var sample = SAMPLES[key];
      if (sample) { showAnswer(key, sample.q, sample); }
      inputEl.value = "";
      inputEl.removeAttribute("aria-invalid");
    });
  });

  formEl.addEventListener("submit", function (e) {
    e.preventDefault();
    cancelScene();
    var text = inputEl.value.trim();
    if (!text) {
      setStatus("Type a question, or pick a sample below.");
      inputEl.setAttribute("aria-invalid", "true");
      inputEl.focus();
      return;
    }
    inputEl.removeAttribute("aria-invalid");
    visitorActed = true;
    // Step 73: a typed question that matches a prepared sample is
    // answered from that sample first — locally, at zero AI cost.
    var matched = matchSample(text);
    if (matched) {
      showTypedMatch(matched, text);
      return;
    }
    // Otherwise the question goes to the live AI when the proxy is
    // configured (Answer mode — the proxy returns speakable points,
    // not Coach keywords). Any failure, and Coach mode, use the
    // honest generic structure, not a fake answer.
    if (IA_AI_ENDPOINT && typeof fetch === "function" && mode !== "coach") {
      showTypedAI(text);
    } else {
      showAnswer("typed", text, null);
    }
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

  /* Step 73 — the scene: "The Interview, Live" (demo.html only).
     The demo window becomes a video call in progress: a LIVE bar
     with a running clock, the interviewer speaking (waveform), the
     question arriving word by word as a provisional transcript
     under a Listening pill, "Question detected", the three points
     landing while the moment is still live, then an ambush
     follow-up whose answer shortens itself twice. The choreography
     is a small state machine on its own timer list + run token; any
     visitor interaction (chip, submit, mode switch) cancels it via
     cancelScene() and hands the window to the classic paths above,
     untouched. With reduced motion — and for no-JS, in the static
     HTML — the scene is shown settled and complete instead of
     played. On pages without the call stage (index.html shares
     this IIFE), every scene function is a no-op and the classic
     autoplay runs exactly as before. */
  var callStageEl = document.getElementById("call-stage");
  var scenePillEl = document.getElementById("scene-pill");
  var scenePillTextEl = document.getElementById("scene-pill-text");
  var sceneClockEl = document.getElementById("scene-clock");
  var callTileEl = document.getElementById("call-tile");
  var callSpeakingEl = document.getElementById("call-speaking");
  var callSelfEl = document.getElementById("call-self");
  var callCaptionEl = document.getElementById("call-caption");
  var sceneControlsEl = document.getElementById("scene-controls");
  var sceneReplayBtn = document.getElementById("scene-replay");
  var sceneSkipBtn = document.getElementById("scene-skip");
  var sceneDownloadEl = document.getElementById("scene-download");
  var sceneOn = !!(callStageEl && scenePillEl && scenePillTextEl && callCaptionEl);
  var scene = { run: 0, timers: [], clockTimer: null, clockStart: 0, done: false, playing: false };
  /* Step 74 — the scene is now a full interview arc, not one
     question: a warm-up, an ambush follow-up (the answer shortens
     itself twice), a deeper behavioural question, a closing
     question, and the interviewer's thanks — with the candidate
     visibly answering between exchanges. Every exchange swaps
     layers inside the same two stacks, so the one window never
     grows; the beats are scheduled from a running cursor, and in
     a voiced run (Step 74 Pass 3) each question's word pacing is
     driven by its pre-generated clip's real duration. */
  var FOLLOW_Q = "Can you give me the shorter version?";
  var THANKS_LINE = "That’s everything I need. Thank you.";
  var sceneQ = {};        // key -> { layer, words, idx }
  var sceneA = {};        // key -> answer layer (story/why/concise/rapid)
  var sceneAnswerShown = null;
  var thanksWords = [];
  var sceneVoiced = false;

  function sceneLater(ms, fn) {
    var myScene = scene.run;
    scene.timers.push(setTimeout(function () {
      if (myScene !== scene.run) { return; }
      fn();
    }, ms));
  }

  function clearSceneTimers() {
    scene.timers.forEach(function (t) { clearTimeout(t); });
    scene.timers = [];
  }

  function setScenePill(text, kind) {
    if (!scenePillEl) { return; }
    scenePillTextEl.textContent = text;
    // Step 74: the pill is the canonical .app-pill of the Live
    // window's .app-header — its states are the app's own
    // (is-listening, with the live meter) or neutral.
    scenePillEl.classList.toggle("is-listening", kind === "listening");
    scenePillEl.classList.toggle("is-live", kind === "listening");
  }

  function setSpeaking(on) {
    if (callTileEl) { callTileEl.classList.toggle("is-speaking", !!on); }
    if (callSpeakingEl) { callSpeakingEl.hidden = !on; }
  }

  function sceneTick() {
    if (!sceneClockEl || !scene.clockStart) { return; }
    var s = Math.floor((Date.now() - scene.clockStart) / 1000);
    var mm = String(Math.floor(s / 60));
    var ss = String(s % 60);
    sceneClockEl.textContent = (mm.length < 2 ? "0" + mm : mm) + ":" + (ss.length < 2 ? "0" + ss : ss);
  }

  function startSceneClock() {
    scene.clockStart = Date.now();
    if (scene.clockTimer) { clearInterval(scene.clockTimer); }
    scene.clockTimer = setInterval(sceneTick, 500);
    sceneTick();
  }

  function buildWordSpans(el, text) {
    el.textContent = "";
    var words = text.split(" ");
    var spans = [];
    words.forEach(function (w, i) {
      var s = document.createElement("span");
      s.className = "w is-hidden";
      s.textContent = w;
      el.appendChild(s);
      if (i < words.length - 1) { el.appendChild(document.createTextNode(" ")); }
      spans.push(s);
    });
    return spans;
  }

  function sceneReveal(layer, intervalMs, done) {
    var rows = layer.querySelectorAll("li");
    if (intervalMs <= 0 || isReducedMotion()) {
      rows.forEach(function (row) { row.classList.remove("is-hidden"); });
      if (done) { done(); }
      return;
    }
    rows.forEach(function (row, i) {
      sceneLater(i * intervalMs, function () {
        row.classList.remove("is-hidden");
        row.classList.add("is-new");
      });
    });
    if (done) { sceneLater(Math.max(0, rows.length - 1) * intervalMs + 60, done); }
  }

  function buildSceneQuestion(key, text) {
    var layer = document.createElement("p");
    layer.className = "demo-question scene-q is-provisional";
    layer.setAttribute("aria-hidden", "true");
    questionStack.appendChild(layer);
    questionLayers.push(layer);
    var words = buildWordSpans(layer, "“" + text + "”");
    layer.classList.add("is-hidden");
    return { layer: layer, words: words, idx: questionLayers.length - 1 };
  }

  function buildSceneLayers() {
    if (!sceneOn) { return; }
    // One question layer per exchange, all in the classic question
    // stack (classic indices preserved; scene layers are only ever
    // referenced through sceneQ). The tell answer is the classic
    // layer 0; the other exchanges get scene-owned answer layers in
    // the same answer stack, swapped by sceneShowAnswer.
    sceneQ.tell = buildSceneQuestion("tell", SAMPLES.tell.q);
    sceneQ.follow = buildSceneQuestion("follow", FOLLOW_Q);
    sceneQ.story = buildSceneQuestion("story", SAMPLES.story.q);
    sceneQ.why = buildSceneQuestion("why", SAMPLES.why.q);
    sceneA.story = buildAnswerLayer(SAMPLES.story.answer, false, "en");
    answerStack.appendChild(sceneA.story);
    sceneA.why = buildAnswerLayer(SAMPLES.why.answer, false, "en");
    answerStack.appendChild(sceneA.why);
    if (typeof INT !== "undefined" && INT && INT.concise && INT.rapid) {
      sceneA.concise = buildAnswerLayer(INT.concise, false, "en");
      answerStack.appendChild(sceneA.concise);
      sceneA.rapid = buildAnswerLayer(INT.rapid, false, "en");
      answerStack.appendChild(sceneA.rapid);
    }
    thanksWords = buildWordSpans(callCaptionEl, THANKS_LINE);
    thanksWords.forEach(function (w) { w.classList.add("is-hidden"); });
    sceneReserveHeights();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { sceneReserveHeights(); });
    }
    window.addEventListener("resize", function () {
      if (!scene.playing) { sceneReserveHeights(); }
    });
  }

  function measureLayer(el) {
    if (!el) { return 0; }
    var wasHidden = el.classList.contains("is-hidden");
    var rows = el.querySelectorAll("li.is-hidden");
    el.classList.remove("is-hidden");
    el.style.visibility = "hidden";
    // The stacks are grids whose items stretch to the cell —
    // pin the item to its content height while measuring.
    el.style.alignSelf = "start";
    rows.forEach(function (li) { li.classList.remove("is-hidden"); });
    var cs = window.getComputedStyle(el);
    var h = el.offsetHeight + parseFloat(cs.marginTop || 0) + parseFloat(cs.marginBottom || 0);
    rows.forEach(function (li) { li.classList.add("is-hidden"); });
    el.style.visibility = "";
    el.style.alignSelf = "";
    if (wasHidden) { el.classList.add("is-hidden"); }
    return h;
  }

  /* The classic stacks reserve the tallest layer by construction
     (grid cell, visibility). Scene mode display:none's the
     inactive layers, so without a reservation the window would
     change height at every exchange. Measure the scene's own
     layers (fonts can change wraps, widths change wraps — hence
     the recompute hooks) and reserve exactly their maximum. */
  function sceneReserveHeights() {
    if (!sceneOn) { return; }
    var maxA = 0, maxQ = 0;
    [answerLayers[0], sceneA.story, sceneA.why, sceneA.concise, sceneA.rapid].forEach(function (l) {
      maxA = Math.max(maxA, measureLayer(l));
    });
    [sceneQ.tell, sceneQ.follow, sceneQ.story, sceneQ.why].forEach(function (q) {
      if (q) { maxQ = Math.max(maxQ, measureLayer(q.layer)); }
    });
    if (maxA) { callStageEl.style.setProperty("--scene-answer-min", maxA + "px"); }
    if (maxQ) { callStageEl.style.setProperty("--scene-question-min", maxQ + "px"); }
    if (sampleTagEl) {
      var prev = sampleTagEl.textContent;
      sampleTagEl.textContent = "Illustrative sample — in the real app, points are built from your confirmed facts: your resume, the job description, your profile.";
      var tagH = measureLayer(sampleTagEl);
      sampleTagEl.textContent = prev;
      if (tagH) { callStageEl.style.setProperty("--scene-tag-min", tagH + "px"); }
    }
  }

  function sceneShowAnswer(layer) {
    hideAllLayers(answerLayers);
    if (sceneAnswerShown && sceneAnswerShown !== layer) {
      sceneAnswerShown.classList.add("is-hidden");
    }
    sceneAnswerShown = layer || null;
    if (layer) {
      layer.classList.remove("is-hidden");
      currentAnswerLayer = layer;
    }
  }

  function setSelfSpeaking(on) {
    if (callSelfEl) { callSelfEl.classList.toggle("is-speaking", !!on); }
  }

  /* One exchange, scheduled from cursor t (seconds). The words
     pace over the speech duration — the clip's real duration in a
     voiced run, the staged pacing otherwise — detection lands
     just after the voice ends, and the points land while the
     moment is still live. Returns the cursor for the next beat. */
  function sceneAsk(t, q, aLayer, opts) {
    var speech = sceneClipDuration(opts.clip, opts.speech);
    var rows = aLayer.querySelectorAll("li").length;
    var step = opts.pointStep || 400;
    sceneLater(t * 1000, function () {
      setSpeaking(true);
      setScenePill("Listening", "listening");
      showLayer(questionLayers, q.idx);
      q.layer.classList.add("is-provisional");
      q.words.forEach(function (w) { w.classList.add("is-hidden"); });
      sceneShowAnswer(aLayer);
      hideRows(aLayer);
      sceneClipPlay(opts.clip);
      var wstep = (speech * 1000) / Math.max(1, q.words.length);
      q.words.forEach(function (w, i) {
        sceneLater(150 + i * wstep, function () { w.classList.remove("is-hidden"); });
      });
    });
    var detectedAt = t + 0.15 + speech + 0.2;
    sceneLater(detectedAt * 1000, function () {
      setSpeaking(false);
      setScenePill("Question detected", "detected");
      q.layer.classList.remove("is-provisional");
    });
    var pointsAt = detectedAt + 0.4;
    sceneLater(pointsAt * 1000, function () {
      if (opts.statusText) { setStatus(opts.statusText); } else { setStatus("Preparing your points…"); }
      sceneReveal(aLayer, step, function () {
        setScenePill("Answer ready", "ready");
        if (opts.tagOnReady) {
          sampleTagEl.textContent = "Illustrative sample — in the real app, points are built from your confirmed facts: your resume, the job description, your profile.";
          sampleTagEl.classList.remove("is-hidden");
        }
        if (opts.readyText) { setStatus(opts.readyText); }
      });
    });
    return pointsAt + Math.max(0, rows - 1) * step / 1000 + 0.5;
  }

  /* The candidate answers: the self tile speaks, the status says
     what the visitor is seeing. Returns the next cursor. */
  function sceneYou(t, dur, statusText) {
    sceneLater(t * 1000, function () {
      if (statusText) { setStatus(statusText); }
      setSelfSpeaking(true);
    });
    sceneLater((t + dur) * 1000, function () { setSelfSpeaking(false); });
    return t + dur;
  }

  function cancelScene() {
    if (!sceneOn) { return; }
    scene.run++;
    clearSceneTimers();
    sceneClipStopAll();
    scene.playing = false;
    callStageEl.classList.remove("is-scene");
    setSpeaking(false);
    setSelfSpeaking(false);
    if (callCaptionEl) { callCaptionEl.hidden = true; }
    if (sceneDownloadEl) { sceneDownloadEl.hidden = true; }
    setScenePill("Not listening", "");
  }

  function settleScene() {
    if (!sceneOn) { return; }
    scene.run++;
    clearSceneTimers();
    sceneClipStopAll();
    clearTimers();
    if (demoFetchCtl) { demoFetchCtl.abort(); demoFetchCtl = null; }
    scene.playing = false;
    scene.done = true;
    callStageEl.classList.add("is-scene");
    setSpeaking(false);
    setSelfSpeaking(false);
    if (callCaptionEl) { callCaptionEl.hidden = true; }
    if (sceneSkipBtn) { sceneSkipBtn.hidden = true; }
    setScenePill("Answer ready", "ready");
    showLayer(questionLayers, sceneQ.tell.idx);
    sceneQ.tell.layer.classList.remove("is-provisional");
    sceneQ.tell.words.forEach(function (w) { w.classList.remove("is-hidden"); });
    var layer = showLayer(answerLayers, 0);
    currentAnswerLayer = layer;
    sceneAnswerShown = null;
    layer.querySelectorAll("li").forEach(function (row) { row.classList.remove("is-hidden"); });
    sampleTagEl.textContent = "Illustrative sample — in the real app, points are built from your confirmed facts: your resume, the job description, your profile.";
    sampleTagEl.classList.remove("is-hidden");
    setStatus("The scene, settled: the app hears each question as it is asked and answers in three short points — the same small window through the whole interview, follow-ups included. Your turn below — typed questions are answered live.");
  }

  function playScene(opts) {
    if (!sceneOn || isReducedMotion()) { settleScene(); return; }
    sceneVoiced = !!(opts && opts.voice);
    scene.run++;
    clearSceneTimers();
    sceneClipStopAll();
    clearTimers();
    if (demoFetchCtl) { demoFetchCtl.abort(); demoFetchCtl = null; }
    runId++;
    scene.playing = true;
    scene.done = false;
    callStageEl.classList.add("is-scene");
    if (sceneSkipBtn) { sceneSkipBtn.hidden = false; }
    if (sceneDownloadEl) { sceneDownloadEl.hidden = true; }
    if (mode !== "answer") {
      mode = "answer";
      modeAnswerBtn.classList.add("is-active");
      modeCoachBtn.classList.remove("is-active");
      modeCoachBtn.classList.remove("is-coach-active");
      modeAnswerBtn.setAttribute("aria-pressed", "true");
      modeCoachBtn.setAttribute("aria-pressed", "false");
    }
    currentKey = "tell";
    currentQuestion = SAMPLES.tell.q;
    // Reset the stage.
    sampleTagEl.classList.add("is-hidden");
    if (callCaptionEl) { callCaptionEl.hidden = true; }
    thanksWords.forEach(function (w) { w.classList.add("is-hidden"); });
    setSelfSpeaking(false);
    setStatus("The interview is live — the app is listening.");
    startSceneClock();

    /* The arc, beat by beat (cursor in seconds; a voiced run
       stretches each ask to its clip's real length):
       1 warm-up (tell) → you answer → 2 ambush follow-up (Concise,
       then Rapid) → you answer → 3 the difficult-project story →
       you answer → 4 the closing question (why) → you answer →
       5 the interviewer's thanks, captioned in his tile, and the
       window's work is done — the download moment. */
    var t = 0.3;
    t = sceneAsk(t, sceneQ.tell, answerLayers[0], {
      clip: "tell", speech: 1.25, pointStep: 400,
      tagOnReady: true, readyText: "3 points ready — sample."
    });
    t = sceneYou(t + 0.4, 1.8, "You answer — the three points, in your own words.");
    // The ambush: asked fast, answered shorter, then shorter still.
    t = sceneAsk(t + 0.35, sceneQ.follow, sceneA.concise, {
      clip: "follow", speech: 1.1, pointStep: 250,
      statusText: "The follow-up came fast — the answer shortened itself."
    });
    sceneLater((t + 0.9) * 1000, function () {
      sceneShowAnswer(sceneA.rapid);
      sceneReveal(sceneA.rapid, 0, null);
      setScenePill("Answer ready", "ready");
      setStatus("Faster still — one line. In the real app, this shortening is automatic.");
    });
    t = t + 1.4;
    t = sceneYou(t, 1.4, "You answer — one line, said in seconds.");
    t = sceneAsk(t + 0.35, sceneQ.story, sceneA.story, {
      clip: "story", speech: 2.0, pointStep: 400,
      statusText: "A harder question — its answer was already in the question bank."
    });
    t = sceneYou(t + 0.4, 2.0, "You answer — the difficult-project story, already prepared.");
    t = sceneAsk(t + 0.35, sceneQ.why, sceneA.why, {
      clip: "why", speech: 1.3, pointStep: 400,
      statusText: "The closing question — the same preparation answers it."
    });
    t = sceneYou(t + 0.4, 1.8, "You answer — calm, because it was ready.");
    // The close: the interviewer thanks you — captioned in his
    // tile, paced by the thanks clip in a voiced run — and the
    // pill rests at Interview complete over the download anchor.
    var thanksSpeech = sceneClipDuration("thanks", 1.5);
    sceneLater((t + 0.4) * 1000, function () {
      setSpeaking(true);
      setScenePill("Listening", "listening");
      sceneClipPlay("thanks");
      if (callCaptionEl) {
        callCaptionEl.hidden = false;
        if (window.getComputedStyle(callCaptionEl).display === "none") {
          // Narrow layouts: the caption chip stands down (the CSS
          // decides), so the status line carries the closing line
          // verbatim instead.
          setStatus("The interviewer closes: “That’s everything I need. Thank you.”");
        }
      }
      var wstep = (thanksSpeech * 1000) / Math.max(1, thanksWords.length);
      thanksWords.forEach(function (w, i) {
        sceneLater(150 + i * wstep, function () { w.classList.remove("is-hidden"); });
      });
    });
    sceneLater((t + 0.4 + thanksSpeech + 0.4) * 1000, function () {
      setSpeaking(false);
      scene.playing = false;
      scene.done = true;
      if (sceneSkipBtn) { sceneSkipBtn.hidden = true; }
      if (sceneDownloadEl) { sceneDownloadEl.hidden = false; }
      setScenePill("Interview complete", "ready");
      setStatus("Four questions — every answer from the same preparation: your resume, the job description, your profile. That is the whole interview, in one small window.");
    });
  }

  /* Step 74 Pass 3 — the spoken interviewer. The interviewer's
     lines are pre-generated clips shipped with the site (small
     static MP3s, zero runtime cost); a voiced run is started
     only by the visitor's gesture on "Start the interview",
     which doubles as the sound opt-in. Word pacing in a voiced
     run is driven by each clip's measured duration, and muting
     uses the muted property so playback position — and with it
     the sync — keeps advancing. If a clip fails to load or play,
     that beat falls back to the staged pacing and the visual
     choreography runs unchanged. */
  var CLIP_FILES = { tell: "tell", follow: "followup", story: "story", why: "why", thanks: "thanks" };
  var sceneClips = {};
  var sceneMuted = false;
  if (sceneOn) {
    Object.keys(CLIP_FILES).forEach(function (key) {
      var el = new Audio();
      el.preload = "auto";
      el.src = "audio/scene-" + CLIP_FILES[key] + ".mp3";
      var rec = { el: el, dur: 0, failed: false };
      el.addEventListener("loadedmetadata", function () { rec.dur = el.duration || 0; });
      el.addEventListener("error", function () { rec.failed = true; });
      el.hidden = true;
      el.setAttribute("aria-hidden", "true");
      callStageEl.appendChild(el);
      sceneClips[key] = rec;
    });
  }
  var sceneStartBtn = document.getElementById("scene-start");
  var sceneMuteBtn = document.getElementById("scene-mute");

  function sceneClipDuration(key, fallback) {
    if (sceneVoiced && key && sceneClips[key] && !sceneClips[key].failed && sceneClips[key].dur > 0) {
      return sceneClips[key].dur + 0.1;
    }
    return fallback;
  }
  function sceneClipPlay(key) {
    if (!sceneVoiced || !key || !sceneClips[key] || sceneClips[key].failed) { return; }
    var rec = sceneClips[key];
    try {
      rec.el.muted = sceneMuted;
      rec.el.currentTime = 0;
      var p = rec.el.play();
      if (p && p.catch) { p.catch(function () { rec.failed = true; }); }
    } catch (e) { rec.failed = true; }
  }
  function sceneClipStopAll() {
    Object.keys(sceneClips).forEach(function (key) {
      var el = sceneClips[key].el;
      try { el.pause(); el.currentTime = 0; } catch (e) {}
    });
  }
  function clipsReady() {
    var waits = Object.keys(sceneClips).map(function (key) {
      var rec = sceneClips[key];
      if (rec.failed || rec.dur > 0) { return Promise.resolve(); }
      return new Promise(function (resolve) {
        var done = false;
        var finish = function () { if (!done) { done = true; resolve(); } };
        rec.el.addEventListener("loadedmetadata", finish);
        rec.el.addEventListener("error", finish);
        setTimeout(finish, 2500);
      });
    });
    return Promise.all(waits);
  }
  if (sceneStartBtn) {
    sceneStartBtn.addEventListener("click", function () {
      // The gesture unlocks every clip element (play + pause at
      // zero volume), then the run starts once durations are
      // known, so the transcript can pace to the real voice.
      Object.keys(sceneClips).forEach(function (key) {
        var el = sceneClips[key].el;
        el.muted = true;
        var p = el.play();
        if (p && p.then) {
          p.then(function () { el.pause(); el.currentTime = 0; el.muted = sceneMuted; })
           .catch(function () { sceneClips[key].failed = true; });
        }
      });
      if (sceneMuteBtn) { sceneMuteBtn.hidden = false; }
      clipsReady().then(function () { playScene({ voice: true }); });
    });
  }
  if (sceneMuteBtn) {
    sceneMuteBtn.addEventListener("click", function () {
      sceneMuted = !sceneMuted;
      Object.keys(sceneClips).forEach(function (key) { sceneClips[key].el.muted = sceneMuted; });
      sceneMuteBtn.textContent = sceneMuted ? "Sound off" : "Sound on";
      sceneMuteBtn.setAttribute("aria-pressed", String(sceneMuted));
    });
  }

  /* Step 74 Pass 3 — the visitor's own camera in the "You" tile.
     Opt-in only (a real button, unhidden by JS — never a dead
     control without JS), gesture-only getUserMedia, video only.
     The stream never leaves the device: no recording, no upload,
     no frame capture; the note under the stage says so. Tracks
     stop on toggle-off, on page hide, and on unload; denial,
     no-camera and insecure-context failures fall back to the
     labelled tile with the choreography untouched. */
  var camToggleBtn = document.getElementById("cam-toggle");
  var camToggleText = document.getElementById("cam-toggle-text");
  var camVideo = document.getElementById("cam-video");
  var camNoteEl = document.getElementById("cam-note");
  var camStream = null;
  var camOn = false;
  function camNote(text) {
    if (!camNoteEl) { return; }
    if (text) { camNoteEl.textContent = text; camNoteEl.hidden = false; }
    else { camNoteEl.hidden = true; }
  }
  function camStop() {
    if (camStream) {
      camStream.getTracks().forEach(function (tr) { tr.stop(); });
      camStream = null;
    }
    if (camVideo) { camVideo.srcObject = null; camVideo.hidden = true; }
    camOn = false;
    if (callSelfEl) { callSelfEl.classList.remove("cam-on"); }
    if (camToggleBtn) { camToggleBtn.setAttribute("aria-pressed", "false"); }
    if (camToggleText) { camToggleText.textContent = "Use your camera"; }
  }
  function camFail(message) {
    camStop();
    camNote(message);
  }
  if (camToggleBtn && camVideo && callSelfEl) {
    camToggleBtn.hidden = false;
    callSelfEl.classList.add("cam-ready");
    camToggleBtn.addEventListener("click", function () {
      if (camOn) { camStop(); camNote(null); return; }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        camFail("Camera is not available in this browser or on this connection — the labelled tile stays. Nothing was recorded or sent.");
        return;
      }
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false }).then(function (stream) {
        camStream = stream;
        camVideo.srcObject = stream;
        camVideo.hidden = false;
        var p = camVideo.play();
        if (p && p.catch) { p.catch(function () {}); }
        camOn = true;
        callSelfEl.classList.add("cam-on");
        camToggleBtn.setAttribute("aria-pressed", "true");
        camToggleText.textContent = "Stop camera";
        camNote("Your camera is live in the tile — on this device only. Nothing is recorded, uploaded or sent anywhere; stopping the camera or leaving the page ends it.");
      }).catch(function () {
        camFail("The camera did not start — permission was not given, or no camera is available. The labelled tile stays; nothing was recorded or sent.");
      });
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden && camOn) { camStop(); camNote(null); }
    });
    window.addEventListener("pagehide", function () { camStop(); });
  }

  if (sceneReplayBtn) {
    sceneReplayBtn.addEventListener("click", function () { playScene(); });
  }
  if (sceneSkipBtn) {
    sceneSkipBtn.addEventListener("click", function () { settleScene(); });
  }

  // Initial state: build the layers, then — on the demo page — play
  // the scene (or settle it, for reduced motion); everywhere else
  // the classic default sample, staged on load, exactly as before.
  buildDemoLayers();
  buildSceneLayers();
  if (sceneOn) {
    if (isReducedMotion()) {
      settleScene();
    } else {
      if (sceneControlsEl) { sceneControlsEl.hidden = false; }
      playScene();
    }
  } else {
    showAnswer("tell", SAMPLES.tell.q, SAMPLES.tell);
  }
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
   page without a demo. It must bind on all 10 pages.
   Step 32: the toggle drives the full-screen menu — aria-expanded is
   the state the icon morph keys off, the page scroll locks while the
   menu is open, and Escape closes the menu and returns focus to the
   toggle. */
(function () {
  "use strict";
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (!toggle || !nav) { return; }
  function setOpen(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
  }
  toggle.addEventListener("click", function () {
    setOpen(!nav.classList.contains("is-open"));
  });
  nav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { setOpen(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
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
   state renders statically, no Replay button.
   Step 30 — the window is now a working preview, not just a play. On
   load it picks ONE of the ten prepared samples at random (a different
   one per visit, per refresh — prepared content costs no AI call). The
   five chips are real buttons and rework the shown answer exactly the
   way the app's engine does (InterviewEngine.RequestVariantAsync: same
   question, new style — Shorter/Technical/Example/Full answer, and
   Regenerate = a fresh Balanced version), using variants prepared to
   the app's own style specs (AnswerStyleSpec), so still no AI call.
   The message box is real too: a typed question that matches a sample
   is answered from that sample; anything else goes to the AI endpoint
   when one is configured (IA_AI_ENDPOINT — the key lives behind it,
   never in this file) and otherwise gets the honest guidance answer,
   the same FALLBACK the demo uses. */
(function () {
  "use strict";
  var pill = document.getElementById("mock-pill");
  var pillText = document.getElementById("mock-pill-text");
  var startEl = document.getElementById("mock-start");
  // Step 38 — the start button's icon follows its label: the play
  // triangle belongs to "Start listening"/"Resume", the pause bars to
  // "Pause". Before this, the label changed and the icon never did,
  // so a button reading "Pause" carried a play glyph.
  var startIconEl = document.getElementById("mock-start-icon");
  var PLAY_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3v10l8-5z" fill="currentColor"/></svg>';
  var PAUSE_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3.8" y="3" width="2.8" height="10" rx="1" fill="currentColor"/><rect x="9.4" y="3" width="2.8" height="10" rx="1" fill="currentColor"/></svg>';
  function setStart(label) {
    startLabelEl.textContent = label;
    if (startIconEl) { startIconEl.innerHTML = label === "Pause" ? PAUSE_ICON : PLAY_ICON; }
  }

  var startLabelEl = document.getElementById("mock-start-label");
  var questionEl = document.getElementById("mock-question");
  var transcriptEl = document.getElementById("mock-transcript");
  var questionGhost = document.getElementById("mock-question-ghost");
  var transcriptGhost = document.getElementById("mock-transcript-ghost");
  var thinkingEl = document.getElementById("mock-thinking");
  var metaEl = document.getElementById("mock-meta");
  var replayBtn = document.getElementById("hero-replay");
  var zone = document.getElementById("mock-answer-zone");
  var stack = document.getElementById("mock-answer-stack");
  var fullEl = document.getElementById("mock-full");
  var liveEl = document.getElementById("hero-live");
  var formEl = document.getElementById("hero-manual-form");
  var inputEl = document.getElementById("hero-manual-input");
  if (!pill || !pillText || !startEl || !startLabelEl || !questionEl || !transcriptEl || !questionGhost || !transcriptGhost || !thinkingEl || !metaEl || !replayBtn || !zone || !stack || !fullEl) { return; }
  var chipBtns = Array.prototype.slice.call(document.querySelectorAll(".app-chip-btn"));
  var appWindow = stack.closest ? stack.closest(".app-window") : null;

  var KEYS = Object.keys(SAMPLES);
  // Step 31 — the sample is picked in a language the visitor reads.
  // The prepared bank exists in three languages (English, Persian,
  // Arabic); picking a random one of the ten surprised an English
  // reader in Canada with an Arabic sample. The signal is the
  // browser's own language list (navigator.languages): the
  // preference the user set on their device — what Apple and Google
  // localize by — which an IP address, and therefore a VPN, cannot
  // change. The first language in the visitor's list that the bank
  // has a sample for wins; every other language falls back to
  // English, the site's own language. Within the matched language
  // the pick stays random, one per refresh (Step 30).
  function pickSampleKey() {
    var langs = (typeof navigator !== "undefined" && navigator.languages && navigator.languages.length)
      ? navigator.languages
      : [(typeof navigator !== "undefined" && navigator.language) || "en"];
    for (var i = 0; i < langs.length; i++) {
      var primary = String(langs[i]).toLowerCase().split("-")[0];
      if (primary === "fa") { return "fa"; }
      if (primary === "ar") { return "ar"; }
      if (primary === "en") { break; }
    }
    var english = KEYS.filter(function (k) { return !SAMPLES[k].rtl; });
    return english[Math.floor(Math.random() * english.length)];
  }
  var key = pickSampleKey();
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var timers = [];
  var spinTimer = null;
  var fetchCtl = null;

  // The current state of the window. `variant` names what the answer
  // area shows: base | shorter | technical | example | full | regen.
  // `source` says where the current question came from: the loaded
  // sample, a typed question that matched a sample, a typed question
  // the AI answered, or a typed question on the guidance fallback.
  var sample = SAMPLES[key];
  var variants = IA_VARIANTS[key] || null;
  var questionText = sample.q;
  var source = "sample";
  var variant = "base";
  var metaWord = "prepared";
  var lastRegen = -1;
  var busy = false;        // a play, switch or fetch is running
  var answerShown = false; // a complete answer is on screen (CanRework)
  var played = false;      // the staged moment has completed once
  var initialInFlight = false;
  var shownCount = 0;      // bullets revealed in the active layer

  var START_MS = 300;  // press Start after the window is seen
  var HEAR_MS = 600;   // Listening -> Hearing audio
  var TRANS_MS = 600;  // Hearing audio -> Transcribing
  var WORD_MS = 160;   // per transcript word
  var DETECT_MS = 300; // transcript done -> question detected
  var THINK_MS = 500;  // Question detected -> Preparing answer
  var STAGE_MS = 450;  // interval between points in the staged play
  var SWITCH_THINK_MS = 450; // thinking beat before a variant lands
  var SWITCH_STAGE_MS = 250; // interval between points in a variant
  var END_MS = 400;    // last point -> Replay appears

  function clearTimers() {
    timers.forEach(function (t) { clearTimeout(t); });
    timers = [];
  }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

  function announce(text) { if (liveEl) { liveEl.textContent = text; } }

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

  function makeLayer(bullets, rtl, lang) {
    var ul = document.createElement("ul");
    ul.className = "app-answer";
    ul.dir = rtl ? "rtl" : "ltr";
    ul.lang = lang || "en";
    bullets.forEach(function (text) {
      var li = makeBullet(text);
      li.classList.add("is-hidden");
      ul.appendChild(li);
    });
    ul.classList.add("is-hidden");
    return ul;
  }

  // Layers for the current sample: base + the four prepared variants +
  // the Regenerate alternates, all pre-rendered in the Step 23 stack so
  // switching between bullet variants never moves the card. The Full
  // paragraph lives outside the stack (it is taller by design) and is
  // swapped in with the Step 24 glide.
  var layers = {};
  function buildLayers() {
    stack.textContent = "";
    layers = {};
    var rtl = !!sample.rtl, lang = sample.lang || "en";
    layers.base = makeLayer(sample.answer, rtl, lang);
    stack.appendChild(layers.base);
    if (variants) {
      layers.shorter = makeLayer(variants.shorter, rtl, lang);
      layers.technical = makeLayer(variants.technical, rtl, lang);
      layers.example = makeLayer(variants.example, rtl, lang);
      stack.appendChild(layers.shorter);
      stack.appendChild(layers.technical);
      stack.appendChild(layers.example);
      layers.regen = variants.regen.map(function (set) {
        var ul = makeLayer(set, rtl, lang);
        stack.appendChild(ul);
        return ul;
      });
      fullEl.textContent = variants.full;
      fullEl.dir = rtl ? "rtl" : "ltr";
      fullEl.lang = lang;
    }
    layers.dyn = null;
  }

  function activeLayer() {
    if (variant === "regen") { return layers.regen ? layers.regen[Math.max(0, lastRegen)] : layers.base; }
    if (variant === "dyn") { return layers.dyn; }
    return layers[variant] || layers.base;
  }

  function setLayerBullets(ul, hidden) {
    for (var i = 0; i < ul.children.length; i++) {
      ul.children[i].classList.toggle("is-hidden", hidden);
      ul.children[i].classList.remove("is-pending");
      ul.children[i].classList.remove("is-new");
    }
  }

  // Show exactly one bullet layer (or the Full paragraph), fully or
  // reset for a staged reveal. Full swaps use display, bullet layers
  // use visibility — the Step 24 distinction.
  function showOnly(name, reset) {
    Object.keys(layers).forEach(function (k) {
      var node = layers[k];
      if (!node) { return; }
      if (Array.isArray(node)) {
        node.forEach(function (ul) { ul.classList.add("is-hidden"); });
      } else {
        node.classList.toggle("is-hidden", true);
      }
    });
    if (name === "full") {
      stack.style.display = "none";
      fullEl.hidden = false;
      return;
    }
    stack.style.display = "";
    fullEl.hidden = true;
    var ul = activeLayer();
    if (ul) {
      ul.classList.remove("is-hidden");
      if (reset) { setLayerBullets(ul, true); }
    }
  }

  // Step 24 glide, reused: animate the answer zone between two content
  // heights over 300ms instead of jumping. Used only when the content
  // height actually changes (Full swaps, a rebuilt layer set, a dynamic
  // AI/guidance layer) — bullet-variant switches never call it.
  function glideSwap(mutator) {
    if (reduced) { mutator(); return; }
    var h0 = zone.offsetHeight;
    zone.style.height = h0 + "px";
    zone.classList.add("is-gliding");
    mutator();
    var h1 = zone.scrollHeight;
    void zone.offsetHeight;
    if (h1 === h0) { zone.style.height = ""; zone.classList.remove("is-gliding"); return; }
    zone.style.height = h1 + "px";
    later(function () { zone.style.height = ""; zone.classList.remove("is-gliding"); }, 320);
  }

  // Step 25 (E1): the question lands (fade + 6px rise + 0.92 scale,
  // 250ms) instead of popping in whole.
  function landQuestion() {
    questionEl.classList.remove("is-landing");
    void questionEl.offsetWidth;
    questionEl.classList.add("is-landing");
  }
  questionEl.addEventListener("animationend", function () {
    questionEl.classList.remove("is-landing");
  });

  // Step 25 (E2): the thinking dots crossfade out over 150ms as the
  // first bullet lands, instead of vanishing instantly.
  function fadeThinking() {
    thinkingEl.style.opacity = "0";
    timers.push(setTimeout(function () {
      thinkingEl.classList.add("is-hidden");
      thinkingEl.style.opacity = "";
    }, 150));
  }
  function showThinking() {
    thinkingEl.classList.remove("is-hidden");
    thinkingEl.style.opacity = "";
  }
  function hideThinking() {
    thinkingEl.classList.add("is-hidden");
    thinkingEl.style.opacity = "";
  }

  function setChipsEnabled(on) {
    chipBtns.forEach(function (btn) { btn.disabled = !on; });
  }
  function selectChip(name) {
    chipBtns.forEach(function (btn) {
      if (btn.getAttribute("data-variant") === name) {
        btn.setAttribute("aria-pressed", "true");
      } else if (btn.hasAttribute("aria-pressed")) {
        btn.setAttribute("aria-pressed", "false");
      }
    });
  }
  function canRework() {
    if (source === "typed-ai") { return !!IA_AI_ENDPOINT; }
    return !!variants && (source === "sample" || source === "typed-matched");
  }

  // Reveal a bullet layer's points one at a time (the app's stream),
  // then settle: pill Answer ready, meta set, chips per canRework.
  function reveal(ul, stageMs, done) {
    shownCount = 0;
    var items = ul.children;
    if (reduced || items.length === 0) {
      setLayerBullets(ul, false);
      shownCount = items.length;
      hideThinking();
      metaEl.textContent = metaWord;
      finishAnswer();
      if (done) { done(); }
      return;
    }
    // The bullet being written shows faded until it lands.
    var pending = items[0];
    pending.classList.remove("is-hidden");
    pending.classList.add("is-pending");
    for (var i = 0; i < items.length; i++) {
      (function (idx) {
        later(function () {
          var li = items[idx];
          li.classList.remove("is-hidden");
          li.classList.remove("is-pending");
          li.classList.add("is-new");
          shownCount++;
          if (idx === 0) {
            fadeThinking();
            metaEl.textContent = metaWord;
          }
          if (idx === items.length - 1) {
            later(function () {
              finishAnswer();
              if (done) { done(); }
            }, END_MS);
          }
        }, idx * stageMs);
      })(i);
    }
  }

  function finishAnswer() {
    busy = false;
    initialInFlight = false;
    answerShown = true;
    setPill("Answer ready", "listening", false);
    hideThinking();
    if (!reduced) { replayBtn.classList.remove("is-hidden"); }
    played = true;
    setChipsEnabled(canRework());
  }

  // Render the current state completely, with no motion. Used for
  // reduced motion and to settle an interrupted user-initiated flow.
  function settle() {
    clearTimers();
    if (fetchCtl) { fetchCtl.abort(); fetchCtl = null; }
    initialInFlight = false;
    setPill("Answer ready", "listening", false);
    setStart("Pause");
    questionEl.textContent = "“" + questionText + "”";
    questionEl.classList.remove("is-empty");
    transcriptEl.textContent = "";
    hideThinking();
    showOnly(variant === "full" ? "full" : "layer", false);
    if (variant !== "full") {
      var ul = activeLayer();
      if (ul) { setLayerBullets(ul, false); shownCount = ul.children.length; }
    }
    metaEl.textContent = metaWord;
    busy = false;
    answerShown = true;
    played = true;
    if (!reduced) { replayBtn.classList.remove("is-hidden"); }
    setChipsEnabled(canRework());
  }

  function renderAll() { settle(); }

  // Ghost layers reserve the question's and the transcript's FINAL
  // heights from the first frame (the Step 23 stack pattern, applied
  // to the question card in the Step 30 fix-up): the prepared bank
  // holds questions that wrap to two lines at phone widths, so a
  // one-line reservation is not enough — the ghost carries the full
  // text, invisibly, and the card is born at its final height.
  function setGhosts(dir, lang) {
    questionGhost.textContent = "“" + questionText + "”";
    questionGhost.dir = dir;
    questionGhost.lang = lang;
    transcriptGhost.textContent = questionText;
    transcriptGhost.dir = dir;
    transcriptGhost.lang = lang;
  }

  // The staged moment for the loaded sample: Start is pressed, the
  // interviewer speaks (transcript grows), the question lands whole,
  // the app thinks, the points stream in.
  function play() {
    clearTimers();
    if (fetchCtl) { fetchCtl.abort(); fetchCtl = null; }
    busy = true;
    initialInFlight = true;
    answerShown = false;
    shownCount = 0;
    variant = "base";
    metaWord = "prepared";
    lastRegen = -1;
    selectChip(null);
    setChipsEnabled(false);
    setPill("Not listening", "", false);
    setStart("Start listening");
    questionEl.textContent = "Waiting for the interviewer…";
    questionEl.classList.add("is-empty");
    questionEl.dir = "ltr";
    transcriptEl.textContent = "";
    transcriptEl.dir = sample.rtl ? "rtl" : "ltr";
    transcriptEl.lang = sample.lang || "en";
    setGhosts(sample.rtl ? "rtl" : "ltr", sample.lang || "en");
    hideThinking();
    showOnly("layer", true);
    metaEl.textContent = "";
    replayBtn.classList.add("is-hidden");
    var words = questionText.split(" ");
    var prefixes = words.map(function (_, i) { return words.slice(0, i + 1).join(" "); });
    later(function () {
      setStart("Pause");
      setPill("Listening", "listening", true);
      later(function () {
        setPill("Hearing audio", "listening", true);
        later(function () {
          setPill("Transcribing", "listening", true);
          prefixes.forEach(function (text, i) {
            later(function () { transcriptEl.textContent = text; }, i * WORD_MS);
          });
          later(function () {
            transcriptEl.textContent = "";
            questionEl.textContent = "“" + questionText + "”";
            questionEl.classList.remove("is-empty");
            questionEl.dir = sample.rtl ? "rtl" : "ltr";
            questionEl.lang = sample.lang || "en";
            landQuestion();
            setPill("Question detected", "thinking", true);
            later(function () {
              setPill("Preparing answer", "thinking", false);
              showThinking();
              reveal(layers.base, STAGE_MS);
            }, THINK_MS);
          }, prefixes.length * WORD_MS + DETECT_MS);
        }, TRANS_MS);
      }, HEAR_MS);
    }, START_MS);
  }

  // Pause: stop the timers and settle the meter. A user-initiated flow
  // (variant, typed answer) settles to its final state; the staged
  // moment keeps the Step 21 rule — it finishes only if every point is
  // already on screen, otherwise it restarts when seen again.
  function pause() {
    if (initialInFlight) {
      var ul = activeLayer();
      if (ul && shownCount === ul.children.length) { settle(); return; }
      clearTimers();
      pill.classList.remove("is-live");
      busy = false;
      return;
    }
    if (busy || answerShown) { settle(); }
  }

  // A variant request, the app's way: same question, new style. The
  // thinking beat runs, then the prepared variant streams in. The meta
  // shows the style word, as the app does; Regenerate is a fresh
  // Balanced version, so its meta returns to the source word.
  var STYLE_META = { shorter: "shorter", technical: "technical", example: "example", full: "full" };
  var STYLE_ANNOUNCE = {
    shorter: "Shorter answer shown.",
    technical: "Technical answer shown.",
    example: "Example answer shown.",
    full: "Full answer shown.",
    regen: "A new version of the answer is shown.",
    base: "Answer ready."
  };
  function requestVariant(name) {
    if (busy || !answerShown) { return; }
    if (source === "typed-ai") { askAI(name); return; }
    if (!canRework()) { return; }
    busy = true;
    setChipsEnabled(false);
    clearTimers();
    if (name === "regen") {
      lastRegen = (lastRegen + 1) % layers.regen.length;
      variant = "regen";
      metaWord = "prepared";
      selectChip(null);
    } else {
      variant = name;
      metaWord = STYLE_META[name];
      selectChip(name);
    }
    setPill("Preparing answer", "thinking", false);
    showThinking();
    metaEl.textContent = "";
    later(function () {
      if (variant === "full") {
        glideSwap(function () { showOnly("full", false); });
        hideThinking();
        metaEl.textContent = metaWord;
        finishAnswer();
      } else if (activeLayer() && stack.style.display === "none") {
        glideSwap(function () { showOnly("layer", true); });
        reveal(activeLayer(), SWITCH_STAGE_MS);
      } else {
        showOnly("layer", true);
        reveal(activeLayer(), SWITCH_STAGE_MS);
      }
      announce(STYLE_ANNOUNCE[name] || "Answer ready.");
    }, reduced ? 0 : SWITCH_THINK_MS);
  }

  chipBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      requestVariant(btn.getAttribute("data-variant"));
    });
  });

  // Typed questions. A match against the prepared bank is answered
  // from that sample (the app's prepared-reference path); anything else
  // goes to the AI endpoint when one is configured, and otherwise gets
  // the guidance answer — the shape of an answer, never an invented
  // specific one. The content switch happens at once (prepare); only
  // the reveal waits for the thinking beat, so a pause mid-beat can
  // still settle onto the right answer.
  var MATCHERS = [
    ["tell", ["about yourself", "introduce yourself", "خودتان", "نفسك"]],
    ["hire", ["hire you", "why you", "should we hire"]],
    ["weakness", ["weakness", "improvement area", "weak point"]],
    ["story", ["difficult project", "led a", "lead a", "challenging project"]],
    ["five", ["five years", "5 years", "see yourself"]],
    ["salary", ["salary", "compensation", "pay are you", "pay do you", "expecting"]],
    ["conflict", ["conflict", "coworker", "co-worker", "disagreement", "disagreed"]],
    ["why", ["work here", "work for us", "join us", "join our", "this company", "our company"]]
  ];
  function matchSample(text) {
    var norm = " " + text.toLowerCase().replace(/[?.!,;:'"“”]/g, " ") + " ";
    for (var k = 0; k < KEYS.length; k++) {
      if (norm.indexOf(" " + SAMPLES[KEYS[k]].q.toLowerCase().replace(/[?.!]/g, "") + " ") >= 0) { return KEYS[k]; }
    }
    for (var i = 0; i < MATCHERS.length; i++) {
      for (var j = 0; j < MATCHERS[i][1].length; j++) {
        if (norm.indexOf(MATCHERS[i][1][j]) >= 0) { return MATCHERS[i][0]; }
      }
    }
    return null;
  }

  var flowId = 0; // stale async completions (a fetch, a beat) bail out
  function typedFlow(prepare, revealFn) {
    clearTimers();
    flowId++;
    busy = true;
    answerShown = false;
    setChipsEnabled(false);
    selectChip(null);
    variant = "base";
    lastRegen = -1;
    setStart("Pause");
    transcriptEl.textContent = "";
    questionEl.textContent = "“" + questionText + "”";
    questionEl.classList.remove("is-empty");
    questionEl.dir = /[\u0600-\u06FF]/.test(questionText) ? "rtl" : "ltr";
    setGhosts(questionEl.dir, questionEl.lang || "en");
    landQuestion();
    setPill("Question detected", "thinking", true);
    metaEl.textContent = "";
    if (prepare) { prepare(); }
    var myFlow = flowId;
    later(function () {
      if (myFlow !== flowId) { return; }
      setPill("Preparing answer", "thinking", false);
      showThinking();
      if (revealFn) { revealFn(); }
    }, reduced ? 0 : THINK_MS);
  }

  function prepareDynamic(bullets, meta, src) {
    source = src;
    metaWord = meta;
    variant = "dyn";
    var isRtl = /[\u0600-\u06FF]/.test(questionText);
    var ul = makeLayer(bullets, isRtl, isRtl ? "fa" : "en");
    if (layers.dyn && layers.dyn.parentNode === stack) { stack.removeChild(layers.dyn); }
    layers.dyn = ul;
    stack.appendChild(ul);
    glideSwap(function () { showOnly("dyn", true); });
  }

  function prepareFallback() {
    prepareDynamic(FALLBACK.answer.slice(), "guidance", "typed-fallback");
  }

  // The AI path — used only when IA_AI_ENDPOINT is configured (the
  // proxy holds the key; nothing secret ever ships in this file). A
  // variant of an AI answer is a fresh generation with that style,
  // exactly like the app. Any failure lands on the guidance answer, so
  // the box never hangs.
  function askAI(styleName) {
    if (!IA_AI_ENDPOINT) { prepareFallback(); reveal(layers.dyn, SWITCH_STAGE_MS); announce("Answer ready."); return; }
    /* Step 40: a browser without fetch lands on the same guidance
       fallback as any other failure (the demo path already guarded
       this; the hero path threw). */
    if (typeof fetch !== "function") { prepareFallback(); reveal(layers.dyn, SWITCH_STAGE_MS); announce("Answer ready."); return; }
    busy = true;
    setChipsEnabled(false);
    flowId++;
    var myFlow = flowId;
    setPill("Preparing answer", "thinking", false);
    showThinking();
    metaEl.textContent = "";
    if (fetchCtl) { fetchCtl.abort(); }
    iaFetchAI(questionText, styleName || "base",
      function () { return fetchCtl; },
      function (c) { fetchCtl = c; },
      function (data) {
      if (myFlow !== flowId) { return; }
      if (styleName === "full" && data && typeof data.full === "string" && data.full) {
        source = "typed-ai";
        variant = "full";
        metaWord = "full";
        selectChip("full");
        fullEl.textContent = data.full;
        fullEl.dir = /[\u0600-\u06FF]/.test(questionText) ? "rtl" : "ltr";
        fullEl.lang = fullEl.dir === "rtl" ? "fa" : "en";
        glideSwap(function () { showOnly("full", false); });
        hideThinking();
        metaEl.textContent = metaWord;
        finishAnswer();
        announce(STYLE_ANNOUNCE.full);
        return;
      }
      var bullets = (data && Array.isArray(data.bullets)) ? data.bullets.filter(function (b) { return typeof b === "string" && b; }).slice(0, 4) : [];
      if (!bullets.length) { throw new Error("shape"); }
      if (styleName && styleName !== "base" && styleName !== "regen") {
        prepareDynamic(bullets, STYLE_META[styleName] || "live", "typed-ai");
        selectChip(styleName);
      } else {
        prepareDynamic(bullets, "live", "typed-ai");
        selectChip(null);
      }
      reveal(layers.dyn, SWITCH_STAGE_MS);
      announce(STYLE_ANNOUNCE[styleName] || "Answer ready.");
      },
      function () {
      if (myFlow !== flowId) { return; }
      prepareFallback();
      reveal(layers.dyn, SWITCH_STAGE_MS);
      announce("Answer ready.");
      });
  }

  function submitTyped() {
    var text = inputEl ? inputEl.value.trim() : "";
    if (!text || busy) { return; }
    questionText = text;
    if (inputEl) { inputEl.value = ""; }
    var matched = matchSample(text);
    if (matched) {
      typedFlow(function () {
        key = matched;
        sample = SAMPLES[key];
        variants = IA_VARIANTS[key] || null;
        source = "typed-matched";
        metaWord = "prepared";
        glideSwap(function () { buildLayers(); showOnly("layer", true); });
      }, function () {
        reveal(layers.base, SWITCH_STAGE_MS);
        announce("Answer ready.");
      });
    } else if (IA_AI_ENDPOINT) {
      typedFlow(null, function () { askAI("base"); });
    } else {
      typedFlow(prepareFallback, function () {
        reveal(layers.dyn, SWITCH_STAGE_MS);
        announce("Answer ready.");
      });
    }
  }
  if (formEl && inputEl) {
    formEl.addEventListener("submit", function (ev) {
      ev.preventDefault();
      submitTyped();
    });
  }

  // Replay: the glyph takes one full turn as the moment restarts (the
  // research-backed activation cue — on click, never on hover). Then
  // the current question's arrival replays: the full staged moment for
  // the loaded sample, the shorter typed flow for a typed question.
  replayBtn.addEventListener("click", function () {
    if (!reduced) {
      replayBtn.classList.add("is-spinning");
      if (spinTimer) { clearTimeout(spinTimer); }
      spinTimer = setTimeout(function () { replayBtn.classList.remove("is-spinning"); }, 320);
    }
    if (busy) { return; }
    if (source === "sample") {
      play();
    } else {
      var keepVariant = variant, keepMeta = metaWord, keepRegen = lastRegen;
      typedFlow(null, function () {
        variant = keepVariant;
        metaWord = keepMeta;
        lastRegen = keepRegen;
        if (variant !== "base" && variant !== "dyn") { selectChip(variant === "regen" ? null : variant); }
        if (variant === "full") {
          glideSwap(function () { showOnly("full", false); });
          hideThinking();
          metaEl.textContent = metaWord;
          finishAnswer();
        } else {
          glideSwap(function () { showOnly("layer", true); });
          reveal(activeLayer(), SWITCH_STAGE_MS);
        }
      });
    }
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      pause();
    } else if (!played && !busy) {
      play();
    }
  });

  buildLayers();
  setGhosts(sample.rtl ? "rtl" : "ltr", sample.lang || "en");
  if (reduced) { renderAll(); return; }

  // Pause when scrolled off-screen; play once when first seen.
  var visual = stack.closest ? stack.closest(".hero-visual") : null;
  if (visual && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        if (!played && !busy) { play(); }
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
  // Step 38 — the start button's icon follows its label: the play
  // triangle belongs to "Start listening"/"Resume", the pause bars to
  // "Pause". Before this, the label changed and the icon never did,
  // so a button reading "Pause" carried a play glyph.
  var startIconEl = document.getElementById("story-start-icon");
  var PLAY_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3v10l8-5z" fill="currentColor"/></svg>';
  var PAUSE_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3.8" y="3" width="2.8" height="10" rx="1" fill="currentColor"/><rect x="9.4" y="3" width="2.8" height="10" rx="1" fill="currentColor"/></svg>';
  function setStart(label) {
    startLabelEl.textContent = label;
    if (startIconEl) { startIconEl.innerHTML = label === "Pause" ? PAUSE_ICON : PLAY_ICON; }
  }

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
      p.addEventListener("animationend", function () { p.classList.remove("is-landing"); });
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
  // Step 25 (E1): the question lands (fade + 6px rise + 0.92 scale, 250ms)
  // instead of popping in whole; the class is removed when the animation
  // ends so a revisit re-triggers it.
  function setQuestionLayer(i) {
    showLayer(questionLayers, i);
    if (questionLayers[i]) {
      var layer = questionLayers[i];
      layer.classList.remove("is-landing");
      void layer.offsetWidth;
      layer.classList.add("is-landing");
    }
  }
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

  // Step 25 (E2): the thinking dots crossfade out over 150ms as the first
  // bullet lands, instead of vanishing instantly. The timeout is tracked
  // in timers so an interruption clears it; the opacity is reset wherever
  // the row is hidden or shown again.
  function fadeThinking() {
    thinkingEl.style.opacity = "0";
    timers.push(setTimeout(function () {
      thinkingEl.classList.add("is-hidden");
      thinkingEl.style.opacity = "";
    }, 150));
  }

  function setLiveBase() {
    showView("live");
    setStart("Pause");
    badge.hidden = true;
    transcriptEl.textContent = "";
    contextEl.classList.add("is-hidden");
    thinkingEl.classList.add("is-hidden");
    thinkingEl.style.opacity = "";
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
      setStart("Start listening");
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
        thinkingEl.style.opacity = "";
        setAnswerLayer(1);
        // The bullet being written shows faded until it lands: it is the
        // pre-rendered first bullet, revealed faded.
        setBulletState(1, 0, "pending");
        Q1_POINTS.forEach(function (text, i) {
          timers.push(setTimeout(function () {
            setBulletState(1, i, "new");
            if (i === 0) {
              fadeThinking();
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
    ".flow-node, .flow-break, .meter-card, .installer, .lang-card, .req-item, " +
    // Step 72 — the motion pilot: How It Works adopts the reveal
    // primitive (the trace card, the prediction card, boundary
    // cards). These classes exist on that page only, so no other
    // page changes behaviour. The hero and the verdict rows stay
    // out of JS reach entirely — the static-top discipline of
    // Steps 68/71; their motion is the CSS-only entrance.
    ".hw-trace, .hw-faded, .hw-bound"
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

/* Step 48 — Growth & Campaigns: renders the announcements carried
   by the release Worker's public /growth document into the slots
   each page declares (a top bar on every page, an update card on
   the homepage, a callout on the pricing page). The document is
   data, never markup: strict shape checks first, textContent-only
   rendering, and any failure — network, shape, country mismatch,
   a past dismissal — leaves the page exactly as authored (the
   static page is the honest floor, the same rule as the download
   manifest). The document carries announcements only: no prices
   and no offers, so nothing here can promise a price that a real
   checkout would not honor. */
(function () {
  "use strict";
  var bar = document.getElementById("ia-growth-bar");
  var home = document.getElementById("ia-growth-home");
  var homeInner = document.getElementById("ia-growth-home-inner");
  var pricing = document.getElementById("ia-growth-pricing");
  if (!bar && !home && !pricing) { return; }
  var ENDPOINT = "https://admin.cybervalida.online/growth";
  var TYPES = ["release", "feature", "product_news", "maintenance", "notice", "offer"];
  var LABELS = { release: "New release", feature: "New feature", product_news: "News",
    maintenance: "Maintenance", notice: "Notice", offer: "Offer" };
  var dismissed = loadDismissed();
  if (typeof fetch !== "function") { return; }
  fetch(ENDPOINT, { headers: { "Accept": "application/json" } })
    .then(function (r) { if (!r.ok) { throw new Error("growth unavailable"); } return r.json(); })
    .then(function (doc) { render(doc); })
    .catch(function () { /* the static page is the honest floor */ });

  function loadDismissed() {
    try {
      var raw = window.localStorage.getItem("ia_growth_dismissed");
      var arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) { return []; }
      return arr.filter(function (x) { return typeof x === "string"; });
    } catch (e) { return []; }
  }
  function saveDismissed() {
    try { window.localStorage.setItem("ia_growth_dismissed", JSON.stringify(dismissed.slice(-50))); }
    catch (e) { /* dismissal then lasts for this page view only */ }
  }
  function valid(a) {
    if (!a || typeof a.id !== "string" || !a.id) { return false; }
    if (TYPES.indexOf(a.type) < 0) { return false; }
    if (["bar", "home_card", "pricing_callout"].indexOf(a.placement) < 0) { return false; }
    if (typeof a.headline !== "string" || !a.headline || a.headline.length > 140) { return false; }
    if (typeof a.body !== "string" || a.body.length > 500) { return false; }
    if (typeof a.linkUrl !== "string" || (a.linkUrl !== "" && !/^https:\/\//.test(a.linkUrl))) { return false; }
    if (typeof a.linkLabel !== "string" || a.linkLabel.length > 40) { return false; }
    if (a.linkUrl && !a.linkLabel) { return false; }
    if (a.countries !== null && !Array.isArray(a.countries)) { return false; }
    if (Array.isArray(a.countries)) {
      for (var i = 0; i < a.countries.length; i++) {
        if (!/^[A-Z]{2}$/.test(a.countries[i])) { return false; }
      }
    }
    if (a.endsAt !== null && (typeof a.endsAt !== "number" || !isFinite(a.endsAt))) { return false; }
    return true;
  }
  function eligible(a, country) {
    if (!a.countries) { return true; }
    return !!country && a.countries.indexOf(country) >= 0;
  }
  function render(doc) {
    if (!doc || !Array.isArray(doc.announcements)) { return; }
    var country = typeof doc.displayCountry === "string" ? doc.displayCountry : "";
    var nowSec = Math.floor(Date.now() / 1000);
    var list = [];
    doc.announcements.forEach(function (a) {
      /* A cached document must never outlive an announcement: if
         its end has passed by the visitor's clock, it does not
         render, however fresh the copy looked to the cache. */
      if (a && a.endsAt !== null && typeof a.endsAt === "number" && a.endsAt <= nowSec) { return; }
      if (valid(a) && eligible(a, country) && dismissed.indexOf(a.id) < 0) { list.push(a); }
    });
    if (bar) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].placement === "bar") { renderBar(list[i]); break; }
      }
    }
    if (home && homeInner) {
      var cards = list.filter(function (a) { return a.placement === "home_card"; }).slice(0, 3);
      if (cards.length) { renderHome(cards); }
    }
    if (pricing) {
      var cos = list.filter(function (a) { return a.placement === "pricing_callout"; }).slice(0, 2);
      if (cos.length) { renderPricing(cos); }
    }
  }
  function endsLine(a) {
    if (!a.endsAt) { return ""; }
    try {
      return "Until " + new Date(a.endsAt * 1000).toLocaleDateString("en-US",
        { month: "long", day: "numeric", year: "numeric" }) + ".";
    } catch (e) { return ""; }
  }
  function linkFor(a) {
    if (!a.linkUrl) { return null; }
    var link = document.createElement("a");
    link.href = a.linkUrl;
    link.textContent = a.linkLabel;
    return link;
  }
  function dismissBtn(a, node, slot) {
    if (!a.dismissible) { return null; }
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ia-dismiss";
    btn.setAttribute("aria-label", "Dismiss this announcement");
    btn.textContent = "×";
    btn.addEventListener("click", function () {
      if (dismissed.indexOf(a.id) < 0) { dismissed.push(a.id); saveDismissed(); }
      if (node && node.parentNode) { node.parentNode.removeChild(node); }
      if (slot && !slot.querySelector(".ia-item")) { slot.hidden = true; }
      if (slot === bar) { bar.hidden = true; }
    });
    return btn;
  }
  function renderBar(a) {
    bar.innerHTML = "";
    var inner = document.createElement("div");
    inner.className = "ia-bar-inner container ia-item";
    var text = document.createElement("p");
    text.className = "ia-bar-text";
    var strong = document.createElement("strong");
    strong.textContent = a.headline;
    text.appendChild(strong);
    var rest = (a.body ? " " + a.body : "") + (endsLine(a) ? " " + endsLine(a) : "");
    if (rest) { text.appendChild(document.createTextNode(rest)); }
    inner.appendChild(text);
    var link = linkFor(a);
    if (link) { link.className = "ia-bar-link"; inner.appendChild(link); }
    var btn = dismissBtn(a, inner, bar);
    if (btn) { inner.appendChild(btn); }
    bar.appendChild(inner);
    bar.hidden = false;
  }
  function renderHome(cards) {
    homeInner.innerHTML = "";
    cards.forEach(function (a) {
      var card = document.createElement("article");
      card.className = "card ia-update-card ia-item";
      var eyebrow = document.createElement("p");
      eyebrow.className = "eyebrow";
      eyebrow.textContent = LABELS[a.type] || "News";
      card.appendChild(eyebrow);
      var h = document.createElement("h3");
      h.textContent = a.headline;
      card.appendChild(h);
      if (a.body) {
        var p = document.createElement("p");
        p.textContent = a.body;
        card.appendChild(p);
      }
      var tail = endsLine(a);
      if (tail) {
        var m = document.createElement("p");
        m.className = "muted";
        m.textContent = tail;
        card.appendChild(m);
      }
      var link = linkFor(a);
      if (link) { card.appendChild(link); }
      var btn = dismissBtn(a, card, home);
      if (btn) { card.appendChild(btn); }
      homeInner.appendChild(card);
    });
    /* The slot deliberately does not carry .section while hidden:
       .section + .section { padding-top: 0 } would otherwise strip
       the next section's top padding and shift the page even with
       no campaign. It gains the class only when it renders. */
    home.classList.add("section");
    home.hidden = false;
  }
  function renderPricing(cos) {
    pricing.innerHTML = "";
    cos.forEach(function (a) {
      var box = document.createElement("div");
      box.className = "callout ia-callout ia-item";
      var p = document.createElement("p");
      var strong = document.createElement("strong");
      strong.textContent = a.headline;
      p.appendChild(strong);
      var rest = (a.body ? " " + a.body : "") + (endsLine(a) ? " " + endsLine(a) : "");
      if (rest) { p.appendChild(document.createTextNode(rest)); }
      box.appendChild(p);
      var link = linkFor(a);
      if (link) { box.appendChild(link); }
      var btn = dismissBtn(a, box, pricing);
      if (btn) { box.appendChild(btn); }
      pricing.appendChild(box);
    });
    pricing.hidden = false;
  }
})();

/* Step 41 — download page: platform detection + release-manifest
   rendering. The static page is the honest floor (nothing published);
   when IA_RELEASES_ENDPOINT serves a manifest, this renders only what
   the manifest proves: real download buttons for released platforms,
   in the owner's order — the visitor's platform first if it is
   released, otherwise Windows first, then the rest in fixed order,
   with unreleased platforms last as status cards
   (standards/RELEASES.md). All manifest data is rendered with
   textContent, never innerHTML. */
(function () {
  "use strict";
  var rec = document.getElementById("dl-rec");
  if (!rec) { return; }
  var ORDER = ["windows", "android", "ios", "mac"];
  var NAMES = { windows: "Windows", android: "Android", ios: "iOS", mac: "Mac" };
  var PLANNED = {
    android: "Interview Assistant for Android is planned — a companion first, with no date yet.",
    ios: "Interview Assistant for iOS is planned — whether it can capture meeting audio is still being researched.",
    mac: "Interview Assistant for Mac is planned as a dedicated native app, with no date yet."
  };
  var MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  var detected = detectPlatform();

  var detectedEl = document.getElementById("dl-rec-detected");
  if (detected && detected !== "windows" && detectedEl && PLANNED[detected]) {
    detectedEl.textContent = "You are on " + NAMES[detected] + ". " + PLANNED[detected];
    detectedEl.hidden = false;
  }

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || typeof t.closest !== "function") { return; }
    var copyBtn = t.closest(".dl-sha-copy");
    if (copyBtn) { copySha(copyBtn); return; }
    var link = t.closest("a[data-dl-file]");
    if (link) { showAfter(link); }
  });

  /* Step 57 — the contextual help block's state line mirrors
     this page's real release state. It appears exactly when the
     rendered page offers no download: the manifest fetch failed,
     the manifest carried no valid published release, or no
     fetch could run at all. When a release does render, the
     line stays hidden — the block never claims a state the
     manifest did not produce. */
  var helpState = document.getElementById("dl-help-state");
  function markNoRelease() { if (helpState) { helpState.hidden = false; } }

  if (IA_RELEASES_ENDPOINT && typeof fetch === "function") {
    fetch(IA_RELEASES_ENDPOINT, { headers: { "Accept": "application/json" } })
      .then(function (r) { if (!r.ok) { throw new Error("manifest unavailable"); } return r.json(); })
      .then(function (data) {
        var byPlatform = pickReleases(data);
        if (byPlatform) { render(byPlatform); }
        else { markNoRelease(); }
      })
      .catch(function () { markNoRelease(); /* the static page is the honest floor */ });
  } else {
    markNoRelease();
  }

  function detectPlatform() {
    try {
      var uad = navigator.userAgentData;
      if (uad && typeof uad.platform === "string" && uad.platform) {
        var p = uad.platform.toLowerCase();
        if (p.indexOf("win") >= 0) { return "windows"; }
        if (p.indexOf("android") >= 0) { return "android"; }
        if (p.indexOf("mac") >= 0) { return "mac"; }
      }
    } catch (err) { /* fall through to the UA string */ }
    var ua = navigator.userAgent || "";
    if (/Android/i.test(ua)) { return "android"; }
    if (/iPhone|iPad|iPod/i.test(ua)) { return "ios"; }
    if (/Windows/i.test(ua)) { return "windows"; }
    if (/Macintosh|Mac OS X/i.test(ua)) { return "mac"; }
    return null;
  }

  function validFile(f) {
    return !!f && typeof f.name === "string" && f.name !== "" &&
      typeof f.url === "string" && /^https:\/\//.test(f.url) &&
      typeof f.size === "number" && isFinite(f.size) && f.size >= 0 &&
      typeof f.sha256 === "string" && /^[0-9a-f]{64}$/i.test(f.sha256);
  }

  function pickReleases(data) {
    if (!data || !Array.isArray(data.releases)) { return null; }
    var stable = {}, beta = {}, any = false;
    data.releases.forEach(function (r) {
      if (!r || ORDER.indexOf(r.platform) < 0 || typeof r.version !== "string" || r.version === "") { return; }
      var files = (Array.isArray(r.files) ? r.files : []).filter(validFile);
      if (!files.length) { return; }
      var rel = {
        platform: r.platform, version: r.version,
        channel: r.channel === "beta" ? "beta" : "stable",
        publishedAt: typeof r.publishedAt === "string" ? r.publishedAt : "",
        notes: typeof r.notes === "string" ? r.notes : "",
        minRequirement: typeof r.minRequirement === "string" ? r.minRequirement : "",
        files: files.map(function (f) {
          return { name: f.name, url: f.url, size: f.size, sha256: f.sha256.toLowerCase(),
            kind: typeof f.kind === "string" ? f.kind : "",
            label: typeof f.label === "string" ? f.label : "" };
        })
      };
      if (rel.channel === "beta") { if (!beta[rel.platform]) { beta[rel.platform] = rel; } }
      else if (!stable[rel.platform]) { stable[rel.platform] = rel; }
      any = true;
    });
    if (!any) { return null; }
    var out = {};
    ORDER.forEach(function (p) { if (stable[p]) { out[p] = stable[p]; } else if (beta[p]) { out[p] = beta[p]; } });
    return out;
  }

  function orderPlatforms(byPlatform) {
    var first = null;
    if (detected && byPlatform[detected]) { first = detected; }
    else if (byPlatform.windows) { first = "windows"; }
    else {
      for (var i = 0; i < ORDER.length; i++) { if (byPlatform[ORDER[i]]) { first = ORDER[i]; break; } }
    }
    var out = [];
    if (first) { out.push(first); }
    ORDER.forEach(function (p) { if (byPlatform[p] && p !== first) { out.push(p); } });
    ORDER.forEach(function (p) { if (!byPlatform[p]) { out.push(p); } });
    return out;
  }

  function fmtSize(bytes) {
    if (bytes >= 1048576) { return (bytes / 1048576).toFixed(1) + " MB"; }
    if (bytes >= 1024) { return Math.round(bytes / 1024) + " KB"; }
    return bytes + " B";
  }

  function fmtDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || "");
    if (!m) { return ""; }
    var month = MONTHS[Number(m[2]) - 1];
    if (!month) { return ""; }
    return Number(m[3]) + " " + month + " " + m[1];
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) { node.className = cls; }
    if (text !== undefined) { node.textContent = text; }
    return node;
  }

  function shaBlock(sha) {
    var box = el("div", "dl-sha");
    box.appendChild(el("span", "dl-sha-label", "SHA-256"));
    box.appendChild(el("code", "", sha));
    var btn = el("button", "btn btn-secondary btn-small dl-sha-copy", "Copy");
    btn.setAttribute("type", "button");
    btn.setAttribute("data-sha", sha);
    box.appendChild(btn);
    return box;
  }

  function downloadLink(file, primary) {
    var a = el("a", primary ? "btn btn-primary" : "btn btn-secondary", file.label || file.name);
    a.setAttribute("href", file.url);
    a.setAttribute("download", "");
    a.setAttribute("data-dl-file", "");
    a.setAttribute("data-name", file.name);
    a.setAttribute("data-size", String(file.size));
    a.setAttribute("data-sha", file.sha256);
    return a;
  }

  function versionText(rel) {
    var d = fmtDate(rel.publishedAt);
    return "Version " + rel.version + (d ? " · " + d : "");
  }

  function fillCard(card, rel) {
    var status = card.querySelector(".dl-card-status");
    if (status) { status.hidden = true; }
    var req = card.querySelector(".dl-card-req");
    if (req && rel.minRequirement) { req.textContent = rel.minRequirement; }
    var live = card.querySelector(".dl-card-live");
    if (!live) { return; }
    var head = el("p", "dl-card-version", versionText(rel));
    if (rel.channel === "beta") {
      head.appendChild(document.createTextNode(" "));
      head.appendChild(el("span", "badge badge-plan", "Beta"));
    }
    live.appendChild(head);
    rel.files.forEach(function (f) {
      var row = el("div", "dl-file");
      var info = el("div", "dl-file-info");
      info.appendChild(el("span", "dl-file-name", f.label || f.name));
      info.appendChild(el("span", "dl-file-size", fmtSize(f.size)));
      row.appendChild(info);
      var link = downloadLink(f, false);
      link.classList.add("btn-small");
      row.appendChild(link);
      live.appendChild(row);
      live.appendChild(shaBlock(f.sha256));
    });
    live.hidden = false;
  }

  function fillRec(rel) {
    var label = document.getElementById("dl-rec-label");
    if (label) { label.textContent = "Recommended — " + NAMES[rel.platform]; }
    var title = document.getElementById("dl-rec-title");
    if (title) { title.textContent = "Interview Assistant for " + NAMES[rel.platform] + "."; }
    var status = document.getElementById("dl-rec-status");
    if (status) { status.hidden = true; }
    var actions = document.getElementById("dl-rec-actions");
    if (actions) { actions.hidden = true; }
    var note = document.getElementById("download-note");
    if (note) { note.textContent = "Published and signed. After the file downloads, check its SHA-256 — shown here and on the platform card — against the file on your machine."; }
    var live = document.getElementById("dl-rec-live");
    if (!live) { return; }
    var meta = el("p", "dl-rec-meta", versionText(rel));
    if (rel.channel === "beta") {
      meta.appendChild(document.createTextNode(" "));
      meta.appendChild(el("span", "badge badge-plan", "Beta"));
    }
    live.appendChild(meta);
    if (rel.minRequirement) { live.appendChild(el("p", "dl-rec-req", rel.minRequirement)); }
    var row = el("p", "cta-row");
    rel.files.forEach(function (f, i) { row.appendChild(downloadLink(f, i === 0)); });
    live.appendChild(row);
    live.appendChild(shaBlock(rel.files[0].sha256));
    live.hidden = false;
  }

  function fillWhatsNew(rel) {
    if (!rel || !rel.notes || !rel.notes.trim()) { return; }
    var section = document.getElementById("dl-whatsnew");
    var body = document.getElementById("dl-whatsnew-body");
    var title = document.getElementById("dl-whatsnew-title");
    if (!section || !body) { return; }
    if (title) { title.textContent = "What’s new in " + rel.version; }
    rel.notes.split(/\n\s*\n/).forEach(function (para) {
      var t = para.trim();
      if (t) { body.appendChild(el("p", "", t)); }
    });
    section.hidden = false;
  }

  function fillAll(byPlatform, order) {
    var section = document.getElementById("dl-all");
    var body = document.getElementById("dl-all-body");
    if (!section || !body) { return; }
    var rows = 0;
    order.forEach(function (p) {
      var rel = byPlatform[p];
      if (!rel) { return; }
      rel.files.forEach(function (f) {
        var rowEl = el("div", "dl-all-row");
        var info = el("div", "dl-file-info");
        info.appendChild(el("span", "dl-file-name", NAMES[p] + " — " + (f.label || f.name)));
        info.appendChild(el("span", "dl-file-size", "Version " + rel.version + " · " + fmtSize(f.size)));
        rowEl.appendChild(info);
        var link = downloadLink(f, false);
        link.classList.add("btn-small");
        link.textContent = "Download";
        rowEl.appendChild(link);
        body.appendChild(rowEl);
        rows++;
      });
    });
    if (rows) { section.hidden = false; }
  }

  function render(byPlatform) {
    var order = orderPlatforms(byPlatform);
    var grid = document.getElementById("dl-platforms");
    var cards = {};
    if (grid) {
      var kids = Array.prototype.slice.call(grid.children);
      kids.forEach(function (c) { cards[c.getAttribute("data-platform")] = c; });
      order.forEach(function (p) { if (cards[p]) { grid.appendChild(cards[p]); } });
    }
    order.forEach(function (p) { if (byPlatform[p] && cards[p]) { fillCard(cards[p], byPlatform[p]); } });
    var first = null;
    for (var i = 0; i < order.length; i++) { if (byPlatform[order[i]]) { first = byPlatform[order[i]]; break; } }
    if (first) { fillRec(first); fillWhatsNew(first); }
    fillAll(byPlatform, order);
  }

  function showAfter(link) {
    var panel = document.getElementById("dl-after");
    var text = document.getElementById("dl-after-text");
    var shaSlot = document.getElementById("dl-after-sha");
    if (!panel || !text) { return; }
    var size = Number(link.getAttribute("data-size")) || 0;
    text.textContent = (link.getAttribute("data-name") || "Your file") + " · " +
      fmtSize(size) + " — if the download did not start, use the download button again.";
    if (shaSlot) {
      shaSlot.textContent = "";
      var sha = link.getAttribute("data-sha");
      if (sha) { shaSlot.appendChild(shaBlock(sha)); }
    }
    panel.hidden = false;
  }

  function copySha(btn) {
    var sha = btn.getAttribute("data-sha");
    if (!sha) { return; }
    function done() {
      btn.textContent = "Copied";
      setTimeout(function () { btn.textContent = "Copy"; }, 2000);
    }
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(sha).then(done, done);
    } else { done(); }
  }
})();

/* Step 25 — chip-row fade edge: a scroller's mask shows only where there
   is more content to scroll to. The scrolling itself is pure CSS
   (native overflow-x); this only toggles the mask classes, on scroll and
   on resize. The chips are decorative spans for now (they become real
   buttons in the next phase), so the row needs no keyboard handling yet —
   the pinned Replay button beside it is focusable. */
(function () {
  "use strict";
  function update(scroller) {
    scroller.classList.toggle("can-scroll-right",
      scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 1);
    scroller.classList.toggle("can-scroll-left", scroller.scrollLeft > 0);
  }
  function updateAll() {
    document.querySelectorAll(".app-actions-scroll").forEach(update);
  }
  document.querySelectorAll(".app-actions-scroll").forEach(function (scroller) {
    scroller.addEventListener("scroll", function () { update(scroller); }, { passive: true });
    update(scroller);
  });
  window.addEventListener("resize", updateAll);
})();

/* Step 54 — Support assistant, Phase 1 (support.html only). The
   local brain of the approved design (step53-support/design-v2.md):
   a procedures engine over a curated bank built only from this
   page's own support playbooks, real live diagnostics against the
   site's own services, and a fully prepared email handoff to the
   developer. No AI, no answer cache, no Cmd+K — those are Phases
   2–3, and nothing here promises them. Answers are instant: the
   only waiting a visitor ever sees is a real network check
   settling. Every path ends somewhere useful — a resolution, a
   diagnostic, a related procedure, or the email handoff — and if
   one of our own services fails, the assistant says the problem
   is on our side. All rendering is textContent-only. */
(function () {
  "use strict";
  var root = document.getElementById("support-assistant");
  if (!root) { return; }
  var log = document.getElementById("sa-log");
  var form = document.getElementById("sa-form");
  var input = document.getElementById("sa-input");
  var topicsEl = document.getElementById("sa-topics");
  var checkBtn = document.getElementById("sa-check-btn");
  if (!log || !form || !input || !topicsEl || !checkBtn) { return; }
  /* Step 55 — the page is a router now: the conversation lives in
     a collapsible body under the single entry, blended results
     render under the input, and tiles/suggestions start
     procedures from outside the panel. All four elements are
     optional here so the Phase 1 harness keeps running the module
     against the original panel shape. */
  var bodyEl = document.getElementById("sa-body");
  var resultsEl = document.getElementById("sa-results");
  var tilesEl = document.getElementById("sa-tiles");
  var suggestEl = document.getElementById("sa-suggest");
  /* Step 56 — the state strip (resume chip + services status),
     the symptom cards and the live region. All optional, like
     the Step 55 elements: older harnesses keep running. */
  var stateEl = document.getElementById("sa-state");
  var resumeBtn = document.getElementById("sa-resume");
  var statusEl = document.getElementById("sa-status");
  var symptomsEl = document.getElementById("sa-symptoms");
  var liveEl = document.getElementById("sa-live");
  if (!liveEl) {
    liveEl = el("p", "visually-hidden");
    liveEl.setAttribute("role", "status");
    liveEl.setAttribute("aria-live", "polite");
    root.appendChild(liveEl);
  }

  var SUPPORT_ADDR = "support@cybervalida.online";
  var GROWTH_URL = "https://admin.cybervalida.online/growth";
  var FA_LEAD = "متوجه شدم — راهنمای قدم‌به‌قدمِ همین مشکل را برایتان باز می‌کنم. قدم‌ها را به انگلیسی می‌آورم، دقیقاً با همان متن راهنمای محصول:";
  var AR_LEAD = "فهمت المشكلة — أفتح لك الدليل خطوة بخطوة لهذه المشكلة بالذات. أعرض الخطوات بالإنجليزية، بالنص نفسه الوارد في دليل المنتج:";

  /* The bank. Every fact below is already stated on this page or
     on the page it links to — the assistant restructures the
     playbooks into procedures, it does not add claims. Node
     choices end at a node index, another procedure ("proc"), a
     defined exit ("resolved"), or an action ("diagnostics",
     "email", "resume", "topics"). */
  var BANK = [
    {
      id: "audio-none",
      title: "No audio — nothing is transcribed",
      subject: "support",
      keys: ["audio", "sound", "hear", "heard", "transcrib", "headset", "headphones", "earphones", "microphone", "mic", "wasapi", "loopback", "playback", "device", "silent", "silence", "empty", "nothing"],
      phrases: ["no audio", "no sound", "can't hear", "cannot hear", "can't hear the interviewer", "not transcribing", "nothing is transcribed", "no transcript", "doesn't hear", "does not hear", "isn't hearing", "not hearing"],
      faKeys: ["صدا", "هدفون", "هدست", "میکروفون", "شنیده"],
      arKeys: ["صوت", "سماعات", "ميكروفون", "اسمع"],
      nodes: [
        {
          say: ["The app hears the interviewer through your headset: it captures the playback device with WASAPI loopback, and it does not record your microphone. An empty stream is recorded as no audio — the app will not invent a transcript. Let's check the path in order."],
          steps: ["In Windows sound settings, make the headset you are wearing the default playback device.", "Play the meeting audio and confirm you hear it in the headset — not through the speakers."],
          choices: [
            { label: "The meeting plays through the speakers", to: 1 },
            { label: "It plays in the headset, still no transcript", to: 2 },
            { label: "That fixed it", exit: "resolved" }
          ]
        },
        {
          say: ["Loopback captures the device the sound actually plays through — if the meeting is on the speakers, the app is listening to a silent stream."],
          steps: ["In the meeting app's audio settings, set the output (speaker) to your headset.", "Keep the same headset as the default playback device in Windows sound settings.", "Ask the interviewer to say a sentence and watch for the transcript."],
          choices: [
            { label: "That fixed it", exit: "resolved" },
            { label: "Still nothing", to: 2 }
          ]
        },
        {
          say: ["Next suspect is exclusive control: another app can hold the device and starve the stream."],
          steps: ["Close other apps that use audio — music players, other calls, recorders.", "In Windows sound settings, open your headset's advanced settings and turn off “Allow applications to take exclusive control of this device”.", "Restart the app and test again while the interviewer speaks."],
          choices: [
            { label: "That fixed it", exit: "resolved" },
            { label: "Still no audio", to: 3 }
          ]
        },
        {
          say: ["You have covered the whole device path. Two useful moves remain: run the live system check to confirm our services are healthy, or send the developer a prepared email — it includes everything you have tried here."],
          choices: [
            { label: "Run the system check", action: "diagnostics" },
            { label: "Email the developer", action: "email" },
            { label: "It hears the wrong app instead", proc: "audio-wrong" }
          ]
        }
      ]
    },
    {
      id: "audio-wrong",
      title: "The app hears the wrong app",
      subject: "support",
      keys: ["wrong", "music", "spotify", "youtube", "video", "another", "other", "background", "noise"],
      phrases: ["wrong app", "hears the wrong", "picks up music", "hears music", "hears another call", "wrong audio"],
      faKeys: ["اشتباه", "موزیک"],
      arKeys: ["الخاطئ", "موسيقى"],
      nodes: [
        {
          say: ["WASAPI loopback captures everything that plays through the selected playback device — if music or another call is playing through the same headset, it is in the stream."],
          steps: ["Close other audio sources before the interview — music, videos, other calls.", "Use a headset, not speakers, so your own voice does not feed back into the stream."],
          choices: [
            { label: "That fixed it", exit: "resolved" },
            { label: "My problem is no audio at all", proc: "audio-none" },
            { label: "Email the developer", action: "email" }
          ]
        }
      ]
    },
    {
      id: "signin",
      title: "Sign-in problems",
      subject: "support",
      keys: ["sign", "login", "log", "account", "password", "google", "microsoft", "browser", "locked", "access"],
      phrases: ["sign in", "sign-in", "log in", "login", "can't sign", "cannot sign", "sign in fails", "sign-in fails", "sign in problem", "locked out"],
      faKeys: ["ورود", "لاگین", "وارد حساب"],
      arKeys: ["تسجيل الدخول", "الدخول"],
      nodes: [
        {
          say: ["Sign-in happens in your system browser — Google, Microsoft, or an email link — not inside the app window."],
          steps: ["Open your default browser and complete the sign-in there first, then retry from the app.", "Check that the default browser can actually open the sign-in page — no blocking extension or stale redirect.", "Retry the sign-in from the app."],
          choices: [
            { label: "That fixed it", exit: "resolved" },
            { label: "It still fails", to: 1 }
          ]
        },
        {
          say: ["Worth knowing while you sort it out: prepared answers keep working offline with a cached entitlement, so a sign-in problem does not erase your preparation. If the browser sign-in still fails, send the prepared email and mention what the browser shows."],
          choices: [
            { label: "Check our services", action: "diagnostics" },
            { label: "Email the developer", action: "email" },
            { label: "That fixed it", exit: "resolved" }
          ]
        }
      ]
    },
    {
      id: "minutes",
      title: "Live minutes running out",
      subject: "support",
      keys: ["minutes", "minute", "meter", "metered", "quota", "allowance", "ran", "out", "used", "limit", "live"],
      phrases: ["minutes running out", "ran out of minutes", "out of minutes", "minutes used up", "live minutes", "minutes left"],
      faKeys: ["دقیقه"],
      arKeys: ["الدقائق", "دقيقة"],
      nodes: [
        {
          say: ["Live minutes are metered by the server, and only live sessions use them — preparation and practice never touch the meter. Which plan are you on?"],
          choices: [
            { label: "Trial", to: 1 },
            { label: "Pro", to: 2 },
            { label: "Not sure", to: 3 }
          ]
        },
        {
          say: ["Trial gives 30 lifetime live minutes. When they are used, live listening stops — but the question bank, prepared answers and practice all keep working. Pro resets the allowance to 600 minutes per billing period."],
          link: { href: "pricing.html", label: "How live minutes work" },
          choices: [
            { label: "That explains it", exit: "resolved" },
            { label: "Tell me about the price", proc: "pricing" },
            { label: "Email the developer", action: "email" }
          ]
        },
        {
          say: ["Pro includes 600 live minutes per billing period. If live listening stopped mid-period with minutes still showing, that is worth a report — the prepared email carries the details from here."],
          choices: [
            { label: "Email the developer", action: "email" },
            { label: "That explains it", exit: "resolved" }
          ]
        },
        {
          say: ["The quick way to tell: Trial shows 30 lifetime minutes; Pro shows 600 per billing period."],
          choices: [
            { label: "Trial, then", to: 1 },
            { label: "Pro, then", to: 2 },
            { label: "That explains it", exit: "resolved" }
          ]
        }
      ]
    },
    {
      id: "download",
      title: "Download problems",
      subject: "download question",
      keys: ["download", "installer", "install", "setup", "exe", "file", "link", "sha", "hash", "windows"],
      phrases: ["download", "can't download", "cannot download", "download does nothing", "download not working", "where is the installer", "install the app"],
      faKeys: ["دانلود", "نصب"],
      arKeys: ["تحميل", "تنزيل", "تثبيت"],
      nodes: [
        {
          say: ["The straight answer first: there is no installer yet. The signed installer and its SHA-256 hash are not published, so a download link that delivers nothing is the expected state right now — not a bug on your side."],
          choices: [
            { label: "Where will it appear?", to: 1 },
            { label: "Email the developer", action: "email" },
            { label: "Understood", exit: "resolved" }
          ]
        },
        {
          say: ["When the first signed build is published, it will appear on the Download page with its version, size and SHA-256 hash, served by this site's release service. There is nothing to install before then."],
          link: { href: "download.html", label: "Open the Download page" },
          choices: [
            { label: "Understood", exit: "resolved" },
            { label: "Email the developer", action: "email" }
          ]
        }
      ]
    },
    {
      id: "demo",
      title: "Help with the demo",
      subject: "demo help",
      keys: ["demo", "simulator", "simulation", "sample", "samples", "practice", "practise", "try", "coach", "interrupt"],
      phrases: ["the demo", "demo help", "demo not working", "demo stuck", "sample questions", "interruption simulator"],
      faKeys: ["دمو", "نمونه"],
      arKeys: ["تجريبي", "العرض"],
      nodes: [
        {
          say: ["The demo on this site is a simulation — it shows the app's real answer styles with sample questions, and it is labelled simulated because the app itself does not run in the browser. Ten sample questions, in Answer and Coach modes."],
          choices: [
            { label: "The demo seems stuck", to: 1 },
            { label: "A sample in my language", to: 2 },
            { label: "That answers it", exit: "resolved" }
          ]
        },
        {
          say: ["Two things fix almost every stuck demo:"],
          steps: ["Reload the demo page — the demo state resets on each visit.", "Run the system check: it confirms the site's services, including the AI answer service the demo uses for typed questions, are reachable from here."],
          choices: [
            { label: "Run the system check", action: "diagnostics" },
            { label: "That fixed it", exit: "resolved" },
            { label: "Email the developer", action: "email" }
          ]
        },
        {
          say: ["Samples are offered in the languages the app supports — including Persian and Arabic with right-to-left layout. Pick a sample in your language from the demo's question list."],
          link: { href: "demo.html", label: "Open the demo" },
          choices: [
            { label: "That answers it", exit: "resolved" },
            { label: "Email the developer", action: "email" }
          ]
        }
      ]
    },
    {
      id: "privacy",
      title: "Privacy request — export or delete my data",
      subject: "privacy request",
      keys: ["privacy", "data", "delete", "deletion", "erase", "export", "gdpr", "request", "personal"],
      phrases: ["delete my data", "export my data", "privacy request", "delete my account", "erase my data", "my personal data"],
      faKeys: ["حریم", "حذف"],
      arKeys: ["الخصوصية", "حذف بيانات"],
      nodes: [
        {
          say: ["Privacy requests follow the product's own runbook, so a partial removal is never presented as a complete one:"],
          steps: ["You submit the request through the support channel.", "Your identity is verified, so nobody can request your data but you.", "The request is traced across the local workspace, the backend and Paddle, field by field.", "Export or erasure is carried out — Paddle invoices stay outside app deletion, under Paddle's own legal retention.", "You receive a scoped confirmation: what was done, and what is still pending if anything is."],
          choices: [
            { label: "Start the request by email", action: "email" },
            { label: "I just wanted the steps", exit: "resolved" }
          ]
        }
      ]
    },
    {
      id: "pricing",
      title: "Price and plans",
      subject: "support",
      keys: ["price", "pricing", "cost", "pay", "payment", "subscription", "subscribe", "pro", "trial", "free", "cancel", "billing", "paddle", "charge"],
      phrases: ["how much", "what does it cost", "the price", "cancel pro", "cancel my subscription", "is it free"],
      faKeys: ["قیمت", "اشتراک", "پرداخت"],
      arKeys: ["السعر", "الاشتراك", "الدفع"],
      nodes: [
        {
          say: ["Trial is free, with 30 lifetime live minutes. Pro is shown at $19.99 per month — that figure is a Paddle sandbox reference, and paid checkout is not open yet, so nobody can be charged today. Pro includes 600 live minutes per billing period and allows 2 devices; Trial allows 1."],
          link: { href: "pricing.html", label: "See Pricing" },
          choices: [
            { label: "How do minutes work?", proc: "minutes" },
            { label: "Can I cancel Pro?", to: 1 },
            { label: "That answers it", exit: "resolved" }
          ]
        },
        {
          say: ["There is no live subscription to cancel — checkout is not open. When it opens, you will cancel anytime in the Paddle customer portal and keep Pro until the end of your billing period."],
          choices: [
            { label: "That answers it", exit: "resolved" },
            { label: "Email the developer", action: "email" }
          ]
        }
      ]
    },
    {
      id: "platforms",
      title: "Mac, Android or iOS",
      subject: "support",
      keys: ["mac", "macos", "android", "ios", "iphone", "apple", "linux", "phone", "mobile", "platform"],
      phrases: ["on mac", "on android", "on iphone", "mac version", "android version", "does it work on"],
      faKeys: ["مک", "اندروید", "آیفون"],
      arKeys: ["ماك", "أندرويد", "آيفون"],
      nodes: [
        {
          say: ["Windows is the only platform today. Android is planned as a companion first; iOS and a dedicated Mac app are separate research phases. No dates and no downloads for those platforms yet."],
          link: { href: "platforms.html", label: "Platforms & roadmap" },
          choices: [
            { label: "That answers it", exit: "resolved" },
            { label: "Email the developer", action: "email" }
          ]
        }
      ]
    },
    {
      id: "offline",
      title: "Working offline",
      subject: "support",
      keys: ["offline", "internet", "connection", "wifi", "online"],
      phrases: ["work offline", "without internet", "no internet", "does it work offline"],
      faKeys: ["آفلاین", "اینترنت"],
      arKeys: ["دون اتصال", "الإنترنت"],
      nodes: [
        {
          say: ["Partly. Live transcription and AI answers need an internet connection. Prepared answers keep working offline with a cached entitlement, and your reports stay on your PC."],
          choices: [
            { label: "That answers it", exit: "resolved" },
            { label: "Sign-in is my problem", proc: "signin" },
            { label: "Email the developer", action: "email" }
          ]
        }
      ]
    },
    {
      id: "ethics",
      title: "Is this cheating?",
      subject: "support",
      keys: ["cheat", "cheating", "caught", "detect", "detected", "hide", "hidden", "record", "allowed", "permit"],
      phrases: ["help me cheat", "is this cheating", "will i get caught", "get caught", "is it allowed"],
      faKeys: ["تقلب"],
      arKeys: ["غش"],
      nodes: [
        {
          say: ["No — it is a preparation and practice coach. It does not hide, does not evade screen capture, does not record your microphone, and never presents experience that is not yours: only facts you confirmed are ever used. Live assist is only for interviews where assistance is permitted."],
          choices: [
            { label: "That answers it", exit: "resolved" },
            { label: "How is my data handled?", proc: "privacy" }
          ]
        }
      ]
    },
    {
      id: "human",
      title: "Talk to a person",
      subject: "support",
      keys: ["human", "person", "someone", "real", "agent", "contact", "email", "mail", "talk", "speak", "developer"],
      phrases: ["talk to a person", "real person", "human help", "contact you", "email you", "speak to someone"],
      faKeys: ["انسان", "ایمیل"],
      arKeys: ["شخص", "بريد"],
      nodes: [
        {
          say: ["Support is handled by the developer personally, by email. The prepared email includes this conversation, the latest system check and your context — you review it in your mail app and press send; nothing leaves your device until you do."],
          choices: [
            { label: "Open the prepared email", action: "email" },
            { label: "Run the system check first", action: "diagnostics" },
            { label: "Topics instead", action: "topics" }
          ]
        }
      ]
    }
  ];

  /* Step 56 — one-line answer previews for the blended results:
     the static form of an answer box. Every line is pre-authored
     from the procedure's own first node — the result list can
     answer before it is clicked, and it can never promise more
     than the procedure itself says. */
  var PREVIEWS = {
    "audio-none": "First check: the meeting must play through the headset set as Windows’ default playback device.",
    "audio-wrong": "Loopback captures everything on the device — close music, videos and other calls first.",
    "signin": "Sign-in runs in your system browser — Google, Microsoft or an email link — not inside the app.",
    "minutes": "Trial is 30 lifetime live minutes; preparation and practice are never metered.",
    "download": "There is no installer yet — the signed build and its SHA-256 are not published.",
    "demo": "The demo is a labelled simulation: ten sample questions in Answer and Coach modes.",
    "privacy": "Five steps: submit, identity check, field-by-field trace, export or erase, scoped confirmation.",
    "pricing": "Trial is free; Pro shows $19.99/month as a Paddle sandbox reference — checkout is not open.",
    "platforms": "Windows only today; Android is planned as a companion, iOS and Mac are research phases.",
    "offline": "Prepared answers work offline with a cached entitlement; live answers need a connection.",
    "ethics": "Only facts you confirmed are ever used — it never presents experience that is not yours.",
    "human": "Support is the developer personally, by email — the prepared email carries this conversation."
  };
  BANK.forEach(function (p) { p.preview = PREVIEWS[p.id] || ""; });

  var state = {
    current: null,        // { proc, node } while a procedure is open
    lastSubject: "support",
    asked: [],            // the visitor's own words, for the handoff
    covered: [],          // procedure titles opened, for the handoff
    diag: null,           // last diagnostics result
    diagRunning: false,
    origin: null          // Step 57: { page, label } when the visit
                          // arrived via a contextual help deep link
  };

  function byId(id) {
    for (var i = 0; i < BANK.length; i++) { if (BANK[i].id === id) { return BANK[i]; } }
    return null;
  }
  function scrollLog() { log.scrollTop = log.scrollHeight; }

  /* Step 56 — resume state. An unfinished procedure (id + node
     index) persists in localStorage so a returning visitor gets
     a "Continue where you left off" chip in the state strip.
     Storage is best-effort: any failure (private mode, blocked
     storage, an old harness) degrades silently to no chip.
     The state clears when the visitor confirms a resolution or
     takes the email handoff — never on silence. */
  var RESUME_KEY = "ia-sa-resume";
  function ls() {
    try { return (typeof localStorage !== "undefined") ? localStorage : null; }
    catch (e) { return null; }
  }
  function storeGet() {
    var s = ls(); if (!s) { return null; }
    try {
      var v = s.getItem(RESUME_KEY);
      var parsed = v ? JSON.parse(v) : null;
      return (parsed && byId(parsed.proc)) ? parsed : null;
    } catch (e) { return null; }
  }
  function saveResume() {
    var s = ls(); if (!s || !state.current) { return; }
    try {
      s.setItem(RESUME_KEY, JSON.stringify({
        proc: state.current.proc.id, node: state.current.node
      }));
    } catch (e) { /* storage is an enhancement, never a dependency */ }
  }
  function clearResume() {
    var s = ls(); if (!s) { return; }
    try { s.removeItem(RESUME_KEY); } catch (e) { /* silent */ }
    hideResumeChip();
  }
  function syncStrip() {
    if (!stateEl) { return; }
    var show = (resumeBtn && !resumeBtn.hidden) || (statusEl && !statusEl.hidden);
    stateEl.hidden = !show;
  }
  function hideResumeChip() {
    if (resumeBtn) { resumeBtn.hidden = true; }
    syncStrip();
  }
  function showResumeChip() {
    if (!resumeBtn) { return; }
    var saved = storeGet();
    if (!saved) { return; }
    var proc = byId(saved.proc);
    resumeBtn.textContent = "Continue where you left off: " + proc.title;
    resumeBtn.hidden = false;
    syncStrip();
  }
  function resumeSaved() {
    var saved = storeGet();
    if (!saved) { return; }
    var proc = byId(saved.proc);
    hideResumeChip();
    hideResults();
    expand();
    addUserBubble("Continue: " + proc.title);
    var idx = Math.min(Math.max(saved.node || 0, 0), proc.nodes.length - 1);
    state.current = { proc: proc, node: idx };
    state.lastSubject = proc.subject;
    if (state.covered.indexOf(proc.title) === -1 && state.covered.length < 6) {
      state.covered.push(proc.title);
    }
    var bubble = addBotBubble();
    var head = el("p");
    head.appendChild(el("strong", null, proc.title));
    bubble.appendChild(head);
    fillNode(bubble, proc.nodes[idx]);
    renderChoices(proc.nodes[idx].choices);
    focusInput();
  }
  if (resumeBtn) {
    resumeBtn.addEventListener("click", resumeSaved);
  }

  /* Step 55 — disclosure state. At rest the conversation body is
     collapsed and the entry stands alone; the first real action
     (a submit, a result pick, a tile, a chip, the system check)
     expands it in place. Escape walks back one level at a time:
     results first, then the body. The entry input carries the
     truthful aria-expanded for both regions it controls. */
  var resultsOpen = false;
  /* Step 56 — aria-expanded now follows the W3C APG combobox
     pattern: it describes the results popup only. The body's
     expansion is announced by the log's live region and by the
     tiles' aria-controls, not by the combobox state. */
  function refreshEntryAria() {
    input.setAttribute("aria-expanded", resultsOpen ? "true" : "false");
  }
  /* Step 58 — motion & scroll discipline for the reveal. Three
     rules, each measured against the owner's live report (see
     step58-support-motion/report.md):
     1. The module never lets the browser scroll on focus: every
        focus() goes through focusInput() with preventScroll, so
        the only page scroll is the one the module asks for.
     2. When a trigger outside the panel opens the conversation
        (a symptom card, a topic tile, a deep-link arrival), the
        module performs ONE smooth scroll that lands the panel
        top under the sticky header — revealAssistant() — instead
        of the browser's focus scroll, which landed the page at
        the document top. The panel top never moves while its own
        body grows (growth extends downward), so the target is
        exact from the first frame.
     3. The opening itself is animated: the body's height unfolds
        over 340ms in the house easing instead of snapping to
        full height in one frame. The content is already computed
        — only its reveal is animated, nothing waits. Reduced
        motion keeps the instant behaviour, and every capability
        is guarded so the older stub harnesses run unchanged. */
  var reduceMotion = false;
  try {
    reduceMotion = !!(typeof window !== "undefined" && window.matchMedia
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  } catch (e) { reduceMotion = false; }
  function focusInput() {
    try { input.focus({ preventScroll: true }); }
    catch (e) { try { input.focus(); } catch (e2) { /* stub */ } }
  }
  var HEADER_OFFSET = 84; /* the html scroll-padding-top */
  function revealAssistant() {
    try {
      if (!root || typeof root.getBoundingClientRect !== "function") { return; }
      if (typeof window === "undefined" || typeof window.scrollTo !== "function") { return; }
      var y = (typeof window.scrollY === "number") ? window.scrollY : 0;
      var target = Math.round(root.getBoundingClientRect().top + y - HEADER_OFFSET);
      if (target < 0) { target = 0; }
      if (Math.abs(target - y) < 2) { return; }
      window.scrollTo({ top: target, behavior: reduceMotion ? "auto" : "smooth" });
    } catch (e) { /* scrolling is an enhancement, never a dependency */ }
  }
  var bodyAnimGen = 0;
  function clearBodyAnimStyles() {
    if (!bodyEl || !bodyEl.style) { return; }
    bodyEl.style.transition = "";
    bodyEl.style.height = "";
    bodyEl.style.overflow = "";
  }
  function animateBodyOpen() {
    if (reduceMotion || !bodyEl) { return; }
    if (typeof requestAnimationFrame !== "function") { return; }
    var gen = ++bodyAnimGen;
    requestAnimationFrame(function () {
      try {
        if (gen !== bodyAnimGen || bodyEl.hidden || !bodyEl.style) { return; }
        var h = bodyEl.offsetHeight;
        if (!h || h < 8) { return; }
        bodyEl.style.overflow = "hidden";
        bodyEl.style.height = "0px";
        void bodyEl.offsetHeight; /* commit the closed state */
        bodyEl.style.transition = "height .34s cubic-bezier(.2,.7,.3,1)";
        bodyEl.style.height = h + "px";
        setTimeout(function () {
          if (gen === bodyAnimGen) { clearBodyAnimStyles(); }
        }, 420);
      } catch (e) { /* a stub DOM without layout: stay instant */ }
    });
  }
  function expand() {
    if (bodyEl && bodyEl.hidden) {
      bodyEl.hidden = false;
      animateBodyOpen();
    }
    refreshEntryAria();
  }
  function collapse() {
    hideResults();
    if (bodyEl) {
      bodyAnimGen++;
      clearBodyAnimStyles();
      bodyEl.hidden = true;
    }
    refreshEntryAria();
  }
  function hideResults() {
    resultsOpen = false;
    resultItems = [];
    activeIdx = -1;
    input.setAttribute("aria-activedescendant", "");
    if (resultsEl) {
      resultsEl.hidden = true;
      while (resultsEl.children.length) {
        resultsEl.removeChild(resultsEl.children[0]);
      }
    }
    refreshEntryAria();
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text !== undefined) { n.textContent = text; }
    return n;
  }
  function addUserBubble(text) {
    var msg = el("div", "sa-msg sa-msg-user");
    var bubble = el("div", "sa-bubble");
    var p = el("p", null, text);
    p.setAttribute("dir", "auto");
    bubble.appendChild(p);
    msg.appendChild(bubble);
    log.appendChild(msg);
    scrollLog();
  }
  function addBotBubble() {
    var msg = el("div", "sa-msg sa-msg-bot");
    var bubble = el("div", "sa-bubble");
    msg.appendChild(bubble);
    log.appendChild(msg);
    scrollLog();
    return bubble;
  }
  function sayBubble(paras) {
    var bubble = addBotBubble();
    paras.forEach(function (t) { bubble.appendChild(el("p", null, t)); });
    scrollLog();
    return bubble;
  }

  var choicesBox = null;
  function clearChoices() {
    if (choicesBox && choicesBox.parentNode) {
      choicesBox.parentNode.removeChild(choicesBox);
    }
    choicesBox = null;
  }
  function renderChoices(choices) {
    clearChoices();
    if (!choices || !choices.length) { return; }
    choicesBox = el("div", "sa-choices");
    choices.forEach(function (choice) {
      var b = el("button", "sa-choice", choice.label);
      b.setAttribute("type", "button");
      b.addEventListener("click", function () { onChoice(choice); });
      choicesBox.appendChild(b);
    });
    log.appendChild(choicesBox);
    scrollLog();
  }
  function onChoice(choice) {
    clearChoices();
    addUserBubble(choice.label);
    if (choice.exit === "resolved") { resolvedExit(); }
    else if (choice.action === "confirm-yes") {
      /* Step 56 — a resolution counts only when the visitor
         confirms it. Silence is never treated as success. */
      clearResume();
      sayBubble(["Confirmed — glad it's sorted. If something else comes up, pick a topic or type it here."]);
    }
    else if (choice.action === "confirm-no") {
      sayBubble(["Then let's keep going — two paths that always work:"]);
      renderChoices([
        { label: "Run the system check", action: "diagnostics" },
        { label: "Email the developer", action: "email" },
        { label: "Another topic", action: "topics" }
      ]);
    }
    else if (typeof choice.to === "number" && state.current) {
      renderNode(state.current.proc, choice.to);
    }
    else if (choice.proc) { startProc(byId(choice.proc), null); }
    else if (choice.action === "diagnostics") { runDiagnostics(); }
    else if (choice.action === "email") { renderEmailOffer(); }
    else if (choice.action === "resume") { resumeChoices(); }
    if (choice.action === "topics") {
      state.current = null;
      sayBubble(["Pick any topic below the conversation, or type what's happening in your own words."]);
    }
    focusInput();
  }
  function resumeChoices() {
    if (state.current) {
      var node = state.current.proc.nodes[state.current.node];
      sayBubble(["Back to “" + state.current.proc.title + "” — where were we?"]);
      renderChoices(node.choices);
    } else {
      sayBubble(["Pick any topic below the conversation, or type what's happening in your own words."]);
    }
  }
  function resolvedExit() {
    /* Step 56 — the resolution-confirmation loop: every resolved
       exit asks, and only a "Yes" closes the matter (and clears
       any saved resume state, inside onChoice). "Not yet" keeps
       the ladder open — diagnostics or the prepared email. */
    state.current = null;
    sayBubble(["Good — that is what the playbook is for. Did that fix it?"]);
    renderChoices([
      { label: "Yes — fixed", action: "confirm-yes" },
      { label: "Not yet", action: "confirm-no" }
    ]);
  }

  function startProc(proc, lang) {
    if (!proc) { return; }
    hideResumeChip();
    state.current = { proc: proc, node: 0 };
    saveResume();
    state.lastSubject = proc.subject;
    if (state.covered.indexOf(proc.title) === -1 && state.covered.length < 6) {
      state.covered.push(proc.title);
    }
    var bubble = addBotBubble();
    if (lang === "fa") {
      var fa = el("p", "sa-rtl", FA_LEAD);
      fa.setAttribute("lang", "fa");
      bubble.appendChild(fa);
    } else if (lang === "ar") {
      var ar = el("p", "sa-rtl", AR_LEAD);
      ar.setAttribute("lang", "ar");
      bubble.appendChild(ar);
    }
    var head = el("p");
    head.appendChild(el("strong", null, proc.title));
    bubble.appendChild(head);
    fillNode(bubble, proc.nodes[0]);
    renderChoices(proc.nodes[0].choices);
  }
  function renderNode(proc, idx) {
    state.current = { proc: proc, node: idx };
    saveResume();
    var bubble = addBotBubble();
    fillNode(bubble, proc.nodes[idx]);
    renderChoices(proc.nodes[idx].choices);
  }
  function fillNode(bubble, node) {
    (node.say || []).forEach(function (t) { bubble.appendChild(el("p", null, t)); });
    if (node.steps && node.steps.length) {
      var ol = el("ol", "sa-steps");
      node.steps.forEach(function (s) { ol.appendChild(el("li", null, s)); });
      bubble.appendChild(ol);
    }
    if (node.link) {
      var p = el("p");
      var a = el("a", null, node.link.label);
      a.setAttribute("href", node.link.href);
      p.appendChild(a);
      bubble.appendChild(p);
    }
    scrollLog();
  }

  /* Matching: normalized keyword + phrase + curated FA/AR scoring.
     Deterministic and instant — the same input always routes the
     same way, which the behavioural sim pins down. */
  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[\u200C\u200D]/g, " ")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  BANK.forEach(function (p) { p._phrases = p.phrases.map(normalize); });
  function scoreProc(proc, norm, raw) {
    var score = 0, lang = null, i, k;
    for (i = 0; i < proc._phrases.length; i++) {
      if (norm.indexOf(proc._phrases[i]) !== -1) { score += 6; }
    }
    var tokens = norm.split(" ");
    for (i = 0; i < proc.keys.length; i++) {
      k = proc.keys[i];
      for (var j = 0; j < tokens.length; j++) {
        if (tokens[j] === k || (k.length >= 4 && tokens[j].indexOf(k) === 0)) { score += 3; break; }
      }
    }
    var faHit = false, arHit = false;
    for (i = 0; i < proc.faKeys.length; i++) { if (raw.indexOf(proc.faKeys[i]) !== -1) { score += 6; faHit = true; } }
    for (i = 0; i < proc.arKeys.length; i++) { if (raw.indexOf(proc.arKeys[i]) !== -1) { score += 6; arHit = true; } }
    if (faHit) { lang = "fa"; } else if (arHit) { lang = "ar"; }
    return { proc: proc, score: score, lang: lang };
  }
  function route(text) {
    var norm = normalize(text);
    var raw = String(text || "");
    var scored = BANK.map(function (p) { return scoreProc(p, norm, raw); })
      .filter(function (s) { return s.score > 0; })
      .sort(function (a, b) { return b.score - a.score; });
    if (scored.length && scored[0].score >= 6 &&
        (scored.length === 1 || scored[0].score - scored[1].score >= 3)) {
      startProc(scored[0].proc, scored[0].lang);
      return;
    }
    if (scored.length && scored[0].score >= 4) {
      offerMatches(scored.slice(0, 3));
      return;
    }
    openResponse(scored.slice(0, 2), text);
  }
  function offerMatches(list) {
    state.current = null;
    sayBubble(["A couple of playbooks fit that — pick the closest one and I'll walk it with you:"]);
    var choices = list.map(function (s) { return { label: s.proc.title, proc: s.proc.id }; });
    choices.push({ label: "Run the system check", action: "diagnostics" });
    choices.push({ label: "Email the developer", action: "email" });
    renderChoices(choices);
  }
  function openResponse(list, text) {
    /* Step 56 — no-result recovery: the visitor's own words are
       echoed back (so a typo is visible), the closest topics are
       offered, and the email handoff carries the query in its
       body — it is already in state.asked via submitQuery. */
    state.current = null;
    sayBubble(["You asked: “" + text + "” — that doesn't match a standard playbook yet, so let's take the paths that always work: the live system check, the closest topics, or a prepared email to the developer with this conversation attached — you won't have to retype anything."]);
    var choices = list.map(function (s) { return { label: s.proc.title, proc: s.proc.id }; });
    if (!choices.length) {
      choices.push({ label: "No audio — nothing is transcribed", proc: "audio-none" });
      choices.push({ label: "Sign-in problems", proc: "signin" });
      choices.push({ label: "Download problems", proc: "download" });
    }
    choices.push({ label: "Run the system check", action: "diagnostics" });
    choices.push({ label: "Email the developer", action: "email" });
    renderChoices(choices);
  }

  /* Diagnostics: four real probes against the site's own services,
     plus the visitor context the browser can state. Each row
     settles when its probe settles — the checklist is the work,
     not an animation of it. */
  var CHECKS = [
    { id: "releases", label: "Release service", url: IA_RELEASES_ENDPOINT, mode: "json" },
    { id: "growth", label: "Announcements service", url: GROWTH_URL, mode: "json" },
    { id: "ai", label: "AI answer service", url: IA_AI_ENDPOINT, mode: "any" },
    { id: "demo", label: "Demo page", url: "demo.html", mode: "ok" }
  ];
  function probe(check) {
    if (typeof fetch !== "function") { return Promise.resolve(false); }
    var ctl = ("AbortController" in window) ? new AbortController() : null;
    var timeout = new Promise(function (res) {
      setTimeout(function () { if (ctl) { ctl.abort(); } res(false); }, 8000);
    });
    var work = fetch(check.url, {
      headers: { "Accept": "application/json" },
      signal: ctl ? ctl.signal : undefined
    }).then(function (r) {
      if (check.mode === "any") { return true; }
      if (!r.ok) { return false; }
      if (check.mode === "json") {
        return r.json().then(function () { return true; }, function () { return false; });
      }
      return true;
    }).catch(function () { return false; });
    return Promise.race([work, timeout]);
  }
  /* Step 56 — the state strip's services chip. It is fed ONLY
     by real probe results: the full diagnostics run, or a quiet
     probe pass on the visitor's first interaction with the
     entry. Before any probe has run the chip does not exist —
     the strip never invents an "all systems normal". */
  function updateStatusChip(results) {
    if (!statusEl) { return; }
    while (statusEl.children.length) {
      statusEl.removeChild(statusEl.children[0]);
    }
    var dot = el("span", "sa-dot");
    dot.setAttribute("aria-hidden", "true");
    var failed = results.filter(function (r) { return !r.ok; });
    var text;
    if (!navigator.onLine) {
      dot.className = "sa-dot sa-dot-bad";
      text = "Connection: offline, per your browser — checks can't run";
    } else if (!failed.length) {
      dot.className = "sa-dot sa-dot-ok";
      text = "Services: all reachable just now";
    } else {
      dot.className = "sa-dot sa-dot-bad";
      text = "Services: " + failed.map(function (r) { return r.label; }).join(", ")
        + " not responding — that part is on our side";
    }
    statusEl.appendChild(dot);
    statusEl.appendChild(el("span", null, text));
    statusEl.hidden = false;
    syncStrip();
  }
  var quietProbed = false;
  function quietProbe() {
    if (quietProbed) { return; }
    quietProbed = true;
    if (!statusEl || typeof fetch !== "function") { return; }
    Promise.all(CHECKS.map(function (c) {
      return probe(c).then(function (ok) { return { label: c.label, ok: ok }; });
    })).then(updateStatusChip);
  }
  function browserSummary() {
    var ua = navigator.userAgent || "";
    var browser = "Browser";
    if (/Edg\//.test(ua)) { browser = "Edge"; }
    else if (/OPR\/|Opera/.test(ua)) { browser = "Opera"; }
    else if (/Chrome\//.test(ua)) { browser = "Chrome"; }
    else if (/Firefox\//.test(ua)) { browser = "Firefox"; }
    else if (/Safari\//.test(ua)) { browser = "Safari"; }
    var os = "";
    if (/Windows/.test(ua)) { os = "Windows"; }
    else if (/Android/.test(ua)) { os = "Android"; }
    else if (/iPhone|iPad|iOS/.test(ua)) { os = "iOS"; }
    else if (/Mac OS/.test(ua)) { os = "macOS"; }
    else if (/Linux/.test(ua)) { os = "Linux"; }
    return os ? browser + " on " + os : browser;
  }
  function contextLine() {
    return "Browser: " + browserSummary()
      + " · Language: " + (navigator.language || "unknown")
      + " · Connection: " + (navigator.onLine ? "online" : "offline")
      + " · Page: support.html"
      + (state.origin ? " · Arrived from: " + state.origin.page : "");
  }
  function runDiagnostics() {
    if (state.diagRunning) { return; }
    expand();
    state.diagRunning = true;
    checkBtn.disabled = true;
    clearChoices();
    var bubble = addBotBubble();
    var card = el("div", "sa-diag");
    card.appendChild(el("p", "sa-diag-title", "System check"));
    var rows = CHECKS.map(function (check) {
      var row = el("div", "sa-diag-row");
      var dot = el("span", "sa-dot sa-dot-wait");
      dot.setAttribute("aria-hidden", "true");
      var label = el("span", "sa-diag-label", check.label);
      var st = el("span", "sa-diag-state", "checking…");
      row.appendChild(dot); row.appendChild(label); row.appendChild(st);
      card.appendChild(row);
      return { check: check, dot: dot, st: st };
    });
    var ctx = el("p", "sa-diag-ctx", contextLine());
    card.appendChild(ctx);
    bubble.appendChild(card);
    scrollLog();
    var results = [];
    var pending = rows.length;
    rows.forEach(function (r) {
      probe(r.check).then(function (ok) {
        r.dot.className = "sa-dot " + (ok ? "sa-dot-ok" : "sa-dot-bad");
        r.st.textContent = ok ? "reachable" : "not responding";
        results.push({ label: r.check.label, ok: ok });
        pending--;
        if (pending === 0) { finishDiagnostics(results); }
      });
    });
  }
  function finishDiagnostics(results) {
    state.diagRunning = false;
    checkBtn.disabled = false;
    state.diag = { at: new Date().toISOString(), rows: results };
    updateStatusChip(results);
    var failed = results.filter(function (r) { return !r.ok; });
    var choices = [];
    if (!navigator.onLine) {
      sayBubble(["Your browser reports this device is offline, so the checks can't reach anything. Reconnect, then run the check again — or send the prepared email and it will carry this result."]);
      choices.push({ label: "Check again", action: "diagnostics" });
      choices.push({ label: "Email the developer", action: "email" });
    } else if (!failed.length) {
      sayBubble(["Every service this check covers is reachable from here — the problem is not a service outage on our side."]);
      if (state.current) { choices.push({ label: "Continue: " + state.current.proc.title, action: "resume" }); }
      choices.push({ label: "Email the developer", action: "email" });
      choices.push({ label: "Another topic", action: "topics" });
    } else {
      var names = failed.map(function (r) { return r.label; }).join(", ");
      sayBubble(["This part is on our side: " + names + " not responding. That is not your setup, and retrying on your device won't change it. The prepared email includes this result, so the developer sees it exactly as you do."]);
      choices.push({ label: "Check again", action: "diagnostics" });
      choices.push({ label: "Email the developer", action: "email" });
      if (state.current) { choices.push({ label: "Continue: " + state.current.proc.title, action: "resume" }); }
    }
    renderChoices(choices);
    scrollLog();
  }

  /* The email handoff: composed at click time from the live
     conversation, the latest diagnostics and the context — the
     developer never has to ask round-1 questions. */
  function renderEmailOffer() {
    clearResume();
    var lines = [];
    lines.push("Hi — I used the support assistant on cybervalida.online and still need a hand.");
    lines.push("");
    if (state.asked.length) {
      lines.push("What I asked:");
      state.asked.forEach(function (q) { lines.push("- " + q); });
      lines.push("");
    }
    if (state.covered.length) {
      lines.push("Playbooks covered: " + state.covered.join("; "));
      lines.push("");
    }
    if (state.diag) {
      lines.push("System check (" + state.diag.at + "):");
      state.diag.rows.forEach(function (r) {
        lines.push("- " + r.label + ": " + (r.ok ? "reachable" : "not responding"));
      });
      lines.push("");
    } else {
      lines.push("System check: not run.");
      lines.push("");
    }
    lines.push("Context:");
    lines.push("- Browser: " + (navigator.userAgent || "unknown"));
    lines.push("- Language: " + (navigator.language || "unknown"));
    lines.push("- Page: support.html");
    if (state.origin) {
      lines.push("- Started from: " + state.origin.page
        + " (help link: " + state.origin.label + ")");
    }
    lines.push("- Connection: " + (navigator.onLine ? "online" : "offline"));
    lines.push("");
    lines.push("My Windows version and what I was doing:");
    lines.push("(please add a line here — it helps)");
    var body = lines.join("\n");
    if (body.length > 1800) { body = body.slice(0, 1800); }
    var href = "mailto:" + SUPPORT_ADDR
      + "?subject=" + encodeURIComponent("Interview Assistant — " + state.lastSubject)
      + "&body=" + encodeURIComponent(body);
    var bubble = sayBubble(["Here is the prepared email — it includes what you asked, the playbooks we covered, and the latest system check. Review it in your mail app and press send; nothing leaves your device until you do."]);
    var actions = el("p", "sa-actions");
    var a = el("a", "btn btn-primary btn-small", "Open the prepared email");
    a.setAttribute("href", href);
    actions.appendChild(a);
    bubble.appendChild(actions);
    scrollLog();
    state.current = null;
    renderChoices([
      { label: "Run the system check", action: "diagnostics" },
      { label: "Another topic", action: "topics" }
    ]);
  }

  /* Step 55 — blended results. Typing in the entry searches the
     same bank the router uses, plus the page's FAQ — restated
     here once, exactly like the playbooks above, so the page
     keeps one canonical wording per answer. Matches render as a
     compact list under the input, labelled by type (Guide /
     FAQ), with a final row that hands the raw words to the
     assistant. Picking a result expands the conversation in
     place, seeded with the visitor's own words. */
  var FAQ_INDEX = [
    {
      q: "What happens if the interviewer interrupts me?",
      a: ["The next answer gets shorter automatically (Concise, then Rapid), so you can keep up. You can reset it with Ctrl+Alt+R."],
      link: { href: "demo.html", label: "Try it in the interruption simulator" },
      keys: ["interrupts", "interrupt", "interruption", "shorter", "concise", "rapid", "reset", "cuts"],
      phrases: ["interrupts me", "interrupted", "interrupt me", "cuts me off", "cut off"]
    },
    {
      q: "What do I get after the interview?",
      a: ["An honest report: the questions asked and the suggestions shown, plus what to prepare next time. No scores, no hiring predictions."],
      keys: ["after", "report", "results", "score", "scores", "feedback", "summary"],
      phrases: ["after the interview", "what do i get"]
    },
    {
      q: "Does it work offline?",
      a: ["Live transcription and AI answers need an internet connection. Prepared answers keep working offline with a cached entitlement, and your reports stay on your PC."],
      keys: ["offline", "internet", "connection"],
      phrases: ["work offline", "without internet", "does it work offline"]
    },
    {
      q: "How do I cancel Pro?",
      a: ["Paid checkout is not open yet — there is no live subscription to cancel. When it opens, you will cancel anytime in the Paddle customer portal and keep Pro until the end of your billing period. The Pro price shown is a Paddle sandbox reference."],
      keys: ["cancel", "subscription", "refund", "paddle", "portal"],
      phrases: ["cancel pro", "cancel my subscription", "cancel the subscription"]
    },
    {
      q: "Does it work on Mac or Android?",
      a: ["Not yet. Windows is the only platform today. Android is planned as a companion first, and iOS and a dedicated Mac app are separate research phases. No dates, no downloads for those platforms yet."],
      link: { href: "platforms.html", label: "Platforms & roadmap" },
      keys: ["mac", "android", "ios", "iphone", "platform"],
      phrases: ["on mac", "on android", "mac or android", "work on mac"]
    },
    {
      q: "Can it help me cheat?",
      a: ["No. It is a preparation and practice coach. It does not hide, does not evade screen capture, does not record your microphone, and does not present experience that is not yours. Only facts you confirmed are ever used — and live assist is only for interviews where assistance is permitted."],
      keys: ["cheat", "cheating", "hide", "evade", "caught"],
      phrases: ["help me cheat", "can it help me cheat", "is it cheating"]
    },
    {
      q: "How do I delete my data?",
      a: ["You can export or delete your workspace from the app. Deleting app data does not delete Paddle’s own payment records, which follow Paddle’s legal retention. A deletion request shows a scoped pending/export/erase status rather than a false “all done”."],
      link: { href: "privacy.html", label: "Privacy" },
      keys: ["delete", "data", "export", "erase", "workspace"],
      phrases: ["delete my data", "how do i delete", "delete my account"]
    }
  ];
  /* Step 56 — FAQ previews, same rule as the bank's: one line,
     pre-authored from the entry's own answer. */
  var FAQ_PREVIEWS = {
    "What happens if the interviewer interrupts me?": "The next answer gets shorter automatically — Concise, then Rapid; reset with Ctrl+Alt+R.",
    "What do I get after the interview?": "An honest report of the questions and suggestions — no scores, no hiring predictions.",
    "Does it work offline?": "Live transcription and AI answers need internet; prepared answers keep working offline.",
    "How do I cancel Pro?": "Checkout is not open yet, so there is no live subscription to cancel.",
    "Does it work on Mac or Android?": "Windows only today — Android is planned as a companion; iOS and Mac are research phases.",
    "Can it help me cheat?": "No — a preparation and practice coach that never presents experience that is not yours.",
    "How do I delete my data?": "Export or delete from the app; Paddle keeps its own payment records under its legal retention."
  };
  FAQ_INDEX.forEach(function (f) {
    f._phrases = f.phrases.map(normalize);
    f.preview = FAQ_PREVIEWS[f.q] || "";
  });
  function scoreFaq(f, norm) {
    var score = 0, i, j, k;
    for (i = 0; i < f._phrases.length; i++) {
      if (norm.indexOf(f._phrases[i]) !== -1) { score += 6; }
    }
    var tokens = norm.split(" ");
    for (i = 0; i < f.keys.length; i++) {
      k = f.keys[i];
      for (j = 0; j < tokens.length; j++) {
        if (tokens[j] === k || (k.length >= 4 && tokens[j].indexOf(k) === 0)) { score += 3; break; }
      }
    }
    return score;
  }
  function searchIndex(text) {
    var norm = normalize(text);
    var raw = String(text || "");
    var procs = BANK.map(function (p) { return scoreProc(p, norm, raw); })
      .filter(function (s) { return s.score >= 4; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 3)
      .map(function (s) { return { kind: "Guide", title: s.proc.title, preview: s.proc.preview, proc: s.proc, lang: s.lang }; });
    var faqs = FAQ_INDEX.map(function (f) { return { f: f, score: scoreFaq(f, norm) }; })
      .filter(function (s) { return s.score >= 4; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 2)
      .map(function (s) { return { kind: "FAQ", title: s.f.q, preview: s.f.preview, faq: s.f }; });
    return procs.concat(faqs).slice(0, 5);
  }
  /* Step 56 — the results popup follows the W3C APG combobox
     pattern: the input keeps focus and role="combobox"; the
     popup is a listbox of options tracked by
     aria-activedescendant; a polite live region announces the
     result count (debounced, so fast typing doesn't chatter);
     ArrowUp/ArrowDown/Home/End move, Enter activates, Escape
     closes (the staged root handler). Result rows carry their
     type label in the accessible name and a one-line answer
     preview under the title. */
  var resultItems = [];
  var activeIdx = -1;
  var liveTimer = null;
  function announce(msg) {
    if (!liveEl) { return; }
    if (liveTimer) { clearTimeout(liveTimer); }
    liveTimer = setTimeout(function () { liveEl.textContent = msg; }, 450);
  }
  function setActive(idx) {
    if (!resultsEl) { return; }
    activeIdx = idx;
    var opts = [];
    for (var j = 0; j < resultsEl.children.length; j++) {
      if (resultsEl.children[j].getAttribute("role") === "option") {
        opts.push(resultsEl.children[j]);
      }
    }
    for (var i = 0; i < opts.length; i++) {
      var on = i === idx;
      opts[i].setAttribute("aria-selected", on ? "true" : "false");
      if (opts[i].classList) {
        if (on) { opts[i].classList.add("sa-result-active"); }
        else { opts[i].classList.remove("sa-result-active"); }
      }
    }
    input.setAttribute("aria-activedescendant",
      idx >= 0 && opts[idx] ? opts[idx].id : "");
    if (idx >= 0 && opts[idx] && typeof opts[idx].scrollIntoView === "function") {
      opts[idx].scrollIntoView({ block: "nearest" });
    }
  }
  function activateOption(idx) {
    var item = resultItems[idx];
    if (!item) { return; }
    if (item.ask) { submitQuery(); }
    else { pickResult(item); }
  }
  function renderResults() {
    if (!resultsEl) { return; }
    var text = input.value.trim();
    if (text.length < 2) { hideResults(); return; }
    var items = searchIndex(text);
    resultItems = items.concat([{ ask: true }]);
    activeIdx = -1;
    input.setAttribute("aria-activedescendant", "");
    while (resultsEl.children.length) {
      resultsEl.removeChild(resultsEl.children[0]);
    }
    if (!items.length) {
      resultsEl.appendChild(el("p", "sa-result-none",
        "No matching guide or FAQ for that — the assistant can still help:"));
    }
    resultItems.forEach(function (item, idx) {
      var b = el("button", "sa-result" + (item.ask ? " sa-result-ask" : ""));
      b.setAttribute("type", "button");
      b.setAttribute("role", "option");
      b.id = "sa-opt-" + idx;
      b.setAttribute("aria-selected", "false");
      b.appendChild(el("span", "sa-result-kind",
        item.ask ? "Assistant" : item.kind));
      var main = el("span", "sa-result-main");
      main.appendChild(el("span", "sa-result-title",
        item.ask ? "Ask the assistant: “" + text + "”" : item.title));
      if (!item.ask && item.preview) {
        main.appendChild(el("span", "sa-result-preview", item.preview));
      }
      b.appendChild(main);
      b.addEventListener("click", function () { activateOption(idx); });
      resultsEl.appendChild(b);
    });
    resultsEl.hidden = false;
    resultsOpen = true;
    refreshEntryAria();
    announce(items.length
      ? items.length + (items.length === 1 ? " result" : " results")
        + " available. Use the arrow keys to choose, Enter to open."
      : "No matches. Press Enter to ask the assistant, or choose a topic below.");
  }
  function rememberAsked(text) {
    if (text && state.asked.length < 6) { state.asked.push(text.slice(0, 200)); }
  }
  function pickResult(item) {
    var text = input.value.trim();
    input.value = "";
    hideResults();
    expand();
    rememberAsked(text);
    if (item.proc) {
      addUserBubble(text || item.title);
      startProc(item.proc, item.lang);
    } else if (item.faq) {
      addUserBubble(item.faq.q);
      state.current = null;
      state.lastSubject = "support";
      var bubble = addBotBubble();
      var head = el("p");
      head.appendChild(el("strong", null, item.faq.q));
      bubble.appendChild(head);
      item.faq.a.forEach(function (t) { bubble.appendChild(el("p", null, t)); });
      if (item.faq.link) {
        var p = el("p");
        var a = el("a", null, item.faq.link.label);
        a.setAttribute("href", item.faq.link.href);
        p.appendChild(a);
        bubble.appendChild(p);
      }
      scrollLog();
      renderChoices([
        { label: "That answers it", exit: "resolved" },
        { label: "Run the system check", action: "diagnostics" },
        { label: "Email the developer", action: "email" }
      ]);
    }
    focusInput();
  }

  /* Wiring. */
  function submitQuery() {
    var text = input.value.trim();
    if (!text) { return; }
    input.value = "";
    hideResults();
    expand();
    addUserBubble(text);
    rememberAsked(text);
    clearChoices();
    route(text);
    focusInput();
  }
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    submitQuery();
  });
  if (resultsEl) {
    input.addEventListener("input", function () { quietProbe(); renderResults(); });
    input.addEventListener("focus", function () { quietProbe(); });
    /* Step 56 — APG keyboard model for the combobox: focus
       never leaves the input; arrows/Home/End move the active
       option, Enter activates it (or submits when none is
       active), Escape is the staged root handler above. */
    input.addEventListener("keydown", function (ev) {
      if (!ev) { return; }
      if (!resultsOpen) {
        if (ev.key === "ArrowDown" && input.value.trim().length >= 2) {
          renderResults();
          if (resultsOpen) { ev.preventDefault(); setActive(0); }
        }
        return;
      }
      var n = resultItems.length;
      if (!n) { return; }
      if (ev.key === "ArrowDown") {
        ev.preventDefault();
        setActive(activeIdx < 0 ? 0 : (activeIdx + 1) % n);
      } else if (ev.key === "ArrowUp") {
        ev.preventDefault();
        setActive(activeIdx < 0 ? n - 1 : (activeIdx - 1 + n) % n);
      } else if (ev.key === "Home") {
        ev.preventDefault();
        setActive(0);
      } else if (ev.key === "End") {
        ev.preventDefault();
        setActive(n - 1);
      } else if (ev.key === "Enter" && activeIdx >= 0) {
        ev.preventDefault();
        activateOption(activeIdx);
      }
    });
  }
  root.addEventListener("keydown", function (ev) {
    if (!ev || ev.key !== "Escape") { return; }
    if (resultsOpen) { hideResults(); return; }
    if (bodyEl && !bodyEl.hidden) { collapse(); focusInput(); }
  });
  /* Step 58 — containers outside the panel (the topic tiles and
     the symptom cards sit below it) pass reveal=true: after the
     expansion renders, the module makes its one managed scroll
     to the panel. Containers inside the panel (the topic chips,
     the entry suggestions) never scroll the page — the visitor
     is already looking at it. */
  function wireTopicButtons(container, reveal) {
    if (!container) { return; }
    var btns = container.children;
    for (var i = 0; i < btns.length; i++) {
      (function (chip) {
        chip.addEventListener("click", function () {
          hideResults();
          expand();
          addUserBubble(chip.getAttribute("data-sa-label") || chip.textContent);
          clearChoices();
          startProc(byId(chip.getAttribute("data-sa-topic")), null);
          if (reveal) { revealAssistant(); }
          focusInput();
        });
      })(btns[i]);
    }
  }
  wireTopicButtons(topicsEl, false);
  wireTopicButtons(suggestEl, false);
  wireTopicButtons(tilesEl, true);
  wireTopicButtons(symptomsEl, true);
  showResumeChip();
  checkBtn.addEventListener("click", function () { runDiagnostics(); });

  /* Step 57 — contextual deep links. The help blocks on the
     demo, download and pricing pages link here as
     support.html?topic=demo|download|pricing: help offered at
     the moment of failure, on the page where it happens, lands
     in the one assistant with that page's procedure already
     open — the visitor never starts over. Arrival replays the
     topic-button path exactly (expand in place, the topic's
     label as the opening bubble, the procedure from node 0),
     and seeds state.origin so the diagnostics context line and
     the email handoff name the page the visitor came from.
     An absent or unknown topic leaves the Step 55/56 rest
     state untouched. The parameter is read once, from
     location.search, at module init — nothing is written back
     to the URL, so Back returns to the origin page as usual. */
  var TOPIC_LINKS = {
    demo: { proc: "demo", label: "Demo help", page: "demo.html" },
    download: { proc: "download", label: "Download problems", page: "download.html" },
    pricing: { proc: "pricing", label: "Pricing", page: "pricing.html" }
  };
  function topicParam() {
    var s = "";
    try {
      s = (typeof location !== "undefined" && typeof location.search === "string")
        ? location.search : "";
    } catch (e) { return null; }
    var m = /[?&]topic=([a-z]+)/.exec(s);
    return m ? m[1] : null;
  }
  function arriveFromTopic() {
    var key = topicParam();
    if (!key || !TOPIC_LINKS[key]) { return; }
    var link = TOPIC_LINKS[key];
    var proc = byId(link.proc);
    if (!proc) { return; }
    state.origin = { page: link.page, label: link.label };
    hideResults();
    expand();
    addUserBubble(link.label);
    clearChoices();
    startProc(proc, null);
    /* Step 58 — the arrival takes the same managed scroll as a
       tile click (one smooth scroll to the panel under the
       header), replacing the scrollIntoView + focus pair, whose
       two browser scrolls fought the expansion. */
    revealAssistant();
    focusInput();
  }
  arriveFromTopic();
})();

/* Step 55 — Privacy runbook disclosure (support.html only). The
   runbook sits behind its one-line card: a sequential procedure
   does not belong in the FAQ accordion (GOV.UK — accordions are
   for single-answer lookup), so it opens staged beneath the card
   instead. One toggle, aria-expanded kept truthful, and a
   #runbook deep link — privacy.html points here — opens it on
   arrival so the link never lands on a hidden section. */
(function () {
  "use strict";
  var toggle = document.getElementById("runbook-toggle");
  var wrap = document.getElementById("runbook-wrap");
  if (!toggle || !wrap) { return; }
  function setOpen(open) {
    wrap.hidden = !open;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }
  toggle.addEventListener("click", function () { setOpen(wrap.hidden); });
  if (typeof location !== "undefined" && location.hash === "#runbook") {
    setOpen(true);
  }
})();

/* Step 59 — Features page, Concept F ("One Window, Five Chapters").
   One module, guarded behaviours, all on pre-rendered layers: the
   hero stages one simulated moment (the Step 21 cadence, the "tell"
   sample), the chapter nav scroll-spies, Prepare's fact-confirm
   really strikes clauses and rewrites the sources line, the
   pipeline stepper steps the 15 stages, Live's Coach toggle and
   interrupt stepper swap one window's layers, the language
   switcher swaps ten pre-rendered layers (the RTL flip is in
   the markup), and the bento anchor tile's meter runs only while
   the tile is on screen. Nothing here scrolls, resizes or re-flows
   the page: visibility swaps only (the Step 58 law). */
(function () {
  "use strict";

  var reduceMotion = typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
  var hasIO = typeof IntersectionObserver === "function";
  /* Safe query: a partial DOM (older test shims, embeds) must never
     make this module throw — it simply finds nothing and stays
     inert, like every other guarded module in this file. */
  var qsa = function (sel) {
    try { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
    catch (e) { return []; }
  };

  /* ---- S0: chapter nav scroll-spy (colour only, centre band) ---- */
  var nav = document.getElementById("feat-nav");
  if (nav && hasIO) {
    var links = Array.prototype.slice.call(nav.querySelectorAll(".feat-nav-link"));
    var byId = {};
    links.forEach(function (l) { byId[l.getAttribute("href").slice(1)] = l; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) { return; }
        links.forEach(function (l) {
          l.classList.remove("is-active");
          l.removeAttribute("aria-current");
        });
        var link = byId[e.target.id];
        if (link) {
          link.classList.add("is-active");
          link.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-40% 0px -40% 0px" });
    links.forEach(function (l) {
      var sec = document.getElementById(l.getAttribute("href").slice(1));
      if (sec) { spy.observe(sec); }
    });
  }

  /* ---- S1: hero — one staged moment, played once, then Replay ----
     Timings are MOTION.md §5's hero cadence (Start 300, Hearing 600,
     Transcribing 600, transcript 160ms/word, question +300, thinking
     500, points 450ms apart, Replay 400 after the last point). The
     static HTML is the final state, so no-JS and reduced-motion
     visitors see the settled window; Replay exists only after a
     real play, and never under reduced motion. */
  var pill = document.getElementById("feat-pill");
  var pillText = document.getElementById("feat-pill-text");
  var startLabel = document.getElementById("feat-start-label");
  var icoPlay = document.getElementById("feat-ico-play");
  var icoPause = document.getElementById("feat-ico-pause");
  var questionEl = document.getElementById("feat-question");
  var transcriptEl = document.getElementById("feat-transcript");
  var thinkingEl = document.getElementById("feat-thinking");
  var answerEl = document.getElementById("feat-answer");
  var metaEl = document.getElementById("feat-meta");
  var replayBtn = document.getElementById("feat-replay");
  if (pill && pillText && questionEl && transcriptEl && thinkingEl && answerEl && metaEl && replayBtn) {
    var items = Array.prototype.slice.call(answerEl.children);
    var timers = [];
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function clearTimers() { timers.forEach(function (t) { clearTimeout(t); }); timers = []; }
    function setPill(text, kind, live) {
      pillText.textContent = text;
      pill.classList.toggle("is-listening", kind === "listening");
      pill.classList.toggle("is-thinking", kind === "thinking");
      pill.classList.toggle("is-live", !!live);
    }
    function setFeatStart(label) {
      if (startLabel) { startLabel.textContent = label; }
      var pause = label === "Pause";
      if (icoPlay) { icoPlay.hidden = pause; }
      if (icoPause) { icoPause.hidden = !pause; }
    }
    function play() {
      clearTimers();
      replayBtn.hidden = true;
      setPill("Not listening", "", false);
      setFeatStart("Start listening");
      questionEl.textContent = "Waiting for the interviewer…";
      questionEl.classList.add("is-empty");
      questionEl.classList.remove("is-landing");
      transcriptEl.textContent = "";
      thinkingEl.classList.add("is-hidden");
      thinkingEl.style.opacity = "";
      items.forEach(function (li) {
        li.classList.add("is-hidden");
        li.classList.remove("is-new");
      });
      metaEl.textContent = "";
      var words = ["Tell", "me", "about", "yourself."];
      later(function () {
        setFeatStart("Pause");
        setPill("Listening", "listening", true);
        later(function () {
          setPill("Hearing audio", "listening", true);
          later(function () {
            setPill("Transcribing", "listening", true);
            words.forEach(function (w, i) {
              later(function () { transcriptEl.textContent = words.slice(0, i + 1).join(" "); }, i * 160);
            });
            later(function () {
              transcriptEl.textContent = "";
              questionEl.textContent = "“Tell me about yourself.”";
              questionEl.classList.remove("is-empty");
              questionEl.classList.add("is-landing");
              setPill("Question detected", "thinking", true);
              later(function () {
                setPill("Preparing answer", "thinking", false);
                thinkingEl.classList.remove("is-hidden");
                items.forEach(function (li, i) {
                  later(function () {
                    if (i === 0) {
                      thinkingEl.style.opacity = "0";
                      later(function () {
                        thinkingEl.classList.add("is-hidden");
                        thinkingEl.style.opacity = "";
                      }, 150);
                    }
                    li.classList.remove("is-hidden");
                    li.classList.add("is-new");
                  }, i * 450);
                });
                later(function () {
                  setPill("Answer ready", "listening", false);
                  setFeatStart("Start listening");
                  metaEl.textContent = "prepared";
                  replayBtn.hidden = false;
                }, items.length * 450 + 400);
              }, 500);
            }, words.length * 160 + 300);
          }, 600);
        }, 600);
      }, 300);
    }
    replayBtn.addEventListener("click", play);
    if (!reduceMotion) {
      if (hasIO) {
        var seen = false;
        var heroIO = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting && !seen) {
              seen = true;
              play();
              heroIO.disconnect();
            }
          });
        }, { threshold: 0.25 });
        heroIO.observe(pill);
      } else {
        play();
      }
    }
  }

  /* ---- S2a: Prepare — you confirm every fact (really works) ---- */
  var boxes = qsa(".feat-fact-box");
  var clauses = qsa(".feat-clause");
  var sourcesEl = document.getElementById("feat-sources");
  var countEl = document.getElementById("feat-count");
  if (boxes.length && clauses.length === boxes.length && sourcesEl && countEl) {
    var factLabels = boxes.map(function (b) {
      var span = b.parentNode.querySelector("span");
      return span ? span.textContent.trim() : "";
    });
    var syncFacts = function () {
      var used = [];
      boxes.forEach(function (b, i) {
        clauses[i].classList.toggle("is-off", !b.checked);
        if (b.checked) { used.push(factLabels[i]); }
      });
      sourcesEl.textContent = used.length
        ? "Sources used by this answer: " + used.join(" · ")
        : "Sources used by this answer: none — with nothing confirmed, the app builds no answer from guesses.";
      countEl.textContent = used.length + " of " + boxes.length
        + " facts confirmed — the app uses only confirmed facts.";
    };
    boxes.forEach(function (b) { b.addEventListener("change", syncFacts); });
  }

  /* ---- S2b: Prepare — the 15-stage pipeline stepper ----
     Static HTML stacks all 15 panels as the full list (the no-JS
     state); init switches the stage to one grid cell and steps by
     visibility. Play all advances every 1.6s, pauses on hover,
     focus or any manual step, and stops at stage 15. */
  var stepper = document.getElementById("feat-stepper");
  if (stepper) {
    var nums = Array.prototype.slice.call(stepper.querySelectorAll(".feat-step-num"));
    var panels = Array.prototype.slice.call(stepper.querySelectorAll(".feat-step-panel"));
    var prevBtn = document.getElementById("feat-step-prev");
    var nextBtn = document.getElementById("feat-step-next");
    var playBtn = document.getElementById("feat-step-play");
    var stepLive = document.getElementById("feat-step-live");
    if (nums.length === 15 && panels.length === 15 && prevBtn && nextBtn && playBtn) {
      stepper.classList.add("is-live");
      var cur = 0;
      var wantsPlay = false;
      var suspended = false;
      var playTimer = null;
      var renderStep = function (announce) {
        panels.forEach(function (p, i) {
          p.classList.toggle("is-hidden", i !== cur);
          p.classList.toggle("is-shown", i === cur);
        });
        nums.forEach(function (b, i) {
          b.classList.toggle("is-active", i === cur);
          if (i === cur) { b.setAttribute("aria-current", "true"); }
          else { b.removeAttribute("aria-current"); }
        });
        prevBtn.disabled = cur === 0;
        nextBtn.disabled = cur === panels.length - 1;
        if (announce && stepLive) {
          var nameEl = panels[cur].querySelector(".feat-step-name");
          stepLive.textContent = "Stage " + (cur + 1) + " of 15"
            + (nameEl ? ": " + nameEl.textContent : "");
        }
      };
      var runTimer = function () {
        if (playTimer) { clearInterval(playTimer); playTimer = null; }
        if (!wantsPlay || suspended) { return; }
        playTimer = setInterval(function () {
          if (cur >= panels.length - 1) { stopPlay(); renderStep(true); return; }
          cur += 1;
          renderStep(false);
        }, 1600);
      };
      var stopPlay = function () {
        wantsPlay = false;
        if (playTimer) { clearInterval(playTimer); playTimer = null; }
        playBtn.setAttribute("aria-pressed", "false");
        playBtn.textContent = "Play all";
      };
      var stepTo = function (n) {
        stopPlay();
        cur = Math.max(0, Math.min(panels.length - 1, n));
        renderStep(true);
      };
      nums.forEach(function (b, i) {
        b.addEventListener("click", function () { stepTo(i); });
      });
      prevBtn.addEventListener("click", function () { stepTo(cur - 1); });
      nextBtn.addEventListener("click", function () { stepTo(cur + 1); });
      playBtn.addEventListener("click", function () {
        if (wantsPlay) { stopPlay(); renderStep(true); return; }
        if (cur === panels.length - 1) { cur = 0; }
        wantsPlay = true;
        playBtn.setAttribute("aria-pressed", "true");
        playBtn.textContent = "Pause";
        renderStep(false);
        runTimer();
      });
      /* Suspension is scoped to the reading surface — the stage
         and the stage numbers. Hovering or focusing the transport
         controls must never deadlock Play: the click that starts
         playback lands there, pointer and focus included, and the
         first audit's Play button appeared broken for exactly that
         reason (hover + focus both live on the controls row). */
      var stageEl = document.getElementById("feat-step-stage");
      var numsWrap = stepper.querySelector(".feat-step-nums");
      [stageEl, numsWrap].forEach(function (el) {
        if (!el) { return; }
        el.addEventListener("mouseenter", function () { suspended = true; runTimer(); });
        el.addEventListener("mouseleave", function () { suspended = false; runTimer(); });
      });
      stepper.addEventListener("focusin", function (e) {
        suspended = nums.indexOf(e.target) !== -1;
        runTimer();
      });
      stepper.addEventListener("focusout", function () { suspended = false; runTimer(); });
      stepper.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") { e.preventDefault(); stepTo(cur - 1); }
        else if (e.key === "ArrowRight") { e.preventDefault(); stepTo(cur + 1); }
      });
      renderStep(false);
    }
  }

  /* ---- S3: Live — Coach toggle + interrupt stepper, one window ----
     The four layers are pre-rendered in the answer stack (the demo's
     SAMPLES.tell answer, its INT shortenings, and its Coach view),
     so the window never changes height. Picking a length returns to
     Answer mode, as the app shortens the answer it is showing. */
  var modeAnswer = document.getElementById("feat-mode-answer");
  var modeCoach = document.getElementById("feat-mode-coach");
  var liveLayers = {
    normal: document.getElementById("feat-live-normal"),
    concise: document.getElementById("feat-live-concise"),
    rapid: document.getElementById("feat-live-rapid"),
    coach: document.getElementById("feat-live-coach")
  };
  var intBtns = {
    normal: document.getElementById("feat-int-normal"),
    concise: document.getElementById("feat-int-concise"),
    rapid: document.getElementById("feat-int-rapid")
  };
  var intState = document.getElementById("feat-int-state");
  var liveStatus = document.getElementById("feat-live-status");
  if (modeAnswer && modeCoach && liveLayers.normal && liveLayers.concise
      && liveLayers.rapid && liveLayers.coach && intBtns.normal && liveStatus) {
    var mode = "answer";
    var len = "normal";
    var LEN_LABEL = {
      normal: "Normal — 3 points",
      concise: "Concise — 2 short points",
      rapid: "Rapid — 1 line"
    };
    var LEN_STATUS = {
      normal: "Normal (3 points)",
      concise: "Concise (2 points)",
      rapid: "Rapid (1 line)"
    };
    var showLive = function (announce, stage) {
      var key = mode === "coach" ? "coach" : len;
      Object.keys(liveLayers).forEach(function (k) {
        var layer = liveLayers[k];
        var on = k === key;
        layer.classList.toggle("is-hidden", !on);
        if (on && stage && !reduceMotion) {
          Array.prototype.forEach.call(layer.querySelectorAll("li"), function (li) {
            li.classList.remove("is-new");
            void li.offsetWidth;
            li.classList.add("is-new");
          });
        }
      });
      modeAnswer.classList.toggle("is-active", mode === "answer");
      modeAnswer.setAttribute("aria-pressed", String(mode === "answer"));
      modeCoach.classList.toggle("is-coach-active", mode === "coach");
      modeCoach.setAttribute("aria-pressed", String(mode === "coach"));
      Object.keys(intBtns).forEach(function (k) {
        intBtns[k].setAttribute("aria-pressed", String(k === len));
      });
      if (intState) { intState.textContent = LEN_LABEL[len]; }
      if (announce) {
        liveStatus.textContent = mode === "coach"
          ? "Coach Mode ready — simulated."
          : LEN_STATUS[len] + " ready — simulated.";
      }
    };
    modeAnswer.addEventListener("click", function () { mode = "answer"; showLive(true, true); });
    modeCoach.addEventListener("click", function () { mode = "coach"; showLive(true, true); });
    Object.keys(intBtns).forEach(function (k) {
      intBtns[k].addEventListener("click", function () {
        len = k;
        mode = "answer";
        showLive(true, true);
      });
    });
    showLive(false, false);
  }

  /* ---- S4: Languages — ten-language switcher, real RTL flip ----
     The ten layers are pre-rendered with their own lang/dir, so
     switching is a visibility swap: direction changes never
     animate, and focus and scroll never move. Step 62: on phones
     the five extra chips wait behind the "+ 5 more" toggle (CSS
     hides them at ≤640px until the group is expanded); wider
     layouts render all ten chips and no toggle. */
  var langChips = qsa(".feat-lang-chip");
  var langLayers = qsa(".feat-lang-layer");
  if (langChips.length && langLayers.length) {
    langChips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var key = chip.getAttribute("data-lang");
        langChips.forEach(function (c) {
          c.setAttribute("aria-pressed", String(c === chip));
        });
        langLayers.forEach(function (layer) {
          var on = layer.getAttribute("data-layer") === key;
          layer.classList.toggle("is-hidden", !on);
          if (on && !reduceMotion) {
            layer.classList.remove("is-shown");
            void layer.offsetWidth;
            layer.classList.add("is-shown");
          }
        });
      });
    });
  }
  var langMore = qsa(".feat-lang-more");
  var langChipsBox = document.getElementById("feat-lang-chips");
  if (langMore.length && langChipsBox) {
    langMore[0].addEventListener("click", function () {
      var open = langChipsBox.classList.toggle("is-expanded");
      langMore[0].setAttribute("aria-expanded", String(open));
      langMore[0].textContent = open ? "Show less" : "+ 5 more";
    });
  }

  /* ---- S7: bento anchor tile — ambient meter, on-screen only ---- */
  var tilePill = document.getElementById("feat-tile-pill");
  if (tilePill && hasIO && !reduceMotion) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        tilePill.classList.toggle("is-live", e.isIntersecting);
      });
    }, { threshold: 0.2 }).observe(tilePill);
  }
})();

/* Step 63 — How It Works, "One Question, Traced". One module,
   guarded behaviours, all on pre-rendered panels: the trace
   stepper steps five staged frames, the stage-5 points and
   facts highlight each other through their data links (the
   trace closing its own loop on the demo's SAMPLES.tell data),
   and the faded second question arms a prediction, then
   reveals the INT shortenings. With JS off, the panels stack
   as the numbered small-multiples and the reveal sits open.
   Step 66 — the stage takes each panel's NATURAL height.
   Steps 63/64 shared one fixed height (the tallest panel's)
   so stepping never moved the page, but on the owner's tall
   phone the short captions spread across that height as a
   chasm (Step 64's centred fear line, floating). Now only
   the shown panel is in flow; a stage change glides the
   stage height from the old panel's height to the new one's
   over .34s in the house easing — the Step 58 unfold
   technique: lock the current height, swap the panels,
   measure the new one, transition, and hand the height back
   to the layout when the transition ends. The stage's top
   edge cannot move (nothing above it changes height), so
   the page never needs a compensating scroll and the module
   still moves no focus and keeps no clock of its own: the
   glide is a CSS transition, and the sheet's reduced-motion
   rule stills it into an instant swap. */
(function () {
  "use strict";

  var slice = function (list) { return Array.prototype.slice.call(list); };

  /* ---- S1: the trace — a guided 5-stage stepper ----
     Static HTML stacks all five panels (the no-JS small
     multiples); init takes the hidden panels out of flow so
     the stage is exactly the shown panel's natural height,
     and stepping glides the stage height between panels
     (Step 66 — see the module header). */
  var trace = document.getElementById("hw-trace");
  if (trace) {
    var nodes = slice(trace.querySelectorAll(".hw-node"));
    var panels = slice(trace.querySelectorAll(".hw-panel"));
    var stageEl = trace.querySelector(".hw-stage");
    var prevBtn = document.getElementById("hw-prev");
    var nextBtn = document.getElementById("hw-next");
    var progress = document.getElementById("hw-progress");
    var live = document.getElementById("hw-live");
    var fill = document.getElementById("hw-nodes-fill");
    if (nodes.length === 5 && panels.length === 5 && prevBtn && nextBtn && progress) {
      trace.classList.add("is-live");
      var names = nodes.map(function (n) {
        var nameEl = n.querySelector(".hw-node-name");
        return nameEl ? nameEl.textContent : "";
      });
      var cur = 0;
      var renderStep = function (announce) {
        panels.forEach(function (p, i) {
          p.classList.toggle("is-hidden", i !== cur);
          p.classList.toggle("is-shown", i === cur);
        });
        nodes.forEach(function (b, i) {
          b.classList.toggle("is-active", i === cur);
          b.classList.toggle("is-done", i < cur);
          if (i === cur) { b.setAttribute("aria-current", "true"); }
          else { b.removeAttribute("aria-current"); }
        });
        if (fill) {
          fill.style.transform = "scaleX(" + (cur / (panels.length - 1)) + ")";
        }
        prevBtn.disabled = cur === 0;
        nextBtn.disabled = cur === panels.length - 1;
        progress.textContent = "Stage " + (cur + 1) + " of " + panels.length
          + " — " + names[cur];
        if (announce && live) { live.textContent = progress.textContent; }
      };
      /* Step 66 — the stage-height glide (see the module
         header). Guarded throughout: a DOM without layout
         (the sim harness) reports no numeric height, and the
         stepper then swaps instantly, exactly as it did
         before. The transition's end hands the height back
         to the layout; a viewport resize does the same, so
         the stage can never stay locked at a stale height —
         under reduced motion the sheet stills the transition
         itself, the swap lands instantly at the new panel's
         natural height, and the next step or resize clears
         the inline height the same way. */
      var clearStageHeight = function () {
        if (!stageEl || !stageEl.style) { return; }
        stageEl.style.transition = "";
        stageEl.style.height = "";
        stageEl.style.overflow = "";
      };
      if (stageEl && stageEl.addEventListener) {
        var onStageSettled = function (e) {
          if (e && e.propertyName && e.propertyName !== "height") { return; }
          clearStageHeight();
        };
        stageEl.addEventListener("transitionend", onStageSettled);
        stageEl.addEventListener("transitioncancel", onStageSettled);
      }
      if (typeof window !== "undefined" && window
          && typeof window.addEventListener === "function") {
        window.addEventListener("resize", clearStageHeight);
      }
      var stepTo = function (n) {
        var target = Math.max(0, Math.min(panels.length - 1, n));
        if (target === cur || !stageEl || !stageEl.style
            || typeof stageEl.offsetHeight !== "number"
            || !stageEl.offsetHeight) {
          cur = target;
          renderStep(true);
          return;
        }
        clearStageHeight();
        var fromH = stageEl.offsetHeight;
        stageEl.style.overflow = "hidden";
        stageEl.style.height = fromH + "px";
        cur = target;
        renderStep(true);
        var toH = panels[cur].offsetHeight;
        if (typeof toH !== "number" || !toH
            || Math.abs(toH - fromH) < 1) {
          clearStageHeight();
          return;
        }
        void stageEl.offsetHeight; /* commit the locked height */
        stageEl.style.transition = "height .34s cubic-bezier(.2,.7,.3,1)";
        stageEl.style.height = toH + "px";
      };
      nodes.forEach(function (b, i) {
        b.addEventListener("click", function () { stepTo(i); });
      });
      prevBtn.addEventListener("click", function () { stepTo(cur - 1); });
      nextBtn.addEventListener("click", function () { stepTo(cur + 1); });
      trace.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") { e.preventDefault(); stepTo(cur - 1); }
        else if (e.key === "ArrowRight") { e.preventDefault(); stepTo(cur + 1); }
      });
      renderStep(false);
    }

    /* ---- S2: stage 5 — points and facts light each other ----
       The links are the data itself: each point names the facts
       it stands on (data-facts), each fact names its points
       (data-bullets). Picking either side lights the other and
       dims the rest; picking it again lets go. Fact 3 honestly
       has no point in this answer — it stands behind the bank's
       second question, and its announcement says so. */
    var bullets = slice(trace.querySelectorAll(".hw-bullet"));
    var facts = slice(trace.querySelectorAll(".hw-fact"));
    var traceLive = document.getElementById("hw-trace-live");
    if (bullets.length === 3 && facts.length === 5) {
      var selBullet = null;
      var selFact = null;
      var say = function (msg) { if (traceLive) { traceLive.textContent = msg; } };
      var numOf = function (id) { return id.slice(1); };
      var clearTrace = function () {
        selBullet = null;
        selFact = null;
        var states = ["is-active", "is-lit", "is-dim"];
        bullets.forEach(function (b) {
          states.forEach(function (c) { b.classList.remove(c); });
          b.setAttribute("aria-pressed", "false");
        });
        facts.forEach(function (f) {
          states.forEach(function (c) { f.classList.remove(c); });
          f.setAttribute("aria-pressed", "false");
        });
      };
      var pickBullet = function (b) {
        if (selBullet === b) { clearTrace(); say(""); return; }
        clearTrace();
        selBullet = b;
        b.classList.add("is-active");
        b.setAttribute("aria-pressed", "true");
        var ids = (b.getAttribute("data-facts") || "").split(" ").filter(Boolean);
        bullets.forEach(function (o) {
          if (o !== b) { o.classList.add("is-dim"); }
        });
        facts.forEach(function (f) {
          var on = ids.indexOf(f.getAttribute("data-fact")) !== -1;
          f.classList.toggle("is-lit", on);
          f.classList.toggle("is-dim", !on);
        });
        var nums = ids.map(numOf);
        say("Point " + numOf(b.getAttribute("data-bullet")) + " stands on "
          + (nums.length > 1 ? "facts " + nums.join(" and ") : "fact " + nums[0]) + ".");
      };
      var pickFact = function (f) {
        if (selFact === f) { clearTrace(); say(""); return; }
        clearTrace();
        selFact = f;
        f.classList.add("is-active");
        f.setAttribute("aria-pressed", "true");
        var ids = (f.getAttribute("data-bullets") || "").split(" ").filter(Boolean);
        facts.forEach(function (o) {
          if (o !== f) { o.classList.add("is-dim"); }
        });
        bullets.forEach(function (b) {
          var on = ids.indexOf(b.getAttribute("data-bullet")) !== -1;
          b.classList.toggle("is-lit", on);
          b.classList.toggle("is-dim", !on);
        });
        if (!ids.length) {
          say("Fact " + numOf(f.getAttribute("data-fact"))
            + " stands behind the bank's second question — it is not in this answer.");
        } else {
          var nums = ids.map(numOf);
          say("Fact " + numOf(f.getAttribute("data-fact")) + " stands behind "
            + (nums.length > 1 ? "points " + nums.join(" and ") : "point " + nums[0]) + ".");
        }
      };
      bullets.forEach(function (b) {
        b.addEventListener("click", function () { pickBullet(b); });
      });
      facts.forEach(function (f) {
        f.addEventListener("click", function () { pickFact(f); });
      });
    }
  }

  /* ---- S3: the faded second question — predict, then reveal ----
     At rest the reveal is open (the no-JS truth). Init arms the
     prediction: the reveal hides until a prediction is chosen
     and the Reveal button is pressed; the verdict then leads the
     same honest text the static page already carried. */
  var faded = document.getElementById("hw-faded");
  if (faded) {
    var opts = slice(faded.querySelectorAll(".hw-opt"));
    var revealBtn = document.getElementById("hw-reveal-btn");
    var feedback = document.getElementById("hw-faded-feedback");
    if (opts.length === 3 && revealBtn && feedback) {
      faded.classList.add("is-armed");
      revealBtn.disabled = true;
      var defaultFeedback = feedback.textContent;
      var chosen = null;
      var revealed = false;
      opts.forEach(function (o) {
        o.addEventListener("click", function () {
          if (revealed) { return; }
          chosen = o;
          opts.forEach(function (x) {
            x.classList.toggle("is-chosen", x === o);
            x.setAttribute("aria-pressed", String(x === o));
          });
          revealBtn.disabled = false;
        });
      });
      revealBtn.addEventListener("click", function () {
        if (!chosen || revealed) { return; }
        revealed = true;
        faded.classList.add("is-revealed");
        opts.forEach(function (o) { o.disabled = true; });
        revealBtn.hidden = true;
        var ok = chosen.getAttribute("data-correct") === "true";
        feedback.textContent = (ok ? "Exactly right. " : "Not quite. ") + defaultFeedback;
      });
    }
  }
})();
