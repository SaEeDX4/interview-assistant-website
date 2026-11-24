/* Spotlight — Phase 1: the interviewer, up close.
   The cooked concept lives in ~/workspace/avatar-expand-ideation/
   concept.md. Tapping the interviewer flies the SAME living
   video element — never a copy, never a reload, never a
   snapshot — from her tile rect to a hero rect inside the call
   frame; the canonical app window settles beneath her at a
   reduced scale; the self tile demotes to a PiP. Tapping her
   again, the close control, or Escape flies everything back to
   its exact original rect.

   Step 84: the live caption that ran between her and the
   window is gone — it duplicated the QUESTION card's sentence
   word for word (owner's ruling), and the card is now the
   single transcription surface, up close as everywhere else.
   This module mirrors nothing: it only flies geometry.

   The lens, not a scene: this module NEVER touches the scene
   engine — no timers, no pill, no speak keys, no audio, no
   video element state. The avatar driver's A/B machinery and
   its 120ms sync guard run underneath, uninformed. Sound
   behaviour is therefore a non-event: she keeps speaking
   through the flight, sample-accurate, and expansion can
   never start sound.

   Flights are FLIP (Paul Lewis): two batched rect reads, then
   WAAPI transforms only — plus the one precedented exception,
   the measured call-field height glide (Steps 24/78). Enter
   400ms on --motion-4 (the concept's scoped MOTION.md
   amendment, consumed by this module alone), exit 300ms on
   --motion-3: exits are faster than entrances. Every flight is
   reversible from its current presentation value — a tap
   mid-flight captures the live rects and reverses from them.
   At <=640px the tile is a square crop and the hero is 4:5, so
   the flight is Material's fade-through instead of a scale
   morph that would stretch her face. Reduced motion: the
   state swaps instantly, no FLIP is armed, all semantics
   identical. The state hook is the [data-spotlight] attribute
   on .call-stage — the stage's own convention (the avatar
   driver reads its speak-key attribute the same way). */
