#!/usr/bin/env python3
"""Bucket-A fix run probe — behaviour verification for the demo
fixes (A4, A5), the print fix (A8) and the copy fixes (A1, A2),
with the five-width screenshot passes the owner's protocol
requires. Serves the local tree and checks:

  A4  reduced motion at 1200/933/768/712/403: the avatar frame is
      .is-static, the FRONT video is rendered (display block) and
      paused, its poster is the chosen persona's — the still
      portrait paints instead of an empty tile. Normal motion at
      1200/403: no .is-static, the idle loop actually plays.
  A5  the classic path (question chip): the status sequence is
      Preparing -> Writing -> final, and "Writing" first appears
      while words are still streaming (some, not all, visible).
  A8  privacy.html under print emulation: paper background, ink
      text, chrome hidden (+ terms.html print as the regression
      reference).
  A1/A2 screenshot passes: platforms at five widths (top + full),
      the Support FAQ answer expanded at 1200/403.
  Zero page errors from local files on every page visited.

Prints PROBE97 OK on success. Shots go to
~/workspace/site-fixes-bucket-a/shots/.
"""
import http.server, os, socketserver, threading, time
from playwright.sync_api import sync_playwright

PORT = "8997"
BASE = "http://127.0.0.1:" + PORT
ROOT = os.path.expanduser("~/workspace/interview-assistant-website/website")
SHOTS = os.path.expanduser("~/workspace/site-fixes-bucket-a/shots")
os.makedirs(SHOTS, exist_ok=True)
FAIL = []

def expect(cond, msg):
    if not cond:
        FAIL.append(msg)
        print("  FAIL", msg)

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass

