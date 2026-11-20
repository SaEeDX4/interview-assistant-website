/* Step 62 suite — Languages chapter: real coverage display.
   Step 0 evidence (the hard gate): the app's ten languages are the
   LanguageRegistry list in the Windows source
   (src/InterviewAssistant.Core/Languages/LanguageRegistry.cs),
   mirrored entry-for-entry in the Android port's LanguageRegistry.kt
   and by the i18n tables — exactly 10 files × 1,166 keys in both
   trees (ar de en es fa fr hi it pt zh). The registry's native
   names and RTL flags are pinned below as literals from that file;
   if the product's registry changes, this suite must change with it.
   Contract pinned here: chips in global-speaker order (the stated
   main-5 criterion) with the registry's native names; the phone
   split (five primary + five .feat-lang-extra behind the toggle);
   one pre-rendered layer per language carrying the demo's sample
   set — EN/FA/AR pinned against SAMPLES in test-step59, the seven
   new sets pinned verbatim below (careful translations of the same
   fa/ar sample texts, Step 62); RTL on exactly {ar, fa}; the CSS
   reveal law (toggle exists only ≤640px, extras hidden there until
   .is-expanded); the JS toggle wiring; and the corrected coverage
   copy (the printed list, the card footer, the win-note), with the
   retired Step 59/60 claims absent. Behaviour (switching at three
   widths, card-height invariance, expansion, reduced motion, JS-off)
   is pinned by the Playwright audit kept with the report in
   step62-languages/audit.py.
   Usage: node test-step62.js   (exit 0 = all pass) */
const fs = require("fs");
const path = require("path");

const D = path.join(__dirname, "..", "website") + path.sep;
const read = (f) => fs.readFileSync(D + f, "utf8");
const html = read("features.html");
const css = read("styles.css");
const js = read("app.js");
const visible = html.replace(/<script[\s\S]*?<\/script>/g, "");

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; }
  else { fail++; console.log("FAIL " + name + (detail ? " — " + detail : "")); }
}
const unesc = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&#39;/g, "'").replace(/&quot;/g, '"');

/* The registry, as literals from LanguageRegistry.cs (Step 0). */
const REGISTRY = [
  ["en", "English", "English", false], ["es", "Spanish", "Español", false],
  ["fr", "French", "Français", false], ["de", "German", "Deutsch", false],
  ["pt", "Portuguese", "Português", false], ["it", "Italian", "Italiano", false],
  ["ar", "Arabic", "العربية", true], ["fa", "Persian", "فارسی", true],
  ["zh", "Chinese (Simplified)", "简体中文", false], ["hi", "Hindi", "हिन्दी", false],
];
/* Chip order = global total speaker base (L1+L2) applied to the
   registry list; the first five are the phone-primary set. */
const CHIP_ORDER = ["en", "zh", "hi", "es", "ar", "fr", "pt", "de", "fa", "it"];
const MAIN5 = CHIP_ORDER.slice(0, 5);
const EXTRA5 = CHIP_ORDER.slice(5);
const nativeOf = (code) => REGISTRY.find((r) => r[0] === code)[2];
const englishOf = (code) => REGISTRY.find((r) => r[0] === code)[1];

/* ---------- 1. Chips: the ten, in speaker order, native names ---------- */
{
  const box = (html.match(/<div class="chips feat-lang-chips"[\s\S]*?<\/div>/) || [""])[0];
  const chips = [...box.matchAll(/<button type="button" class="chip feat-lang-chip( feat-lang-extra)?" data-lang="([a-z]+)" aria-pressed="(true|false)">([\s\S]*?)<\/button>/g)]
    .map((m) => ({ extra: !!m[1], code: m[2], pressed: m[3], label: m[4] }));
  check("chips: exactly ten, in global-speaker order",
    JSON.stringify(chips.map((c) => c.code)) === JSON.stringify(CHIP_ORDER),
    JSON.stringify(chips.map((c) => c.code)));
  check("chips: English pressed at rest, all others not",
    chips.length === 10 && chips[0].code === "en" && chips[0].pressed === "true"
    && chips.slice(1).every((c) => c.pressed === "false"));
  check("chips: labels are the registry's native names (English plain, others in lang spans)",
    chips.every((c) => c.code === "en"
      ? c.label === "English"
      : c.label === '<span lang="' + c.code + '">' + nativeOf(c.code) + "</span>"),
    chips.map((c) => c.label).join(" | "));
  check("chips: the extra five are exactly the speaker-order tail, marked .feat-lang-extra",
    JSON.stringify(chips.filter((c) => c.extra).map((c) => c.code)) === JSON.stringify(EXTRA5)
    && JSON.stringify(chips.filter((c) => !c.extra).map((c) => c.code)) === JSON.stringify(MAIN5));
  check("toggle: one phone reveal, collapsed, wired to the chip group",
    (html.match(/feat-lang-more/g) || []).length >= 1
    && html.includes('<button type="button" class="chip feat-lang-more" id="feat-lang-more" aria-expanded="false" aria-controls="feat-lang-chips">+ 5 more</button>')
    && html.includes('<div class="chips feat-lang-chips" id="feat-lang-chips" role="group" aria-label="Sample language">'));
}

