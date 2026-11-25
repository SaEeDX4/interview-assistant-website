#!/usr/bin/env python3
"""Step 95 probe — the Download page ("The release desk").

Serves the site locally, then at 1200 / 933 / 768 / 712 / 403 checks:
  - zero console errors, page errors and failed requests (the
    release-service host is excluded: the sandbox cannot always
    reach it, and the page's floor does not depend on it — the
    Step 94 precedent);
  - the honest static floor: status visible, live regions hidden,
    the help block's state line SHOWN (the live manifest is empty,
    so the module marks no-release on every path — fetch success
    with zero releases, or fetch failure, both land there);
  - the Step 41 contract in the live DOM: four cards in the fixed
    order, cards status-only (no link, no button), the disabled
    artifact pair, the badge per platform state;
  - the meanwhile band's two routes resolve to real files, as does
    every internal link on the page;
  - no horizontal overflow.
Then three state checks:
  - an Android user agent surfaces the detected-platform line;
  - JS disabled (403): the full static page, badges and routes live;
  - a fixture manifest (route-intercepted) renders the real release
    state end to end: live links, version + SHA on the card, What's
    new, All downloads, the post-click panel, and the help state
    line hidden again — the Step 41 machine on the new markup.
Screenshots for the five review passes go to
~/workspace/step95-download/shots/. Prints PROBE95 OK on success.
Run by tests/test-step95.js.
"""
import http.server, json, os, socketserver, threading, time
from playwright.sync_api import sync_playwright

PORT = "8995"
BASE = "http://127.0.0.1:" + PORT
ROOT = os.path.expanduser("~/workspace/interview-assistant-website/website")
SHOTS = os.path.expanduser("~/workspace/step95-download/shots")
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

