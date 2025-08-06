/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

const sdlcDir = path.join(process.cwd(), '.sdlc');
if (!fs.existsSync(sdlcDir) || !fs.statSync(sdlcDir).isDirectory()) {
  console.error(`Error: .sdlc directory not found at ${sdlcDir}`);
  process.exit(1);
}

const files = walk(sdlcDir);
const header = 'directory,file';
const csvLines = files.map(filePath => {
  const relative = path.relative(sdlcDir, filePath);
  const dir = path.dirname(relative);
  const file = path.basename(relative);
  return `${dir},${file}`;
});

const outputPath = path.join(sdlcDir, 'inventory.csv');
fs.writeFileSync(outputPath, [header, ...csvLines].join('\n'), 'utf8');
console.log(`Successfully generated SDLC inventory at ${outputPath}`);