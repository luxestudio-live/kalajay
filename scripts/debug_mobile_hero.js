const { chromium } = require('playwright');
const path = require('path');

async function testMobile() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const viewports = [
    { name: 'iphone12_390', width: 390, height: 844 },
    { name: 'iphoneSE_375', width: 375, height: 667 },
    { name: 'android_360', width: 360, height: 800 },
    { name: 'desktop_1440', width: 1440, height: 900 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Evaluate card positions before scroll
    const initialBounds = await page.evaluate(() => {
      const cards = document.querySelectorAll('section div.relative.aspect-\\[4\\/5\\]');
      // Or find cards inside visualStageRef
      const allAspect = Array.from(document.querySelectorAll('div[class*="aspect-[4/5]"]')).slice(0, 3);
      return allAspect.map((el, i) => {
        const rect = el.getBoundingClientRect();
        return {
          index: i,
          tag: el.querySelector('h2')?.textContent?.trim(),
          left: rect.left,
          right: rect.right,
          width: rect.width,
          windowWidth: window.innerWidth
        };
      });
    });
    console.log(`\n--- Viewport: ${vp.name} (${vp.width}x${vp.height}) INITIAL ---`);
    console.log(JSON.stringify(initialBounds, null, 2));

    await page.screenshot({ path: `scratch_${vp.name}_initial.png` });

    // Scroll down 50px to trigger fanOut
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(800);

    const fannedBounds = await page.evaluate(() => {
      const allAspect = Array.from(document.querySelectorAll('div[class*="aspect-[4/5]"]')).slice(0, 3);
      return allAspect.map((el, i) => {
        const rect = el.getBoundingClientRect();
        return {
          index: i,
          tag: el.querySelector('h2')?.textContent?.trim(),
          left: rect.left,
          right: rect.right,
          width: rect.width,
          windowWidth: window.innerWidth
        };
      });
    });
    console.log(`--- Viewport: ${vp.name} FANNED ---`);
    console.log(JSON.stringify(fannedBounds, null, 2));

    await page.screenshot({ path: `scratch_${vp.name}_fanned.png` });
    await page.close();
  }

  await browser.close();
}

testMobile().catch(console.error);
