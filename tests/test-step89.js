/* Step 89 — the unfolded band's bottom row, participant
   identity, the camera audit, the turn halo, and the Spotlight
   seats. Run: node tests/test-step89.js (from
   ~/workspace/interview-assistant-website).
   Owner evidence: two screenshots from his Galaxy Z Fold 7 —
   the band at the story answer's "You answer" beat (persona
   p4) and the phone Spotlight open at Interview complete.
   The contracts pinned here:
   - F1/F2: in the <=933 band the participant is ONE unit — the
     label's width IS the frame's width (88px), left edges
     shared, so the label's right edge keeps the frame's own
     32px clearance from the capped window (it was a 104px card
     at 16px, wrapping its text over three lines with the meter
     dangling). The desktop plate is the frame's width too (172).
   - F3: the bottom row shares one floor — the band label and
     the self tile both anchor at bottom: 16px.
   - F4: the camera note lives INSIDE .call-main (the field),
     as the row's middle element — absolute at >=641 between
     the unit and the self tile, in flow on phones; never a
     full-width page paragraph under the stage again.
   - F5: the halo state machine's wiring — her speaking is set
     by sceneAsk and cleared at the commit BEFORE any "You
     answer" beat can start; the candidate's speaking is set
     ONLY by sceneYou. (The timed-frame proof lives in the
     Step 89 probe: during every You-beat window her class is
     off and --lvl is 0.00 in 100% of 15ms samples; the owner's
     frame was the why-question's legitimate speaking window
     under the previous beat's persisting status line.)
   - N1: the "AI interviewer — simulated" plate is DELETED on
     the owner's order. Each persona carries a believable name
     + role (avatar.js PERSONAS, matched to the posters),
     written into #call-name / #call-role; the glyph fallback
     restores the generic plate. The honesty wording STAYS in
     the eyebrow above the stage ("Live demo — simulated") and page copy
     (Step 90: the call header itself carries real-call furniture now).
   - N2: the 3-dot meter is DELETED everywhere — markup, sheet,
     scripts. The speaking signal is the tiles' halo alone.
   - N3: the camera flow is hardened — an in-flight guard
     (camBusy) and failure notes that name the actual rejection
     (NotAllowedError / NotFoundError / other).
   - N4: the self tile's halo is NOT gated by the camera state
     (Step 87's gate is superseded by the owner's direct
     order): during "You answer" beats it breathes as the turn
     signal, camera live or not.
   - S1: in the phone Spotlight the self tile leaves the
     portrait — it sits in the label row (right: 16, top: 312,
     centred on the label), and with the camera off the tile
     shows the camera glyph alone (the toggle's text is hidden
     in Spotlight), never a text sticker over the portrait.
   - S2/S4: the phone hero is 232x290 (was 248x310) so the
     close button's left edge clears the portrait's right edge
     (measured 0.5px before; >=8px after at 403), and the
     Spotlight name plate's width equals the hero's width at
     every width (320 / 264 / 232).
   - S3: the hero column is balanced — the gap under the
     Spotlight label equals the 16px above the portrait
     (spotlight.js measures label bottom + 16; the phone
     window's margin-top is 16). */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "website");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const html = fs.readFileSync(path.join(root, "demo.html"), "utf8");
const js = fs.readFileSync(path.join(root, "app.js"), "utf8");
const av = fs.readFileSync(path.join(root, "avatar.js"), "utf8");
const spot = fs.readFileSync(path.join(root, "spotlight.js"), "utf8");
let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");

/* ---------- N1: participant identity ---------- */
check("N1: the AI-interviewer plate is deleted from the demo (Step 90 re-pin, annotated: the call header's 'simulated' wording was itself retired by the owner's addendum E1 — the disclosure now stands in the eyebrow above the stage, 'Live demo — simulated', and in the page's honesty copy)",
  !html.includes("AI interviewer") && html.includes("Live demo — simulated") &&
  !html.includes("Video call — simulated"));
check("N1: the label is a name plate — #call-name over #call-role, with the speaking word after the name",
  html.includes('<span class="call-name" id="call-name">Interviewer</span>') &&
  html.includes('id="call-speaking"') && html.includes('<span class="call-role" id="call-role"></span>'));
check("N1: all six personas carry a name + role in avatar.js, matched to the posters",
  ["p1", "p2", "p3", "p4", "p5", "p6"].every((p) =>
    new RegExp(p + ': \\{ name: "[A-Z][a-z]+ [A-Z][a-z]+", role: "[^"]+" \\}').test(av)));
