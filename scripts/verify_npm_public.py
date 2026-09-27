"""Read-only verification of the fixed 0.7.2 release, without npm credentials."""
from __future__ import annotations

import base64
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile
import time
from urllib.error import HTTPError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

PACKAGE = '@hjs-api-db/jep-sdk-js'
VERSION = '0.7.2'
ROOT = 'https://registry.npmjs.org/@hjs-api-db%2fjep-sdk-js'
SHA256 = '18e557ea6cbe6c46b42f18ddfb2368d4f7a3eb1ab75916fd7a0031d128010e40'
ACCEPT = 'application/vnd.npm.install-v1+json'


def read(url, accept='application/json', dummy=False):
    parsed = urlsplit(url)
    if parsed.scheme != 'https' or parsed.hostname != 'registry.npmjs.org' or parsed.username:
        raise ValueError('Unexpected registry URL')
    headers = {'Accept': accept, 'User-Agent': 'JEP-public-install-verifier', 'Cache-Control': 'no-cache'}
    if dummy:
        # Deliberately reproduce setup-node v4's PUBLIC placeholder, never a secret.
        headers['Authorization'] = 'Bearer XXXXX-XXXXX-XXXXX-XXXXX'
    with urlopen(Request(url, headers=headers), timeout=25) as response:
        return response.read()


def check_metadata(metadata):
    if metadata.get('name') != PACKAGE or metadata.get('version') != VERSION:
        raise ValueError('Unexpected package identity')
    return metadata


def check_bytes(data, metadata):
    if hashlib.sha256(data).hexdigest() != SHA256:
        raise ValueError('Registry tarball does not match pinned GitHub SHA-256')
    expected_sri = 'sha512-' + base64.b64encode(hashlib.sha512(data).digest()).decode()
    if metadata['dist'].get('integrity') != expected_sri:
        raise ValueError('Registry integrity differs from actual bytes')
    if metadata['dist'].get('shasum') != hashlib.sha1(data).hexdigest():
        raise ValueError('Registry shasum differs from actual bytes')


def anonymous_environment(root):
    root = Path(root)
    home = root / 'home'
    home.mkdir()
    userconfig, globalconfig = root / 'user.npmrc', root / 'global.npmrc'
    userconfig.write_text('', encoding='utf-8')
    globalconfig.write_text('', encoding='utf-8')
    # An allowlist prevents inherited .npmrc, NODE_AUTH_TOKEN, NPM_CONFIG_*,
    # NODE_OPTIONS, proxy credentials or CI tokens from reaching npm/node.
    env = {k: os.environ[k] for k in ('PATH', 'SystemRoot', 'COMSPEC', 'PATHEXT') if k in os.environ}
    env.update(HOME=str(home), USERPROFILE=str(home),
               NPM_CONFIG_USERCONFIG=str(userconfig), NPM_CONFIG_GLOBALCONFIG=str(globalconfig),
               NPM_CONFIG_CACHE=str(root / 'cache'), NPM_CONFIG_REGISTRY='https://registry.npmjs.org/',
               NPM_CONFIG_IGNORE_SCRIPTS='true', NPM_CONFIG_AUDIT='false', NPM_CONFIG_FUND='false')
    return env


def main():
    output = Path('public-npm-evidence')
    output.mkdir(exist_ok=True)
    report = {'status': 'running', 'package': PACKAGE, 'version': VERSION, 'probes': []}
    try:
        # Contrast anonymous reads with the non-secret setup-node placeholder.
        for dummy in (False, True):
            for accept in ('application/json', ACCEPT):
                try:
                    read(ROOT, accept, dummy)
                    status = 200
                except HTTPError as exc:
                    status = exc.code
                report['probes'].append({'auth': 'literal-setup-node-placeholder' if dummy else 'none',
                                         'accept': accept, 'status': status})
        print(json.dumps({'probes': report['probes']}, indent=2), flush=True)
        for attempt in range(6):
            try:
                meta = check_metadata(json.loads(read(ROOT + '/' + VERSION)))
                full = json.loads(read(ROOT))
                abbreviated = json.loads(read(ROOT, ACCEPT))
                check_metadata(full['versions'][VERSION])
                check_metadata(abbreviated['versions'][VERSION])
                data = read(meta['dist']['tarball'], 'application/octet-stream')
                for item in (meta, full['versions'][VERSION], abbreviated['versions'][VERSION]):
                    check_bytes(data, item)
                break
            except HTTPError as exc:
                if exc.code not in (404, 429, 502, 503, 504) or attempt == 5:
                    raise
            except KeyError:
                if attempt == 5:
                    raise
            time.sleep(5 * (attempt + 1))
        report['sha256'] = hashlib.sha256(data).hexdigest()
        report['public_metadata'] = ['version', 'full', 'install-v1']
        (output / 'registry-version.json').write_text(json.dumps(meta, indent=2), encoding='utf-8')
        for attempt in range(4):
            with tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                env = anonymous_environment(root)
                work = root / 'consumer'
                work.mkdir()
                result = subprocess.run(['npm', 'install', PACKAGE + '@' + VERSION, '--ignore-scripts',
                    '--no-audit', '--no-fund', '--package-lock=false', '--registry=https://registry.npmjs.org/'],
                    cwd=work, env=env, text=True, capture_output=True, timeout=120)
                (output / f'install-{attempt + 1}.log').write_text(result.stdout + result.stderr, encoding='utf-8')
                print(result.stdout + result.stderr, flush=True)
                if result.returncode:
                    if attempt == 3 or not any(code in result.stderr for code in ('E404', 'ETARGET')):
                        raise RuntimeError('Anonymous clean npm installation failed; see install log')
                else:
                    imported = subprocess.run(['node', '--input-type=module', '-e',
                        "import fs from 'node:fs'; const m = await import('@hjs-api-db/jep-sdk-js'); "
                        "const p = JSON.parse(fs.readFileSync('node_modules/@hjs-api-db/jep-sdk-js/package.json')); "
                        "if (p.name !== '@hjs-api-db/jep-sdk-js' || p.version !== '0.7.2' || "
                        "typeof m.JEPClient !== 'function' || m.JEP_CORE_PROFILE !== 'jep-core-0.7') "
                        "throw Error('Unexpected installed SDK'); console.log('Anonymous registry import verified');"],
                        cwd=work, env=env, text=True, capture_output=True, timeout=30)
                    (output / 'import.log').write_text(imported.stdout + imported.stderr, encoding='utf-8')
                    imported.check_returncode()
                    report['anonymous_install'] = 'pass'
                    report['installed_import'] = 'pass'
                    break
            time.sleep(10 * (attempt + 1))
        report['status'] = 'pass'
        report['limits'] = 'Read-only package/hash/install check; no publication, OIDC test or live JEP service.'
    except Exception as exc:
        report.update(status='fail', error=f'{type(exc).__name__}: {exc}')
        raise
    finally:
        text = json.dumps(report, indent=2)
        (output / 'report.json').write_text(text, encoding='utf-8')
        print(text, flush=True)
        if os.environ.get('GITHUB_STEP_SUMMARY'):
            with open(os.environ['GITHUB_STEP_SUMMARY'], 'a') as summary:
                summary.write('## Anonymous npm registry verification\n\n```json\n' + text + '\n```\n')


if __name__ == '__main__':
    main()
