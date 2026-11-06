const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const http = require('http');

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
  const port = 3093;
  const server = await serveStatic(port);

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });

  const artifactDir = 'C:/Users/Sonali/.gemini/antigravity/brain/4f5a1296-881a-4359-aa32-546747398b60';

  // 320px ultra-small viewport
  const page = await browser.newPage({
    viewport: { width: 320, height: 640 },
    isMobile: true
  });

  await page.goto(`http://localhost:${port}/cart/`);
  await page.evaluate(() => {
    sessionStorage.setItem('kalajay_preloader_seen', 'true');
    localStorage.setItem('kalajay_cart', JSON.stringify([
      {
        id: 'kj-apc-402',
        name: 'Colorful Beaded AirPods Case',
        price: 1850,
        quantity: 1,
        image: 'https://www.kalajay.in/v2/p1-1.jpg',
        category: 'Airpod Cases'
      }
    ]));
  });
  await page.reload();
  await page.waitForTimeout(600);

  const button = page.locator('a:has-text("Instant Approval")');
  await button.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  const shotPath = path.join(artifactDir, 'cart_mobile_320px.png');
  await page.screenshot({ path: shotPath });
  console.log('Saved screenshot:', shotPath);

  await browser.close();
  server.close();
}

run().catch(console.error);
