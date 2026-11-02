const fs = require('fs');
const path = require('path');
const http = require('http');

const hrefsFound = new Map(); // url -> Set of file paths

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Match href="..." or href={'...'} or router.push('...')
  const regex = /(?:href|router\.push)\s*(?:=|\()\s*['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    let url = match[1];
    if (url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('https://wa.me')) {
      continue;
    }
    let cleanUrl = url.split('?')[0].split('#')[0];
    if (!cleanUrl) cleanUrl = '/';

    if (!hrefsFound.has(cleanUrl)) {
      hrefsFound.set(cleanUrl, new Set());
    }
    hrefsFound.get(cleanUrl).add(path.relative(process.cwd(), filePath));
  }
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== '.git') {
        walkDir(full);
      }
    } else if (/\.(tsx|ts|js|jsx)$/.test(entry.name)) {
      scanFile(full);
    }
  }
}

walkDir(path.join(__dirname, '..', 'src'));

async function checkRoute(route) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:3000${route}`, (res) => {
      resolve(res.statusCode);
    });
    req.on('error', () => resolve(500));
  });
}

(async () => {
  console.log(`\nAuditing all ${hrefsFound.size} unique internal link targets found in src/...`);
  const results = [];
  for (const [url, files] of hrefsFound.entries()) {
    // If url contains template variable like ${...}, skip
    if (url.includes('${') || url.includes('[')) {
      results.push({ url, status: 'Dynamic Template', files: Array.from(files).join(', ') });
      continue;
    }
    const status = await checkRoute(url);
    results.push({ url, status, files: Array.from(files).slice(0, 2).join(', ') });
  }

  console.table(results);
})();

