import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

test('retired bootstrap remains historical, never an active publishing path', () => {
  assert.equal(fs.existsSync(path.join(root, '.github/workflows/bootstrap-npm.yml')), false);
  assert.ok(fs.existsSync(path.join(root, 'docs/history/bootstrap-npm-0.7.2.yml.txt')));
  for (const name of fs.readdirSync(path.join(root, '.github/workflows'))) {
    if (!/\.ya?ml$/.test(name)) continue;
    const workflow = fs.readFileSync(path.join(root, '.github/workflows', name), 'utf8');
    assert.doesNotMatch(workflow, /NPM_BOOTSTRAP_TOKEN/);
  }
});

test('ordinary releases retain OIDC and read-only installation remains separate', () => {
  const release = fs.readFileSync(path.join(root, '.github/workflows/release.yml'), 'utf8');
  assert.match(release, /id-token: write/);
  assert.doesNotMatch(release, /secrets\.NPM_TOKEN/);
  const verify = fs.readFileSync(path.join(root, '.github/workflows/verify-npm.yml'), 'utf8');
  assert.doesNotMatch(verify, /npm publish|id-token: write|secrets\./);
});
