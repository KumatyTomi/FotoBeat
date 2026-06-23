import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const indexPath = path.resolve(process.cwd(), 'dist', 'index.html');

if (!existsSync(indexPath)) {
  console.error(`Electron asset smoke check failed: ${indexPath} does not exist. Run the web build first.`);
  process.exit(1);
}

const html = readFileSync(indexPath, 'utf8');
const absoluteLocalReferences = [...html.matchAll(/\b(?:src|href)=["']\/(?!\/)([^"']+)["']/g)].map((match) => `/${match[1]}`);

if (absoluteLocalReferences.length > 0) {
  console.error('Electron asset smoke check failed: packaged app cannot load absolute local asset paths through file://.');
  console.error('Found absolute references:');
  for (const reference of absoluteLocalReferences) {
    console.error(`- ${reference}`);
  }
  console.error("Set Vite base to './' and rebuild.");
  process.exit(1);
}

const hasRelativeBundleReference = /\b(?:src|href)=["'](?:\.\/)?assets\//.test(html);

if (!hasRelativeBundleReference) {
  console.warn('Electron asset smoke check warning: no relative assets/* bundle references found in dist/index.html.');
}

console.log('Electron asset smoke check passed: dist/index.html uses file:// safe relative asset paths.');
