const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  // Base icon SVG with full badge
  const baseSvg = fs.readFileSync('public/icon.svg', 'utf8');

  // Maskable SVG with safe margin padding (40% padding around symbol, solid background)
  const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="kjGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F2E6D0" />
      <stop offset="50%" stop-color="#C5A880" />
      <stop offset="100%" stop-color="#9E7E52" />
    </linearGradient>
    <linearGradient id="kjBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1D1C1B" />
      <stop offset="100%" stop-color="#141312" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" fill="url(#kjBg)" />
  <g transform="translate(18, 18) scale(0.64)">
    <polygon points="50,12 78,32 50,78 22,32" fill="none" stroke="url(#kjGold)" stroke-width="3" stroke-linejoin="round" />
    <polygon points="36,32 64,32 50,12" fill="url(#kjGold)" fill-opacity="0.35" stroke="url(#kjGold)" stroke-width="2" stroke-linejoin="round" />
    <polygon points="22,32 36,32 50,12" fill="url(#kjGold)" fill-opacity="0.15" stroke="url(#kjGold)" stroke-width="2" stroke-linejoin="round" />
    <polygon points="64,32 78,32 50,12" fill="url(#kjGold)" fill-opacity="0.25" stroke="url(#kjGold)" stroke-width="2" stroke-linejoin="round" />
    <polygon points="36,32 64,32 50,78" fill="url(#kjGold)" fill-opacity="0.3" stroke="url(#kjGold)" stroke-width="2" stroke-linejoin="round" />
    <polygon points="22,32 36,32 50,78" fill="url(#kjGold)" fill-opacity="0.18" stroke="url(#kjGold)" stroke-width="2" stroke-linejoin="round" />
    <polygon points="64,32 78,32 50,78" fill="url(#kjGold)" fill-opacity="0.45" stroke="url(#kjGold)" stroke-width="2" stroke-linejoin="round" />
    <circle cx="50" cy="32" r="2.5" fill="#FFFFFF" opacity="0.95" />
  </g>
</svg>
  `.trim();

  // Generate 192x192 regular
  let page = await browser.newPage({ viewport: { width: 192, height: 192 } });
  await page.setContent('<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;">' + baseSvg.replace('width="64" height="64"', 'width="192" height="192"') + '</body></html>');
  let buf192 = await page.screenshot({ type: 'png', omitBackground: true });
  fs.writeFileSync('public/icon-192.png', buf192);
  await page.close();

  // Generate 512x512 regular
  page = await browser.newPage({ viewport: { width: 512, height: 512 } });
  await page.setContent('<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;">' + baseSvg.replace('width="64" height="64"', 'width="512" height="512"') + '</body></html>');
  let buf512 = await page.screenshot({ type: 'png', omitBackground: true });
  fs.writeFileSync('public/icon-512.png', buf512);
  await page.close();

  // Generate 192x192 maskable
  page = await browser.newPage({ viewport: { width: 192, height: 192 } });
  await page.setContent('<!DOCTYPE html><html><body style="margin:0;padding:0;background:#141312;">' + maskableSvg.replace('width="100" height="100"', 'width="192" height="192"') + '</body></html>');
  let bufMask192 = await page.screenshot({ type: 'png' });
  fs.writeFileSync('public/icon-maskable-192.png', bufMask192);
  await page.close();

  // Generate 512x512 maskable
  page = await browser.newPage({ viewport: { width: 512, height: 512 } });
  await page.setContent('<!DOCTYPE html><html><body style="margin:0;padding:0;background:#141312;">' + maskableSvg.replace('width="100" height="100"', 'width="512" height="512"') + '</body></html>');
  let bufMask512 = await page.screenshot({ type: 'png' });
  fs.writeFileSync('public/icon-maskable-512.png', bufMask512);
  await page.close();

  await browser.close();
  console.log('Successfully generated all PWA icons: icon-192, icon-512, icon-maskable-192, icon-maskable-512!');
})();

