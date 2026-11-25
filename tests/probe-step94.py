#!/usr/bin/env python3
"""Step 94 probe — the 404 page ("The app answers its own 404").

Serves the site with a GitHub-Pages-style handler (any unmatched
path returns 404.html with a 404 status, exactly as production
does), then at 1200 / 933 / 768 / 712 / 403 checks:
  - zero console errors, page errors and failed requests;
  - exactly one app window, QUESTION card above ANSWER card, the
    answer card hugging its three points (no 240px live-stage
    reservation in this context);
  - no horizontal overflow;
  - every route the page offers resolves to a real file;
  - the settled state is the floor: JS off and reduced motion both
    show the full answer immediately, dots never shown;
  - with motion allowed, the beat plays: dots visible inside the
    400ms Step 86 budget, points hidden, then all points landed;
  - the question names the address actually asked for;
  - on a nested bogus path the deep-path repair lands: the sheet
    applies (window radius 14px) and the answer links resolve to
    the site root.
Screenshots for the five review passes go to
~/workspace/step94-404/shots/. Prints PROBE94 OK on success.
Run by tests/test-step94.js.
"""
import http.server, os, socketserver, subprocess, sys, threading, time
from playwright.sync_api import sync_playwright

PORT = "8996"
BASE = "http://127.0.0.1:" + PORT
ROOT = os.path.expanduser("~/workspace/interview-assistant-website/website")
SHOTS = os.path.expanduser("~/workspace/step94-404/shots")
os.makedirs(SHOTS, exist_ok=True)
FAIL = []

def expect(cond, msg):
    if not cond:
        FAIL.append(msg)
        print("  FAIL", msg)

class PagesHandler(http.server.SimpleHTTPRequestHandler):
    def send_error(self, code, message=None, explain=None):
        if code == 404:
            body = open(os.path.join(ROOT, "404.html"), "rb").read()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            super().send_error(code, message, explain)
    def log_message(self, *a):
        pass

