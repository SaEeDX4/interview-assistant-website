/* Step 90 — the band's bottom-row corners, the name plate, the
   Spotlight caption deletion, the never-wrapping header row, the
   call-bar furniture + lens craft, the under-stage composition,
   the shortened demo texts, and the demo-head toolbar.
   Run: node tests/test-step90.js (from
   ~/workspace/interview-assistant-website).
   Owner evidence: his Galaxy Z Fold 7 (OPEN fold) screenshots of
   the live Step 89 build — the primed stage (self tile over the
   window's bottom-right corner; participant tile touching the
   window's left edge), the Spotlight dark box, the wrapped
   header row, the left-set name plate, the call header, the
   under-stage block, and the demo head's dead right side.
   The contracts pinned here:
   - 1: the field reserves a bottom LANE for the tile row —
     fitFieldToWindow runs in EVERY state (primed included),
     measures at rest (transitions frozen for the measuring
     task — the animated floor poisoned every mid-glide read),
     and adds the lane's live-measured height whenever either
     side's horizontal clearance is under 16px. The sampled
     browser probe (tests/probe-step90.py) asserts the live
     invariant: zero overlap, >=16px on the separating axis,
     at 641/712/768/853/933 x primed/complete, plus the header
     row one line for every real status string.
   - B: the name plate is centred in its box at every seat,
     name strong / role quiet, hairline edge, no pills.
   - C: the .call-caption element is DELETED (markup, sheet,
     JS) — the QUESTION card is the only transcription
     surface; the closing line rides the status line.
   - D: the call window's header row never wraps in the band
     (nowrap + flexing meter in <=933; the precedented chrome
     shed — meter + stop glyph — at <=860).
   - E1: the call bar's right side is real-call furniture
     (meeting title + participants mark); the "simulated"
     disclosure stands in the eyebrow + honesty copy.
   - E2: the webcam lens keeps its 13x13 box; finer gradients
     and a two-tone concentric ring inside the same 3px.
   - F: the under-stage controls compose in the band (buttons
     stretch on one baseline; the note takes its own row in a
     560px measure); phones keep the pre-Step-90 composition.
   - G: the three demo texts are shortened by half or more,
     every factual disclosure survives, the word "simulated"
     is gone from them (the eyebrow is untouched by the order).
   - H: the demo head is a toolbar in the band — chip left,
     action right (preparing state carved out). */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..", "website");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const html = fs.readFileSync(path.join(root, "demo.html"), "utf8");
const js = fs.readFileSync(path.join(root, "app.js"), "utf8");
let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
const fit = (js.match(/function fitFieldToWindow\(\) \{[\s\S]*?\n  \}/) || [""])[0];

/* ---------- 1: the lane ---------- */
check("1: the fit runs in every state — its guard no longer excludes the primed state",
  fit.length > 0 && !fit.includes("is-primed") &&
  fit.includes('getComputedStyle(demoWindowEl).position !== "absolute"'));
check("1: the fit measures at rest — transitions are frozen for the measuring task (the animated floor poisoned the old reads: the fit once read its own 870px reservation as the floor, cleared it, and never re-set it)",
  fit.includes('el.style.transition = "none"') && fit.includes("prevTransitions"));
check("1: the lane is measured live from the participant unit, only where it is bottom-anchored",
  js.includes("function bottomLaneHeight()") &&
  js.includes('(mr.bottom - lr.bottom) <= 20') &&
  js.includes('(unitTop - mr.top) > 100'));
check("1: the lane is added only where a side's horizontal clearance is under 16px — where both sides clear, the composed field height stands",
  fit.includes("if (selfGap >= 16 && partGap >= 16) { lane = 0; }") &&
  fit.includes("if (lane) { need += lane; }"));
check("1: the band window cap reserves 124px per side (participant side gap 24, self side 20 at cap-bound widths)",
  /\.call-main \.app-window \{ width: min\(432px, calc\(100% - 248px\)\); \}/.test(clean));

