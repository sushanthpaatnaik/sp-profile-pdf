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
  await page.waitForTimeout(4000);
  await page.evaluate(() => document.fonts.ready);
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
