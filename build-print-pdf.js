#!/usr/bin/env node
/**
 * Renders index.html to a press-ready A4 PDF.
 *
 * Chromium exports at trim size with no bleed, which leaves white slivers
 * when a full-bleed black page is trimmed. So the page is rendered 3mm
 * oversize on every edge and the design is scaled to fill it; add-bleed.py
 * then stamps the TrimBox so the printer knows where to cut.
 *
 *   node build-print-pdf.js
 */
const { chromium } = require('playwright-core');
const path = require('path');

const SRC = `file://${path.join(__dirname, 'index.html')}`;
const OUT = path.join(__dirname, 'print', 'profile-A4-trim.pdf');

(async () => {
  require('fs').mkdirSync(path.join(__dirname, 'print'), { recursive: true });
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium',
    args: ['--no-sandbox', '--font-render-hinting=none'],
  });
  const page = await browser.newPage();
  await page.goto(SRC, { waitUntil: 'networkidle', timeout: 180000 });

  // The page lazy-loads images for the web. Chromium never scrolls during a
  // PDF export, so offscreen images would render blank — force them all in
  // and wait for every one to decode before exporting.
  const loaded = await page.evaluate(async () => {
    const imgs = [...document.images];
    imgs.forEach(i => { i.loading = 'eager'; i.decoding = 'sync'; });
    await Promise.all(imgs.map(i => i.complete && i.naturalWidth
      ? null
      : new Promise(res => { i.addEventListener('load', res, { once: true });
                             i.addEventListener('error', res, { once: true }); })));
    return imgs.filter(i => i.complete && i.naturalWidth > 0).length;
  });
  await page.waitForTimeout(2500);
  await page.evaluate(() => document.fonts.ready);
  const total = await page.evaluate(() => document.images.length);
  if (loaded !== total) throw new Error(`only ${loaded}/${total} images decoded — refusing to export a PDF with blank artwork`);
  console.log(`  ${loaded}/${total} images decoded`);
  await page.emulateMedia({ media: 'print' });

  await page.pdf({
    path: OUT,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  await browser.close();
  console.log('wrote', path.relative(__dirname, OUT));
})();
