/* Step 76 — Avatar Step B driver. One synthetic persona ("p1")
   whose pre-rendered presence loops (idle / listening / thinking /
   greeting, Step 75) and MuseTalk speaking renders (Step 76) are
   driven by the Step 74 scene's own signals. Speaking is keyed by
   the stage's data-speak-key / data-speak-dur attributes, which
   the scene engine publishes for every spoken beat: in a voiced
   run the render is clock-synced to the scene's audio element
   (drift-guarded to the spec's 120ms lip-sync target); in a
   silent run its playback rate is fitted to the staged speech
   window so the mouth finishes with the line. The persona speaks
   with her own voice: when the avatar takes over, the scene's
   clip elements are re-pointed at her per-persona clips (the
   Step 74 clips stay untouched as the no-avatar fallback). If a
   speaking render is missing, the avatar holds its presence loop
   for that beat — no fake mouth motion is ever substituted. If
   every loop fails to load, the frame hides and the glyph design
   returns untouched. */
(function () {
  "use strict";
  var frame = document.getElementById("avatar-frame");
  var tile = document.getElementById("call-tile");
  var stage = document.getElementById("call-stage");
  if (!frame || !tile || !stage) { return; }
  var vids = [document.getElementById("avatar-video-a"), document.getElementById("avatar-video-b")];
  if (!vids[0] || !vids[1]) { return; }
  var pillText = document.getElementById("scene-pill-text");
  var selfTile = document.getElementById("call-self");
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var SRC = {
    idle: "avatar/p1-idle", listening: "avatar/p1-listening",
    thinking: "avatar/p1-thinking", greeting: "avatar/p1-greeting"
  };
  /* Per-question speaking renders + the persona's own voice clips.
     clipFile is the Step 74 scene clip this beat uses without the
     avatar; voice is the same line in the persona's own voice. */
  var SPEAK = {
    tell:   { file: "avatar/p1-speaking-tell",   clipFile: "scene-tell.mp3",     voice: "avatar/p1-voice-tell.mp3" },
    follow: { file: "avatar/p1-speaking-follow", clipFile: "scene-followup.mp3", voice: "avatar/p1-voice-followup.mp3" },
    story:  { file: "avatar/p1-speaking-story",  clipFile: "scene-story.mp3",    voice: "avatar/p1-voice-story.mp3" },
    why:    { file: "avatar/p1-speaking-why",    clipFile: "scene-why.mp3",      voice: "avatar/p1-voice-why.mp3" },
    thanks: { file: "avatar/p1-speaking-thanks", clipFile: "scene-thanks.mp3",   voice: "avatar/p1-voice-thanks.mp3" }
  };
  var state = "", currentFile = "", front = 0, dead = false, greetedClose = false;
  var speakKey = "", speakFailed = {}, renderDur = {}, syncTimer = null;
  var probe = { transitions: [], sync: [], speakStarts: [], voice: "scene", failed: {} };
  var api = { probe: probe, setState: setState, active: false,
              state: function () { return state; },
              speakKey: function () { return speakKey; } };
  window.__avatarStepA = api;

  function fail() {
    if (dead) { return; }
    dead = true;
    api.active = false;
    frame.hidden = true;
    tile.classList.remove("has-avatar");
  }
  vids.forEach(function (v) {
    v.addEventListener("error", function () {
      var f = v.dataset.file || "";
      if (f && v.src.indexOf(".webm") !== -1) { v.src = f + ".mp4"; v.load(); }
      else if (v.dataset.speakKey) {
        /* A missing speaking render must not kill the avatar:
           mark the key and hold the presence loop for the beat. */
        speakFailed[v.dataset.speakKey] = true;
        probe.failed[v.dataset.speakKey] = "media-error";
        if (state === "speaking" && speakKey === v.dataset.speakKey) { setState("listening"); }
      }
      else if (v.classList.contains("is-front")) { fail(); }
    }, true);
  });

  /* Crossfade loader: file into the back element, swap on play. */
  function show(file, opts) {
    opts = opts || {};
    var back = vids[1 - front], old = vids[front];
    back.loop = !!opts.loop;
    back.playbackRate = opts.rate || 1;
    back.dataset.speakKey = opts.speakKey || "";
    if (back.dataset.file !== file) {
      back.dataset.file = file;
      back.src = file + ".webm";
    }
    try { back.currentTime = opts.at || 0; } catch (e) {}
    var t0 = performance.now();
    var myToken = (back._showToken || 0) + 1;
    back._showToken = myToken;
    var p = back.play();
    var swap = function () {
      back.classList.add("is-front");
      old.classList.remove("is-front");
      front = 1 - front;
      currentFile = file;
      probe.transitions.push({ to: opts.label || file, ms: Math.round(performance.now() - t0) });
      if (opts.speakKey) {
        probe.speakStarts.push({ key: opts.speakKey, ms: Math.round(performance.now() - t0) });
      }
      setTimeout(function () { try { old.pause(); } catch (e) {} }, 280);
    };
    if (p && p.then) {
      p.then(swap).catch(function (err) {
        /* A newer show on this element supersedes this one: its
           play() aborting is not a failure of anything. */
        if (back._showToken !== myToken) { return; }
        /* An interrupted play() on the live speaking beat (a
           competing state change in the greeting seam) retries
           once before the beat is given up as failed. */
        if (opts.speakKey && err && err.name === "AbortError" &&
            state === "speaking" && speakKey === opts.speakKey) {
          setTimeout(function () {
            if (back._showToken !== myToken || state !== "speaking" || speakKey !== opts.speakKey) { return; }
            var p2 = back.play();
            if (p2 && p2.then) {
              p2.then(swap).catch(function () {
                speakFailed[opts.speakKey] = true;
                probe.failed[opts.speakKey] = "play-rejected";
                if (state === "speaking") { setState("listening"); }
              });
            } else { swap(); }
          }, 60);
          return;
        }
        if (opts.speakKey) {
          speakFailed[opts.speakKey] = true;
          probe.failed[opts.speakKey] = "play-rejected";
          if (state === "speaking") { setState("listening"); }
        } else if (back === vids[front]) { fail(); }
      });
    } else { swap(); }
  }

  function setState(name) {
    if (dead || !SRC[name] || name === state) { return; }
    state = name;
    speakKey = "";
    stopSync();
    if (reduced) { return; }
    var file = SRC[name];
    if (file === currentFile) { return; }
    show(file, { loop: name !== "greeting", label: name });
  }

  function clipElFor(key) {
    var spec = SPEAK[key];
    if (!spec) { return null; }
    var els = stage.querySelectorAll("audio");
    for (var i = 0; i < els.length; i++) {
      var s = els[i].src || "";
      if (s.indexOf(spec.clipFile) !== -1 || s.indexOf(spec.voice) !== -1) { return els[i]; }
    }
    return null;
  }

  function stopSync() {
    if (syncTimer) { clearInterval(syncTimer); syncTimer = null; }
  }
  /* Voiced runs: keep the render on the audio element's clock.
     A drift past the 120ms lip-sync target snaps back; every
     sample is kept on the probe for the parity audit. */
  function startSync(key) {
    stopSync();
    syncTimer = setInterval(function () {
      if (state !== "speaking" || speakKey !== key) { stopSync(); return; }
      var a = clipElFor(key), v = vids[front];
      if (a && !a.paused && !a.ended && !v.paused) {
        var d = v.currentTime - a.currentTime;
        if (probe.sync.length < 400) { probe.sync.push(Math.round(Math.abs(d) * 1000)); }
        if (Math.abs(d) > 0.12) { try { v.currentTime = a.currentTime; } catch (e) {} }
      }
    }, 200);
  }

  function startSpeaking(key) {
    var spec = SPEAK[key];
    if (dead || !spec) { return; }
    if (speakFailed[key]) { probe.failed[key] = probe.failed[key] || "pre-failed"; setState("listening"); return; }
    state = "speaking";
    speakKey = key;
    if (reduced) { return; }
    var a = clipElFor(key);
    var voiced = !!(a && !a.paused && !a.ended);
    var at = 0, rate = 1;
    if (voiced) {
      at = a.currentTime || 0;
    } else {
      /* Silent run: fit the render to the staged window — the
         engine's speech length plus its fixed 0.35s of lead-in
         and detection settle (sceneAsk's own arithmetic). */
      var dur = parseFloat(stage.getAttribute("data-speak-dur") || "0");
      var rd = renderDur[key] || 0;
      if (dur > 0 && rd > 0) {
        rate = Math.min(1.3, Math.max(0.8, rd / (dur + 0.35)));
      }
    }
    show(spec.file, { loop: false, rate: rate, at: at, speakKey: key, label: "speaking:" + key });
    if (voiced) { startSync(key); }
  }

  function postSpeech() {
    if (pillText && pillText.textContent === "Question detected") { setState("thinking"); }
    else if (selfTile && selfTile.classList.contains("is-speaking")) { setState("listening"); }
    else { setState("idle"); }
  }

  vids.forEach(function (v) {
    v.addEventListener("ended", function () {
      if (!v.classList.contains("is-front")) { return; }
      if (state === "greeting") { setState("idle"); }
      else if (state === "speaking") {
        /* The line is finished but the scene is still settling:
           close the mouth and listen — never a frozen last frame. */
        stopSync();
        state = "";
        setState("listening");
      }
    });
  });

  /* The scene publishes each spoken beat on the stage. This is
     the single speaking signal, voiced and silent alike. */
  new MutationObserver(function () {
    var key = stage.getAttribute("data-speak-key");
    if (key) { if (key !== speakKey || state !== "speaking") { startSpeaking(key); } }
    else if (state === "speaking") { stopSync(); speakKey = ""; postSpeech(); }
  }).observe(stage, { attributes: true, attributeFilter: ["data-speak-key"] });

  if (selfTile) {
    new MutationObserver(function () {
      if (state === "speaking") { return; }
      if (selfTile.classList.contains("is-speaking")) { setState("listening"); }
      else if (state === "listening") { setState("idle"); }
    }).observe(selfTile, { attributes: true, attributeFilter: ["class"] });
  }
  if (pillText) {
    new MutationObserver(function () {
      var t = pillText.textContent;
      if (t === "Question detected" && state !== "speaking") { setState("thinking"); }
      else if (t === "Answer ready" && state !== "speaking") { postSpeech(); }
      else if (t === "Interview complete" && !greetedClose) { greetedClose = true; setState("greeting"); }
      else if (t === "Not listening" && state !== "speaking") { greetedClose = false; setState("idle"); }
    }).observe(pillText, { childList: true, characterData: true, subtree: true });
  }
  ["scene-start", "scene-replay"].forEach(function (id) {
    var b = document.getElementById(id);
    if (b) { b.addEventListener("click", function () { greetedClose = false; setState("greeting"); }); }
  });
  document.addEventListener("visibilitychange", function () {
    var cur = vids[front];
    if (document.hidden) { try { cur.pause(); } catch (e) {} }
    else if (!reduced && state) { try { cur.play(); } catch (e) {} }
  });

  /* Her voice, not the stand-in's: once her first clip proves
     reachable, re-point the scene's clip elements at her own
     recordings. The scene reads durations from the same elements,
     so a voiced run re-paces itself to her voice automatically.
     If her clips are unreachable, the Step 74 clips stay. */
  function swapVoice() {
    var probeEl = new Audio();
    probeEl.preload = "auto";
    probeEl.addEventListener("loadedmetadata", function () {
      var anyPlaying = false;
      Object.keys(SPEAK).forEach(function (key) {
        var a = clipElFor(key);
        if (a && !a.paused) { anyPlaying = true; }
      });
      if (anyPlaying) { return; }
      Object.keys(SPEAK).forEach(function (key) {
        var a = clipElFor(key);
        if (a) { a.src = SPEAK[key].voice; a.load(); }
      });
      probe.voice = "p1";
    });
    probeEl.addEventListener("error", function () { probe.voice = "scene-fallback"; });
    probeEl.src = SPEAK.tell.voice;
  }

  /* Warm the speaking renders: metadata first (durations feed
     the silent rate-fit), then the full files, so a spoken beat
     starts at the pre-render floor instead of on a cold fetch. */
  function warmSpeaking() {
    Object.keys(SPEAK).forEach(function (key) {
      var w = document.createElement("video");
      w.preload = "metadata";
      w.muted = true;
      w.addEventListener("loadedmetadata", function () {
        renderDur[key] = w.duration || 0;
        w.preload = "auto";
      });
      w.src = SPEAK[key].file + ".webm";
    });
  }

  /* Take over: the poster carries the first paint; the idle loop
     takes over from it. Reduced motion keeps the still poster. */
  frame.hidden = false;
  tile.classList.add("has-avatar");
  if (reduced) {
    frame.classList.add("is-static");
    state = "idle";
    api.active = true;
  } else {
    setState("idle");
    api.active = true;
    swapVoice();
    warmSpeaking();
  }
})();
