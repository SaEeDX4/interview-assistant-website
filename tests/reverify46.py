#!/usr/bin/env python3
"""Step 46 live verification for the minified era.

Since Step 46 the Pages workflow minifies app.js and styles.css
during deployment (pinned terser / clean-css), so the older
reverify scripts' source-text markers no longer match the live
CSS/JS. This script replaces them with a stronger check: it
rebuilds the minified artifacts locally from the repository
sources with the same pinned tools and requires the live files
to be byte-identical to that build. HTML pages are not minified
and must stay byte-identical to the sources. A few content
markers in minified form are asserted as a second signal.
"""
import hashlib
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

BASE = "https://saeedx4.github.io/interview-assistant-website/"
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) reverify46"}
ROOT = Path(__file__).resolve().parent.parent
PAGES = ["index", "features", "how-it-works", "demo", "pricing",
         "download", "platforms", "privacy", "terms", "support", "404"]


def fetch(path):
    req = urllib.request.Request(BASE + path, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def sha(b):
    return hashlib.sha256(b).hexdigest()


def build_minified(tmp):
    web = ROOT / "website"
    app = Path(tmp, "app.js")
    css = Path(tmp, "styles.css")
    subprocess.run(
        ["npx", "--yes", "terser@5.51.2", str(web / "app.js"),
         "--compress", "--mangle", "-o", str(app)],
        check=True, capture_output=True)
    subprocess.run(
        ["npx", "--yes", "clean-css-cli@5.6.3",
         "-o", str(css), str(web / "styles.css")],
        check=True, capture_output=True)
    return app.read_bytes(), css.read_bytes()


def main():
    checks = []
    for name in PAGES:
        live = fetch(name + ".html")
        local = (ROOT / "website" / (name + ".html")).read_bytes()
        checks.append((f"{name}.html byte-identical to source", live == local))
    with tempfile.TemporaryDirectory() as tmp:
        min_app, min_css = build_minified(tmp)
    live_app = fetch("app.js")
    live_css = fetch("styles.css")
    checks.append(("live app.js byte-identical to the local minified build",
                   sha(live_app) == sha(min_app)))
    checks.append(("live styles.css byte-identical to the local minified build",
                   sha(live_css) == sha(min_css)))
    css_text = live_css.decode("utf-8", "replace")
    js_text = live_app.decode("utf-8", "replace")
    checks.append(("story nav radius survives minification (12px)",
                   ".story-prev{width:44px;height:44px;border-radius:12px" in css_text))
    checks.append(("release endpoint survives minification",
                   "admin.cybervalida.online/manifest" in js_text))
    checks.append(("AI endpoint survives minification",
                   "interview-assistant-ai-website.saeed-sharifzadeh91.workers.dev" in js_text))
    failed = 0
    for name, ok in checks:
        print(("PASS " if ok else "FAIL ") + name)
        failed += 0 if ok else 1
    print(f"\n{len(checks) - failed}/{len(checks)} markers passed")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
