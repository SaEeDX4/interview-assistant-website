#!/usr/bin/env node
/* Step 81 — Stage top bar, webcam marker round 3, unfolded pass,
   and the folded tile row. The owner checked Steps 79+79b LIVE
   on his Galaxy Z Fold 7 UNFOLDED (~712-768px: complete state,
   persona p5) and FOLDED (403px: settled state, persona p2) and
   reported: F1 the demo head wrapped — the Answer/Coach toggle
   sat alone on a second row although the wide view has ample
   width; F2 the 79b webcam bezel strip still read as a big
   empty black band across the full width for one small label;
   F3 the unfolded call area was unbalanced — a wide dark void
   between the avatar tile and the app window; F4 in the folded
   tile row the tile, the name chip and the "Use your camera"
   button had three heights and no shared alignment (the button
   sat 14px low). His standing requirement for this step: at
   least three full measured review passes over the stage at
   403x928 and 712-768 across all states, each with an explicit
   alignment checklist; a pass that finds a defect restarts the
   count; done only when a full pass finds zero new defects.
   The measured BEFORE numbers (step81-stage-unfolded/work/
   before.json): the head's kids summed 639.17px primed /
   653.17px complete against a 588px content box at 712 (head
   129px tall, toggle stranded); the strip was 34.14px tall at
   every width; at 712 the centred 432px window OVERLAPPED the
   avatar frame by 23px, the tile label's top sat 396.6px below
   the avatar's bottom, the primed below-window void was 396.3px;
   at 403 the camera button's centre sat exactly 14px below the
   tile row's shared centre line (.call-self top:28px in a 52px
   strip). Pass 1 of the review loop then found three more: the
   mode toggle's segments sized to their text (73 vs 66px); the
   call window's header wrapped in the primed state only at 403
   (the primed pill is 206.4px vs 171.4px settled — 325.4px of
   header against a 295px inner width); and Pass 2 found the
   preparing state squeezing the band row (the ~288px progress
   label wrapped the button's text, shrank the pill until IT
   wrapped, and collapsed the toggle's grid — head 89px).
   This suite pins the fixes' static contracts; the measured
   behaviour is pinned by the Playwright audit kept with the
   report (step81-stage-unfolded/work/audit81.py; passes 3, 4
   and 5 each 268 checks, 0 failed, after Pass 1's 13 findings
   and Pass 2's 2 findings were fixed).
   Step 81b (annotated re-pin): the parent's own inspection of
   the final 768 primed shot found the defect the loop's
   checklist missed — at >=641px the primed frame was 480px
   while its content is ~250px: the 480 still sized the frame
   by the self tile's dock (tile bottom 464 + 16), so the tile
   kept a row of its own and the frame's lower ~40% was empty
   dark space on the diagonal. The hug is now tallest content
   + the frame's standard 16px bottom padding (342 base, where
   the participant label bottoms at 325.9; 260 in the band,
   where the window bottoms at 243.7), the self tile is a true
   PiP overlay (z 3, above the window where they meet), and
   the audit gained the checklist line this defect taught:
   PRIMED-HUG (0 <= frame height - tallest content bottom
   <= 16px + tolerance), with OVERLAP-1's zero-intersection
   pin kept for every content-full state and the primed state
   pinning the PiP dock instead.
   Step 81c (annotated re-pin): the parent inspected the 81b
   band shot personally and rejected the PiP-over-window
   variant — at 712/768 the tile covered the right-hand tails
   of both hint lines. Covered text in the money state is a
   defect, so at the band the primed tile DOCKS below the
   window in a deliberate row (the variant 81b itself
   measured): the band hug is now 352 = window bottom 243.7
   + 8 gap + tile 84 + the standard 16 bottom padding, and
   window ∩ tile = 0 at the band too. The base 342 hug and
   the ≥861 PiP (which clears the window entirely) stand;
   the audit's OVERLAP-1 now requires zero intersection in
   the primed frame at every width, PRIMED-HUG counts the
   docked tile as band content, and a new TEXT-OVERLAP line
   pins that no element overlaps the window's text body in
   any state at any width.
   Under-the-webcam staging (annotated re-pin, 2026-11-22):
   the owner clarified he always wanted the FEELING of the
   window under the webcam — the label executions were the
   problem. The frame's top bezel now carries a hardware lens
   (.call-bezel/.call-lens: dark glass, no text, no glow) and
   the window hangs centred beneath it at every ≥641 width:
   window top 52 -> 16; the band's +50px offset is deleted;
   the band participant unit anchors bottom-left (frame
   bottom-offset 76, label bottom 16) because a centred
   window cannot clear a top-left unit at 712-768; the band
   primed hug is re-derived as 404 (unit top 218 below the
   hanging window's bottom 207.7; hug = tallest content 388
   + 16). The F2 absence pins are untouched — no call-cam
   markup or rules exist; the lens is staging, not a marker.
   Desktop composition otherwise stands: unit top-left at
   52, base hug 342, PiP clear of the window. */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const js = fs.readFileSync(path.join(ROOT, "website", "app.js"), "utf8");