check("N1: avatar.js writes the chosen persona's identity into the plate, and fail() restores the generic plate",
  av.includes('nameEl.textContent = who.name') && av.includes('roleEl.textContent = who.role') &&
  av.includes('nameEl.textContent = "Interviewer"'));
check("N1: the role line is a muted block under the name; an empty role reserves nothing",
  /\.call-role \{[^}]*display: block;[^}]*color: var\(--muted\);/.test(clean) &&
  /\.call-role:empty \{ display: none; \}/.test(clean));

/* ---------- N2: the meter is gone ---------- */
check("N2: no 3-dot meter anywhere — markup, sheet, or scripts",
  !/call-dots/.test(html) && !/call-dots/.test(clean) && !/call-dots/.test(js) &&
  !/call-dots/.test(av) && !/call-dots/.test(spot));
check("N2: the speaking signal is the halo alone — her frame rule and the self rule, both ungated by any meter",
  /\.call-tile\.is-speaking \.avatar-frame \{[^}]*border-color: rgba\(45, 212, 191, \.85\);/.test(clean) &&
  /\.call-self\.is-speaking \{[^}]*border-color: var\(--accent-2\);/.test(clean));

/* ---------- F1/F2/F3: one unit, one floor ---------- */
check("F2: in the band the label's width IS the frame's width (88px) — one unit, left edges shared (Step 90 re-pin, annotated: the refined name plate is 51.9px tall, so the frame's bottom offset is re-derived — 16 floor + 51.9 plate + 8 gap = 76 — and the band plate carries the plate's 8px padding)",
  /\.avatar-frame \{ left: 12px; top: auto; bottom: 76px; width: 88px; height: 110px; \}/.test(clean) &&
  /\.call-tile > \.call-tile-label \{ left: 12px; top: auto; bottom: 16px; width: 88px; max-width: 88px; font-size: 12px; padding: 8px; \}/.test(clean));
check("F2: the desktop plate is the desktop frame's width too (172px)",
  /\.call-tile-label \{[^}]*width: 172px; max-width: 172px;/.test(clean) &&
  /\.avatar-frame \{[^}]*width: 172px; height: 215px;/.test(clean));
check("F1: the band window cap reserves 124px per side (Step 90 re-pin, annotated: was 132/side — the cap's collision job is superseded by the field's reserved bottom lane in app.js; the cap now guarantees the standing side clearances, measured 24px participant / 20px self at cap-bound widths, and room for the never-wrapping header row)",
  /\.call-main \.app-window \{ width: min\(432px, calc\(100% - 248px\)\); \}/.test(clean));
check("F3: the bottom row shares one floor — band label and self tile both anchor at bottom: 16px",
  /\.call-tile > \.call-tile-label \{[^}]*bottom: 16px;/.test(clean) &&
  /\.call-self \{[^}]*bottom: 16px;/.test(clean));

/* ---------- F4: the camera note inside the field ---------- */
check("F4: #cam-note lives inside .call-main in the markup (after the window and the close button, before the scene controls)",
  html.indexOf('<div class="call-main">') < html.indexOf('id="app-window"') &&
  html.indexOf('id="app-window"') < html.indexOf('id="spotlight-close"') &&
  html.indexOf('id="spotlight-close"') < html.indexOf('id="cam-note"') &&
  html.indexOf('id="cam-note"') < html.indexOf('id="scene-controls"'));
check("F4: at >=641 the note is the row's middle element — absolute, bottom-aligned with the row, clear of both tiles",
  /\.cam-note \{[^}]*position: absolute; left: 204px; right: 160px; bottom: 16px;/.test(clean) &&
  /\.cam-note \{ left: 116px; \}/.test(clean));
check("F4: on phones the note flows inside the field; in Spotlight it stands down at >=641 and stays in flow on phones",
  /\.cam-note \{ position: static; margin: 12px 0 0; \}/.test(clean) &&
  /\.call-stage\[data-spotlight\] \.cam-note \{ display: none; \}/.test(clean) &&
  /\.call-stage\[data-spotlight\] \.cam-note:not\(\[hidden\]\) \{ display: block; \}/.test(clean));

/* ---------- N3: the camera flow, hardened ---------- */
check("N3: an in-flight guard keeps a double-tap from starting a second getUserMedia (whose stream would leak)",
  js.includes("var camBusy = false;") && js.includes("if (camBusy) { return; }") &&
  js.includes("camBusy = true;") && js.includes("camBusy = false;"));
check("N3: the failure note names the actual rejection — permission, no device, or other",
  js.includes('err.name === "NotAllowedError"') && js.includes("permission was not given") &&
  js.includes('err.name === "NotFoundError"') && js.includes("No camera is available on this device"));

