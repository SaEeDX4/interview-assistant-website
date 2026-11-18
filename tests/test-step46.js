#!/usr/bin/env node
/* Step 46 — minification lives in the deploy pipeline, never in
   the sources. Locks in:
   - the Pages workflow minifies app.js and styles.css with pinned
     tool versions, after checkout and before the artifact upload;
   - the repository sources stay readable (formatted, commented,
     multi-thousand-line files — the minified form exists only in
     the deployed artifact);
   - the live verification for the minified era exists
     (reverify46.py rebuilds the artifacts with the same pinned
     tools and byte-compares them against the live files). */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const wf = fs.readFileSync(path.join(ROOT, ".github", "workflows", "static.yml"), "utf8");
const css = fs.readFileSync(path.join(ROOT, "website", "styles.css"), "utf8");
const js = fs.readFileSync(path.join(ROOT, "website", "app.js"), "utf8");
const reverify = fs.readFileSync(path.join(ROOT, "tests", "reverify46.py"), "utf8");

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log("PASS " + name); }
  else { fail++; console.log("FAIL " + name); }
}

check("the workflow minifies with pinned tool versions",
  wf.includes("terser@5.51.2") && wf.includes("clean-css-cli@5.6.3") &&
  wf.includes("website/app.js --compress --mangle") &&
  wf.includes("-o website/styles.min.css website/styles.css"));
check("minification runs after checkout and before the artifact upload",
  wf.indexOf("actions/checkout") < wf.indexOf("Minify CSS and JS") &&
  wf.indexOf("Minify CSS and JS") < wf.indexOf("upload-pages-artifact"));
check("the sources stay readable (not minified in the repo)",
  css.split("\n").length > 1500 && js.split("\n").length > 2500 &&
  css.includes("/* ----------") && js.includes("/* The one AI request core"));
check("reverify46 rebuilds with the same pinned tools and byte-compares live files",
  reverify.includes("terser@5.51.2") && reverify.includes("clean-css-cli@5.6.3") &&
  reverify.includes("sha256") && reverify.includes("byte-identical"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