(function () {
  "use strict";
  var stage = document.getElementById("call-stage");
  var tile = document.getElementById("call-tile");
  var frame = document.getElementById("avatar-frame");
  var toggle = document.getElementById("avatar-toggle");
  var closeBtn = document.getElementById("spotlight-close");
  var appWindow = document.getElementById("app-window");
  var selfTile = document.getElementById("call-self");
  var tileLabel = tile.querySelector(".call-tile-label");
  if (!stage || !tile || !frame || !toggle || !closeBtn || !appWindow || !selfTile || !tileLabel) { return; }
  var callMain = stage.querySelector(".call-main");
  if (!callMain) { return; }

  var reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var phoneMq = window.matchMedia("(max-width: 640px)");
  var bandMq = window.matchMedia("(max-width: 933px)");
  /* In the band her hero frame rests centred on a CSS
     translateX(-50%) (the sheet spells the centring that way;
     test-step6 bans the 132px literal the calc would need).
     FLIP and the press response compose with that resting
     transform instead of replacing it. */
  function frameBase() {
    return (!phoneMq.matches && bandMq.matches) ? "translateX(-50%)" : "";
  }
  var EASE = "cubic-bezier(.2,.7,.3,1)";
  var rootCs = window.getComputedStyle(document.documentElement);
  /* --motion-4 (400ms): the scoped amendment — this flight is
     its only consumer, here and in the :root definition. */
  var DUR_IN = parseInt(rootCs.getPropertyValue("--motion-4"), 10) || 400;
  var DUR_OUT = parseInt(rootCs.getPropertyValue("--motion-3"), 10) || 300;

  var isOpen = false, seq = 0, flights = [], glideAnim = null, pendingFocusClose = false;

  function rect(el) { return el.getBoundingClientRect(); }

  /* ---------- availability: a person, or no toggle ----------
     The feature exists only while a living persona does. If
     the avatar driver is dead (glyph fallback) the toggle is
     never rendered — enlarging a diagram icon is exactly the
     fake the owner rejects. If she dies mid-spotlight, the
     lens snaps shut with her. */
  function refreshAvailability() {
    var ok = tile.classList.contains("has-avatar") && !frame.hidden;
    toggle.hidden = !ok;
    if (!ok && isOpen) {
      isOpen = false;
      seq++;
      cancelFlights();
      stage.removeAttribute("data-spotlight");
      stage.removeAttribute("data-spotlight-prep");
      stage.style.removeProperty("--spot-win-top");
      stage.style.removeProperty("--spot-main-h");
      closeBtn.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "See the interviewer up close");
    }
  }
  new MutationObserver(refreshAvailability).observe(tile, { attributes: true, attributeFilter: ["class"] });
  new MutationObserver(refreshAvailability).observe(frame, { attributes: true, attributeFilter: ["hidden"] });

  /* ---------- measured heights ----------
     The window's spotlight top is the tile label's measured
     bottom + 16 (Step 84: the label is the last element of the
     hero composition now that the caption is gone; Step 89:
     the gap under the label now equals the 16px above the
     portrait, so the hero column is balanced in its area);
     the field's height is that top + the window's measured
     height + the standard 16px bottom padding. On phones the
     composition is in flow, so the field's height is simply
     its own. */
  function measureSpot() {
    if (phoneMq.matches) {
      stage.style.setProperty("--spot-main-h", "0px");
      return { winTop: 0, mainH: callMain.offsetHeight };
    }
    var mainRect = callMain.getBoundingClientRect();
    var labelRect = tileLabel.getBoundingClientRect();
    var winTop = Math.round(labelRect.bottom - mainRect.top) + 16;
    return { winTop: winTop, mainH: winTop + appWindow.offsetHeight + 16 };
  }
  function refreshSpotHeights() {
    var m = measureSpot();
    if (!phoneMq.matches) { stage.style.setProperty("--spot-win-top", m.winTop + "px"); }
    stage.style.setProperty("--spot-main-h", m.mainH + "px");
  }

  /* ---------- flights ---------- */
  function cancelFlights() {
    flights.forEach(function (a) { try { a.cancel(); } catch (e) {} });
    flights = [];
    glideAnim = null;
    [frame, appWindow, selfTile].forEach(function (el) {
      el.style.willChange = "";
      el.style.transformOrigin = "";
    });
    callMain.style.height = "";
    callMain.style.transition = "";
    callMain.style.minHeight = "";
  }
  /* FLIP one element from a captured rect to its current
     layout rect. baseTransform is the element's own resting
     CSS transform in the destination state (the window's
     translateX(-50%) on the way home), prefixed so the invert
     composes with it instead of replacing it. */
  function flip(el, first, last, dur, delay, baseTransform) {
    var dx = first.left - last.left, dy = first.top - last.top;
    var sx = last.width ? first.width / last.width : 1;
    var sy = last.height ? first.height / last.height : 1;
    var pre = baseTransform ? baseTransform + " " : "";
    var from = pre + "translate(" + dx + "px," + dy + "px) scale(" + sx + "," + sy + ")";
    el.style.transformOrigin = "0 0";
    el.style.willChange = "transform";
    var anim = el.animate(
      [{ transform: from }, { transform: baseTransform || "none" }],
      { duration: dur, delay: delay || 0, easing: EASE, fill: "both" });
    flights.push(anim);
    var done = function () {
      if (flights.indexOf(anim) === -1) { return; }
      flights.splice(flights.indexOf(anim), 1);
      el.style.willChange = "";
      el.style.transformOrigin = "";
      try { anim.cancel(); } catch (e) {}
    };
    anim.finished.then(done, done);
    return anim;
  }
  /* The field's height glide — the house's one layout
     exception (Steps 24/78), measured and tap-driven. The
     inline min-height pins the smaller end so the resting
     var can never clamp the glide mid-flight. */
  function glideMain(fromH, toH, dur) {
    if (reduced || dur <= 0 || Math.abs(toH - fromH) < 1) { return; }
    callMain.style.transition = "none";
    callMain.style.minHeight = Math.min(fromH, toH) + "px";
    var anim = callMain.animate(
      [{ height: fromH + "px" }, { height: toH + "px" }],
      { duration: dur, easing: EASE, fill: "both" });
    glideAnim = anim;
    flights.push(anim);
    var done = function () {
      if (glideAnim !== anim) { return; }
      glideAnim = null;
      var i = flights.indexOf(anim);
      if (i !== -1) { flights.splice(i, 1); }
      callMain.style.transition = "";
      callMain.style.minHeight = "";
      callMain.style.height = "";
      try { anim.cancel(); } catch (e) {}
    };
    anim.finished.then(done, done);
  }
  function fadeFrame(keyframes, dur, delay) {
    var anim = frame.animate(keyframes, { duration: dur, delay: delay || 0, easing: EASE, fill: "both" });
    flights.push(anim);
    var done = function () {
      if (flights.indexOf(anim) === -1) { return; }
      flights.splice(flights.indexOf(anim), 1);
      try { anim.cancel(); } catch (e) {}
    };
    anim.finished.then(done, done);
    return anim;
  }

  /* Apply the open state and measure it: the prep attribute
     lands the label's hero geometry for one synchronous
     turn (no paint), so the window's top is measured from the
     label's real box, not from arithmetic. */
  function applyOpenState() {
    stage.setAttribute("data-spotlight-prep", "");
    var m = measureSpot();
    if (!phoneMq.matches) { stage.style.setProperty("--spot-win-top", m.winTop + "px"); }
    stage.setAttribute("data-spotlight", "");
    stage.removeAttribute("data-spotlight-prep");
    closeBtn.hidden = false;
    if (pendingFocusClose) { pendingFocusClose = false; closeBtn.focus(); }
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Back to the call view");
    var m2 = measureSpot();
    stage.style.setProperty("--spot-main-h", m2.mainH + "px");
    return m2;
  }
  function applyClosedAria() {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "See the interviewer up close");
    var mySeq = seq;
    setTimeout(function () {
      if (!isOpen && mySeq === seq) { closeBtn.hidden = true; }
    }, 200);
    stage.style.removeProperty("--spot-win-top");
    stage.style.removeProperty("--spot-main-h");
  }

  function open() {
    if (isOpen || toggle.hidden) { return; }
    retireHint();
    isOpen = true;
    seq++;
    var mySeq = seq;
    var fF = rect(frame), fW = rect(appWindow), fS = rect(selfTile);
    var h0 = callMain.getBoundingClientRect().height;
    cancelFlights();
    appWindow.style.transition = "none";
    if (phoneMq.matches && !reduced) {
      /* Fade-through: she fades out at the strip, the state
         swaps while she is invisible, she fades in large. The
         swap lands at 80ms — just before the fade-out's own
         end — so the fade-in's backwards fill already holds
         her at 0 when the geometry changes: no frame ever
         shows her back at the strip. A reversal mid-fade
         starts from her current opacity, not from 1. */
      var curO = parseFloat(window.getComputedStyle(frame).opacity);
      fadeFrame([{ opacity: isNaN(curO) ? 1 : curO }, { opacity: 0 }], 90, 0);
      setTimeout(function () {
        if (mySeq !== seq || !isOpen) { return; }
        var m2 = applyOpenState();
        glideMain(h0, m2.mainH, DUR_IN);
        flip(selfTile, fS, rect(selfTile), DUR_OUT, 40, "");
        fadeFrame([{ opacity: 0, transform: "scale(.96)" }, { opacity: 1, transform: "scale(1)" }], 250, 60);
        appWindow.style.transition = "";
      }, 80);
      return;
    }
    var m = applyOpenState();
    if (!reduced) {
      flip(frame, fF, rect(frame), DUR_IN, 0, frameBase());
      flip(appWindow, fW, rect(appWindow), DUR_IN, 0, "");
      flip(selfTile, fS, rect(selfTile), DUR_OUT, 40, "");
      glideMain(h0, m.mainH, DUR_IN);
    }
    appWindow.style.transition = "";
  }

  function close() {
    if (!isOpen) { return; }
    isOpen = false;
    seq++;
    var mySeq = seq;
    var fF = rect(frame), fW = rect(appWindow), fS = rect(selfTile);
    var h0 = callMain.getBoundingClientRect().height;
    cancelFlights();
    appWindow.style.transition = "none";
    if (phoneMq.matches && !reduced) {
      /* Symmetric fade-through home, starting from whatever
         opacity she is actually at (a reversal mid-fade
         continues from the current value, never from 1). */
      var curO = parseFloat(window.getComputedStyle(frame).opacity) || 0;
      fadeFrame([{ opacity: curO }, { opacity: 0 }], 90, 0);
      setTimeout(function () {
        if (mySeq !== seq || isOpen) { return; }
        stage.removeAttribute("data-spotlight");
        applyClosedAria();
        var h1 = callMain.offsetHeight;
        glideMain(h0, h1, DUR_OUT);
        flip(selfTile, fS, rect(selfTile), DUR_OUT, 0, "");
        fadeFrame([{ opacity: 0 }, { opacity: 1 }], 150, 0);
        appWindow.style.transition = "";
      }, 80);
      return;
    }
    stage.removeAttribute("data-spotlight");
    applyClosedAria();
    var h1 = callMain.offsetHeight;
    if (!reduced) {
      flip(frame, fF, rect(frame), DUR_OUT, 0, "");
      flip(appWindow, fW, rect(appWindow), DUR_OUT, 0, phoneMq.matches ? "" : "translateX(-50%)");
      flip(selfTile, fS, rect(selfTile), DUR_OUT, 0, "");
      glideMain(h0, h1, DUR_OUT);
    }
    appWindow.style.transition = "";
  }

  /* ---------- the grammar: one tap ---------- */
  toggle.addEventListener("pointerdown", function () {
    if (reduced) { return; }
    /* The press response composes with the frame's CURRENT
       resting transform: none at rest; in the band's Spotlight
       her hero rests on translateX(-50%). */
    var base = isOpen ? frameBase() : "";
    frame.style.transform = (base ? base + " " : "") + "scale(.98)";
  });
  ["pointerup", "pointerleave", "pointercancel"].forEach(function (ev) {
    toggle.addEventListener(ev, function () { frame.style.transform = ""; });
  });
  toggle.addEventListener("click", function (e) {
    frame.style.transform = "";
    if (isOpen) { close(); }
    else {
      /* Keyboard activation (detail 0) hands focus to the close
         control once it exists — applyOpenState consumes the
         flag; pointer users keep their context. */
      if (e.detail === 0) { pendingFocusClose = true; }
      open();
    }
  });
  closeBtn.addEventListener("click", function () {
    close();
    toggle.focus();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen && stage.contains(e.target)) {
      close();
      toggle.focus();
    }
  });

  /* ---------- staying true while open ----------
     The window's height moves with the scene (reservations,
     exchanges, typed answers). Re-measure from the real
     boxes — the resting var changes glide on the field's own
     transition, the window's top on its spotlight transition.
     A breakpoint crossing re-derives the whole geometry at
     once. */
  var wasPhone = phoneMq.matches;
  window.addEventListener("resize", function () {
    var nowPhone = phoneMq.matches;
    if (nowPhone !== wasPhone) {
      wasPhone = nowPhone;
      if (isOpen) { cancelFlights(); refreshSpotHeights(); }
      return;
    }
    if (isOpen && !flights.length) { refreshSpotHeights(); }
  });
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(function () {
      if (isOpen && !flights.length) { refreshSpotHeights(); }
    });
    ro.observe(appWindow);
  }

  /* ---------- Step 87: the Lean-In (the Spotlight hint) ----------
     The expand glyph is deleted; the tile rests clean, like
     every call app's. Discoverability is a one-time PERFORMANCE
     of the tile itself, TipKit-shaped (research:
     ~/workspace/avatar-expand-affordance/report.md Part 1):
     eligible only after Start/Watch (the demo module dispatches
     "ia-scene-first-question" as the first question starts
     arriving — never on page load, never primed); 900ms later
     her frame leans 1 -> 1.05 -> 1 over --motion-pulse (900ms,
     the scoped MOTION.md exception this performance owns) with
     one sonar ring around her rect, and the bare whisper line
     fades in under the participant row. A second beat lands at
     +2.2s if untouched; the whisper leaves at +5s. Retirement
     is PERMANENT (localStorage "ia-spotlight-hint"): the
     Spotlight opens by any input (open() calls retireHint), or
     the performance has run in 2 separate scene plays.
     Keyboard focus is its own discovery moment: while the
     toggle holds :focus-visible and the hint is unretired, the
     whisper shows and one beat fires; focus alone never
     retires and never counts as a showing. Reduced motion: no
     lean, no ring — the whisper appears statically at the same
     mark and is removed at +6s; that counts as a showing. */
  var HINT_KEY = "ia-spotlight-hint";
  var hint = { shown: 0, done: false };
  try {
    var hintJson = JSON.parse(localStorage.getItem(HINT_KEY));
    if (hintJson && typeof hintJson.shown === "number") {
      hint = { shown: hintJson.shown, done: !!hintJson.done };
    }
  } catch (e) {}
  if (hint.shown >= 2) { hint.done = true; }
  var whisperEl = document.getElementById("spotlight-whisper");
  var ringEl = document.getElementById("lean-ring");
  var hintTimers = [], hintActive = false, focusWhisper = false, leanAnim = null;
  var PULSE_MS = parseInt(rootCs.getPropertyValue("--motion-pulse"), 10) || 900;

  function saveHint() {
    try { localStorage.setItem(HINT_KEY, JSON.stringify(hint)); } catch (e) {}
  }
  /* Step 87 fix: placement is computed from bounding rects,
     relative to each element's OWN offsetParent. The first
     version copied the label's offsetTop into the whisper's
     style — the two elements have different offsetParents, so
     at phone width the whisper landed ~19px too low, under
     the app window's top edge, and was painted over: present
     in the DOM, invisible on the phone. */
  function placeIn(el, rect) {
    var parent = el.offsetParent;
    if (!parent) { return; }
    var pr = parent.getBoundingClientRect();
    el.style.left = (rect.left - pr.left) + "px";
    el.style.top = (rect.top - pr.top) + "px";
  }
  function placeHint() {
    if (ringEl && frame) {
      var fr = frame.getBoundingClientRect();
      placeIn(ringEl, fr);
      ringEl.style.width = fr.width + "px";
      ringEl.style.height = fr.height + "px";
      ringEl.style.borderRadius = window.getComputedStyle(frame).borderRadius;
    }
    if (whisperEl && tileLabel) {
      var lr = tileLabel.getBoundingClientRect();
      placeIn(whisperEl, { left: lr.left, top: lr.bottom + 4 });
    }
  }
  function hideWhisper() {
    if (whisperEl && !focusWhisper) { whisperEl.classList.remove("is-shown"); }
  }
  function stopHint() {
    hintTimers.forEach(clearTimeout);
    hintTimers = [];
    hintActive = false;
    if (leanAnim) { try { leanAnim.cancel(); } catch (e) {} leanAnim = null; }
    hideWhisper();
  }
  function retireHint() {
    if (hint.done) { return; }
    hint.done = true;
    saveHint();
    stopHint();
  }
  /* Step 92: the lean's base must be the frame's RESTING
     transform. frameBase() answers for the Spotlight hero
     (translateX(-50%) in the band), but at rest the band
     frame carries no transform at all — copying the hero's
     base into the lean's keyframes slid the resting frame
     -44px sideways for the whole 900ms performance (Step 92
     sweep, playing capture at 768: the unit's box measured
     x -32.1 mid-lean). The resting base is read off the
     computed style, and only a pure translation counts (a
     mid-lean scale matrix is not a base). At rest this
     returns "" at every width — the lean is a pure scale,
     as designed. */
  function leanBase() {
    var t = window.getComputedStyle(frame).transform;
    if (!t || t === "none") { return ""; }
    var m = t.match(/^matrix\(([^)]+)\)$/);
    if (!m) { return ""; }
    var p = m[1].split(",").map(function (n) { return Number(n); });
    return (p[0] === 1 && p[3] === 1 && p[1] === 0 && p[2] === 0) ? t : "";
  }
  function hintBeat() {
    if (reduced || hint.done || isOpen) { return; }
    placeHint();
    var base = leanBase();
    var pre = base ? base + " " : "";
    leanAnim = frame.animate(
      [{ transform: pre + "scale(1)" },
       { transform: pre + "scale(1.05)", offset: .35 },
       { transform: pre + "scale(1)" }],
      { duration: PULSE_MS, easing: "ease" });
    if (ringEl) {
      ringEl.animate(
        [{ opacity: .5, transform: "scale(1)" },
         { opacity: 0, transform: "scale(1.5)" }],
        { duration: PULSE_MS, easing: "ease-out" });
    }
  }
  function performHint() {
    if (hint.done || isOpen || hintActive || toggle.hidden) { return; }
    if (!stage.classList.contains("is-scene")) { return; }
    hintActive = true;
    hint.shown++;
    saveHint();
    placeHint();
    if (whisperEl) { whisperEl.classList.add("is-shown"); }
    hintBeat();
    if (!reduced) { hintTimers.push(setTimeout(hintBeat, 2200)); }
    hintTimers.push(setTimeout(function () {
      hintActive = false;
      hideWhisper();
      if (hint.shown >= 2) { retireHint(); }
    }, reduced ? 6000 : 5000));
  }
  document.addEventListener("ia-scene-first-question", function () {
    if (hint.done) { return; }
    hintTimers.push(setTimeout(performHint, 900));
  });
  toggle.addEventListener("focus", function () {
    if (hint.done || isOpen || !toggle.matches(":focus-visible")) { return; }
    focusWhisper = true;
    placeHint();
    if (whisperEl) { whisperEl.classList.add("is-shown"); }
    hintBeat();
  });
  toggle.addEventListener("blur", function () {
    focusWhisper = false;
    if (!hintActive) { hideWhisper(); }
  });

  refreshAvailability();
})();