const demo = fs.readFileSync(path.join(ROOT, "website", "demo.html"), "utf8");
const css = fs.readFileSync(path.join(ROOT, "website", "styles.css"), "utf8");

let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
const has = (s) => clean.includes(s);

/* F1 — one head row at >=641px. */
check("F1 the band head never wraps (nowrap, scoped to the demo stage)",
  has(".demo-stage .demo-head { flex-wrap: nowrap; gap: 8px; }"));
check("F1 the band head sheds the decorative dots (the phone-grid precedent)",
  has(".demo-stage .demo-head .demo-dots { display: none; }"));
check("F1 the toggle can never be flex-shrunk below fit-content",
  has(".demo-stage .demo-head .mode-toggle { flex: none; }"));
check("F1 the toggle is an equal two-column grid (segments cannot size to their text: 73 vs 66 measured)",
  /\.mode-toggle \{[^}]*display: inline-grid; grid-template-columns: 1fr 1fr;/.test(clean));
check("F1 the phone grid keeps its own gap (the band's 8px is countermanded at <=640)",
  has(".demo-stage .demo-head { gap: 12px; }"));
check("F1 while preparing, the band head sheds the pill (its label lives in the call bar)",
  has(".demo-stage .demo-head.is-preparing .pill { display: none; }"));
check("F1 app.js mirrors the preparing state onto the head (is-preparing)",
  /classList\.toggle\("is-preparing", mode === "preparing"\)/.test(js));

/* F2 — the webcam marker. Step 81 built its third form (a
   zero-height notch on the frame's top border); the owner
   rejected it on the live build too (2026-11-22) — pill (79),
   bezel strip (79b), notch (81): three forms, three rejections.
   OWNER DECISION: the marker is REMOVED ENTIRELY. No element,
   no rules, no replacement, no new placement — a real video
   call carries no such label; the tiles carry the meaning.
   The pins below assert absence, plus the one stage-geometry
   invariant the notch era introduced and the removal keeps. */
check("F2 (owner removal 2026-11-22): no webcam-marker markup remains in demo.html",
  !demo.includes("call-cam"));
check("F2 (owner removal 2026-11-22): no webcam-marker rules remain in the stylesheet (notch, strip and pill forms all deleted)",
  !/\.call-cam/.test(clean) && !clean.includes("call-cam") &&
  !has(".call-main { padding-top: 0; }"));
check("F2 (owner removal 2026-11-22): the frame top is clean — the LIVE bar is followed directly by the call area",
  demo.indexOf('class="call-bar"') < demo.indexOf('class="call-main"'));
check("F2 (retained): the stage keeps its standing overflow geometry (visible stage, hidden call area) — introduced in the notch era, unchanged by the removal",
  /\.call-stage \{[^}]*overflow: visible;/.test(clean) &&
  /\.call-main \{[^}]*overflow: hidden;/.test(clean));

