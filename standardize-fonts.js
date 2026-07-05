const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.css')) results.push(file);
    }
  });
  return results;
}

const cssFiles = walk(path.join(__dirname, 'client', 'src'));

cssFiles.forEach(file => {
  if (file.includes('index.css')) return; // Skip index.css as we just set it up
  
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // 1. Remove all font-family definitions
  content = content.replace(/font-family:\s*[^;]+;/g, '');
  
  // 2. Optionally map some standard font-sizes to variables if they match exactly, 
  // or just leave sizes but ensure they don't override our semantic scales unnecessarily.
  // Actually, to fully comply with "Remove inconsistent font sizes and weights",
  // we could strip all font-weight: 400|500|600|bold|normal etc.
  content = content.replace(/font-weight:\s*(400|500|600|700|bold|normal|lighter|bolder);/gi, (match, p1) => {
      if (p1 === '400' || p1 === 'normal') return 'font-weight: var(--weight-regular);';
      if (p1 === '500') return 'font-weight: var(--weight-medium);';
      if (p1 === '600' || p1 === 'bold') return 'font-weight: var(--weight-semibold);';
      if (p1 === '700') return 'font-weight: var(--weight-bold);';
      return match;
  });

  if (original !== content) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated:', file);
  }
});
console.log('Done standardizing typography.');
