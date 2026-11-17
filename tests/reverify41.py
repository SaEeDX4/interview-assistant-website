#!/usr/bin/env python3
"""Step 41 live markers: the redesigned download page is deployed,
wired to the release service (41c), and still the honest floor
while the manifest is empty — no version, no size, no binary link
may appear on the live page."""
import sys
import urllib.request

BASE = "https://saeedx4.github.io/interview-assistant-website/"
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) reverify41"}


def fetch(path):
    req = urllib.request.Request(BASE + path, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def main():
    dl = fetch("download.html")
    js = fetch("app.js")
    css = fetch("styles.css")
    checks = [
        ("rec panel live", 'id="dl-rec"' in dl),
        ("four platform cards live",
         all(f'data-platform="{p}"' in dl for p in ("windows", "android", "ios", "mac"))),
        ("honest static floor live",
         "Signed installer + SHA-256: not yet published" in dl),
        ("no invented version live", "Version 1" not in dl),
        ("endpoint wired to the release service (41c)",
         'IA_RELEASES_ENDPOINT = "https://interview-assistant-releases.saeed-sharifzadeh91.workers.dev/manifest"' in js),
        ("download IIFE live", "Step 41 — download page" in js),
        ("dl styles live", ".dl-rec {" in css and ".dl-sha {" in css),
        ("installer mockup retired live", "installer app-window" not in dl),
    ]
    failed = 0
    for name, ok in checks:
        print(("PASS " if ok else "FAIL ") + name)
        failed += 0 if ok else 1
    print(f"\n{len(checks) - failed}/{len(checks)} markers passed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
