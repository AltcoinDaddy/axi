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
  content = content.replace(/axi-protocol-contracts/g, 'nox-protocol-contracts');
  content = content.replace(/axi-confidential-contracts/g, 'nox-confidential-contracts');
  content = content.replace(/axi-hardhat-plugin/g, 'nox-hardhat-plugin');
  content = content.replace(/@iexec-axi/g, '@iexec-nox');
  
  if (content !== original) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log('Fixed', filepath);
  }
};

walk('.', replaceInFile);
