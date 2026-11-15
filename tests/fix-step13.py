"""Step 13 fix script: apply the SEO.md standard (head tags + descriptions).
Aborts if any old string does not occur exactly the expected number of times.
DO NOT RUN until Steps 10-12 are pushed — this edits the same HTML files.
sitemap.xml, robots.txt and 404.html are new files and already exist.
"""
import sys, os
from pathlib import Path

BASE = "https://saeedx4.github.io/interview-assistant-website/"
DIR = str(Path(__file__).resolve().parent.parent / "website")
PAGES = ["index.html", "features.html", "how-it-works.html", "demo.html",
         "pricing.html", "download.html", "platforms.html", "privacy.html",
         "terms.html", "support.html"]
OG_IMAGE = ('<meta property="og:image" content="https://saeedx4.github.io/'
            'interview-assistant-website/og-image.png">')

def apply(path, old, new, count):
    text = open(path).read()
    found = text.count(old)
    if found != count:
        print(f"ABORT {path}: expected {count}x but found {found}x: {old[:80]!r}")
        sys.exit(1)
    open(path, "w").write(text.replace(old, new))

applied = 0
for page in PAGES:
    path = os.path.join(DIR, page)
    url = BASE if page == "index.html" else BASE + page
    head_tags = (f"{OG_IMAGE}\n"
                 f'<link rel="canonical" href="{url}">\n'
                 f'<meta property="og:url" content="{url}">\n'
                 '<meta name="theme-color" content="#0a0c10">')
    apply(path, OG_IMAGE, head_tags, 1)
    applied += 1
    # S7: JSON-LD url
    apply(path, '  "name": "Interview Assistant",\n',
          '  "name": "Interview Assistant",\n'
          f'  "url": "{BASE}",\n', 1)
    applied += 1

# S9: platforms og copy must not say "Windows now" — align both descriptions
# to one shorter honest text (the old meta was 164 chars, over the 160 limit)
apply(os.path.join(DIR, "platforms.html"),
      "Windows first — installer pending. Android companion-first planning, iOS and native Mac as phased research. Five gated phases, no dates, no promises we cannot keep.",
      "Windows first — installer pending. Android, iOS and Mac as phased research. Five gated phases, no dates, no promises we cannot keep.",
      1)
applied += 1
apply(os.path.join(DIR, "platforms.html"),
      '<meta property="og:description" content="Windows now. Android companion-first planning, iOS and native Mac as phased research. Five gated phases, no dates, no promises we cannot keep.">',
      '<meta property="og:description" content="Windows first — installer pending. Android, iOS and Mac as phased research. Five gated phases, no dates, no promises we cannot keep.">',
      1)
applied += 1
# S4: descriptions over 160 chars (features meta + og, index meta only)
apply(os.path.join(DIR, "features.html"),
      "Prepare from your resume, get three speakable points live, Coach Mode, 10 languages with RTL, adaptive answers, and an honest report — with the evidence behind each claim.",
      "Prepare from your resume, get three speakable points live, Coach Mode, 10 languages with RTL, adaptive answers, and an honest report.",
      2)
applied += 2
apply(os.path.join(DIR, "index.html"),
      "Prepare for your interview from your resume and job description, then get three short, speakable points live — in 10 languages. Windows app. Free 30-minute trial.",
      "Prepare for your interview from your resume and job description, then get three short, speakable points live — in 10 languages. Free 30-minute trial.",
      1)
applied += 1
print(f"STEP13 FIX DONE: {applied} replacements")
