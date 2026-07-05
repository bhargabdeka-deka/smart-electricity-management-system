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
  if (file.includes('index.css')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Map inconsistent px/rem values to semantic variables
  content = content.replace(/font-size:\s*([^;]+);/g, (match, p1) => {
    const size = p1.trim();
    
    // Large headings
    if (['2.5rem', '40px', '2.2rem'].includes(size)) return 'font-size: var(--text-h1);';
    if (['2rem', '32px', '1.8rem'].includes(size)) return 'font-size: var(--text-h2);';
    if (['1.5rem', '24px'].includes(size)) return 'font-size: var(--text-h3);';
    if (['1.25rem', '20px', '1.2rem'].includes(size)) return 'font-size: var(--text-h4);';
    
    // Body text
    if (['1.125rem', '18px', '1.1rem'].includes(size)) return 'font-size: var(--text-body-large);';
    if (['1rem', '16px'].includes(size)) return 'font-size: var(--text-body-regular);';
    
    // Small text
    if (['0.875rem', '14px', '0.9rem', '0.95rem', '0.92rem', '0.94rem'].includes(size)) return 'font-size: var(--text-small);';
    if (['0.75rem', '12px', '0.8rem', '0.85rem'].includes(size)) return 'font-size: var(--text-caption);';

    // Leave exact/weird values (like 'inherit', '10px', '4rem') intact to not break specific UI elements
    return match;
  });

  if (original !== content) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Normalized font sizes in:', file);
  }
});
console.log('Done normalizing font sizes.');
