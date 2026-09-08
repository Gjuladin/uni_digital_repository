#!/usr/bin/env node

const { execFileSync } = require('node:child_process');
const { readFileSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');

const output = execFileSync('npx', [
  '--yes',
  'license-checker',
  '--production',
  '--json',
  '--relativeLicensePath',
], { encoding: 'utf8' });
const licenses = JSON.parse(output);

for (const license of Object.values(licenses)) {
  // Machine-specific installation paths do not belong in a committed notice.
  delete license.path;
}

writeFileSync(
  resolve(__dirname, '..', 'THIRD_PARTY_LICENSES.json'),
  `${JSON.stringify(licenses, null, 2)}\n`,
);

const notices = ['THIRD-PARTY NOTICES', '===================', ''];
for (const [component, license] of Object.entries(licenses).sort(([a], [b]) => a.localeCompare(b))) {
  notices.push(component, '-'.repeat(component.length));
  notices.push(`Declared licence: ${license.licenses || 'UNKNOWN'}`);
  if (license.repository) {
    notices.push(`Source: ${license.repository}`);
  }
  notices.push('');
  if (license.licenseFile) {
    notices.push(readFileSync(resolve(__dirname, '..', license.licenseFile), 'utf8').trim());
  } else {
    notices.push('No licence text file was identified by license-checker; consult THIRD_PARTY_LICENSES.json.');
  }
  notices.push('', '');
}

writeFileSync(
  resolve(__dirname, '..', 'THIRD_PARTY_NOTICES.txt'),
  `${notices.join('\n')}`,
);