/* ---------- 2. Layers: one per language, sample-set structure ---------- */
const langSeg = (lang) => {
  const i = html.indexOf('data-layer="' + lang + '"');
  if (i < 0) return "";
  const next = html.indexOf('data-layer="', i + 12);
  return html.slice(i, next > -1 ? next : i + 2600);
};
const langBullets = (seg) => [...seg.matchAll(/<li><span class="num">\d<\/span><span>([^<]*)<\/span><\/li>/g)]
  .map((m) => unesc(m[1]));
{
  const layerCodes = [...html.matchAll(/data-layer="([a-z]+)"/g)].map((m) => m[1]);
  check("layers: exactly the registry's ten (existing three first, then registry order)",
    JSON.stringify(layerCodes) === JSON.stringify(["en", "fa", "ar", "es", "fr", "de", "pt", "it", "zh", "hi"]),
    JSON.stringify(layerCodes));
  check("layers: every layer carries tag + question + 3 bullets + coach line",
    REGISTRY.every(([code]) => {
      const seg = langSeg(code);
      return seg.includes("Answer · " + englishOf(code))
        && langBullets(seg).length === 3
        && seg.includes('class="feat-lang-coach"');
    }));
  check("layers: RTL belongs to exactly Arabic and Persian (registry flags)",
    REGISTRY.every(([code, , , rtl]) => {
      const seg = langSeg(code);
      return rtl
        ? seg.includes('<ul class="a" lang="' + code + '" dir="rtl">')
        : !seg.includes('dir="rtl"');
    }));
}

