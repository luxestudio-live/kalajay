const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Testing /privacy ...');
  await page.goto('http://localhost:3000/privacy', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'scripts/page-privacy.png', fullPage: false });

  console.log('Testing /track ...');
  await page.goto('http://localhost:3000/track', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'scripts/page-track.png', fullPage: false });

  console.log('Testing /wishlist ...');
  await page.goto('http://localhost:3000/wishlist', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'scripts/page-wishlist.png', fullPage: false });

  console.log('Testing mobile /track ...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/track', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'scripts/page-track-mobile.png', fullPage: false });

  await browser.close();
  console.log('Screenshots captured successfully!');
})();

