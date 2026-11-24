#!/usr/bin/env python3
"""Step 92 probe — the unfolded band's folded-strip top row.

Asserts, at sampled band widths (641/712/768/853/933), in the
primed, complete (reduced-motion settled) and camera-denied
states (plus a camera-on pass at 768):
  - the participant unit (frame + 8px + plate) and the self
    tile are ONE shared box: 88x170, |dw| and |dh| <= 1px;
  - the plate sits under the frame at the strip's own gap,
    same width, its text inside its box;
  - the window hangs 24px under the row and the complete
    state's dead remainder under it stays <= 24px;
  - the window header holds one line for every status string;
  - the camera guide stands in the self tile while the camera
    is off (and only there), and the denied note sits fully
    readable under the window;
  - on a phone (403) the guide never renders.
Run by tests/test-step92.js. Prints PROBE92 OK on success.
"""
import json, os, subprocess, sys, time
from playwright.sync_api import sync_playwright

PORT = "8952"
BASE = "http://127.0.0.1:" + PORT
ROOT = os.path.expanduser("~/workspace/interview-assistant-website/website")
HEADERS = ["Listening…", "Question detected", "Preparing your points…",
           "Answer ready", "Live answer", "Interview complete"]

GEOM = r"""
() => {
  const F = document.querySelector('.call-main').getBoundingClientRect();
  const fr = document.querySelector('.avatar-frame').getBoundingClientRect();
  const lb = document.querySelector('.call-tile-label').getBoundingClientRect();
  const sl = document.getElementById('call-self').getBoundingClientRect();
  const wn = document.querySelector('.call-main .app-window').getBoundingClientRect();
  const nt = document.getElementById('cam-note');
  const nr = nt && !nt.hidden ? nt.getBoundingClientRect() : null;
  const lab = document.querySelector('.call-tile-label');
  const g = getComputedStyle(document.querySelector('.cam-toggle'), '::before');
  const rel = r => ({ x: r.x - F.x, y: r.y - F.y, w: r.width, h: r.height,
                      b: r.bottom - F.y });
  return {
    fieldH: F.height,
    unit: { x: fr.x - F.x, y: fr.y - F.y, w: fr.width,
            h: lb.bottom - fr.y, b: lb.bottom - F.y },
    frame: rel(fr), label: rel(lb), self: rel(sl), win: rel(wn),
    note: nr ? rel(nr) : null,
    labelOverflow: lab.scrollHeight - lab.clientHeight,
    guide: { content: g.content, bg: g.backgroundImage, w: parseFloat(g.width), h: parseFloat(g.height) },
  };
}
"""

HEADER_PROBE = r"""
() => {
  const pill = document.getElementById('scene-pill-text');
  const bar = pill.closest('.app-header').getBoundingClientRect();
  const out = {};
  for (const s of %s) {
    pill.textContent = s;
    out[s] = pill.closest('.app-header').getBoundingClientRect().height === bar.height
      && pill.getBoundingClientRect().height <= 20;
  }
  return out;
}
""" % json.dumps(HEADERS)

fails = []

def check(cond, msg):
    if not cond:
        fails.append(msg)
    return cond

def band_state(g, w, state):
    u, s = g["unit"], g["self"]
    check(abs(u["w"] - 88) <= 1 and abs(u["h"] - 170) <= 1,
          f"{w} {state}: unit box {u['w']}x{u['h']}, not 88x170")
    check(abs(u["w"] - s["w"]) <= 1 and abs(u["h"] - s["h"]) <= 1,
          f"{w} {state}: boxes differ |dw| {abs(u['w']-s['w'])} |dh| {abs(u['h']-s['h'])}")
    check(abs(u["y"] - s["y"]) <= 1, f"{w} {state}: the row's tops differ")
    check(abs(g["label"]["y"] - (g["frame"]["y"] + g["frame"]["h"]) - 8) <= 1,
          f"{w} {state}: plate gap is not the strip's 8px")
    check(abs(g["label"]["w"] - g["frame"]["w"]) <= 1,
          f"{w} {state}: plate width != frame width")
    check(g["labelOverflow"] <= 1, f"{w} {state}: plate text overflow {g['labelOverflow']}")
    check(abs(g["win"]["y"] - u["b"] - 24) <= 1.5,
          f"{w} {state}: window does not hang 24px under the row ({g['win']['y'] - u['b']})")

