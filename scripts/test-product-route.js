const http = require('http');

http.get('http://localhost:3000/products/colorful-beaded-airpods-case-kj-apc-402', (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const titleMatch = data.match(/<title>(.*?)<\/title>/);
    console.log('Page Title:', titleMatch ? titleMatch[1] : 'No title');
  });
});

