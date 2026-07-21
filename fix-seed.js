const fs = require('fs');
const path = require('path');

const seedFile = path.join(__dirname, 'apps/backend/prisma/seed.ts');
let content = fs.readFileSync(seedFile, 'utf8');

const replacements = {
  'Ã©': 'é',
  'Ã¨': 'è',
  'Ã\u00A0': 'à', // Ã + non-breaking space
  'Ãª': 'ê',
  'Ã§': 'ç',
  'Ã¢': 'â',
  'Ã´': 'ô',
  'Ã»': 'û',
  'Ã®': 'î',
  'Ã¯': 'ï',
  'Ã«': 'ë',
  'Å“': 'œ',
  'â‚¬': '€',
  'â€™': '’'
};

let matchCount = 0;
for (const [bad, good] of Object.entries(replacements)) {
  const parts = content.split(bad);
  if (parts.length > 1) {
    matchCount += (parts.length - 1);
    content = parts.join(good);
  }
}

fs.writeFileSync(seedFile, content, 'utf8');
console.log(`Fixed seed.ts, replaced ${matchCount} characters.`);
