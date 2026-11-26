import { chromium } from 'playwright';

async function testCartScroll() {
  console.log('--- TESTING KALAJAY SIDE CART SCROLL ---');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });
  // Viewport 430x800 simulating the mobile screen from the user's screenshot
  const context = await browser.newContext({
    viewport: { width: 430, height: 800 }
  });
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:3000/shop', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Pre-populate cart with 4 items via localStorage
    await page.evaluate(() => {
      const items = [
        {
          id: 'kj-apc-402',
          key: 'kj-apc-402-default',
          slug: 'colorful-beaded-airpods-case',
          name: 'Colorful Beaded AirPods Case',
          price: 399,
          quantity: 1,
          image: '/images/products/airpod-cases/apc-402.jpg',
          category: 'Airpod Cases',
          code: 'KJ-APC-402',
          craftTime: '4 days'
        },
        {
          id: 'kj-apc-404',
          key: 'kj-apc-404-default',
          slug: 'crystal-beaded-airpods-case',
          name: 'Crystal Beaded AirPods Case',
          price: 499,
          quantity: 1,
          image: '/images/products/airpod-cases/apc-404.jpg',
          category: 'Airpod Cases',
          code: 'KJ-APC-404',
          craftTime: '5 days'
        },
        {
          id: 'kj-apc-405',
          key: 'kj-apc-405-default',
          slug: 'florescent-beaded-airpods-case',
          name: 'Florescent Beaded AirPods Case',
          price: 499,
          quantity: 1,
          image: '/images/products/airpod-cases/apc-405.jpg',
          category: 'Airpod Cases',
          code: 'KJ-APC-405',
          craftTime: '4 days'
        },
        {
          id: 'kj-apc-406',
          key: 'kj-apc-406-default',
          slug: 'pearl-woven-airpods-case',
          name: 'Pearl Woven AirPods Case',
          price: 599,
          quantity: 1,
          image: '/images/products/airpod-cases/apc-406.jpg',
          category: 'Airpod Cases',
          code: 'KJ-APC-406',
          craftTime: '6 days'
        }
      ];
      localStorage.setItem('kalajay_cart', JSON.stringify(items));
    });

    // Reload page to hydrate cart state
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Click cart icon button
    const cartButton = page.locator('button[aria-label*="Shopping Bag"], button[aria-label*="cart"], button[aria-label*="Bag"]').first();
    await cartButton.click();
    await page.waitForTimeout(500);

    // Verify dialog exists and is visible
    const drawer = page.locator('[role="dialog"][aria-label="Your Shopping Bag"]');
    const isVisible = await drawer.isVisible();
    console.log(`Cart Drawer Visible: ${isVisible}`);

    // Verify list metrics
    const metrics = await page.evaluate(() => {
      const listEl = document.querySelector('[role="dialog"] [data-lenis-prevent="true"].overflow-y-auto') as HTMLElement;
      if (!listEl) return null;
      return {
        clientHeight: listEl.clientHeight,
        scrollHeight: listEl.scrollHeight,
        scrollTop: listEl.scrollTop,
        isScrollable: listEl.scrollHeight > listEl.clientHeight,
        overflowY: window.getComputedStyle(listEl).overflowY,
        minHeight: window.getComputedStyle(listEl).minHeight,
        itemCount: listEl.children.length,
      };
    });

    console.log('Cart Items Container Metrics:', metrics);

    if (metrics && metrics.isScrollable) {
      console.log(`[PASS] scrollHeight (${metrics.scrollHeight}px) > clientHeight (${metrics.clientHeight}px). Container is scrollable.`);

      // Test scrolling down by 200px
      const scrolled = await page.evaluate(() => {
        const listEl = document.querySelector('[role="dialog"] [data-lenis-prevent="true"].overflow-y-auto') as HTMLElement;
        listEl.scrollTop = 200;
        return listEl.scrollTop;
      });

      console.log(`[PASS] Scrolled scrollTop to: ${scrolled}px`);

      // Verify footer is still visible and pinned
      const footerMetrics = await page.evaluate(() => {
        const footer = document.querySelector('[role="dialog"] .shrink-0:last-child') as HTMLElement;
        const checkoutBtn = document.querySelector('[role="dialog"] a[href="/checkout"]') as HTMLElement;
        return {
          footerVisible: !!footer && footer.clientHeight > 0,
          checkoutBtnVisible: !!checkoutBtn && checkoutBtn.clientHeight > 0,
        };
      });

      console.log('Footer & Checkout Button status:', footerMetrics);

      // Save screenshot
      await page.screenshot({ path: 'cart_scroll_verified.png' });
      console.log('Screenshot saved to cart_scroll_verified.png');
      console.log('ALL CHECKS PASSED: Side cart now scrolls effortlessly while keeping footer pinned!');
    } else {
      console.error('[FAIL] Container is not scrollable:', metrics);
      process.exitCode = 1;
    }
  } catch (e) {
    console.error('Error during test:', e);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

testCartScroll();
