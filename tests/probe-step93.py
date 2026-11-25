#!/usr/bin/env python3
"""Step 93 probe — the final Terms page ("The Reading Room").

At 1200 (rail) and 933 / 768 / 712 / 403 (sticky contents bar):
  - zero console errors and zero page errors;
  - every one of the 15 contents links resolves, and clicking it
    lands its section at the composed scroll offset (100px desktop /
    148px under the bar — the sheet's 84px scroll-padding plus the
    section's own margin), or the document is at max scroll;
  - scrollspy tracks: the current link carries aria-current and,
    in bar mode, the current-section label names the section;
  - the progress hairline is 0 at the document's start, 1 at its
    end, and monotonic between;
  - the Contents disclosure opens/closes with aria-expanded in
    step, and a link click both closes it and navigates;
  - print emulation: white body, header/rail/footer hidden.
Screenshots for the five review passes go to
~/workspace/terms-redesign/shots/. Prints PROBE93 OK on success.
Run by tests/test-step93.js.
"""
import os, subprocess, sys, time
from playwright.sync_api import sync_playwright

PORT = "8993"
BASE = "http://127.0.0.1:" + PORT
ROOT = os.path.expanduser("~/workspace/interview-assistant-website/website")
SHOTS = os.path.expanduser("~/workspace/terms-redesign/shots")
os.makedirs(SHOTS, exist_ok=True)
FAIL = []

def expect(cond, msg):
    if not cond:
        FAIL.append(msg)
        print("  FAIL", msg)

server = subprocess.Popen(
    [sys.executable, "-m", "http.server", PORT, "--bind", "127.0.0.1"],
    cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.0)
