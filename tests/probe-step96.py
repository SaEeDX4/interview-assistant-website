#!/usr/bin/env python3
"""Step 96 probe — the Pricing page ("The plan ledger").

Serves the site locally, then at 1200 / 933 / 768 / 712 / 403 checks:
  - zero console errors, page errors and failed requests (the
    release-service host is excluded: the sandbox cannot always
    reach it, and the page does not depend on it — the Step 94/95
    precedent);
  - the hero state line: checkout is not open, stated up top;
  - the two plan cards: Trial $0 with its real limits; Pro carrying
    $19.99 with the reference-price label inside the price block;
  - no buy-shaped control anywhere (no Buy / Subscribe / Checkout /
    Upgrade / Get Pro text on any link or button in <main>);
  - the comparison table: 9 rows, every data-label equal to its
    column header;
  - the finder (4 fieldsets, the Step 2 field names) and the
    calculator present; the FAQ at 5 items; the stale strings gone
    ("draft Terms", "Concurrent live sessions", "heartbeat");
  - every internal link in <main> resolves to a real file;
  - no horizontal overflow.
Then the behaviour states:
  - the finder driven to both verdicts (Trial fits / Pro fits, the
    Pro verdict carrying the sandbox label in its own text);
  - the calculator at 4 x 45 = 180 minutes (Trial covers about 4
    interviews; Pro covers with 420 to spare);
  - the FAQ accordion toggling;
  - JS disabled (403): cards, table, state line, noscript lines;
  - reduced motion (403): the page complete, nothing motion-gated.
Screenshots for the five review passes go to
~/workspace/step96-pricing/shots/. Prints PROBE96 OK on success.
Run by tests/test-step96.js.
"""
import http.server, os, socketserver, threading, time
from playwright.sync_api import sync_playwright

