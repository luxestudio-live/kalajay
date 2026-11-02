const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 64, height: 64 } });
  const svgContent = fs.readFileSync('public/icon.svg', 'utf8');
  await page.setContent('<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;">' + svgContent + '</body></html>');
  const pngBuffer = await page.screenshot({ type: 'png', omitBackground: true });
  await browser.close();

  fs.writeFileSync('public/icon.png', pngBuffer);
  fs.writeFileSync('src/app/icon.png', pngBuffer);
  fs.writeFileSync('public/apple-icon.png', pngBuffer);

  // Pack into .ico
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0); // reserved
  icoHeader.writeUInt16LE(1, 2); // icon type
  icoHeader.writeUInt16LE(1, 4); // 1 image

  const icoEntry = Buffer.alloc(16);
  icoEntry.writeUInt8(64, 0); // width
  icoEntry.writeUInt8(64, 1); // height
  icoEntry.writeUInt8(0, 2);  // colors
  icoEntry.writeUInt8(0, 3);  // reserved
  icoEntry.writeUInt16LE(1, 4); // color planes
  icoEntry.writeUInt16LE(32, 6); // bits per pixel
  icoEntry.writeUInt32LE(pngBuffer.length, 8); // size
  icoEntry.writeUInt32LE(22, 12); // offset (6 + 16)

  const icoBuffer = Buffer.concat([icoHeader, icoEntry, pngBuffer]);
  fs.writeFileSync('public/favicon.ico', icoBuffer);
  fs.writeFileSync('src/app/favicon.ico', icoBuffer);
  console.log('Successfully generated icon.png, apple-icon.png, and favicon.ico!');
})();
