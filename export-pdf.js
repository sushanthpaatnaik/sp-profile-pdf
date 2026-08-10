const { chromium } = require('playwright-core');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  const filePath = path.resolve('/home/user/sp-profile-pdf/index.html');
  await page.goto(`file://${filePath}`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  
  await page.pdf({
    path: '/home/user/sp-profile-pdf/sushanth-paatnaik-profile.pdf',
    format: 'A4',
    printBackground: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 }
  });
  
  console.log('PDF exported successfully');
  await browser.close();
})();