/* ---------- 3. The seven new sample sets, verbatim ---------- */
const NEW_SETS = {
  es: { q: "«Hábleme de usted.»",
    a: ["Empiezo por mi puesto actual y menciono un resultado concreto que logré.",
        "Después doy un ejemplo real de mi experiencia, no frases generales.",
        "Y termino explicando por qué este puesto encaja conmigo."],
    coach: "EXPERIENCIA · RESULTADO · ENCAJE — Puesto actual → un resultado → por qué este puesto" },
  fr: { q: "«Parlez-moi de vous.»",
    a: ["Je commence par mon poste actuel et je cite un résultat concret.",
        "Puis je donne un exemple réel de mon expérience, pas des généralités.",
        "Et je termine en expliquant pourquoi ce poste me convient."],
    coach: "EXPÉRIENCE · RÉSULTAT · ADÉQUATION — Poste actuel → un résultat → pourquoi ce poste" },
  de: { q: "«Erzählen Sie mir etwas über sich.»",
    a: ["Ich beginne mit meiner aktuellen Rolle und nenne ein konkretes Ergebnis.",
        "Dann ein echtes Beispiel aus meiner Erfahrung, keine Allgemeinplätze.",
        "Zum Schluss erkläre ich, warum diese Rolle zu mir passt."],
    coach: "ERFAHRUNG · ERGEBNIS · PASSUNG — Aktuelle Rolle → ein Ergebnis → warum diese Rolle" },
  pt: { q: "«Fale-me sobre você.»",
    a: ["Começo pelo meu cargo atual e cito um resultado concreto.",
        "Depois dou um exemplo real da minha experiência, nada de generalidades.",
        "E termino explicando por que esta vaga combina comigo."],
    coach: "EXPERIÊNCIA · RESULTADO · ENCAIXE — Cargo atual → um resultado → por que esta vaga" },
  it: { q: "«Mi parli di lei.»",
    a: ["Comincio dal mio ruolo attuale e cito un risultato concreto.",
        "Poi un esempio reale della mia esperienza, niente discorsi generici.",
        "E chiudo spiegando perché questo ruolo fa per me."],
    coach: "ESPERIENZA · RISULTATO · IDONEITÀ — Ruolo attuale → un risultato → perché questo ruolo" },
  zh: { q: "«请介绍一下您自己。»",
    a: ["我先介绍我目前的职位，并说一个我取得的具体成果。",
        "然后我会举一个亲身经历的真实例子，而不是泛泛而谈。",
        "最后我会说明为什么这个职位适合我。"],
    coach: "经验 · 成果 · 契合 — 当前职位 → 一个成果 → 为什么是这个职位" },
  hi: { q: "«अपने बारे में बताइए।»",
    a: ["मैं अपनी वर्तमान भूमिका से शुरुआत करता हूँ और एक ठोस परिणाम बताता हूँ।",
        "फिर मैं अपने अनुभव का एक वास्तविक उदाहरण देता हूँ, कोई सामान्य बात नहीं।",
        "अंत में मैं बताता हूँ कि यह भूमिका मेरे लिए क्यों सही है।"],
    coach: "अनुभव · परिणाम · उपयुक्तता — वर्तमान भूमिका → एक परिणाम → यह भूमिका क्यों" },
};
{
  for (const [code, set] of Object.entries(NEW_SETS)) {
    const seg = langSeg(code);
    check("sample " + code + ": question + bullets + coach line, verbatim",
      seg.includes(set.q)
      && JSON.stringify(langBullets(seg)) === JSON.stringify(set.a)
      && seg.includes(set.coach),
      JSON.stringify(langBullets(seg)));
    check("sample " + code + ": texts carry lang=\"" + code + "\" (no dir — LTR per the registry)",
      seg.includes('<p class="q" lang="' + code + '">')
      && seg.includes('<ul class="a" lang="' + code + '">')
      && seg.includes('<p class="feat-lang-coach" lang="' + code + '">'));
  }
}

/* ---------- 4. CSS reveal law + JS wiring ---------- */
{
  check("css: the toggle is display:none by default (wider layouts never render it)",
    css.includes(".feat-lang-more { display: none; }"));
  const moreBlock = css.indexOf(".feat-lang-more { display: block; }");
  const mediaBefore = css.lastIndexOf("@media (max-width: 640px)", moreBlock);
  check("css: at ≤640px the toggle renders and unexpanded extras hide (in the features phone block)",
    moreBlock > -1 && mediaBefore > -1
    && css.slice(mediaBefore, moreBlock).includes(".feat-nav-link")
    && css.includes(".feat-lang-chips:not(.is-expanded) .feat-lang-extra { display: none; }"));
  check("js: the toggle swaps .is-expanded, aria-expanded and its label, guarded",
    js.includes('var langMore = qsa(".feat-lang-more");')
    && js.includes('langChipsBox.classList.toggle("is-expanded")')
    && js.includes('langMore[0].setAttribute("aria-expanded", String(open));')
    && js.includes('langMore[0].textContent = open ? "Show less" : "+ 5 more";'));
}

/* ---------- 5. Coverage copy: corrected, retired claims absent ---------- */
{
  check("copy: the chapter prints the registry list, in registry order",
    html.includes("across all ten of the app’s languages — English, Spanish, French, German, Portuguese, Italian, Arabic, Persian, Chinese (Simplified) and Hindi, the list exactly as the app’s own language registry states it"));
  check("copy: card footer + win-note tell the ten-language truth",
    html.includes("All ten of the app’s languages, shown with the demo’s sample question.")
    && html.includes("the same question and answer re-render in each of the ten"));
  check("copy: the retired claims are gone (unsourced-list refusal, three-of-ten, pair framing)",
    !html.includes("we do not print one we cannot source")
    && !html.includes("Three of the app’s ten languages")
    && !html.includes("English, plus the two right-to-left examples"));
  check("copy: no language outside the registry is named anywhere visible",
    !/Japanese|Korean|Turkish|Russian|Dutch/.test(visible));
}

console.log("test-step62: " + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
