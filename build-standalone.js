#!/usr/bin/env node
/**
 * Inlines every profile-assets/*.jpg referenced by index.html as a base64
 * data URI, producing profile-2026-standalone.html — one file, zero dependencies.
 *
 *   node build-standalone.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'index.html');
const OUT = path.join(ROOT, 'profile-2026-standalone.html');

const html = fs.readFileSync(SRC, 'utf8');
const cache = new Map();
let inlined = 0;
let missing = 0;

const out = html.replace(/(["'(])profile-assets\/([^"')]+)\1?/g, (match, quote, file) => {
  const abs = path.join(ROOT, 'profile-assets', file);
  if (!fs.existsSync(abs)) {
    console.warn('  missing asset:', file);
    missing++;
    return match;
  }
  if (!cache.has(file)) {
    const ext = path.extname(file).slice(1).toLowerCase();
    const mime = ext === 'png' ? 'image/png' : ext === 'svg' ? 'image/svg+xml' : 'image/jpeg';
    cache.set(file, `data:${mime};base64,${fs.readFileSync(abs).toString('base64')}`);
  }
  inlined++;
  return `${quote}${cache.get(file)}${quote}`;
});

fs.writeFileSync(OUT, out);
console.log(`inlined ${inlined} refs (${cache.size} unique assets), ${missing} missing`);
console.log(`${path.basename(OUT)}: ${(Buffer.byteLength(out) / 1024 / 1024).toFixed(1)} MB`);
