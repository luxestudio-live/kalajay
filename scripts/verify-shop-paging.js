const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('--- 1. Testing Homepage Metadata & Favicon ---');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  const homeTitle = await page.title();
  console.log('Home title:', homeTitle);

  const homeDesc = await page.$eval('meta[name="description"]', el => el.content).catch(() => null);
  console.log('Home meta description:', homeDesc);

  const iconLinks = await page.$$eval('link[rel*="icon"]', els => els.map(e => ({ rel: e.rel, href: e.href })));
  console.log('Icon links in head:', iconLinks);

  const ogTitle = await page.$eval('meta[property="og:title"]', el => el.content).catch(() => null);
  console.log('OG title:', ogTitle);

  console.log('\n--- 2. Testing Shop All Metadata & Pagination ---');
  await page.goto('http://localhost:3000/shop', { waitUntil: 'networkidle' });

  const shopTitle = await page.title();
  console.log('Shop title:', shopTitle);

  const shopDesc = await page.$eval('meta[name="description"]', el => el.content).catch(() => null);
  console.log('Shop meta description:', shopDesc);

  const shopCanonical = await page.$eval('link[rel="canonical"]', el => el.href).catch(() => null);
  console.log('Shop canonical link:', shopCanonical);

  // Take screenshot of ShopAll Page 1
  await page.screenshot({ path: 'scripts/shop-page-1.png', fullPage: false });

  // Check product cards count on Page 1
  const productCardsPage1 = await page.$$('div.grid > div.group');
  console.log('Product cards on Page 1:', productCardsPage1.length);

  // Check pagination UI
  const paginationRange = await page.$eval('.text-ink-muted strong', el => el.textContent).catch(() => null);
  console.log('Pagination range text on page 1:', paginationRange);

  // Scroll to pagination controls
  const paginationContainer = await page.$('button[aria-label="Next page"]');
  if (paginationContainer) {
    await paginationContainer.scrollIntoViewIfNeeded();
    await page.screenshot({ path: 'scripts/shop-pagination-controls.png' });
  }

  // Click Page 2
  console.log('\n--- 3. Testing Navigation to Page 2 ---');
  const page2Button = await page.$('button[aria-label="Go to page 2"]');
  if (page2Button) {
    await page2Button.click();
    await page.waitForTimeout(600);
    const productCardsPage2 = await page.$$('div.grid > div.group');
    console.log('Product cards on Page 2:', productCardsPage2.length);
    await page.screenshot({ path: 'scripts/shop-page-2.png', fullPage: false });
  }

  // Click Next Button to Page 3
  console.log('\n--- 4. Testing Next Button to Page 3 ---');
  const nextButton = await page.$('button[aria-label="Next page"]');
  if (nextButton) {
    await nextButton.click();
    await page.waitForTimeout(600);
    const page3Active = await page.$eval('button[aria-current="page"]', el => el.textContent.trim());
    console.log('Active page after clicking Next:', page3Active);
  }

  // Test Mobile Viewport
  console.log('\n--- 5. Testing Mobile Viewport (390px) ---');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'scripts/shop-mobile-view.png', fullPage: false });

  // Direct fetch checks for favicons
  console.log('\n--- 6. Verifying Favicon Files via HTTP ---');
  const iconSvgResponse = await page.goto('http://localhost:3000/icon.svg');
  console.log('/icon.svg status:', iconSvgResponse.status());

  const faviconIcoResponse = await page.goto('http://localhost:3000/favicon.ico');
  console.log('/favicon.ico status:', faviconIcoResponse.status());

  await browser.close();
  console.log('\nAll tests completed successfully!');
})();

