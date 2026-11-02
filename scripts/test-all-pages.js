const http = require('http');

const routes = [
  '/',
  '/shop',
  '/collections/organisers',
  '/collections/purses',
  '/collections/slings',
  '/collections/airpod-cases',
  '/collections/coasters-mats',
  '/collections/candle-holders',
  '/collections/key-rings',
  '/collections/crochet-magic',
  '/collections/little-treasures',
  '/products/pearl-vanity-box-heirloom',
  '/customise',
  '/cart',
  '/checkout',
  '/story',
  '/atelier',
  '/gifting',
  '/corporate-gifting',
  '/faq',
  '/shipping-returns',
  '/terms',
  '/contact',
  '/login',
  '/signup',
  '/account',
  '/account/orders',
  '/privacy',
  '/track',
  '/wishlist',
  '/sitemap.xml',
  '/robots.txt',
];

async function checkRoute(path) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:3000${path}`, (res) => {
      resolve({ path, status: res.statusCode, location: res.headers.location });
    });
    req.on('error', (err) => resolve({ path, error: err.message }));
  });
}

(async () => {
  console.log('Testing all standard and potential routes on http://localhost:3000 ...\n');
  const results = [];
  for (const r of routes) {
    const res = await checkRoute(r);
    results.push(res);
  }

  console.log('Route Test Results:');
  console.table(results);
})();

