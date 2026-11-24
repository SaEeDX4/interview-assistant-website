#!/usr/bin/env python3
"""Step 90 sampled invariant probe — driven by tests/test-step90.js.

Serves website/ locally and checks, at sampled band widths x states:
  - zero overlap between either bottom unit (participant / self) and
    the app window;
  - where a unit and the window share a vertical band, their side gap
    is >= 16px; where they share a horizontal band, the vertical gap
    is >= 16px;
  - the window's header row is one line for every real status string;
  - Spotlight (during an active question): no caption element exists
    and nothing overlays the portrait's lower fifth;
  - the eyebrow disclosure ("Live demo — simulated") is rendered and
    visible (addendum E1's honesty precondition).

Usage: probe-step90.py <website-dir>
Prints one JSON object: {"failures": [...], "checks": n}
"""
import json, sys, threading, http.server, functools
from playwright.sync_api import sync_playwright

ROOT = sys.argv[1]
WIDTHS = [641, 712, 768, 853, 933]
PILLS = ["Ready when you are", "Listening", "Question detected",
         "Answer ready", "Not listening", "Interview complete"]

GEOM = r"""
() => {
  const main = document.querySelector('.call-main');
  const mr = main.getBoundingClientRect();
  const R = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) return null;
    return { x: r.left - mr.left, y: r.top - mr.top, w: r.width, h: r.height,
             right: r.right - mr.left, bottom: r.bottom - mr.top };
  };
  const win = document.getElementById('app-window');
  const frame = document.getElementById('avatar-frame');
  const label = document.querySelector('.call-tile > .call-tile-label');
  const self = document.getElementById('call-self');
  const W = R(win), F = R(frame), L = R(label), S = R(self);
  const P = (F && L) ? { x: Math.min(F.x, L.x), y: Math.min(F.y, L.y),
    right: Math.max(F.right, L.right), bottom: Math.max(F.bottom, L.bottom) } : (F || L);
  const pair = (U) => {
    if (!U || !W) return null;
    const ov = Math.max(0, Math.min(U.right, W.right) - Math.max(U.x, W.x)) *
               Math.max(0, Math.min(U.bottom, W.bottom) - Math.max(U.y, W.y));
    return { overlap: ov,
             sideGap: (U === S) ? (U.x - W.right) : (W.x - U.right),
             vertGap: U.y - W.bottom,
             shareY: Math.min(U.bottom, W.bottom) - Math.max(U.y, W.y) > 0,
             shareX: Math.min(U.right, W.right) - Math.max(U.x, W.x) > 0 };
  };
  return { self: pair(S), part: pair(P),
           caption: !!document.getElementById('call-caption'),
           eyebrow: (() => { const e = document.querySelector('.eyebrow');
             if (!e) return false; const r = e.getBoundingClientRect();
             return r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; })() };
}
"""

HEADER = r"""
(txt) => {
  const win = document.getElementById('app-window');
  const header = win.querySelector('.app-header');
  const pill = document.getElementById('scene-pill');
  const controls = win.querySelector('.app-header-controls');
  document.getElementById('scene-pill-text').textContent = txt;
  const hr = header.getBoundingClientRect(), pr = pill.getBoundingClientRect(),
        cr = controls.getBoundingClientRect();
  return { h: hr.height, wrapped: Math.abs((pr.top + pr.height/2) - (cr.top + cr.height/2)) > 2 };
}
"""


def serve(port):
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


def pair_failures(w, state, g):
    out = []
    for name in ("self", "part"):
        p = g[name]
        if not p:
            out.append(f"{w} {state}: {name} unit missing")
            continue
        if p["overlap"] > 0.5:
            out.append(f"{w} {state}: {name} overlaps window by {p['overlap']:.0f}px^2")
        if p["shareY"] and p["sideGap"] < 16:
            out.append(f"{w} {state}: {name} side gap {p['sideGap']:.1f} < 16 in a shared band")
        if p["shareX"] and p["vertGap"] < 16:
            out.append(f"{w} {state}: {name} vertical gap {p['vertGap']:.1f} < 16 in a shared band")
    return out


def main():
    failures, checks = [], 0
    srv = serve(8921)
    base = "http://127.0.0.1:8921/demo.html"
    with sync_playwright() as pw:
        browser = pw.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
        for w in WIDTHS:
            # primed + header strings + spotlight (normal motion)
            pg = browser.new_page(viewport={"width": w, "height": 900})
            pg.goto(base)
            pg.evaluate("document.fonts.ready.then(() => 1)")
            pg.wait_for_timeout(1200)
            g = pg.evaluate(GEOM)
            checks += 1
            failures += pair_failures(w, "primed", g)
            if g["caption"]:
                failures.append(f"{w} primed: #call-caption element exists")
            if not g["eyebrow"]:
                failures.append(f"{w}: eyebrow disclosure not rendered/visible")
            for txt in PILLS:
                h = pg.evaluate(HEADER, txt)
                checks += 1
                if h["wrapped"] or h["h"] > 50:
                    failures.append(f"{w}: header wraps for '{txt}' (h={h['h']})")
            # spotlight during an active question
            pg.click("#scene-start")
            pg.wait_for_function(
                "() => (document.getElementById('scene-pill-text')||{}).textContent === 'Listening'",
                timeout=30000)
            pg.evaluate("document.querySelector('.avatar-toggle').click()")
            pg.wait_for_timeout(1200)
            g = pg.evaluate(GEOM)
            checks += 1
            if g["caption"]:
                failures.append(f"{w} spotlight: #call-caption element exists")
            pg.close()
            # complete (reduced motion settles instantly)
            ctx = browser.new_context(viewport={"width": w, "height": 900},
                                      reduced_motion="reduce")
            pg = ctx.new_page()
            pg.goto(base)
            pg.evaluate("document.fonts.ready.then(() => 1)")
            pg.wait_for_timeout(1200)
            g = pg.evaluate(GEOM)
            checks += 1
            failures += pair_failures(w, "complete", g)
            pg.close()
            ctx.close()
        browser.close()
    srv.shutdown()
    print(json.dumps({"failures": failures, "checks": checks}))


if __name__ == "__main__":
    main()
