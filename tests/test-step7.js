// Step 7 tests — pure Node, no deps. Run: node test-step7.js
// Checks the Step 7 layout + content fixes and a small regression smoke set.
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'website');
const read = f => fs.readFileSync(path.join(dir, f), 'utf8');
const css = read('styles.css');
const results = [];
function check(name, ok) { results.push([name, !!ok]); }

const pages = {};
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.html'))) pages[f] = read(f);

// --- D1: long <code> tokens must break anywhere ---
check('D1 code overflow-wrap anywhere rule exists',
  /code\s*\{\s*overflow-wrap:\s*anywhere;/.test(css));
// --- D2: header nav matches on all pages (Step 32 set: the 7 funnel
// links in order, then the menu foot's demo CTA, Privacy and Terms) ---
function navLinks(html) {
  const m = html.match(/<nav id="site-nav"[\s\S]*?<\/nav>/);
  return m ? [...m[0].matchAll(/href="([^"]+)"/g)].map(x => x[1]) : [];
}
const expectedNav = ['index.html', 'features.html', 'how-it-works.html', 'demo.html', 'pricing.html',
  'download.html', 'platforms.html', 'support.html', 'demo.html', 'privacy.html', 'terms.html'];
for (const [f, html] of Object.entries(pages)) {
  check(`D2 ${f} nav has exactly the 11 standard links (Step 32 set + Step 36 Home)`,
    JSON.stringify(navLinks(html)) === JSON.stringify(expectedNav));
}
// --- D3: simulator state row stacks cleanly on small phones ---
check('D3 demo seg-label span exists',
  pages['demo.html'].includes('<span class="seg-label">Current length:</span>'));
check('D3 seg-state wraps at <=640px',
  /\.seg-state\s*\{\s*flex-wrap:\s*wrap;/.test(css));
check('D3 seg-label nowrap at <=640px',
  /\.seg-state\s+\.seg-label\s*\{\s*white-space:\s*nowrap;/.test(css));

// --- Content fixes C1-C5 ---
check('C1 platforms docs link to repo docs folder',
  pages['platforms.html'].includes('href="https://github.com/SaEeDX4/interview-assistant-website/tree/main/docs"'));
check('C2 support runbook h2 has id', pages['support.html'].includes('<h2 id="runbook">'));
check('C2 privacy links to support.html#runbook',
  pages['privacy.html'].includes('href="support.html#runbook"'));
check('C3 features lead drops the planning-docs clause',
  !pages['features.html'].includes('claim table in our planning docs'));
check('C4 download buttons will go live',
  pages['download.html'].includes('The buttons below will go live with the first signed release'));
check('C5 no unsourced weak-question resurfacing claim',
  !pages['how-it-works.html'].includes('come back first next time'));
check('C5 practise flow keeps the honest framing',
  pages['how-it-works.html'].includes('The questions you struggled with are the ones to fold into your next preparation run.'));

// --- Regression smoke (Step 6 fixes still in place) ---
check('smoke pipe-list 1fr rule present',
  /@media \(max-width: 640px\) \{\s*\.pipe-list \{ grid-template-columns: 1fr; \}\s*\}/.test(css));
/* Step 63 re-pin (deliberate): the mini-tag wrap rule served the old
   how-it-works mini card; Step 63 retired the whole mini family as
   dead code (test-step17 census). The smoke now pins its absence. */
check('smoke mini-tag retired with the old timeline (Step 63 re-pin)',
  !/\.mini-tag\s*\{/.test(css));
check('smoke sticky bar one-row rule at <=480px',
  /@media \(max-width: 480px\) \{\s*\.sticky-cta \.btn-secondary \{ display: none; \}/.test(css));
check('smoke pricing data-labels present',
  (pages['pricing.html'].match(/data-label="/g) || []).length >= 16);
check('smoke no orphaned kbd period',
  !Object.values(pages).some(h => h.includes('</kbd>.')));
check('smoke demo still labelled simulated',
  pages['demo.html'].includes('Live demo — simulated'));

let fail = 0;
for (const [name, ok] of results) {
  if (!ok) { fail++; console.log('FAIL', name); }
}
console.log(`${results.length - fail} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
