const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Copy layoutComponents
console.log('Copying layoutComponents...');
execSync('cp -r /Users/amman/Documents/projects/costahq/FindYourStays-FrontEnd/app/components/layoutComponents /Users/amman/Documents/projects/costahq/costahq-admin/src/components/');

// 2. Fix envConfig imports
function fixEnvConfigImports(dir, depth) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixEnvConfigImports(fullPath, depth + 1);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');

      // Calculate correct relative path to src/envConfig
      // depth = 1 -> '../envConfig'
      // depth = 2 -> '../../envConfig'
      // depth = 3 -> '../../../envConfig'
      let relativePrefix = '';
      for (let i = 0; i < depth; i++) relativePrefix += '../';
      let correctPath = relativePrefix + 'envConfig';

      // Replace any variation of envConfig import with the correct one
      const newContent = content.replace(/['"](\.\.\/)+envConfig['"]/g, `'${correctPath}'`);

      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log(`Fixed envConfig import in ${fullPath}`);
      }
    }
  });
}

// src is depth 0
// src/components is depth 1
// src/components/adminComponents is depth 2
// src/pages is depth 1
// src/pages/admin is depth 2
// src/layouts is depth 1

console.log('Fixing envConfig imports...');
fixEnvConfigImports(path.join(__dirname, 'src', 'components'), 1);
fixEnvConfigImports(path.join(__dirname, 'src', 'pages'), 1);
fixEnvConfigImports(path.join(__dirname, 'src', 'layouts'), 1);

// Fix layout components imports as well, and apply the tailwind transformations to them
const SOURCE_ROOT = '/Users/amman/Documents/projects/costahq/FindYourStays-FrontEnd';
const classMap = {
  'container': 'container mx-auto px-4',
  'row': 'flex flex-wrap',
  'd-flex': 'flex',
  'align-items-center': 'items-center',
  'justify-content-between': 'justify-between',
  // etc, just basic ones
};
function applyTailwindToLayouts(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      applyTailwindToLayouts(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/import\s+['"][^'"]+\.css['"]\s*;/g, '');
      Object.keys(classMap).forEach(bsClass => {
        const regex = new RegExp(`(?<=[\\s"'\\\`])${bsClass}(?=[\\s"'\\\`])`, 'g');
        content = content.replace(regex, classMap[bsClass]);
      });
      fs.writeFileSync(fullPath, content);
    }
  });
}
applyTailwindToLayouts(path.join(__dirname, 'src', 'components', 'layoutComponents'));

console.log('Done!');
