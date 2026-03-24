const fs = require('fs');

const enContent = fs.readFileSync('d:/hedoomyy/locales/en.ts', 'utf8');
const arContent = fs.readFileSync('d:/hedoomyy/locales/ar.ts', 'utf8');

const getKeys = (content) => {
  const lines = content.split('\n');
  const keys = [];
  lines.forEach(line => {
    const match = line.match(/^\s*([a-zA-Z0-9_]+):/);
    if (match) keys.push(match[1]);
  });
  return keys;
};

const enKeys = getKeys(enContent);
const arKeys = getKeys(arContent);

console.log('Keys in EN but not in AR:');
enKeys.forEach(k => {
  if (!arKeys.includes(k)) console.log(k);
});

console.log('\nKeys in AR but not in EN:');
arKeys.forEach(k => {
  if (!enKeys.includes(k)) console.log(k);
});
