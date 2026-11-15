"""Step 19 — full final review of the Interview Assistant website.
Runs in order:
  A. Every test suite (test-step6..18) — all must pass.
  B. Link audit — every internal href/src resolves; every #anchor exists.
  C. Content audit — key numbers consistent; no TODO/lorem/coming-soon.
  D. Multi-size renders — all 11 pages at 390px + index at 320/768/900/1024/1025/1280,
     each exactly viewport-wide (Microlink, ?v=step19 cache-buster).
     900px is the worst header-overflow width found by the review; 1025px is
     the smallest viewport with the desktop nav after the fix.
  E. PageSpeed Insights (mobile, home page) — scores + vitals, best effort.
Writes tests/step19-report.json and prints a summary.
Exit code: 0 only if A+B+C pass; D/E problems are reported as failures too
(except PSI unavailable, which is a warning).
Run: python3 tests/review19.py (takes several minutes; run in background).
"""
import json, os, re, subprocess, sys, time, urllib.parse, urllib.request, urllib.error
from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(ROOT, "..", "website")
BASE = "https://saeedx4.github.io/interview-assistant-website"
CAP = os.path.join(ROOT, "step19-captures")
os.makedirs(CAP, exist_ok=True)

report = {"failures": [], "warnings": [], "suites": {}, "links": {},
          "content": {}, "captures": {}, "pagespeed": {}}


def fail(msg):
    report["failures"].append(msg)
    print("FAIL", msg, flush=True)


def warn(msg):
    report["warnings"].append(msg)
    print("WARN", msg, flush=True)


# ---- A. All test suites ----
print("== A. test suites ==", flush=True)
for n in range(6, 19):
    p = subprocess.run(["node", f"tests/test-step{n}.js"], cwd=os.path.join(ROOT, ".."),
                       capture_output=True, text=True, timeout=120)
    tail = (p.stdout.strip().splitlines() or [""]) [-1]
    m = re.search(r"(\d+) passed, (\d+) failed", tail)
    passed, failed = (int(m.group(1)), int(m.group(2))) if m else (0, -1)
    report["suites"][f"step{n}"] = {"passed": passed, "failed": failed}
    print(f"  step{n}: {passed} passed, {failed} failed", flush=True)
    if failed != 0 or p.returncode != 0:
        fail(f"test-step{n}.js: {failed} failed (rc={p.returncode})")

# ---- B. Link audit ----
print("== B. link audit ==", flush=True)
pages = sorted(f for f in os.listdir(SITE) if f.endswith(".html"))
ids = {}
for f in pages:
    html = open(os.path.join(SITE, f), encoding="utf-8").read()
    ids[f] = set(re.findall(r'id="([^"]+)"', html))

broken, missing_anchor, external = [], [], []
for f in pages:
    html = open(os.path.join(SITE, f), encoding="utf-8").read()
    refs = set(re.findall(r'(?:href|src)="([^"]+)"', html))
    for ref in refs:
        if ref.startswith(("http://", "https://", "mailto:", "tel:")):
            if ref.startswith("http"):
                external.append(ref)
            continue
        target, _, anchor = ref.partition("#")
        target_file = target if target else f
        if target_file and not os.path.exists(os.path.join(SITE, target_file)):
            broken.append(f"{f} -> {ref}")
        elif anchor and anchor not in ids.get(target_file, set()):
            missing_anchor.append(f"{f} -> {ref}")
report["links"] = {"pages": len(pages), "broken": broken,
                   "missing_anchors": missing_anchor,
                   "external": sorted(set(external))}
print(f"  {len(pages)} pages, {len(broken)} broken, {len(missing_anchor)} missing anchors",
      flush=True)
if broken:
    fail(f"broken internal links: {broken[:5]}")
if missing_anchor:
    fail(f"missing anchors: {missing_anchor[:5]}")
# 404 page: direct request serves the file (200 is correct); a missing path must 404 with the 404 page
try:
    req404 = urllib.request.Request(BASE + "/404.html",
                                    headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req404, timeout=30) as r:
        body404 = r.read().decode("utf-8", "replace")
        ok404 = "Page not found" in body404 and "googleapis.com" not in body404
        print(f"  live 404.html direct: HTTP {r.status}, content ok: {ok404}", flush=True)
        if not ok404:
            fail("live 404.html content check failed")
except Exception as e:
    warn(f"live 404.html direct fetch failed: {e}")
