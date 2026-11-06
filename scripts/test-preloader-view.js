const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const http = require('http');

// Simple static server for out directory
const outDir = path.resolve(__dirname, '../out');

function serveStatic(port) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0];
      if (reqPath.endsWith('/')) reqPath += 'index.html';
      if (!path.extname(reqPath)) reqPath += '/index.html';
      
      const filePath = path.join(outDir, reqPath);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        const mimeMap = {
          '.html': 'text/html',
          '.js': 'application/javascript',
          '.css': 'text/css',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.svg': 'image/svg+xml',
          '.json': 'application/json',
          '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        };
        res.writeHead(200, { 'Content-Type': mimeMap[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    server.listen(port, () => {
      resolve(server);
    });
  });
}

async function run() {
  const port = 3088;
  const server = await serveStatic(port);
  console.log(`Static server running on http://localhost:${port}`);

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });

  const artifactDir = 'C:/Users/Sonali/.gemini/antigravity/brain/4f5a1296-881a-4359-aa32-546747398b60';

  // 1. Desktop Preloader View (at 900ms when thread is drawn and progress is ~50%)
  const pageDesktop = await browser.newPage({
    viewport: { width: 1280, height: 800 }
  });
  await pageDesktop.goto(`http://localhost:${port}/`, { waitUntil: 'domcontentloaded' });
  // Wait 700ms into the preloader animation
  await pageDesktop.waitForTimeout(700);
  const shotDesktop = path.join(artifactDir, 'preloader_desktop.png');
  await pageDesktop.screenshot({ path: shotDesktop });
  console.log('Saved desktop screenshot:', shotDesktop);

  // 2. Mobile Preloader View
  const pageMobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true
  });
  await pageMobile.goto(`http://localhost:${port}/`, { waitUntil: 'domcontentloaded' });
  await pageMobile.waitForTimeout(700);
  const shotMobile = path.join(artifactDir, 'preloader_mobile.png');
  await pageMobile.screenshot({ path: shotMobile });
  console.log('Saved mobile screenshot:', shotMobile);

  await browser.close();
  server.close();
  console.log('Done!');
}

run().catch(console.error);
