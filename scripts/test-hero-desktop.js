const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  await page.screenshot({ path: 'scripts/hero-desktop-initial.png' });

  await page.evaluate(() => window.scrollTo(0, 100));
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'scripts/hero-desktop-fanned.png' });

  await browser.close();
  console.log('Desktop hero screenshots captured!');
})();