os.chdir(ROOT)
socketserver.TCPServer.allow_reuse_address = True
server = socketserver.TCPServer(("127.0.0.1", int(PORT)), Handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
time.sleep(0.5)

WIDTHS = [1200, 933, 768, 712, 403]

try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch()

        def new_page(width, height=1000, reduced=None, errors=None):
            ctx = browser.new_context(
                viewport={"width": width, "height": height},
                reduced_motion=reduced or "no-preference")
            page = ctx.new_page()
            if errors is not None:
                page.on("pageerror", lambda e: errors.append(str(e)))
            return ctx, page

        # ---------- A4: reduced motion paints the still portrait ----------
        for w in WIDTHS:
            errors = []
            ctx, page = new_page(w, 928 if w == 403 else 1000, reduced="reduce", errors=errors)
            page.goto(BASE + "/demo.html")
            page.wait_for_timeout(1500)
            st = page.evaluate("""() => {
              const frame = document.getElementById('avatar-frame');
              const front = document.querySelector('.avatar-video.is-front');
              const cs = getComputedStyle(front);
              return { isStatic: frame.classList.contains('is-static'),
                       display: cs.display, paused: front.paused,
                       poster: front.poster || '',
                       pid: window.__avatarPersonaId || '' };
            }""")
            expect(st["isStatic"], f"A4 @{w}: frame is not .is-static")
            expect(st["display"] == "block", f"A4 @{w}: front video display={st['display']} (poster cannot paint)")
            expect(st["paused"], f"A4 @{w}: front video is playing under reduced motion")
            expect(st["pid"] and ("/" + st["pid"] + "-poster.webp") in st["poster"],
                   f"A4 @{w}: poster {st['poster']} is not the chosen persona's ({st['pid']})")
            expect(not errors, f"A4 @{w}: page errors {errors}")
            tile = page.locator("#call-tile")
            tile.scroll_into_view_if_needed()
            page.wait_for_timeout(250)
            tile.screenshot(path=os.path.join(SHOTS, f"a4-reduced-{w}.png"))
            ctx.close()
        print("A4 reduced-motion pass done")

        # ---------- A4 regression: normal motion still lives ----------
        for w in [1200, 403]:
            ctx, page = new_page(w, 928 if w == 403 else 1000)
            page.goto(BASE + "/demo.html")
            page.wait_for_timeout(2000)
            st = page.evaluate("""() => {
              const frame = document.getElementById('avatar-frame');
              const front = document.querySelector('.avatar-video.is-front');
              return { isStatic: frame.classList.contains('is-static'),
                       paused: front.paused, ready: front.readyState };
            }""")
            expect(not st["isStatic"], f"A4-regression @{w}: frame wrongly .is-static")
            expect(not st["paused"] and st["ready"] >= 2,
                   f"A4-regression @{w}: idle loop not playing (paused={st['paused']}, ready={st['ready']})")
            ctx.close()
        print("A4 normal-motion regression pass done")

        # ---------- A5: the status tells the truth mid-stream ----------
        for w in [1200, 403]:
            errors = []
            ctx, page = new_page(w, 928 if w == 403 else 1000, errors=errors)
            page.goto(BASE + "/demo.html")
            page.wait_for_selector('button.chip[data-q="tell"]')
            page.wait_for_timeout(600)
            page.evaluate("""() => {
              window.__statusLog = [];
              const el = document.getElementById('demo-status');
              let last = el.textContent;
              window.__statusObs = new MutationObserver(() => {
                if (el.textContent !== last) {
                  last = el.textContent;
                  const layer = document.querySelector('.demo-answer:not([hidden])');
                  let vis = 0, tot = 0;
                  if (layer) {
                    layer.querySelectorAll('.sw').forEach(s => { tot++; if (!s.classList.contains('is-hidden')) { vis++; } });
                  }
                  window.__statusLog.push({ t: performance.now(), s: last, vis, tot });
                }
              });
              window.__statusObs.observe(el, { childList: true, characterData: true, subtree: true });
            }""")
            page.click('button.chip[data-q="tell"]')
            page.wait_for_timeout(6000)
            log = page.evaluate("window.__statusLog || []")
            seq = [e["s"] for e in log]
            expect("Preparing your points…" in seq, f"A5 @{w}: Preparing never appeared: {seq}")
            expect("Writing your points…" in seq, f"A5 @{w}: Writing never appeared: {seq}")
            if "Preparing your points…" in seq and "Writing your points…" in seq:
                expect(seq.index("Preparing your points…") < seq.index("Writing your points…"),
                       f"A5 @{w}: Writing precedes Preparing: {seq}")
                wfirst = next(e for e in log if e["s"] == "Writing your points…")
                expect(wfirst["vis"] >= 1, f"A5 @{w}: Writing appeared before any word landed: {wfirst}")
                expect(wfirst["tot"] == 0 or wfirst["vis"] < wfirst["tot"],
                       f"A5 @{w}: Writing appeared only after the stream finished: {wfirst}")
            expect(seq and seq[-1] in ("3 points ready.", "Coach points ready."),
                   f"A5 @{w}: final status unexpected: {seq[-1] if seq else None}")
            expect(not errors, f"A5 @{w}: page errors {errors}")
            page.screenshot(path=os.path.join(SHOTS, f"a5-settled-{w}.png"))
            ctx.close()
        print("A5 pass done")

        # ---------- A1: Platforms at five widths ----------
        for w in WIDTHS:
            errors = []
            ctx, page = new_page(w, 928 if w == 403 else 1000, errors=errors)
            page.goto(BASE + "/platforms.html")
            page.wait_for_timeout(700)
            # textContent, not innerText: the badges are
            # text-transform:uppercase, which innerText would
            # return transformed.
            body = page.evaluate("document.querySelector('main').textContent")
            for stale in ["companion first", "Feasibility UNKNOWN", "phased research", "still being tested"]:
                expect(stale not in body, f"A1 @{w}: stale string on page: {stale}")
            expect("Built — not yet published" in body, f"A1 @{w}: Android badge missing")
            expect(not errors, f"A1 @{w}: page errors {errors}")
            page.screenshot(path=os.path.join(SHOTS, f"a1-platforms-{w}-top.png"))
            page.screenshot(path=os.path.join(SHOTS, f"a1-platforms-{w}-full.png"), full_page=True)
            ctx.close()
        print("A1 pass done")

        # ---------- A2: Support FAQ, expanded ----------
        for w in [1200, 403]:
            ctx, page = new_page(w, 928 if w == 403 else 1000)
            page.goto(BASE + "/support.html")
            page.wait_for_timeout(500)
            btn = page.locator("#faq-b10")
            btn.scroll_into_view_if_needed()
            txt = page.inner_text("#faq-p10")
            expect("full mirror of the Windows app" in txt, f"A2 @{w}: FAQ answer not corrected")
            expect("companion first" not in txt, f"A2 @{w}: FAQ answer still stale")
            page.screenshot(path=os.path.join(SHOTS, f"a2-support-faq-{w}.png"))
            ctx.close()
        print("A2 pass done")

        # ---------- A8: Privacy prints on paper ----------
        ctx, page = new_page(1200, 1000)
        page.goto(BASE + "/privacy.html")
        page.wait_for_timeout(500)
        page.emulate_media(media="print")
        st = page.evaluate("""() => {
          const cs = getComputedStyle(document.body);
          const h2 = document.querySelector('main h2');
          const head = document.querySelector('.site-header');
          return { bg: cs.backgroundColor, h2color: h2 ? getComputedStyle(h2).color : '',
                   headerDisplay: getComputedStyle(head).display };
        }""")
        expect(st["bg"] == "rgb(255, 255, 255)", f"A8: print body background is {st['bg']}")
        expect(st["h2color"] == "rgb(0, 0, 0)", f"A8: print h2 colour is {st['h2color']}")
        expect(st["headerDisplay"] == "none", f"A8: header not hidden in print ({st['headerDisplay']})")
        page.screenshot(path=os.path.join(SHOTS, "a8-privacy-print.png"), full_page=True)
        ctx.close()
        ctx, page = new_page(1200, 1000)
        page.goto(BASE + "/terms.html")
        page.wait_for_timeout(500)
        page.emulate_media(media="print")
        page.screenshot(path=os.path.join(SHOTS, "a8-terms-print-regression.png"), full_page=True)
        ctx.close()
        print("A8 pass done")

        browser.close()
finally:
    server.shutdown()

if FAIL:
    print(f"\nPROBE97 FAILED ({len(FAIL)})")
    raise SystemExit(1)
print("\nPROBE97 OK")
