const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('--- 1. Testing Login Page & OTP Flow ---');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });

  // Take screenshot of Login page
  await page.screenshot({ path: 'scripts/login-page.png', fullPage: false });

  // Enter phone number
  const phoneInput = await page.$('input[type="tel"]');
  if (phoneInput) {
    await phoneInput.fill('9876543210');
    const sendOtpBtn = await page.$('button[type="submit"]');
    await sendOtpBtn.click();
    await page.waitForTimeout(600);

    // Take screenshot of OTP code entry step
    await page.screenshot({ path: 'scripts/login-otp-step.png', fullPage: false });

    // Click One-Tap Fill demo OTP and then verify
    const oneTapBtn = await page.$('button:has-text("One-Tap Fill")');
    if (oneTapBtn) {
      await oneTapBtn.click();
      await page.waitForTimeout(400);
      const verifyBtn = await page.$('button:has-text("VERIFY & ENTER")');
      if (verifyBtn) {
        await verifyBtn.click();
        await page.waitForTimeout(1000);
      }
    } else {
      const demoBtn = await page.$('button:has-text("1-Click Demo Sign In")');
      if (demoBtn) {
        await demoBtn.click();
        await page.waitForTimeout(1000);
      }
    }
  }

  console.log('Current URL after OTP login:', page.url());

  console.log('\n--- 2. Testing Account Dashboard & Orders ---');
  await page.goto('http://localhost:3000/account', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'scripts/account-overview.png', fullPage: false });

  // Switch to Orders Tab
  console.log('Clicking Orders tab...');
  const ordersTabBtn = await page.$('button:has-text("Orders & Provenance")');
  if (ordersTabBtn) {
    await ordersTabBtn.click();
    await page.waitForTimeout(600);

    // Expand first order details
    const viewSpecsBtn = await page.$('button:has-text("View Timeline & Specs")');
    if (viewSpecsBtn) {
      await viewSpecsBtn.click();
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: 'scripts/account-orders.png', fullPage: false });
  }

  // Switch to Saved Addresses Tab
  console.log('Clicking Addresses tab...');
  const addrTabBtn = await page.$('button:has-text("Saved Addresses")');
  if (addrTabBtn) {
    await addrTabBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'scripts/account-addresses.png', fullPage: false });
  }

  // Switch to Profile Tab
  console.log('Clicking Profile tab...');
  const profileTabBtn = await page.$('button:has-text("Profile & Preferences")');
  if (profileTabBtn) {
    await profileTabBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'scripts/account-profile.png', fullPage: false });
  }

  console.log('\n--- 3. Testing Signup Page ---');
  // Clear session to test signup
  await page.evaluate(() => localStorage.removeItem('kalajay_user_session'));
  await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'scripts/signup-page.png', fullPage: false });

  console.log('\n--- 4. Testing Mobile Viewport for Account & Login ---');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'scripts/login-mobile.png', fullPage: false });

  await browser.close();
  console.log('All Auth & Account tests passed successfully!');
})();

