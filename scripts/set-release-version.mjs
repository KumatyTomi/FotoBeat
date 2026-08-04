import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const write = process.argv.includes('--write');
const requestedVersion = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
const versionPattern = /^v?(0\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/;

if (!requestedVersion) {
  const rootPackage = readJson('package.json');
  console.log(`Current release version: v${rootPackage.version}`);
  console.log('Usage: npm run release:version -- 0.1.1 --write');
  process.exit(0);
}

const match = requestedVersion.match(versionPattern);
if (!match) {
  console.error(`Invalid release version: ${requestedVersion}`);
  console.error('Expected v0.x.x or 0.x.x, for example v0.1.1.');
  process.exit(1);
}

const nextVersion = match[1];
const packagePaths = ['package.json', 'desktop/package.json'];

for (const packagePath of packagePaths) {
  const packageJson = readJson(packagePath);
  packageJson.version = nextVersion;

  if (write) {
    fs.writeFileSync(path.join(repoRoot, packagePath), `${JSON.stringify(packageJson, null, 2)}\n`);
  }
}

if (write) {
  console.log(`Updated FotoBeat release version to v${nextVersion}.`);
} else {
  console.log(`Dry run: FotoBeat release version would be v${nextVersion}. Add --write to update package files.`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}
