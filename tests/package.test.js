import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import * as renamed from '@hjs-api-db/jep-sdk-js';
import * as original from '../src/index.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const metadata = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

test('npm account scope changes without changing GitHub source identity', () => {
  assert.equal(metadata.name, '@hjs-api-db/jep-sdk-js');
  assert.equal(metadata.version, readFileSync(new URL('../VERSION', import.meta.url), 'utf8').trim());
  assert.equal(metadata.repository.url, 'https://github.com/hjs-spec/sdk-js.git');
  assert.equal(metadata.publishConfig.access, 'public');
  assert.equal(metadata.publishConfig.registry, 'https://registry.npmjs.org/');
});

test('new package self-reference preserves every runtime export', () => {
  assert.deepEqual(Object.keys(renamed), Object.keys(original));
  for (const name of Object.keys(original)) assert.equal(renamed[name], original[name]);
  assert.equal(renamed.JEP_CORE_PROFILE, 'jep-core-0.7');
});

test('packed archive installs offline and imports under its actual new name', () => {
  assert.ok(process.env.npm_execpath, 'Run this suite with npm test');
  const temporary = mkdtempSync(join(tmpdir(), 'jep-js-package-'));
  const npm = (...args) => execFileSync(process.execPath, [process.env.npm_execpath, ...args], {
    cwd: root, encoding: 'utf8', timeout: 60000,
  });
  try {
    const packed = JSON.parse(npm('pack', '--json', '--ignore-scripts', '--pack-destination', temporary));
    assert.equal(packed.length, 1);
    assert.equal(packed[0].name, metadata.name);
    assert.equal(packed[0].version, metadata.version);
    const install = join(temporary, 'consumer');
    mkdirSync(install);
    writeFileSync(join(install, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
    npm('install', '--prefix', install, '--offline', '--ignore-scripts', '--no-audit', '--no-fund',
      '--package-lock=false', join(temporary, packed[0].filename));
    const installed = JSON.parse(readFileSync(join(install, 'node_modules', metadata.name, 'package.json'), 'utf8'));
    assert.equal(installed.name, metadata.name);
    assert.equal(installed.version, metadata.version);
    for (const path of ['src/index.js', 'index.d.ts']) {
      assert.deepEqual(readFileSync(join(install, 'node_modules', metadata.name, path)), readFileSync(join(root, path)));
    }
    const consumer = join(install, 'check.mjs');
    writeFileSync(consumer, `import assert from 'node:assert/strict';
import { JEPClient, Verb, JEP_CORE_PROFILE } from '@hjs-api-db/jep-sdk-js';
assert.equal(JEP_CORE_PROFILE, 'jep-core-0.7');
let endpoint;
const client = new JEPClient({baseUrl:'http://127.0.0.1:8000',fetchImpl:async(url)=>{
  endpoint=String(url);return {ok:true,text:async()=>JSON.stringify({event:{id:'urn:example:smoke'}})};
}});
await client.createEvent({verb:Verb.Judgment,what:{claim:'package-smoke'}});
assert.ok(endpoint.endsWith('/v0.7/events/create'));
`);
    execFileSync(process.execPath, [consumer], { cwd: install, encoding: 'utf8', timeout: 10000 });
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});
