# RELEASES — the download page, the manifest and the admin panel

Step 41. The download page, the release service and the admin panel
are one system with three faces. This standard is the contract
between them.

## The manifest is the only source of truth

- The page renders availability exclusively from one JSON manifest
  served by the release service (`IA_RELEASES_ENDPOINT` in app.js).
- A platform is downloadable only when the manifest carries a
  release for it whose files each have: a name, an `https` URL, a
  byte size, and a 64-hex SHA-256. Anything failing validation is
  dropped; a manifest with no valid release changes nothing.
- The static page is the honest floor: no endpoint, a failed fetch
  or an empty manifest leaves exactly the static state — Windows
  described as the first platform, nothing downloadable, no version
  number and no file size anywhere. Never a broken page.

## Availability honesty

- No button without a file. An unreleased platform shows a status
  line only — the pattern on every major download page, and this
  site's standing rule against fake links.
- Status words mirror platforms.html ("Planned — Phase 3",
  "feasibility still being researched"); the two pages never
  disagree about a platform's state.
- The panel publishes only signed builds. The page's "Published and
  signed" wording is a process commitment the panel enforces, not
  a claim the page invents.
- SHA-256 is printed at the point of decision (recommendation,
  platform card, post-click panel) because a direct download has
  no store to vouch for it.

## Ordering (the owner's rule)

1. The visitor's detected platform, if it is released.
2. Otherwise Windows, if it is released.
3. Otherwise the first released platform in the fixed order
   Windows, Android, iOS, Mac.
4. Then the remaining released platforms in that fixed order.
5. Unreleased platforms last, in the same fixed order, as status
   cards.

Detection uses `navigator.userAgentData` where available and the
UA string elsewhere. Known limits are accepted, not hidden:
iPadOS reports as macOS; detection is an enhancement — the static
DOM order is the fixed order above.

## Channels

- Stable wins over Beta for the same platform. A Beta release is
  shown (badged "Beta") only when no Stable release exists for
  that platform.

## Rendering safety

- Manifest data is untrusted input: everything renders through
  `textContent`, never `innerHTML`; URLs must be `https`;
  the SHA-256 must match the 64-hex shape before it is printed.

## The panel (Step 41b)

- One admin, full access, token login. The panel writes the
  manifest the page reads; nothing appears on the website that did
  not pass through the panel. Unpublish is immediate.