/* F3 — the unfolded participant unit + primed hug. */
check("F3 the participant unit: desktop frame top-left at 52px, below the hanging window's top line (16px); band frame bottom-anchored (under-the-webcam re-pin 2026-11-22: band top 52px → bottom 76px — a centred window cannot clear a top-left unit at 712-768, so the unit anchors bottom-left. Step 89 re-pin: bottom 76px → 74px — the label is now the persona's name over her role, a uniform 48.9px at this width for all six personas, so the unit is 184 and the frame keeps its ~9px gap over the label. Step 90 re-pin: bottom 74px → 76px — the refined name plate (centred text, plate padding, hairline border) is a uniform 51.9px, so the unit is 186 and the frame keeps its 8px gap over the plate. Step 92 re-pin: the band takes the folded strip's composition on the owner's order — the frame anchors TOP-left (top 16, bottom auto) and the window hangs BELOW the row, so the old collision the bottom anchor solved no longer exists; the unit is 88 x 170, exactly the self tile's box)",
  /\.avatar-frame \{[^}]*position: absolute; left: 16px; top: 52px;/.test(clean) &&
  has(".avatar-frame { left: 12px; top: 16px; bottom: auto; width: 88px; height: 110px; }"));
check("F3 the tile label hangs under the frame, left edges shared (base: under the top-left frame; band: under the top-left frame, its top 8px under the frame's bottom. Step 89 re-pin: the band label's width IS the frame's width — 88px, one unit — where it was a 104px card wider than the tile, wrapping its text and dangling its meter. Step 90 re-pin: the band plate carries the name plate's 8px padding. Step 92 re-pin: the plate hangs under the TOP-row frame (top 134 = 16 + 110 + 8) with a fixed 52px height — Step 90's measured plate height given as a token so the unit box, and with it the box equality the owner ordered, cannot breathe with font metrics)",
  /\.call-tile-label \{[^}]*left: 16px; top: 275px;/.test(clean) &&
  has(".call-tile > .call-tile-label { left: 12px; top: 134px; bottom: auto; width: 88px; max-width: 88px; height: 52px; font-size: 12px; padding: 8px; }"));
check("F3 the band window hangs centred on the bezel lens's axis (under-the-webcam re-pin 2026-11-22: Step 81's +50px offset, which centred the window in the canvas right of the participant column, is deleted — the unit anchors bottom-left instead)",
  !has(".call-main .app-window { left: calc(50% + 50px); }"));
check("F3 the primed frame hugs its tallest content + the standard 16px padding (Step 81b re-pin: 342 base / 260 band — 480 still reserved the self tile's row; the PiP paints above the window. Step 81c re-pin: band 260 → 352 — the parent rejected the PiP covering the hint lines, so at the band the tile docks below the window in its own row and window ∩ tile = 0. Under-the-webcam re-pin 2026-11-22: band 352 → 404 — the window hangs at top 16 (bottom 207.7) and the bottom-anchored unit's top lands at 218; the unit's label and the docked tile share the bottom line (388), so the hug is 388 + 16) and is countermanded on phones. Step 92 re-pin (annotated): the top-row composition's hug is 418 (row 186 + gap 24 + primed window ~192 + 16), set in the <=933 block, which follows the <=860 block in the sheet and so supersedes its 404 there without editing it; the field's fit takes the hug from that floor at narrower widths",
  has(".call-stage.is-primed .call-main { min-height: 342px; }") &&
  has(".call-stage.is-primed .call-main { min-height: 404px; }") &&
  has(".call-stage.is-primed .call-main { min-height: 418px; }") &&
  !has(".call-stage.is-primed .call-main { min-height: 352px; }") &&
  !has(".call-stage.is-primed .call-main { min-height: 260px; }") &&
  has(".call-stage.is-primed .call-main { min-height: 0; }") &&
  /\.call-self \{[^}]*z-index: 3;/.test(clean));
check("F3 the call window's meter rests on phones (one header row in every state)",
  has(".call-main .app-meter { display: none; }"));

/* F4 — the folded tile row shares one centre line. */
check("F4 the camera tile is centred in the 52px strip on phones (top:14px, not 28px)",
  has(".call-self { width: 80px; height: 52px; right: 12px; bottom: auto; top: 14px; }") &&
  !/\.call-self \{[^}]*top: 28px/.test(clean));

console.log(`\nStep 81: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