SHA = "a" * 64
SHA2 = "b" * 64
FIXTURE = {"generatedAt": "2026-11-17T00:00:00Z", "releases": [{
    "platform": "windows", "version": "1.0.0", "channel": "stable",
    "publishedAt": "2026-11-17",
    "notes": "First signed release.\n\nPrepare, practise, go live.",
    "minRequirement": "Windows 10 or 11, 64-bit",
    "files": [
        {"kind": "installer", "name": "InterviewAssistant-Setup.exe",
         "label": "Download the installer",
         "url": "https://dl.example.test/win/setup.exe",
         "size": 48211302, "sha256": SHA},
        {"kind": "portable", "name": "InterviewAssistant-Portable.zip",
         "label": "Portable ZIP",
         "url": "https://dl.example.test/win/portable.zip",
         "size": 47185920, "sha256": SHA2}]}]}

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
                    if "admin.cybervalida.online" not in r.url else None)
            resp = page.goto(BASE + "/download.html", wait_until="networkidle")
            expect(resp.status == 200, f"{width}: download.html is 200 (got {resp.status})")
            page.wait_for_timeout(1200)
            g = page.evaluate("""() => {
              const q = s => document.querySelector(s);
              const vis = el => !!el && !el.hidden && getComputedStyle(el).display !== 'none';
              const cards = [...document.querySelectorAll('#dl-platforms .dl-card')];
              return {
                lead: q('.page-hero .lead').textContent,
                statusVis: vis(q('#dl-rec-status')),
                liveVis: vis(q('#dl-rec-live')),
                afterVis: vis(q('#dl-after')),
                whatsVis: vis(q('#dl-whatsnew')),
                allVis: vis(q('#dl-all')),
                helpStateVis: vis(q('#dl-help-state')),
                detectedVis: vis(q('#dl-rec-detected')),
                order: cards.map(c => c.getAttribute('data-platform')),
                cardActions: cards.map(c => c.querySelectorAll('a, button').length),
                badges: cards.map(c => { const b = c.querySelector('.badge');
                  return b ? b.className + '|' + b.textContent.trim() : ''; }),
                buttons: [...document.querySelectorAll('#dl-rec-actions button')]
                  .map(b => ({ id: b.id, disabled: b.disabled })),
                meanwhile: (() => { const m = q('.dlx-meanwhile'); if (!m) return null;
                  return { vis: vis(m),
                    links: [...m.querySelectorAll('a')].map(a => a.getAttribute('href')) }; })(),
                artifacts: document.querySelectorAll('.dlx-artifact').length,
                scrollW: document.documentElement.scrollWidth,
                clientW: document.documentElement.clientWidth,
                links: [...document.querySelectorAll('main a[href]')]
                  .map(a => a.getAttribute('href'))
              }; }""")
            expect("not published yet" in g["lead"],
                   f"{width}: hero lead carries the not-yet answer")
            expect(g["statusVis"] and not g["liveVis"] and not g["afterVis"]
                   and not g["whatsVis"] and not g["allVis"],
                   f"{width}: static floor — status shown, live regions hidden")
            expect(g["helpStateVis"],
                   f"{width}: help state line shown (empty manifest = no release)")
            expect(not g["detectedVis"],
                   f"{width}: detected line hidden for a non-mobile UA")
            expect(g["order"] == ["windows", "android", "ios", "mac"],
                   f"{width}: card order fixed (got {g['order']})")
            expect(all(n == 0 for n in g["cardActions"]),
                   f"{width}: cards are status-only (got {g['cardActions']})")
            expect(g["badges"][0].startswith("badge badge-now"),
                   f"{width}: Windows badge is First platform (got {g['badges'][0]!r})")
            expect(g["badges"][1].startswith("badge badge-current")
                   and "Built" in g["badges"][1],
                   f"{width}: Android badge is Built — not yet published (got {g['badges'][1]!r})")
            expect(g["badges"][2].startswith("badge badge-plan")
                   and g["badges"][3].startswith("badge badge-plan"),
                   f"{width}: iOS + Mac badges are Planned")
            expect(len(g["buttons"]) == 2
                   and all(b["disabled"] for b in g["buttons"])
                   and {b["id"] for b in g["buttons"]} == {"dl-installer", "dl-portable"},
                   f"{width}: the artifact pair is present and disabled (got {g['buttons']})")
            expect(g["artifacts"] == 2, f"{width}: two artifact spec rows (got {g['artifacts']})")
            expect(g["meanwhile"] and g["meanwhile"]["vis"]
                   and g["meanwhile"]["links"] == ["demo.html", "how-it-works.html"],
                   f"{width}: meanwhile band routes to demo then how-it-works (got {g['meanwhile']})")
            expect(g["scrollW"] <= g["clientW"],
                   f"{width}: no horizontal overflow ({g['scrollW']} <= {g['clientW']})")
            for href in g["links"]:
                if href.startswith(("http", "mailto:", "#")):
                    continue
                target = href.split("#")[0].split("?")[0]
                expect(os.path.exists(os.path.join(ROOT, target)),
                       f"{width}: route {href} resolves to a real file")
            expect(not errors, f"{width}: zero console/page errors (got {errors})")
            expect(not reqfail, f"{width}: zero failed requests (got {reqfail})")
            page.screenshot(path=os.path.join(SHOTS, f"pass-{width}-top.png"))
            page.screenshot(path=os.path.join(SHOTS, f"pass-{width}-full.png"), full_page=True)
            page.close()

        # Android UA: the detected line names the visitor's platform.
        ctx = browser.new_context(
            viewport={"width": 403, "height": 928},
            user_agent="Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/126 Mobile Safari/537.36")
        page = ctx.new_page()
        page.goto(BASE + "/download.html", wait_until="networkidle")
        page.wait_for_timeout(800)
        det = page.evaluate("""() => { const e = document.querySelector('#dl-rec-detected');
          return { hidden: e.hidden, text: e.textContent }; }""")
        expect(not det["hidden"] and det["text"].startswith("You are on Android."),
               f"android UA: detected line shown (got {det})")
        page.screenshot(path=os.path.join(SHOTS, "state-403-android-ua.png"))
        ctx.close()

        # JS disabled (403): the floor is the whole page.
        ctx = browser.new_context(viewport={"width": 403, "height": 928},
                                  java_script_enabled=False)
        page = ctx.new_page()
        page.goto(BASE + "/download.html", wait_until="load")
        nojs = page.evaluate("""() => ({
          status: document.querySelector('#dl-rec-status').textContent.includes('not yet published'),
          badges: document.querySelectorAll('#dl-platforms .badge').length,
          demo: !!document.querySelector('.dlx-meanwhile a[href="demo.html"]'),
          buttons: [...document.querySelectorAll('#dl-rec-actions button')].every(b => b.disabled) })""")
        expect(nojs["status"] and nojs["badges"] == 4 and nojs["demo"] and nojs["buttons"],
               f"no-JS: status, four badges, demo route, disabled pair (got {nojs})")
        page.screenshot(path=os.path.join(SHOTS, "state-403-nojs.png"))
        ctx.close()

        # Fixture manifest: the Step 41 machine renders a real release.
        page = browser.new_page(viewport={"width": 1200, "height": 900})
        page.route("**/manifest", lambda route: route.fulfill(
            status=200, content_type="application/json",
            body=json.dumps(FIXTURE)))
        page.goto(BASE + "/download.html", wait_until="networkidle")
        page.wait_for_timeout(1200)
        live = page.evaluate("""() => {
          const q = s => document.querySelector(s);
          const vis = el => !!el && !el.hidden && getComputedStyle(el).display !== 'none';
          const recLinks = [...document.querySelectorAll('#dl-rec-live a[data-dl-file]')];
          const winCard = document.querySelector('.dl-card[data-platform="windows"]');
          return {
            statusVis: vis(q('#dl-rec-status')),
            actionsVis: vis(q('#dl-rec-actions')),
            liveVis: vis(q('#dl-rec-live')),
            recHrefs: recLinks.map(a => a.getAttribute('href')),
            note: q('#download-note').textContent,
            cardLiveVis: vis(winCard.querySelector('.dl-card-live')),
            cardText: winCard.querySelector('.dl-card-live').textContent,
            cardStatusVis: vis(winCard.querySelector('.dl-card-status')),
            whatsVis: vis(q('#dl-whatsnew')),
            whatsTitle: q('#dl-whatsnew-title').textContent,
            allLinks: document.querySelectorAll('#dl-all-body a[data-dl-file]').length,
            helpStateVis: vis(q('#dl-help-state')),
            order: [...document.querySelectorAll('#dl-platforms .dl-card')]
              .map(c => c.getAttribute('data-platform'))
          }; }""")
        expect(live["liveVis"] and not live["statusVis"] and not live["actionsVis"],
               "live manifest: recommendation goes live, static status + buttons hide")
        expect(live["recHrefs"] == ["https://dl.example.test/win/setup.exe",
                                    "https://dl.example.test/win/portable.zip"],
               f"live manifest: real download links rendered (got {live['recHrefs']})")
        expect(live["note"].startswith("Published and signed."),
               "live manifest: the note flips to the published wording")
        expect(live["cardLiveVis"] and not live["cardStatusVis"]
               and "Version 1.0.0" in live["cardText"] and SHA in live["cardText"],
               "live manifest: Windows card carries version + SHA-256")
        expect(live["whatsVis"] and live["whatsTitle"] == "What’s new in 1.0.0",
               f"live manifest: What's new renders (got {live['whatsTitle']!r})")
        expect(live["allLinks"] == 2,
               f"live manifest: All downloads lists both files (got {live['allLinks']})")
        expect(not live["helpStateVis"],
               "live manifest: help state line hides again — it never claims a false state")
        expect(live["order"] == ["windows", "android", "ios", "mac"],
               f"live manifest: card order holds (got {live['order']})")
        # Neutralise the anchor's default action (a cross-origin
        # download link would navigate away); the app's delegated
        # document handler still receives the click and opens the
        # post-click panel — that handler is what is under test.
        # The synthetic event must be cancelable, or preventDefault
        # is a no-op and the browser follows the fixture URL.
        page.evaluate("""() => { document.addEventListener('click', e => {
          if (e.target.closest && e.target.closest('a[data-dl-file]')) {
            e.preventDefault();
          } }, true); }""")
        page.evaluate("""() => { const a = document.querySelector('#dl-rec-live a[data-dl-file]');
          a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); }""")
        page.wait_for_timeout(400)
        after = page.evaluate("""() => { const p = document.querySelector('#dl-after');
          return { hidden: p.hidden,
                   text: document.querySelector('#dl-after-text').textContent }; }""")
        expect(not after["hidden"] and "InterviewAssistant-Setup.exe" in after["text"],
               f"live manifest: post-click panel opens with the file name (got {after})")
        page.screenshot(path=os.path.join(SHOTS, "state-1200-live-release.png"))
        page.close()
        browser.close()
finally:
    server.shutdown()
    server.server_close()

if FAIL:
    print(f"PROBE95 FAILED: {len(FAIL)} expectation(s)")
    raise SystemExit(1)
print("PROBE95 OK")