try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        for width, mode in [(1200, "rail"), (933, "bar"), (768, "bar"),
                            (712, "bar"), (403, "bar")]:
            page = browser.new_page(viewport={"width": width, "height": 900})
            errors = []
            reqfail = []
            page.on("console", lambda m: errors.append(m.text)
                    if m.type == "error" and not m.text.startswith("Failed to load resource") else None)
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.on("requestfailed", lambda r: reqfail.append(r.url))
            page.goto(BASE + "/terms.html", wait_until="networkidle")
            margin = 100 if mode == "rail" else 148

            ids = page.evaluate("""() => [...document.querySelectorAll('.doc-toc a')]
                .map(a => a.getAttribute('href'))""")
            expect(len(ids) == 15, f"{width}: 15 contents links (got {len(ids)})")
            targets = page.evaluate("""() => [...document.querySelectorAll('.doc-sec')]
                .map(s => s.id)""")
            expect(targets == [h[1:] for h in ids],
                   f"{width}: every contents link resolves in order")

            if mode == "rail":
                vis = page.evaluate("""() => {
                  const card = document.querySelector('.doc-rail-card');
                  const r = document.querySelector('.doc-rail').getBoundingClientRect();
                  return { card: getComputedStyle(card).display !== 'none', railTop: r.top };
                }""")
                expect(vis["card"], "1200: rail support card visible")
                page.evaluate("window.scrollTo(0, 1500)")
                page.wait_for_timeout(250)
                top2 = page.evaluate("document.querySelector('.doc-rail').getBoundingClientRect().top")
                expect(abs(top2 - 100) <= 2, f"1200: rail sticks at 100 (got {top2})")
                page.evaluate("window.scrollTo(0, 0)")
                page.wait_for_timeout(200)
            else:
                vis = page.evaluate("""() => {
                  const card = document.querySelector('.doc-rail-card');
                  const cur = document.querySelector('.doc-rail-current');
                  return { card: getComputedStyle(card).display,
                           cur: getComputedStyle(cur).display };
                }""")
                expect(vis["card"] == "none", f"{width}: rail card hidden in bar mode")
                expect(vis["cur"] != "none", f"{width}: current-section label visible in bar mode")
                # disclosure: open, verify, close via link click
                page.click("#doc-toc-toggle")
                page.wait_for_timeout(450)
                opened = page.evaluate("""() => ({
                  exp: document.getElementById('doc-toc-toggle').getAttribute('aria-expanded'),
                  h: document.getElementById('doc-toc-nav').getBoundingClientRect().height })""")
                expect(opened["exp"] == "true" and opened["h"] > 200,
                       f"{width}: Contents opens (expanded={opened['exp']}, h={opened['h']})")
                page.click(".doc-toc a[href='#s5']")
                page.wait_for_timeout(600)
                closed = page.evaluate("""() =>
                  document.getElementById('doc-toc-toggle').getAttribute('aria-expanded')""")
                expect(closed == "false", f"{width}: link click closes the Contents panel")

            # anchor landings (reopen per click in bar mode)
            for hid in ["#s1", "#s3", "#s7", "#s11", "#s15"]:
                if mode == "bar":
                    page.click("#doc-toc-toggle")
                    page.wait_for_timeout(400)
                page.click(f".doc-toc a[href='{hid}']")
                for _ in range(30):
                    page.wait_for_timeout(120)
                    got = page.evaluate("""(id) => {
                      const r = document.querySelector(id).getBoundingClientRect();
                      const maxed = window.scrollY + window.innerHeight >=
                        document.documentElement.scrollHeight - 2;
                      return { top: r.top, maxed };
                    }""", hid)
                    if abs(got["top"] - margin) <= 3 or got["maxed"]:
                        break
                expect(abs(got["top"] - margin) <= 3 or got["maxed"],
                       f"{width}: {hid} lands at {margin} (got {got['top']:.1f}, maxed={got['maxed']})")

            # scrollspy + progress across the document
            samples = page.evaluate("""() => {
              const art = document.getElementById('doc-article');
              const y = window.scrollY;
              const aTop = art.getBoundingClientRect().top + y;
              return { aTop, aH: art.offsetHeight, doc: document.documentElement.scrollHeight };
            }""")
            fracs = []
            for f in [0.0, 0.25, 0.5, 0.75, 1.0]:
                ty = samples["aTop"] - 120 + f * max(samples["aH"] - 900, 1)
                page.evaluate("(t) => window.scrollTo({top: t, behavior: 'instant'})", ty)
                page.wait_for_timeout(160)
                fracs.append(page.evaluate("""() => {
                  const el = document.getElementById('doc-progress-fill');
                  const m = /scaleX\\(([\\d.]+)\\)/.exec(el.style.transform || '');
                  return m ? parseFloat(m[1]) : -1;
                }"""))
            expect(fracs[0] <= 0.02, f"{width}: progress ~0 at start (got {fracs[0]})")
            expect(all(fracs[i] <= fracs[i + 1] + 0.001 for i in range(4)),
                   f"{width}: progress monotonic {fracs}")
            page.evaluate("window.scrollTo(0, document.documentElement.scrollHeight)")
            page.wait_for_timeout(200)
            fend = page.evaluate("""() => {
              const el = document.getElementById('doc-progress-fill');
              const m = /scaleX\\(([\\d.]+)\\)/.exec(el.style.transform || '');
              return m ? parseFloat(m[1]) : -1;
            }""")
            expect(abs(fend - 1) <= 0.002, f"{width}: progress exactly 1 at end (got {fend})")

            for sid, label in [("s5", "5 · Payment, cancellation, and refunds"),
                               ("s13", "13 · Dispute resolution")]:
                page.evaluate("""(id) => {
                  const s = document.getElementById(id);
                  const top = s.getBoundingClientRect().top + window.scrollY;
                  window.scrollTo({top: top - 100, behavior: 'instant'});
                }""", sid)
                page.wait_for_timeout(200)
                spy = page.evaluate("""() => ({
                  cur: document.querySelector('.doc-toc a[aria-current="true"]')?.getAttribute('href'),
                  label: document.getElementById('doc-current').textContent })""")
                expect(spy["cur"] == "#" + sid, f"{width}: scrollspy marks {sid} (got {spy['cur']})")
                if mode == "bar":
                    expect(spy["label"] == label, f"{width}: bar label names {sid} (got {spy['label']!r})")

            expect(not errors, f"{width}: zero console/page errors (got {errors[:3]})")
            local_fail = [u for u in reqfail if u.startswith(BASE)]
            expect(not local_fail, f"{width}: zero local resource failures (got {local_fail[:3]})")
            ext_fail = [u for u in reqfail if not u.startswith(BASE)]
            if ext_fail:
                print(f"  note {width}: external requests unreachable from sandbox (environmental): {ext_fail[:2]}")

            page.evaluate("window.scrollTo(0, 0)")
            page.wait_for_timeout(250)
            page.screenshot(path=os.path.join(SHOTS, f"pass-{width}-top.png"))
            page.screenshot(path=os.path.join(SHOTS, f"pass-{width}-full.png"), full_page=True)
            page.close()

        # reduced motion: behaviour intact, no errors
        page = browser.new_page(viewport={"width": 768, "height": 900},
                                reduced_motion="reduce")
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(BASE + "/terms.html", wait_until="networkidle")
        page.click("#doc-toc-toggle")
        page.wait_for_timeout(120)
        exp = page.evaluate("document.getElementById('doc-toc-toggle').getAttribute('aria-expanded')")
        expect(exp == "true", "reduced motion: Contents still opens")
        expect(not errors, f"reduced motion: zero page errors (got {errors[:2]})")
        page.close()

        # print rendering
        page = browser.new_page(viewport={"width": 1200, "height": 900})
        page.goto(BASE + "/terms.html", wait_until="networkidle")
        page.emulate_media(media="print")
        page.wait_for_timeout(200)
        pr = page.evaluate("""() => ({
          bg: getComputedStyle(document.body).backgroundColor,
          header: getComputedStyle(document.querySelector('.site-header')).display,
          rail: getComputedStyle(document.querySelector('.doc-rail')).display,
          footer: getComputedStyle(document.querySelector('.site-footer')).display,
          h2: getComputedStyle(document.querySelector('.doc-sec h2')).color })""")
        expect(pr["bg"] == "rgb(255, 255, 255)", f"print: white body (got {pr['bg']})")
        expect(pr["header"] == "none" and pr["rail"] == "none" and pr["footer"] == "none",
               f"print: chrome hidden (got {pr})")
        expect(pr["h2"] == "rgb(0, 0, 0)", f"print: black headings (got {pr['h2']})")
        page.screenshot(path=os.path.join(SHOTS, "print-1200.png"), full_page=True)
        page.close()
        browser.close()
finally:
    server.terminate()

if FAIL:
    print(f"PROBE93 FAILED ({len(FAIL)})")
    sys.exit(1)
print("PROBE93 OK")