def main():
    srv = subprocess.Popen(["python3", "-m", "http.server", PORT, "--bind", "127.0.0.1"],
                           cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(args=["--autoplay-policy=no-user-gesture-required",
                                               "--use-fake-device-for-media-stream",
                                               "--use-fake-ui-for-media-stream"])
            for w in (641, 712, 768, 853, 933):
                ctx = browser.new_context(viewport={"width": w, "height": 1000})
                pg = ctx.new_page()
                pg.goto(BASE + "/demo.html")
                pg.evaluate("document.fonts.ready.then(() => 1)")
                pg.wait_for_timeout(400)
                g = pg.evaluate(GEOM)
                band_state(g, w, "primed")
                check(g["guide"]["bg"].startswith('url("data:image/svg') and
                      abs(g["guide"]["w"] - 56) <= 1 and abs(g["guide"]["h"] - 64) <= 1,
                      f"{w} primed: camera guide missing or mis-sized {g['guide']}")
                hdrs = pg.evaluate(HEADER_PROBE)
                check(all(hdrs.values()), f"{w}: a header string wrapped: {hdrs}")
                ctx.close()
                # settled (reduced motion) + denied note
                ctx = browser.new_context(viewport={"width": w, "height": 1000},
                                          reduced_motion="reduce")
                pg = ctx.new_page()
                pg.goto(BASE + "/demo.html")
                pg.evaluate("document.fonts.ready.then(() => 1)")
                pg.wait_for_timeout(400)
                g = pg.evaluate(GEOM)
                band_state(g, w, "settled")
                below = g["fieldH"] - g["win"]["b"]
                check(below <= 24.5, f"{w} settled: dead remainder {below} under the window")
                pg.click("#call-self")
                pg.wait_for_timeout(900)
                g = pg.evaluate(GEOM)
                band_state(g, w, "cam-denied")
                check(g["note"] is not None, f"{w} cam-denied: note not shown")
                if g["note"]:
                    check(g["note"]["y"] >= g["win"]["b"] - 0.5,
                          f"{w} cam-denied: note not under the window")
                    check(g["note"]["b"] <= g["fieldH"] + 0.5,
                          f"{w} cam-denied: note escapes the field")
                ctx.close()
            # camera-on at 768: the real feed replaces the guide
            ctx = browser.new_context(viewport={"width": 768, "height": 1000},
                                      permissions=["camera"])
            pg = ctx.new_page()
            pg.goto(BASE + "/demo.html")
            pg.evaluate("document.fonts.ready.then(() => 1)")
            pg.wait_for_timeout(400)
            pg.click("#call-self")
            pg.wait_for_timeout(2500)
            g = pg.evaluate(GEOM)
            band_state(g, 768, "cam-on")
            check(g["guide"]["content"] == "none",
                  f"768 cam-on: guide still rendered {g['guide']}")
            ctx.close()
            # phone: the guide never renders at 403
            ctx = browser.new_context(viewport={"width": 403, "height": 928})
            pg = ctx.new_page()
            pg.goto(BASE + "/demo.html")
            pg.evaluate("document.fonts.ready.then(() => 1)")
            pg.wait_for_timeout(400)
            g = pg.evaluate(GEOM)
            check(g["guide"]["content"] == "none",
                  f"403: guide rendered on the phone strip {g['guide']}")
            ctx.close()
            browser.close()
    finally:
        srv.terminate()
    if fails:
        print("PROBE92 FAILURES:")
        for f in fails:
            print("  FAIL", f)
        sys.exit(1)
    print("PROBE92 OK")

if __name__ == "__main__":
    main()
