import { spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import {
  join,
  resolve,
} from 'node:path';
import { parseArgs } from 'node:util';

import { load } from 'js-yaml';

import { HarvestingConfig } from '../src/config/harvesting-config.interface';
import {
  buildFairicatLinkset,
  buildRepositoryGraph,
  getRepositoryDiscoveryLinks,
} from '../src/config/harvesting-metadata.util';

const { values } = parseArgs({ options: {
  'harvester-path': { type: 'string' },
  python: { type: 'string' },
} });
if (!values['harvester-path']) {
  throw new Error('Pass --harvester-path pointing to an unchanged EDEN checkout with its Python dependencies installed.');
}
const harvesterPath = resolve(values['harvester-path']);
const python = values.python || join(harvesterPath, '.venv/bin/python');
const config = (load(readFileSync('config/config.yml', 'utf8')) as { harvesting: HarvestingConfig }).harvesting;
const ui = 'https://repository.uist.edu.mk';
const rest = `${ui}/server`;
const fixtures = mkdtempSync(join(tmpdir(), 'uist-eden-compatibility-'));
try {
  for (const [name, value] of [
    ['repository.jsonld', buildRepositoryGraph(config, ui, rest)],
    ['api-catalog.json', buildFairicatLinkset(config, ui, rest)],
    ['discovery-links.json', getRepositoryDiscoveryLinks(config, ui, rest)],
  ] as const) {
    writeFileSync(join(fixtures, name), JSON.stringify(value));
  }
  const result = spawnSync(python, [
    'scripts/check_eden_fixtures.py', '--harvester-path', harvesterPath, '--fixtures-dir', fixtures,
  ], { stdio: 'inherit' });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exitCode = result.status || 1;
  }
} finally {
  rmSync(fixtures, { recursive: true, force: true });
}
