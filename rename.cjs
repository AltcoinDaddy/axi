const fs = require('fs');
const path = require('path');

const walk = (dir, callback) => {
  if (dir.includes('node_modules') || dir.includes('.next') || dir.includes('artifacts') || dir.includes('cache') || dir.includes('deployments')) return;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      walk(filepath, callback);
    } else if (stats.isFile()) {
      callback(filepath);
    }
  });
};

const replaceInFile = (filepath) => {
  if (!filepath.match(/\.(ts|tsx|sol|json|md|css|env|example|local)$/) && !filepath.includes('.env')) return;
  let content = fs.readFileSync(filepath, 'utf8');
  let original = content;
  content = content.replace(/NoxShield/g, 'Axi');
  content = content.replace(/noxshield/g, 'axi');
  content = content.replace(/nox-/g, 'axi-');
  
  // Exclude some files if needed, but here it should be fine.
  if (content !== original) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log('Updated', filepath);
  }
};

walk('.', replaceInFile);
