const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  console.log('--- 1. Testing Manifest & Service Worker Endpoints ---');
  const context = await browser.newContext();
  const page = await context.newPage();

  const manifestRes = await page.goto('http://localhost:3000/manifest.webmanifest');
  console.log('/manifest.webmanifest status:', manifestRes.status());
  const manifestJson = await manifestRes.json();
  console.log('Manifest name:', manifestJson.name);
  console.log('Manifest display:', manifestJson.display);
  console.log('Manifest icons count:', manifestJson.icons ? manifestJson.icons.length : 0);

  const swRes = await page.goto('http://localhost:3000/sw.js');
  console.log('/sw.js status:', swRes.status());

  const icon192Res = await page.goto('http://localhost:3000/icon-192.png');
  console.log('/icon-192.png status:', icon192Res.status());

  const icon512Res = await page.goto('http://localhost:3000/icon-512.png');
  console.log('/icon-512.png status:', icon512Res.status());

  console.log('\n--- 2. Testing Mobile Viewport & PWA Head Tags ---');
  // Emulate mobile
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  const manifestTag = await page.$eval('link[rel="manifest"]', el => el.href).catch(() => null);
  console.log('link[rel="manifest"] href:', manifestTag);

  const appleCapable = await page.$eval('meta[name="apple-mobile-web-app-capable"]', el => el.content).catch(() => null);
  console.log('apple-mobile-web-app-capable:', appleCapable);

  const appleTitle = await page.$eval('meta[name="apple-mobile-web-app-title"]', el => el.content).catch(() => null);
  console.log('apple-mobile-web-app-title:', appleTitle);

  console.log('\n--- 3. Testing Mobile Menu "Install Kalajay App" Action ---');
  // Open mobile menu
  const menuBtn = await page.$('button[aria-label="Open Navigation Menu"]');
  if (menuBtn) {
    await menuBtn.click();
    await page.waitForTimeout(400);
    const installBtn = await page.$('button:has-text("Install Kalajay App")');
    console.log('Found "Install Kalajay App" in mobile drawer:', !!installBtn);
    await page.screenshot({ path: 'scripts/mobile-drawer-install.png' });
  }

  // Trigger floating banner check
  console.log('\n--- 4. Testing Floating Install Banner ---');
  await page.evaluate(() => {
    window.dispatchEvent(new Event('beforeinstallprompt'));
  });
  await page.waitForTimeout(4000);
  const bannerExists = await page.$('aside[role="region"]');
  console.log('PWA floating install banner rendered:', !!bannerExists);
  await page.screenshot({ path: 'scripts/mobile-install-banner.png' });

  await browser.close();
  console.log('\nPWA Verification finished successfully!');
})();