try:
    reqm = urllib.request.Request(BASE + "/no-such-page-xyz",
                                  headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(reqm, timeout=30) as r:
        warn("live missing path returned 200 (expected 404)")
except urllib.error.HTTPError as e:
    bodym = e.read().decode("utf-8", "replace")
    okm = e.code == 404 and "Page not found" in bodym
    print(f"  live missing path: HTTP {e.code}, serves 404 page: {okm}", flush=True)
    if not okm:
        fail("live missing path does not serve the 404 page")
except Exception as e:
    warn(f"live missing-path fetch failed: {e}")

for url in sorted(set(external)):
    try:
        req = urllib.request.Request(url, method="HEAD",
                                     headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as r:
            print(f"  external {r.status} {url}", flush=True)
            if r.status >= 400:
                warn(f"external link {r.status}: {url}")
    except Exception as e:
        warn(f"external link unreachable ({e}): {url}")

# ---- C. Content audit ----
print("== C. content audit ==", flush=True)
all_html = "\n".join(open(os.path.join(SITE, f), encoding="utf-8").read() for f in pages)
css = open(os.path.join(SITE, "styles.css"), encoding="utf-8").read()
checks = {
    "Pro price $19.99 present": "$19.99" in all_html,
    "no other dollar price": len(set(re.findall(r"\$\d+\.\d{2}", all_html))) == 1,
    "trial 30 minutes present": "30 live minutes" in all_html or "30-minute" in all_html,
    "600 Pro minutes present": "600" in all_html,
    "50-150 question bank present": bool(re.search(r"50[–-]150", all_html)),
    "10 languages present": "10 languages" in all_html,
    "no TODO/FIXME": not re.search(r"TODO|FIXME", all_html + css, re.I),
    "no lorem ipsum": "lorem" not in (all_html + css).lower(),
    "no 'coming soon' promise": "coming soon" not in all_html.lower(),
    "no google fonts reference": "googleapis.com" not in all_html and "gstatic.com" not in all_html,
    "no american 'organize/behavior'": not re.search(r"organiz\w*|behavior|customiz\w*", all_html, re.I),
}
report["content"] = checks
for name, ok in checks.items():
    print(f"  {'ok' if ok else 'BAD'} {name}", flush=True)
    if not ok:
        fail(f"content check failed: {name}")

# ---- D. Multi-size renders ----
print("== D. multi-size renders ==", flush=True)


def capture(page, width, name):
    url = BASE + "/" + page + "?v=step19"
    q = ("https://api.microlink.io/?url=" + urllib.parse.quote(url, safe="")
         + f"&screenshot=true&viewport.width={width}&viewport.height=844"
         + "&fullPage=true&screenshot.fullPage=true")
    data = None
    for attempt in (1, 2):
        try:
            req = urllib.request.Request(q, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=240) as r:
                data = r.read()
            if data[:8] != b"\x89PNG\r\n\x1a\n" and data[:3] != b"\xff\xd8\xff":
                # Microlink may return its JSON envelope with a screenshot URL
                j = json.loads(data.decode("utf-8"))
                shot = j["data"]["screenshot"]["url"]
                req2 = urllib.request.Request(shot, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req2, timeout=240) as r2:
                    data = r2.read()
            if data[:8] != b"\x89PNG\r\n\x1a\n" and data[:3] != b"\xff\xd8\xff":
                raise ValueError("not an image (%d bytes, starts: %r)" % (len(data), data[:60]))
            break
        except Exception as e:
            print(f"  {name}: attempt {attempt} failed: {e}", flush=True)
            if attempt == 2:
                report["captures"][name] = {"ok": False, "error": str(e)}
                fail(f"capture {name} failed: {e}")
                return
            time.sleep(10)
    p = os.path.join(CAP, name)
    open(p, "wb").write(data)
    im = Image.open(p)
    css_w = im.size[0] // 2
    ok = css_w == width
    report["captures"][name] = {"px": im.size, "css_w": css_w, "ok": ok}
    print(f"  {name}: {im.size} css_w={css_w} {'ok' if ok else 'BAD'}", flush=True)
    if not ok:
        fail(f"capture {name} is {css_w}px wide, expected {width}px")


for f in pages:
    if f == "404.html":
        continue  # Microlink returns metadata JSON, not a screenshot, for a 404-status page; verified by direct fetch in part B
    capture(f, 390, f.replace(".html", "-390.png"))
for w in (320, 768, 900, 1024, 1025, 1280):
    capture("index.html", w, f"index-{w}.png")

# ---- E. PageSpeed Insights (best effort) ----
print("== E. PageSpeed Insights (mobile, home) ==", flush=True)
psi_url = ("https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url="
           + urllib.parse.quote(BASE + "/", safe="")
           + "&strategy=mobile&category=performance&category=accessibility"
           + "&category=best-practices&category=seo")
try:
    req = urllib.request.Request(psi_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=180) as r:
        psi = json.load(r)
    cats = {k: v["score"] for k, v in psi["lighthouseResult"]["categories"].items()}
    audits = psi["lighthouseResult"]["audits"]
    vitals = {k: audits[k]["displayValue"] for k in
              ("largest-contentful-paint", "cumulative-layout-shift",
               "total-blocking-time", "first-contentful-paint") if k in audits}
    report["pagespeed"] = {"scores": cats, "vitals": vitals}
    print(f"  scores: {cats}", flush=True)
    print(f"  vitals: {vitals}", flush=True)
except Exception as e:
    report["pagespeed"] = {"unavailable": str(e)}
    warn(f"PageSpeed Insights unavailable: {e}")

json.dump(report, open(os.path.join(ROOT, "step19-report.json"), "w"), indent=2)
print(f"\nREVIEW19 DONE: {len(report['failures'])} failures, "
      f"{len(report['warnings'])} warnings", flush=True)
sys.exit(1 if report["failures"] else 0)