/* ---------- D: the header row never wraps ---------- */
check("D: in the band the call window's header is nowrap, the pill may narrow, the meter flexes, the controls never shrink",
  /\.call-main \.app-header \{ flex-wrap: nowrap; \}/.test(clean) &&
  /\.call-main \.app-pill \{ flex: 0 1 auto; min-width: 0; \}/.test(clean) &&
  /\.call-main \.app-meter \{ flex: 1 1 auto; width: auto; min-width: 12px; \}/.test(clean) &&
  /\.call-main \.app-header-controls \{ flex: none; \}/.test(clean));
check("D: at <=860 the precedented shed completes — meter and decorative stop glyph rest, the row tightens on scale (play + close never shed)",
  /\.call-main \.app-meter \{ display: none; \}/.test(clean) &&
  /\.call-main \.app-stop \{ display: none; \}/.test(clean) &&
  /\.call-main \.app-header \{ gap: 8px; \}/.test(clean) &&
  /\.call-main \.app-header-controls \{ gap: 4px; \}/.test(clean));

/* ---------- B: the name plate ---------- */
check("B: the plate's text is centred in its box, on a deeper scrim with a hairline edge and the plate padding",
  /\.call-tile-label \{[^}]*text-align: center;[^}]*background: rgba\(10, 12, 16, \.78\); padding: 8px 12px;[^}]*border: 1px solid var\(--border\);/.test(clean));
check("B: hierarchy — the name rides the label's strong type; the role stays a smaller, quieter block under it",
  /\.call-role \{[^}]*display: block;[^}]*font-size: 11px;[^}]*color: var\(--muted\);/.test(clean) &&
  /\.call-tile-label \{[^}]*font-size: 13px; font-weight: 600;/.test(clean));
check("B: the band plate keeps width == frame width (88px) with the plate's 8px padding (Step 92 re-pin, annotated: the seat moves from the bottom row to under the TOP-row frame — plate top 134 = frame top 16 + frame 110 + gap 8, its 51.9px measured height now a fixed 52px token so the unit box is exactly 170, the self tile's box)",
  /\.call-tile > \.call-tile-label \{ left: 12px; top: 134px; bottom: auto; width: 88px; max-width: 88px; height: 52px; font-size: 12px; padding: 8px; \}/.test(clean) &&
  /\.avatar-frame \{ left: 12px; top: 16px; bottom: auto; width: 88px; height: 110px; \}/.test(clean));
check("B: the phone Spotlight plate is centred too, and the self tile's 'You' tag keeps its compact pre-Step-90 form",
  /\.call-stage\[data-spotlight\] \.call-tile > \.call-tile-label,\s*\.call-stage\[data-spotlight-prep\] \.call-tile > \.call-tile-label \{\s*position: static;[^}]*text-align: center;/.test(clean) &&
  /\.call-self \.call-tile-label \{[^}]*padding: 4px 8px; border: 0; box-shadow: none; text-align: left; \}/.test(clean));

/* ---------- C: the caption is deleted ---------- */
check("C: no caption element in the markup, no caption rules in the sheet, no caption code in app.js",
  !html.includes('id="call-caption"') && !/\.call-caption/.test(clean) &&
  !js.includes("callCaptionEl") && !js.includes("thanksWords"));
check("C: the closing thanks line rides the window's status line at every width",
  js.includes('setStatus("The interviewer closes: “" + THANKS_LINE + "”")'));

/* ---------- E1/E2: call bar + lens ---------- */
check("E1: the call bar's right side is real-call furniture — the meeting title and a participants mark for the two tiles on the call",
  html.includes('class="call-bar-meta"') && html.includes("Final-round interview") &&
  html.includes('class="call-bar-people"') && !html.includes("Video call — simulated") &&
  !/\.call-bar-note/.test(clean));
check("E1: the disclosure the header gave up stands in the eyebrow directly above the stage",
  html.includes('<p class="eyebrow">Live demo — simulated</p>'));