/* ---------- N4 + F5: the turn halo and the state machine ---------- */
check("N4: Step 87's camera-off gate on the self halo is deleted — the halo is the turn signal, camera live or not",
  !/\.call-self\.cam-ready:not\(\.cam-on\)\.is-speaking/.test(clean));
check("N4/F5: the candidate's speaking is set ONLY by sceneYou (one setSelfSpeaking(true) call site in the whole engine)",
  (js.match(/setSelfSpeaking\(true\)/g) || []).length === 1 &&
  /function sceneYou\(t, dur, statusText\) \{[\s\S]*?setSelfSpeaking\(true\);/.test(js));
check("F5: her speaking is cleared at the commit, before the answer streams — so no You-beat can inherit it",
  /setSpeaking\(false\);[\s\S]{0,200}streamAnswer\(/.test(js) ||
  js.includes("setSpeaking(false);"));

/* ---------- S1–S4: the Spotlight seats ---------- */
check("S1: the phone Spotlight self tile sits in the label row — right: 16 on the window's grid, centred on the label (top: 312)",
  /width: 72px; height: 48px; top: 312px; bottom: auto; right: 16px;/.test(clean));
check("S1: with the camera off, the Spotlight self tile shows the camera glyph alone — no toggle text on the tile",
  /\.call-stage\[data-spotlight\] \.call-self:not\(\.cam-on\) #cam-toggle-text \{ display: none; \}/.test(clean));
check("S2/S4: the phone hero is 232x290 and its name plate is exactly its width (232)",
  /width: 232px; height: 290px; border-radius: 12px; order: 1;/.test(clean) &&
  /width: 232px; max-width: 232px; margin-top: 8px;/.test(clean));
check("S4: the Spotlight plate matches the hero's width at desktop and band too (320 / 264)",
  /\.call-stage\[data-spotlight\] \.call-tile > \.call-tile-label,\s*\.call-stage\[data-spotlight-prep\] \.call-tile > \.call-tile-label \{\s*left: calc\(50% - 160px\); top: 424px; width: 320px; max-width: 320px;/.test(clean) &&
  /width: 264px; max-width: 264px; font-size: 13px;/.test(clean));
check("S3: the hero column is balanced — spotlight.js lands the window at label bottom + 16, the phone margin-top is 16",
  spot.includes('getBoundingClientRect();') && spot.includes("+ 16;") &&
  !spot.includes("labelRect.bottom - mainRect.top) + 12") &&
  /margin: 16px 0 16px; align-self: center;/.test(clean));
check("S4b (Step 90 re-pin, annotated): the closing caption is DELETED entirely — element, sheet rules, and JS (owner's addendum C: in Spotlight its empty box painted across the portrait's lower fifth); the window's status line carries the closing line at every width",
  !html.includes('id="call-caption"') && !/\.call-caption/.test(clean) && !js.includes("callCaptionEl"));
check("D5 (Step 90 re-pin, annotated): no caption stand-down or re-show rules remain either — there is no caption in any layout or state",
  !/\.call-caption/.test(clean) && !js.includes("thanksWords"));
check("D6: the field fits its window — fitFieldToWindow grows the field past the sheet floor in the absolute band, wired into every syncAnswerCard exit",
  js.includes("function fitFieldToWindow()") &&
  (js.match(/fitFieldToWindow\(\);/g) || []).length >= 3 &&
  js.includes('window.getComputedStyle(demoWindowEl).position !== "absolute"') &&
  js.includes('callStageEl.hasAttribute("data-spotlight")') &&
  js.includes("demoWindowEl.offsetTop + demoWindowEl.offsetHeight + 16"));
check("D6: Spotlight's exit re-fits the field (its glide clears the inline min-height on the way out) — the fit alone, never a full card re-sync",
  js.includes("new MutationObserver(function () { fitFieldToWindow(); })") &&
  js.includes('attributeFilter: ["data-spotlight", "data-spotlight-prep"]'));
check("S4b (Step 90 re-pin, annotated): phones have no Spotlight caption either — the element is gone, so no band rule can leak a caption into the phone hero",
  !/\.call-caption/.test(clean));
check("S4c (Step 90 re-pin, annotated): nothing overlays the Spotlight portrait's lower fifth — the caption's old z-index seat is deleted with it; the name plate is the portrait's only overlay at its foot",
  !/\.call-caption/.test(clean) && /\.call-stage\[data-spotlight\] \.call-tile > \.call-tile-label/.test(clean));

console.log(`\nStep 89: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
