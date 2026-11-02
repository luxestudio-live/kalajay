const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'catalogue.ts');
let content = fs.readFileSync(filePath, 'utf8');

const target = 'across our Bihar and Mumbai ateliers';
const replacement = 'in our artisanal studios';

const occurrences = content.split(target).length - 1;
console.log(`Found ${occurrences} occurrences of "${target}"`);

content = content.replaceAll(target, replacement);
fs.writeFileSync(filePath, content, 'utf8');
console.log(`Successfully replaced ${occurrences} occurrences with "${replacement}"`);

