const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  // Test iPhone 14 (390x844)
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // 1. Initial Hero view
  await page.screenshot({ path: 'scripts/hero-mobile-initial.png' });

  // 2. Scroll slightly to trigger fanOut
  await page.evaluate(() => window.scrollTo(0, 80));
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'scripts/hero-mobile-fanned.png' });

  // 3. Test smaller Android device (360x780)
  await page.setViewportSize({ width: 360, height: 780 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollTo(0, 80));
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'scripts/hero-mobile-360-fanned.png' });

  await browser.close();
  console.log('Mobile hero screenshots captured!');
})();

