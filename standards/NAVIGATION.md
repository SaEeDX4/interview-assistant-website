# NAVIGATION — header, menu and footer standard

Set in Step 32, from a study of Apple, Google, Microsoft and Tesla
(research notes: `~/workspace/step32-nav-research.md` and
`~/workspace/step32-footer-research.md`, outside the repo). The four
agree on more than they differ; this standard records what this site
takes from them.

## Header order

One rule covers both bars: **the funnel reads left to right, support
is last, legal never enters the header, and there is exactly one
filled CTA, at the far right.**

- Desktop: Features → How it works → Demo → Pricing → Download →
  Support, then the "Try the live demo" button. (Apple and Microsoft
  both end the text links on Support; Tesla puts commerce at an end,
  never the middle; none of the four puts privacy or terms in the
  top bar.)
- Platforms and Privacy left the header in Step 32. Platforms is
  informational, not a funnel step; Privacy is a legal/ethics page.
  Both stay one tap away (below).
- The mobile menu mirrors the funnel and restores what the desktop
  bar squeezed out (the four all do this): Features → How it works →
  Demo → Pricing → Download → Platforms → Support, then a pinned
  foot with the full-width demo CTA and a quiet Privacy · Terms
  (draft) row. Every page of the site is reachable from the menu.

## The menu (≤1024px)

- The toggle is **two bars, never a glyph**. On open they translate
  to the centre and rotate ±45° into an × — one continuous
  transformation the eye can track (Apple's pattern). 300ms on the
  standard curve; `aria-expanded` is the state the morph keys off.
- The panel is a **full-screen overlay** in the header's own
  material (same dark tint + blur), anchored under the bar
  (`position: absolute` — the header's backdrop-filter would make a
  `fixed` panel resolve against the header box, not the viewport).
- Links are 24px in ≥56px rows. On open they rise and fade with a
  40ms stagger (delays live only under `.is-open`, so closing is one
  unstaggered 250ms fade). The menu foot fades in last.
- The current page is named in the accent colour
  (`a[aria-current="page"]`) — none of the four emphasise it; this
  site does.
- While open, the page scroll is locked (`body.menu-open`, scoped
  to ≤1024px so the lock can never survive into the desktop
  layout). Escape closes and returns focus to the toggle; tapping a
  link closes. No fake furniture: no search, sign-in or language
  control the site cannot honour.

## Footer anatomy

**Product first, legal last — and legal lives in the bottom bar,
never in a column** (all four; the one-link "Legal" column this
site had until Step 32 read as a layout mistake).

- Main row: brand block (mark, name, one-line tagline) → Product
  (Features, How it works, Live demo, Pricing, Download, Platforms)
  → Resources (Support & FAQ, Privacy & ethics, Terms (draft)).
  Chrome is scaled to inventory: ~10 links earn three blocks, not
  four columns.
- Bottom bar: the © sentence (with the use-only-where-allowed
  line) → the Billing — via Paddle link → "Made for candidates, in
  10 languages." in the far-right identity slot (the slot Apple
  gives to the locale).
- The footer's top is for claim-qualifying microcopy only, and
  only on a page whose claims need it; there is no CTA or
  newsletter in the footer (the four have none — the demo band in
  the page content is the CTA).
- No social icons, no app badges, no trust seals: none exist to
  show honestly.
- Mobile stacks brand → Product → Resources in the same order, no
  accordion at this link count (Apple's accordion is justified at
  40+ links, not 10).

Enforced by `tests/test-step32.js`; nav/footer sameness across all
11 pages stays with `tests/test-step17.js`.

## Step 36 audit — the Home question

Researched 2026-11-16 (~/workspace/step36-home-link-research.md):
nine of nine brand sites checked (Apple, Google Store, Google,
Microsoft, Tesla, Samsung, Amazon, Nike, Stripe) carry NO
explicit "Home" link in the header or the mobile menu — the
top-left logo is the path home, and none adds Home to the footer
either. NN/g (updated Oct 2024) nevertheless recommends an
explicit link somewhere in the global navigation, and the best
controlled study (Optimal Workshop, n=242) measures ~83%
return-home success logo-only vs ≥98% with an explicit link —
the failures concentrate in less-technical users. Back is not a
substitute: it returns to the previous page, not home.

Adopted for this flat site: NO Home link in the desktop header
(it would duplicate the logo beside it, which NN/g warns
against); "Home" IS the mobile menu's first item (mobile-only,
like Platforms — the evidence-supported spot, at zero header
cost); the header brand's hit area is 48px tall; and the
footer brand is a home link too, so every page offers three
quiet paths home: logo, menu (mobile), footer brand.