os.chdir(ROOT)
socketserver.TCPServer.allow_reuse_address = True
server = socketserver.TCPServer(("127.0.0.1", int(PORT)), PagesHandler)
threading.Thread(target=server.serve_forever, daemon=True).start()
time.sleep(0.5)
try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        for width in [1200, 933, 768, 712, 403]:
            height = 928 if width == 403 else 900
            page = browser.new_page(viewport={"width": width, "height": height})
            errors, reqfail = [], []
            page.on("console", lambda m: errors.append(m.text)
                    if m.type == "error" and not m.text.startswith("Failed to load resource") else None)
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.on("requestfailed", lambda r: reqfail.append(r.url)
                    # app.js's growth-bar fetch targets the release
                    # service, which the sandbox cannot reach; it
                    # fires identically on every page, including the
                    # pre-Step-94 404 — not a page defect.
                    if "admin.cybervalida.online" not in r.url else None)
            resp = page.goto(BASE + "/404.html", wait_until="networkidle")
            expect(resp.status == 200, f"{width}: direct /404.html visit is 200 (got {resp.status})")
            page.wait_for_timeout(1500)  # the beat settles
            g = page.evaluate("""() => {
              const q = s => document.querySelector(s);
              const r = el => { const b = el.getBoundingClientRect();
                return {top: b.top, bottom: b.bottom, left: b.left, right: b.right, height: b.height}; };
              const win = q('.nf-window');
              const qc = win.querySelector('.app-card');
              const ac = win.querySelector('.app-card--answer');
              const lis = [...win.querySelectorAll('#nf-points li')];
              const links = [...document.querySelectorAll('#nf-points a, .nf-more a')]
                .map(a => a.getAttribute('href'));
              return {
                windows: document.querySelectorAll('.app-window').length,
                win: r(win), qc: r(qc), ac: r(ac),
                lastLi: r(lis[lis.length - 1]),
                question: q('#nf-question').textContent.trim(),
                dotsVis: getComputedStyle(q('#nf-thinking')).visibility,
                pointsVis: lis.map(li => getComputedStyle(li).visibility),
                scrollW: document.documentElement.scrollWidth,
                clientW: document.documentElement.clientWidth,
                links: links,
                radius: getComputedStyle(win).borderRadius
              }; }""")
            expect(g["windows"] == 1, f"{width}: exactly one app window (got {g['windows']})")
            expect(g["qc"]["top"] < g["ac"]["top"], f"{width}: QUESTION card above ANSWER card")
            expect(abs(g["ac"]["bottom"] - g["lastLi"]["bottom"] - 16) <= 2.5,
                   f"{width}: answer card hugs its points (slack {g['ac']['bottom'] - g['lastLi']['bottom']:.1f}px, want 16)")
            if width >= 712:
                # At 403 the three points wrap to ~9 lines and the
                # natural card legitimately exceeds 240px; the hug
                # slack above is the invariant there.
                expect(g["ac"]["height"] < 240, f"{width}: no live-stage reservation (card {g['ac']['height']:.0f}px < 240)")
            expect(g["scrollW"] <= g["clientW"], f"{width}: no horizontal overflow ({g['scrollW']} <= {g['clientW']})")
            expect(g["question"] == "Where is this page?",
                   f"{width}: direct visit keeps the generic question (got {g['question']!r})")
            expect(g["dotsVis"] == "hidden", f"{width}: dots hidden once settled")
            expect(all(v == "visible" for v in g["pointsVis"]), f"{width}: all points visible once settled")
            expect(g["radius"] == "14px", f"{width}: window radius is the app's 14px (got {g['radius']})")
            for href in g["links"]:
                expect(os.path.exists(os.path.join(ROOT, href.split("#")[0])),
                       f"{width}: route {href} resolves to a real file")
            expect(not errors, f"{width}: zero console/page errors (got {errors})")
            expect(not reqfail, f"{width}: zero failed requests (got {reqfail})")
            page.screenshot(path=os.path.join(SHOTS, f"pass-{width}-top.png"))
            page.screenshot(path=os.path.join(SHOTS, f"pass-{width}-full.png"), full_page=True)
            page.close()

        # The beat, mid-flight (768): dots inside the budget, points held.
        page = browser.new_page(viewport={"width": 768, "height": 900})
        resp = page.goto(BASE + "/probe-missing", wait_until="load")
        expect(resp.status == 404, f"beat: bogus top-level path returns 404 (got {resp.status})")
        page.wait_for_timeout(180)
        mid = page.evaluate("""() => ({
          dots: getComputedStyle(document.querySelector('#nf-thinking')).visibility,
          points: [...document.querySelectorAll('#nf-points li')].map(li => getComputedStyle(li).visibility),
          question: document.querySelector('#nf-question').textContent.trim() })""")
        expect(mid["dots"] == "visible", f"beat: thinking dots visible at ~180ms (got {mid['dots']})")
        expect(all(v == "hidden" for v in mid["points"]), "beat: points held while the dots show")
        expect(mid["question"] == "Where is /probe-missing?",
               f"beat: the question names the asked address (got {mid['question']!r})")
        page.screenshot(path=os.path.join(SHOTS, "beat-768-mid.png"))
        page.wait_for_timeout(1400)
        done = page.evaluate("""() => ({
          dots: getComputedStyle(document.querySelector('#nf-thinking')).visibility,
          points: [...document.querySelectorAll('#nf-points li')].map(li => getComputedStyle(li).visibility) })""")
        expect(done["dots"] == "hidden" and all(v == "visible" for v in done["points"]),
               "beat: settled — dots gone, all points landed")
        page.close()

        # Reduced motion (403): the settled answer, immediately.
        ctx = browser.new_context(viewport={"width": 403, "height": 928}, reduced_motion="reduce")
        page = ctx.new_page()
        page.goto(BASE + "/404.html", wait_until="load")
        page.wait_for_timeout(180)
        rm = page.evaluate("""() => ({
          dots: getComputedStyle(document.querySelector('#nf-thinking')).visibility,
          points: [...document.querySelectorAll('#nf-points li')].map(li => getComputedStyle(li).visibility) })""")
        expect(rm["dots"] == "hidden" and all(v == "visible" for v in rm["points"]),
               "reduced motion: settled answer at once, dots never shown")
        page.screenshot(path=os.path.join(SHOTS, "state-403-reduced-motion.png"))
        ctx.close()

        # JS disabled (403): the floor — everything present, links live.
        ctx = browser.new_context(viewport={"width": 403, "height": 928}, java_script_enabled=False)
        page = ctx.new_page()
        page.goto(BASE + "/404.html", wait_until="load")
        nojs = page.evaluate("""() => ({
          points: document.querySelectorAll('#nf-points li').length,
          links: [...document.querySelectorAll('#nf-points a')].map(a => a.getAttribute('href')) })""")
        expect(nojs["points"] == 3 and nojs["links"] == ["index.html", "demo.html", "support.html"],
               f"no-JS: three points with the three routes (got {nojs})")
        page.screenshot(path=os.path.join(SHOTS, "state-403-nojs.png"))
        ctx.close()

        # Nested bogus path (768): served 404 + the deep-path repair lands.
        page = browser.new_page(viewport={"width": 768, "height": 900})
        resp = page.goto(BASE + "/some/deep/bogus/path", wait_until="networkidle")
        expect(resp.status == 404, f"nested: status 404 (got {resp.status})")
        page.wait_for_timeout(600)
        deep = page.evaluate("""() => {
          const win = document.querySelector('.nf-window');
          const a = document.querySelector('#nf-points a');
          return { radius: getComputedStyle(win).borderRadius,
                   firstRoute: new URL(a.href).pathname,
                   question: document.querySelector('#nf-question').textContent.trim() }; }""")
        expect(deep["radius"] == "14px",
               f"nested: stylesheet applied after repair (radius {deep['radius']})")
        expect(deep["firstRoute"] == "/index.html",
               f"nested: first route resolves to the site root (got {deep['firstRoute']})")
        expect(deep["question"] == "Where is /some/deep/bogus/path?",
               f"nested: question names the full asked path (got {deep['question']!r})")
        page.screenshot(path=os.path.join(SHOTS, "state-768-nested-path.png"))
        page.close()
        browser.close()
finally:
    server.shutdown()
    server.server_close()

if FAIL:
    print(f"PROBE94 FAILED: {len(FAIL)} expectation(s)")
    sys.exit(1)
print("PROBE94 OK")
