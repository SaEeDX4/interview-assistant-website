/* Step 77 — Avatar driver, generalised to the persona pool.
   Six fully synthetic interviewers (p1–p6), each with her or his
   own photoreal portrait, presence loops (idle / listening /
   thinking / greeting, in-house motion-field renderer), MuseTalk
   speaking renders driven by a living performance take (Step 77:
   the head breathes, sways and blinks THROUGH the spoken line —
   the Step 76 still-driven renders froze the head for the whole
   line, 1,320ms of a 1,360ms line, and the owner rejected them),
   and her or his own recorded voice for the five fixed lines.

   Selection: a fresh persona on every page load, never the same
   as the previous load's (localStorage last-persona exclusion);
   fixed within the load. Only the chosen persona's assets are
   ever requested. (Step 77 selected per session via
   sessionStorage; Step 79 made it per load — a phone refresh
   stays in the same tab session, so the face never changed.)

   Speaking is keyed by the stage's data-speak-key / data-speak-dur
   attributes: in a voiced run the render is clock-synced to the
   scene's sound clock (window.__iaSceneClock — the Step 77 Web
   Audio buffer clock, element clock as fallback) with the spec's
   120ms drift guard; in a silent run its playback rate is fitted
   to the staged speech window. The persona's voice is played by
   the scene's Web Audio engine (app.js reads the persona id this
   driver publishes); the element re-pointing below remains as
   the no-Web-Audio fallback. If a speaking render is missing,
   the avatar holds its presence loop for that beat — no fake
   mouth motion is ever substituted. If every loop fails to load,
   the frame hides and the glyph design returns untouched. */
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

  /* --- Persona selection (Step 79): a fresh persona on every
     page load, never the same as the previous load's. The
     localStorage last-persona exclusion is the whole mechanism;
     Step 77's sessionStorage layer is gone — a phone refresh
     keeps the tab session, so the session-pinned face survived
     every refresh the owner tried. Within one load the persona
     is fixed: the interview never changes faces mid-run. --- */
  var POOL = ["p1", "p2", "p3", "p4", "p5", "p6"];
  function lstore(k) {
    try { return window.localStorage.getItem(k); } catch (e) { return null; }
  }
  function lstoreSet(k, v) {
    try { window.localStorage.setItem(k, v); } catch (e) {}
  }
  var last = lstore("ia-avatar-last");
  var cands = POOL.filter(function (p) { return p !== last; });
  var pid = cands[Math.floor(Math.random() * cands.length)];
  lstoreSet("ia-avatar-last", pid);
  window.__avatarPersonaId = pid;

  var SRC = {
    idle: "avatar/" + pid + "-idle", listening: "avatar/" + pid + "-listening",
    thinking: "avatar/" + pid + "-thinking", greeting: "avatar/" + pid + "-greeting"
  };
  /* Per-question speaking renders + the persona's own voice clips.
     clipFile is the Step 74 scene clip this beat uses without the
     avatar; voice is the same line in the persona's own voice. */
  var SPEAK = {
    tell:   { file: "avatar/" + pid + "-speaking-tell",   clipFile: "scene-tell.mp3",     voice: "avatar/" + pid + "-voice-tell.mp3" },
    follow: { file: "avatar/" + pid + "-speaking-follow", clipFile: "scene-followup.mp3", voice: "avatar/" + pid + "-voice-followup.mp3" },
    story:  { file: "avatar/" + pid + "-speaking-story",  clipFile: "scene-story.mp3",    voice: "avatar/" + pid + "-voice-story.mp3" },
    why:    { file: "avatar/" + pid + "-speaking-why",    clipFile: "scene-why.mp3",      voice: "avatar/" + pid + "-voice-why.mp3" },
    thanks: { file: "avatar/" + pid + "-speaking-thanks", clipFile: "scene-thanks.mp3",   voice: "avatar/" + pid + "-voice-thanks.mp3" }
  };
  vids.forEach(function (v) { v.poster = "avatar/" + pid + "-poster.webp"; });

  var state = "", currentFile = "", front = 0, dead = false, greetedClose = false;
  var speakKey = "", speakFailed = {}, renderDur = {}, syncTimer = null;
  var probe = { transitions: [], sync: [], speakStarts: [], voice: "scene", failed: {}, persona: pid };
  var api = { probe: probe, setState: setState, active: false, persona: pid,
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

  /* Step 78 — stall watchdog. The error chain above covers files
     that fail to LOAD; a file can also load, "play", and never
     advance on a real device (a wedged decoder shows a frozen
     first frame with no error and no signal — the owner's phone
     read exactly that as "nothing works"). After each swap the
     front element must prove it is advancing: checks every
     500ms with <50ms of progress while the page is visible mean
     stalled. A wrongly-paused front gets one resume attempt;
     then one format switch (WebM → MP4) is tried; a second stall
     gives up honestly — the presence loop holds the beat
     (speaking) or the glyph returns (loops), never a frozen frame
     pretending to be a person. */
  function watchAdvance(v, file, opts) {
    var token = v._showToken;
    var t0 = null, checks = 0, resumed = false;
    var iv = setInterval(function () {
      if (v._showToken !== token || dead) { clearInterval(iv); return; }
      if (document.hidden) { return; }
      if (!v.classList.contains("is-front") || v.ended) { clearInterval(iv); return; }
      if (v.readyState < 2 && !v.paused) { return; }
      if (!v.paused && t0 !== null && v.currentTime - t0 > 0.05) { clearInterval(iv); return; }
      if (t0 === null) { t0 = v.currentTime; return; }
      checks++;
      if (checks < 2) { return; }
      /* ~1.5s without advance — frozen decoder, or a pause that
         landed on the wrong element: one resume attempt first,
         so a stray pause can never freeze the interviewer. */
      if (v.paused && !resumed) {
        resumed = true; checks = 0; t0 = null;
        var rp = v.play();
        if (rp && rp.catch) { rp.catch(function () {}); }
        return;
      }
      clearInterval(iv);
      if (v.src.indexOf(".webm") !== -1 && v.dataset.stallFile !== file) {
        v.dataset.stallFile = file;
        v.src = file + ".mp4";
        v.load();
        var p = v.play();
        if (p && p.catch) { p.catch(function () {}); }
        watchAdvance(v, file, opts);
        return;
      }
      probe.failed[opts.speakKey || opts.label || file] = "stalled";
      if (opts.speakKey) {
        speakFailed[opts.speakKey] = true;
        if (state === "speaking" && speakKey === opts.speakKey) { setState("listening"); }
      } else if (v.classList.contains("is-front")) { fail(); }
    }, 500);
  }

  /* Crossfade loader: file into the back element, swap on play. */
  function show(file, opts) {
    opts = opts || {};
    var back = vids[1 - front], old = vids[front];
    back._gen = (back._gen || 0) + 1;
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
      /* Step 78: the old element is paused only if it is still
         the same content this swap replaced. The timeout used to
         capture the bare element: when the greeting ended and
         the idle swap armed this pause, the element was recycled
         for the speaking render within the 280ms — and the stale
         timeout paused the FRONT speaking element mid-line,
         freezing the interviewer's face for the whole beat while
         her voice played (caught by the Step 78 freeze probe:
         pause on the front element at ct 0.12, fh 0 for ~1.8s).
         The generation guard makes that class of freeze
         impossible: a retargeted element is never paused. */
      var oldGen = old._gen || 0;
      setTimeout(function () {
        if ((old._gen || 0) === oldGen && old !== vids[front]) {
          try { old.pause(); } catch (e) {}
        }
      }, 280);
      watchAdvance(back, file, opts);
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

  /* The beat's sound clock, whichever engine is sounding: the
     scene's Web Audio clock when it exists (Step 77), else the
     clip element's own clock (the Step 76 path). */
  function beatClock(key) {
    if (window.__iaSceneClock) {
      var c = window.__iaSceneClock();
      if (c && c.key === key) { return c; }
      return { playing: false, t: 0 };
    }
    var a = clipElFor(key);
    if (a && !a.paused && !a.ended) { return { playing: true, t: a.currentTime || 0 }; }
    return { playing: false, t: 0 };
  }

  function stopSync() {
    if (syncTimer) { clearInterval(syncTimer); syncTimer = null; }
  }
  /* Voiced runs: keep the render on the sound clock. A drift
     past the 120ms lip-sync target snaps back; every sample is
     kept on the probe for the parity audit. */
  function startSync(key) {
    stopSync();
    syncTimer = setInterval(function () {
      if (state !== "speaking" || speakKey !== key) { stopSync(); return; }
      var c = beatClock(key), v = vids[front];
      if (c.playing && !v.paused) {
        var d = v.currentTime - c.t;
        if (probe.sync.length < 400) { probe.sync.push(Math.round(Math.abs(d) * 1000)); }
        if (Math.abs(d) > 0.12) { try { v.currentTime = c.t; } catch (e) {} }
      } else if (!c.playing) { stopSync(); }
    }, 200);
  }

  function startSpeaking(key) {
    var spec = SPEAK[key];
    if (dead || !spec) { return; }
    if (speakFailed[key]) { probe.failed[key] = probe.failed[key] || "pre-failed"; setState("listening"); return; }
    state = "speaking";
    speakKey = key;
    if (reduced) { return; }
    var c = beatClock(key);
    var voiced = !!c.playing;
    var at = 0, rate = 1;
    if (voiced) {
      at = c.t || 0;
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
  ["scene-start", "scene-replay", "scene-watch"].forEach(function (id) {
    var b = document.getElementById(id);
    if (b) { b.addEventListener("click", function () { greetedClose = false; setState("greeting"); }); }
  });
  document.addEventListener("visibilitychange", function () {
    var cur = vids[front];
    if (document.hidden) { try { cur.pause(); } catch (e) {} }
    else if (!reduced && state) { try { cur.play(); } catch (e) {} }
  });

  /* The persona's voice, not the stand-in's: the scene's Web
     Audio engine reads window.__avatarPersonaId itself; this
     re-pointing remains for its element fallback — once her
     first clip proves reachable, the scene's clip elements are
     pointed at her own recordings. If her clips are unreachable,
     the Step 74 clips stay. */
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
      probe.voice = pid;
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

  /* Step 78 — warm the presence loops too. Only the idle loop is
     requested at takeover; the others loaded on first use, so on
     a slow network the seam after a spoken line could sit on the
     render's last frame for ~0.9s while the thinking loop fetched
     (Slow-4G audit). Detached preloads put all four loops in the
     cache before the run starts; the driver's own elements then
     swap from cache. */
  function warmPresence() {
    Object.keys(SRC).forEach(function (name) {
      var w = document.createElement("video");
      w.preload = "auto";
      w.muted = true;
      w.src = SRC[name] + ".webm";
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
    warmPresence();
  }
})();
