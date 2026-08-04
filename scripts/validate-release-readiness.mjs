import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const rootPackage = readJson('package.json');
const desktopPackage = readJson('desktop/package.json');
const windowsWorkflow = readText('.github/workflows/windows-installer.yml');
const releaseDocs = readText('docs/RELEASE_PROCESS.md');

const errors = [
  ...validateVersions(rootPackage, desktopPackage),
  ...validateWindowsInstallerWorkflow(windowsWorkflow),
  ...validateReleaseDocs(releaseDocs)
];

if (errors.length > 0) {
  console.error('\nRelease readiness validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`ok release version v${rootPackage.version}`);
console.log('ok Windows installer GitHub Release publishing');
console.log('ok Windows installer signing configuration');
console.log('ok manual update path');

function validateVersions(rootPkg, desktopPkg) {
  const errors = [];
  const versionPattern = /^0\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

  if (!versionPattern.test(rootPkg.version)) {
    errors.push(`root package version must match v0.x.x release line, got ${rootPkg.version}`);
  }

  if (rootPkg.version !== desktopPkg.version) {
    errors.push(`root and desktop package versions must match, got ${rootPkg.version} and ${desktopPkg.version}`);
  }

  return errors;
}

function validateWindowsInstallerWorkflow(workflow) {
  const requiredSnippets = [
    ["tag trigger for v* releases", "tags: ['v*']"],
    ['contents write permission', 'contents: write'],
    ['Windows CSC link secret', 'WINDOWS_CSC_LINK'],
    ['Windows CSC password secret', 'WINDOWS_CSC_KEY_PASSWORD'],
    ['electron-builder CSC_LINK env', 'CSC_LINK'],
    ['unsigned fallback', 'CSC_IDENTITY_AUTO_DISCOVERY=false'],
    ['installer exe asset upload', 'desktop/release/*.exe'],
    ['GitHub Release upload', 'gh release upload'],
    ['GitHub Release create', 'gh release create']
  ];

  return missingSnippetErrors(workflow, requiredSnippets, '.github/workflows/windows-installer.yml');
}

function validateReleaseDocs(docs) {
  const requiredSnippets = [
    ['version command', 'npm run release:version -- 0.1.1 --write'],
    ['release readiness command', 'npm run release:check'],
    ['tag push command', 'git push origin v0.1.1'],
    ['signing secrets', 'WINDOWS_CSC_LINK'],
    ['manual update page', 'GitHub Releases']
  ];

  return missingSnippetErrors(docs, requiredSnippets, 'docs/RELEASE_PROCESS.md');
}

function missingSnippetErrors(text, requiredSnippets, filePath) {
  return requiredSnippets
    .filter(([, snippet]) => !text.includes(snippet))
    .map(([label, snippet]) => `${filePath} is missing ${label}: ${snippet}`);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}
