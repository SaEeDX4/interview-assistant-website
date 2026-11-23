/* Spotlight — Phase 1: the interviewer, up close.
   The cooked concept lives in ~/workspace/avatar-expand-ideation/
   concept.md. Tapping the interviewer flies the SAME living
   video element — never a copy, never a reload, never a
   snapshot — from her tile rect to a hero rect inside the call
   frame; the canonical app window settles beneath her at a
   reduced scale; her current question runs as a live caption
   between them; the self tile demotes to a PiP. Tapping her
   again, the close control, or Escape flies everything back to
   its exact original rect.

   The lens, not a scene: this module NEVER touches the scene
   engine — no timers, no pill, no speak keys, no audio, no
   video element state. It reads the scene's published DOM (the
   question stack's word spans, the closing caption) and mirrors
   it; the avatar driver's A/B machinery and its 120ms sync
   guard run underneath, uninformed. Sound behaviour is
   therefore a non-event: she keeps speaking through the flight,
   sample-accurate, and expansion can never start sound.

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
  var caption = document.getElementById("spotlight-caption");
  var callCaption = document.getElementById("call-caption");
  var appWindow = document.getElementById("app-window");
  var selfTile = document.getElementById("call-self");
  var qStack = document.getElementById("demo-question-stack");
  if (!stage || !tile || !frame || !toggle || !closeBtn || !caption || !appWindow || !selfTile) { return; }
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

  /* ---------- the caption mirror ----------
     Her current question, cloned from the scene's own word
     spans (the visible question layer, or the closing caption
     on the thanks beat): arrived words visible, unarrived
     words holding their space, the provisional/settled colour
     law carried by the layer's own class. One extra write
     target on an existing publication — no new timing system. */
  var lastMirrorKey = "";
  function visibleQuestionLayer() {
    if (!qStack) { return null; }
    var kids = qStack.children, found = null;
    for (var i = 0; i < kids.length; i++) {
      if (!kids[i].classList.contains("is-hidden")) { found = kids[i]; }
    }
    return found || kids[0] || null;
  }
  function mirrorCaption() {
    var src = null;
    if (callCaption && !callCaption.hidden && callCaption.textContent.trim()) { src = callCaption; }
    if (!src) { src = visibleQuestionLayer(); }
    if (!src) { return; }
    var key = (src === callCaption ? "cap|" : "q|") + src.innerHTML;
    if (key === lastMirrorKey) { return; }
    lastMirrorKey = key;
    caption.textContent = "";
    for (var i = 0; i < src.childNodes.length; i++) {
      caption.appendChild(src.childNodes[i].cloneNode(true));
    }
    caption.classList.toggle("is-provisional", src.classList.contains("is-provisional"));
    if (isOpen && !flights.length) { refreshSpotHeights(); }
  }
  var mirrorMo = new MutationObserver(mirrorCaption);
  if (qStack) { mirrorMo.observe(qStack, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] }); }
  if (callCaption) { mirrorMo.observe(callCaption, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "hidden"] }); }

  /* ---------- measured heights ----------
     The window's spotlight top is the caption's measured
     bottom + 12; the field's height is that top + the window's
     measured height + the standard 16px bottom padding. On
     phones the composition is in flow, so the field's height
     is simply its own. */
  function measureSpot() {
    if (phoneMq.matches) {
      stage.style.setProperty("--spot-main-h", "0px");
      return { winTop: 0, mainH: callMain.offsetHeight };
    }
    var mainRect = callMain.getBoundingClientRect();
    var capRect = caption.getBoundingClientRect();
    var winTop = Math.round(capRect.bottom - mainRect.top) + 12;
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
     lands the caption's hero geometry for one synchronous
     turn (no paint), so the window's top is measured from the
     caption's real box, not from arithmetic. */
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
    isOpen = true;
    seq++;
    var mySeq = seq;
    var fF = rect(frame), fW = rect(appWindow), fS = rect(selfTile);
    var h0 = callMain.getBoundingClientRect().height;
    cancelFlights();
    appWindow.style.transition = "none";
    mirrorCaption();
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
     exchanges, typed answers); the caption's wrap moves with
     the beat. Re-measure from the real boxes — the resting
     var changes glide on the field's own transition, the
     window's top on its spotlight transition. A breakpoint
     crossing re-derives the whole geometry at once. */
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
    ro.observe(caption);
  }

  mirrorCaption();
  refreshAvailability();
})();
