const { chromium } = require('playwright');
const fs = require('fs');

async function run() {
  fs.mkdirSync('screenshots', { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  // 1a. Desktop Homepage Initial Load (scrollY = 0) - Cards in resting peek position
  const pageDesktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pageDesktop.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await pageDesktop.waitForTimeout(600); // Allow preloader to finish
  await pageDesktop.screenshot({ path: 'screenshots/home-initial-load.png' });
  console.log('Saved screenshots/home-initial-load.png');

  // 1b. Desktop Homepage Scrolled in Pinned Hero (Mouse wheel 450px) - Hero PINS & cards smoothly fan out
  await pageDesktop.mouse.wheel(0, 450);
  await pageDesktop.waitForTimeout(900); // Allow smooth scrub to settle
  await pageDesktop.screenshot({ path: 'screenshots/home-scrolled-fanout.png' });
  console.log('Saved screenshots/home-scrolled-fanout.png');

  // 1c. Manifesto Section (Past the pinned hero, check words full opacity)
  await pageDesktop.evaluate(() => window.scrollTo(0, 1600));
  await pageDesktop.waitForTimeout(600);
  await pageDesktop.screenshot({ path: 'screenshots/home-manifesto.png' });
  console.log('Saved screenshots/home-manifesto.png');

  // 1d. Chapter 04 Process Cinema (Redesigned Right-side timeline)
  await pageDesktop.evaluate(() => window.scrollTo(0, 3100));
  await pageDesktop.waitForTimeout(600);
  await pageDesktop.screenshot({ path: 'screenshots/home-chapter04.png' });
  console.log('Saved screenshots/home-chapter04.png');

  // 2. Mobile Homepage
  const pageMobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await pageMobile.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await pageMobile.screenshot({ path: 'screenshots/home-mobile.png' });
  console.log('Saved screenshots/home-mobile.png');

  // 3. Shop All
  await pageDesktop.goto('http://localhost:3000/shop', { waitUntil: 'networkidle' });
  await pageDesktop.screenshot({ path: 'screenshots/shop-desktop.png' });
  console.log('Saved screenshots/shop-desktop.png');

  // 4. Product Detail Page
  await pageDesktop.goto('http://localhost:3000/products/colorful-beaded-airpods-case-kj-apc-402', { waitUntil: 'networkidle' });
  await pageDesktop.screenshot({ path: 'screenshots/product-desktop.png' });
  console.log('Saved screenshots/product-desktop.png');

  // 5. Customise Studio
  await pageDesktop.goto('http://localhost:3000/customise', { waitUntil: 'networkidle' });
  await pageDesktop.screenshot({ path: 'screenshots/customise-desktop.png' });
  console.log('Saved screenshots/customise-desktop.png');

  // 6. Gifting Page
  await pageDesktop.goto('http://localhost:3000/gifting', { waitUntil: 'networkidle' });
  await pageDesktop.screenshot({ path: 'screenshots/gifting-desktop.png' });
  console.log('Saved screenshots/gifting-desktop.png');

  await browser.close();
  console.log('All screenshots completed successfully!');
}

run().catch(err => {
  console.error('Screenshot error:', err);
  process.exit(1);
});
