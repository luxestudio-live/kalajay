const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // Locate the manifesto section
  const manifesto = await page.$('section:has-text("The Kalajay Manifesto")');
  if (manifesto) {
    await manifesto.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await manifesto.screenshot({ path: 'scripts/manifesto-preview.png' });
    console.log('Manifesto preview screenshot captured at scripts/manifesto-preview.png');
  } else {
    console.log('Manifesto section not found');
  }

  await browser.close();
})();

