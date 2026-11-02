const fs = require('fs');
const path = require('path');

const validStaticRoutes = new Set([
  '/',
  '/account',
  '/account/orders',
  '/atelier',
  '/cart',
  '/checkout',
  '/contact',
  '/corporate-gifting',
  '/customise',
  '/faq',
  '/gifting',
  '/login',
  '/shipping-returns',
  '/shop',
  '/signup',
  '/story',
  '/terms',
]);

// Read catalogue to know valid products and collections
const catalogueFile = fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'catalogue.ts'), 'utf8');
const productMatches = [...catalogueFile.matchAll(/slug:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
const validProductSlugs = new Set(productMatches);

const collectionMatches = [...catalogueFile.matchAll(/category:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
const validCategories = new Set(collectionMatches);

console.log(`Found ${validProductSlugs.size} products and ${validCategories.size} categories.`);

// Walk src directory to find all hrefs
const hrefsFound = new Map(); // href -> array of files

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Match href="..." or href={'...'} or router.push('...')
  const regex = /(?:href|to|router\.push)\s*(?:=|:|\()\s*['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    let url = match[1];
    // ignore external urls and hash/mailto/tel/whatsapp
    if (url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('https://wa.me')) {
      continue;
    }
    // Clean query and hash
    let cleanUrl = url.split('?')[0].split('#')[0];
    if (!cleanUrl) cleanUrl = '/';

    if (!hrefsFound.has(cleanUrl)) {
      hrefsFound.set(cleanUrl, []);
    }
    hrefsFound.get(cleanUrl).push(path.relative(process.cwd(), filePath));
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

console.log('\n--- Link Analysis Summary ---');
const brokenLinks = [];
for (const [link, files] of hrefsFound.entries()) {
  let isValid = false;
  if (validStaticRoutes.has(link)) {
    isValid = true;
  } else if (link.startsWith('/products/')) {
    const slug = link.replace('/products/', '');
    // Some might be template strings or variable expressions
    if (slug.includes('${') || validProductSlugs.has(slug)) {
      isValid = true;
    }
  } else if (link.startsWith('/collections/')) {
    const slug = link.replace('/collections/', '');
    if (slug.includes('${') || validCategories.has(slug) || ['all', 'jewellery-boxes', 'airpod-cases', 'luxury-bags', 'beaded-trays', 'keychains-charms'].includes(slug)) {
      isValid = true;
    }
  }

  if (!isValid) {
    brokenLinks.push({ link, files: [...new Set(files)] });
  } else {
    // console.log(`✓ ${link} (${files.length} references)`);
  }
}

console.log(`Total unique internal paths detected: ${hrefsFound.size}`);
if (brokenLinks.length > 0) {
  console.log(`\n❌ POTENTIALLY BROKEN / UNMATCHED ROUTES FOUND (${brokenLinks.length}):`);
  brokenLinks.forEach(b => console.log(`  - ${b.link} in: ${b.files.join(', ')}`));
} else {
  console.log('✓ All scanned internal routes map to valid pages or dynamic routes!');
}