PORT = "8996"
BASE = "http://127.0.0.1:" + PORT
ROOT = os.path.expanduser("~/workspace/interview-assistant-website/website")
SHOTS = os.path.expanduser("~/workspace/step96-pricing/shots")
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
            resp = page.goto(BASE + "/pricing.html", wait_until="networkidle")
            expect(resp.status == 200, f"{width}: pricing.html is 200 (got {resp.status})")
            page.wait_for_timeout(800)
            g = page.evaluate("""() => {
              const q = s => document.querySelector(s);
              const qa = s => [...document.querySelectorAll(s)];
              const cards = qa('.prx-plan');
              const heads = qa('table.compare thead th').map(t => t.textContent.trim());
              const rows = qa('table.compare tbody tr');
              const labelOk = rows.every(r => {
                const cells = [...r.querySelectorAll('td')];
                return cells.length === heads.length &&
                  cells.slice(1).every((c, i) => c.getAttribute('data-label') === heads[i + 1]);
              });
              const buyWords = qa('main a, main button')
                .map(e => e.textContent.trim())
                .filter(t => /buy|subscribe|checkout|upgrade|get pro/i.test(t));
              const mainText = q('main').textContent;
              return {
                state: q('.prx-state') ? q('.prx-state').textContent : '',
                cards: cards.map(c => c.textContent),
                cardLinks: cards.map(c => [...c.querySelectorAll('a')].map(a => a.getAttribute('href'))),
                heads, rowCount: rows.length, labelOk,
                buyWords,
                faq: qa('.acc-item').length,
                fieldsets: qa('#plan-finder fieldset').length,
                fieldNames: qa('#plan-finder input').map(i => i.name),
                calc: !!q('#calc-interviews') && !!q('#calc-minutes') && !!q('#calc-result'),
                staleDraft: mainText.includes('draft Terms'),
                staleConcurrent: mainText.includes('Concurrent live sessions'),
                staleHeartbeat: mainText.toLowerCase().includes('heartbeat'),
                refunds14: mainText.includes('14 days of your first Pro payment'),
                scrollW: document.documentElement.scrollWidth,
                clientW: document.documentElement.clientWidth,
                links: qa('main a[href]').map(a => a.getAttribute('href'))
              }; }""")
            expect("Paid checkout is not open yet" in g["state"],
                   f"{width}: hero state line says checkout is not open")
            expect(len(g["cards"]) == 2, f"{width}: two plan cards (got {len(g['cards'])})")
            if len(g["cards"]) == 2:
                expect("$0" in g["cards"][0] and "30 live minutes" in g["cards"][0],
                       f"{width}: Trial card carries $0 and the 30 lifetime minutes")
                expect("$19.99" in g["cards"][1] and "Reference price" in g["cards"][1]
                       and "not confirmed for launch" in g["cards"][1],
                       f"{width}: Pro card carries the figure WITH its reference label")
                expect("600 live minutes" in g["cards"][1],
                       f"{width}: Pro card carries the 600 minutes")
            expect(g["cardLinks"] == [["demo.html"], ["download.html"]],
                   f"{width}: card CTAs are the honest routes (got {g['cardLinks']})")
            expect(g["rowCount"] == 9 and g["labelOk"],
                   f"{width}: compare table 9 rows, data-labels == headers (rows={g['rowCount']}, ok={g['labelOk']})")
            expect(not g["buyWords"],
                   f"{width}: no buy-shaped control (got {g['buyWords']})")
            expect(g["faq"] == 5, f"{width}: FAQ has 5 items (got {g['faq']})")
            expect(g["fieldsets"] == 4
                   and set(g["fieldNames"]) == {"pf-interviews", "pf-profiles", "pf-devices", "pf-prep"},
                   f"{width}: finder contract intact (got {g['fieldsets']}, {sorted(set(g['fieldNames']))})")
            expect(g["calc"], f"{width}: calculator contract present")
            expect(not g["staleDraft"] and not g["staleConcurrent"] and not g["staleHeartbeat"],
                   f"{width}: stale strings gone (draft={g['staleDraft']}, concurrent={g['staleConcurrent']}, heartbeat={g['staleHeartbeat']})")
            expect(g["refunds14"], f"{width}: Terms §5 first-payment refund stated")
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

        # Behaviour: finder verdicts, calculator maths, FAQ toggle.
        page = browser.new_page(viewport={"width": 1200, "height": 900})
        page.goto(BASE + "/pricing.html", wait_until="networkidle")
        page.wait_for_timeout(600)
        for name, value in [("pf-interviews", "0-1"), ("pf-profiles", "1"),
                            ("pf-devices", "1"), ("pf-prep", "0-2")]:
            page.check(f'input[name="{name}"][value="{value}"]')
        page.wait_for_timeout(200)
        trial = page.evaluate("() => document.querySelector('#finder-result').textContent")
        expect("Trial fits you" in trial,
               f"finder: light answers recommend Trial (got {trial[:80]!r})")
        for name, value in [("pf-interviews", "5+"), ("pf-profiles", "2-3"),
                            ("pf-devices", "2"), ("pf-prep", "3-20")]:
            page.check(f'input[name="{name}"][value="{value}"]')
        page.wait_for_timeout(200)
        pro = page.evaluate("() => document.querySelector('#finder-result').textContent")
        expect("Pro fits you" in pro and "sandbox reference" in pro,
               "finder: heavy answers recommend Pro, with the sandbox label in the verdict")
        calc = page.evaluate("""() => {
          const set = (id, v) => { const e = document.querySelector(id);
            e.value = String(v); e.dispatchEvent(new Event('input', { bubbles: true })); };
          set('#calc-interviews', 4); set('#calc-minutes', 45);
          return document.querySelector('#calc-result').textContent; }""")
        expect("180 live minutes" in calc and "420 minutes to spare" in calc,
               f"calculator: 4 x 45 = 180, Pro covers with 420 spare (got {calc[:120]!r})")
        before = page.get_attribute("#faq-pb1", "aria-expanded")
        page.click("#faq-pb1")
        page.wait_for_timeout(200)
        after = page.get_attribute("#faq-pb1", "aria-expanded")
        expect(before != after, f"faq: accordion toggles (aria-expanded {before} -> {after})")
        page.screenshot(path=os.path.join(SHOTS, "state-1200-behaviour.png"))
        page.close()

        # JS disabled (403): the floor is the whole page.
        ctx = browser.new_context(viewport={"width": 403, "height": 928},
                                  java_script_enabled=False)
        page = ctx.new_page()
        page.goto(BASE + "/pricing.html", wait_until="load")
        nojs = page.evaluate("""() => ({
          cards: document.querySelectorAll('.prx-plan').length,
          state: document.querySelector('.prx-state').textContent.includes('not open yet'),
          rows: document.querySelectorAll('table.compare tbody tr').length,
          noscript: document.body.textContent.includes('The plan finder needs JavaScript') })""")
        expect(nojs["cards"] == 2 and nojs["state"] and nojs["rows"] == 9 and nojs["noscript"],
               f"no-JS: cards, state line, 9 table rows, noscript notes (got {nojs})")
        page.screenshot(path=os.path.join(SHOTS, "state-403-nojs.png"))
        ctx.close()

        # Reduced motion (403): nothing on the page is motion-gated.
        ctx = browser.new_context(viewport={"width": 403, "height": 928},
                                  reduced_motion="reduce")
        page = ctx.new_page()
        page.goto(BASE + "/pricing.html", wait_until="networkidle")
        page.wait_for_timeout(600)
        rm = page.evaluate("""() => ({
          cards: document.querySelectorAll('.prx-plan').length,
          state: document.querySelector('.prx-state').textContent.includes('not open yet') })""")
        expect(rm["cards"] == 2 and rm["state"],
               f"reduced-motion: page complete (got {rm})")
        page.screenshot(path=os.path.join(SHOTS, "state-403-reduced-motion.png"))
        ctx.close()
        browser.close()
finally:
    server.shutdown()
    server.server_close()

if FAIL:
    print(f"PROBE96 FAILED: {len(FAIL)} expectation(s)")
    raise SystemExit(1)
print("PROBE96 OK")
