const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function verify() {
  const scriptContent = fs.readFileSync('scripts/generate-client-handover-pdf.js', 'utf8');
  const startIdx = scriptContent.indexOf('const HTML_CONTENT = `') + 'const HTML_CONTENT = `'.length;
  const endIdx = scriptContent.lastIndexOf('`;\n\nasync function generatePDF()');
  const html = scriptContent.slice(startIdx, endIdx);

  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 900, height: 1280 } });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluateHandle('document.fonts.ready');
  await page.waitForTimeout(1000);

  const pages = await page.$$('.page');
  console.log(`Found ${pages.length} pages in document`);

  for (let i = 0; i < pages.length; i++) {
    const outPath = path.resolve(`C:/Users/Sonali/.gemini/antigravity/brain/4f5a1296-881a-4359-aa32-546747398b60/client_page_${i + 1}.png`);
    await pages[i].screenshot({ path: outPath });
    console.log(`Saved page ${i + 1} to: ${outPath}`);
  }

  await browser.close();
}

verify().catch(console.error);