check("E2: the lens keeps its exact 13x13 box, crafted finer — brand-hue coating tint low on the glass, two-tone concentric ring inside the same 3px footprint",
  /\.call-lens \{[^}]*width: 13px; height: 13px;[^}]*rgba\(124, 108, 255, \.22\)[^}]*0 0 0 2px rgba\(0, 0, 0, \.34\),\s*0 0 0 3px rgba\(255, 255, 255, \.05\);/.test(clean));

/* ---------- F/H: under-stage block + demo head ---------- */
check("F: in the band the action buttons stretch on one baseline and the honesty note takes its own row in a 560px measure (the sound button keeps its natural size — during play it is the row's only button)",
  /\.scene-controls \.btn:not\(#scene-mute\) \{ flex: 1 1 0; \}/.test(clean) &&
  /\.scene-note \{ flex: 1 1 100%; margin-left: 0; max-width: 560px; \}/.test(clean));
check("F: phones keep the pre-Step-90 composition (folded restoration)",
  /\.scene-controls \.btn:not\(#scene-mute\) \{ flex: 0 1 auto; \}/.test(clean) &&
  /\.scene-note \{ flex: 0 1 auto; margin-left: 0; max-width: 420px; \}/.test(clean));
check("H: the demo head is a toolbar in the band — chip left, interview action right; the preparing state is carved out",
  /\.demo-stage \.demo-head:not\(\.is-preparing\) #scene-start \{ margin-left: auto; \}/.test(clean));

/* ---------- G: the shortened texts ---------- */
const panel = (html.match(/<p class="demo-note">([\s\S]*?)<\/p>/) || ["", ""])[1].replace(/\s+/g, " ").trim();
const note = (html.match(/<p class="scene-note">([\s\S]*?)<\/p>/) || ["", ""])[1].replace(/\s+/g, " ").trim();
const caption = (html.match(/<p class="demo-stage-caption">([\s\S]*?)<\/p>/) || ["", ""])[1].replace(/\s+/g, " ").trim();
check("G: the panel is about half its old length and every disclosure survives in plain words (the camera sentence keeps its full pinned form — recorded, uploaded or sent anywhere — and typed questions are sent to the answer service)",
  panel.split(" ").length <= 56 &&
  /staged demo with sample data/.test(panel) && /pre-recorded sample/.test(panel) &&
  /stay on this device — nothing is recorded, uploaded or sent anywhere/.test(panel) &&
  /confirmed facts and question bank/.test(panel) && /sent to our answer service and answered live/.test(panel),
  `panel is ${panel.split(" ").length} words`);
check("G: the under-stage line and the stage caption carry the shortened texts",
  note === "A staged interview, played with the interviewer’s recorded sample lines. The answers are the sample profile’s own." &&
  caption === "In the real call, the app’s small window sits under your webcam — glance down, read three short points, speak. It is already listening.");
check("G: the word 'simulated' is gone from all three texts — and the eyebrow is explicitly NOT touched by the order",
  !/simulated/i.test(panel) && !/simulated/i.test(note) && !/simulated/i.test(caption) &&
  html.includes("Live demo — simulated"));

/* ---------- the live invariant (sampled sweep) ---------- */
const py = process.env.PW_PYTHON || path.join(process.env.HOME, "workspace/.venv-pw/bin/python");
try {
  const out = execFileSync(py, [path.join(__dirname, "probe-step90.py"),
    path.join(__dirname, "..", "website")],
    { timeout: 600000, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const res = JSON.parse(out.trim().split("\n").pop());
  check(`sweep: zero overlap and >=16px on the separating axis at 641/712/768/853/933 x primed/complete, header one line for all six status strings, no caption element anywhere, eyebrow disclosure rendered (${res.checks} probe checks)`,
    res.failures.length === 0, res.failures.slice(0, 6).join(" | "));
} catch (e) {
  check("sweep: probe executed (venv python + playwright)", false,
    String(e.message || e).slice(0, 200));
}

console.log(`\nStep 90: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
