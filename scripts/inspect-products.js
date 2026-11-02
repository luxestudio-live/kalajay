const fs = require('fs');
const content = fs.readFileSync('src/data/catalogue.ts', 'utf8');

// Match all product objects
const slugRegex = /"slug":\s*"([^"]+)"/g;
let match;
const allSlugs = [];
while ((match = slugRegex.exec(content)) !== null) {
  allSlugs.push(match[1]);
}

console.log('Total slugs found in catalogue.ts:', allSlugs.length);
console.log('Sample slugs:', allSlugs.slice(0, 15));

