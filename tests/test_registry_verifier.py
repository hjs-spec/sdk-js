import base64
import hashlib
import importlib.util
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('verifier', Path(__file__).parents[1] / 'scripts/verify_npm_public.py')
v = importlib.util.module_from_spec(spec)
spec.loader.exec_module(v)


class PublicVerifierTest(unittest.TestCase):
    def test_credentials_and_inherited_npm_settings_never_reach_install(self):
        with tempfile.TemporaryDirectory() as directory, patch.dict(os.environ, {
            'NODE_AUTH_TOKEN': 'secret', 'NPM_TOKEN': 'secret', 'GH_TOKEN': 'secret',
            'NPM_CONFIG_USERCONFIG': '/old/auth.npmrc', 'npm_config_registry': 'https://wrong/',
            'NODE_OPTIONS': '--require=/bad.js', 'HTTPS_PROXY': 'https://secret@proxy'}):
            env = v.anonymous_environment(directory)
            for key in ('NODE_AUTH_TOKEN', 'NPM_TOKEN', 'GH_TOKEN', 'npm_config_registry', 'NODE_OPTIONS', 'HTTPS_PROXY'):
                self.assertNotIn(key, env)
            self.assertEqual(Path(env['NPM_CONFIG_USERCONFIG']).read_text(), '')
            self.assertEqual(Path(env['NPM_CONFIG_GLOBALCONFIG']).read_text(), '')
            self.assertNotEqual(env['HOME'], os.environ.get('HOME'))
            self.assertEqual(env['NPM_CONFIG_REGISTRY'], 'https://registry.npmjs.org/')

    def test_identity_mismatch_is_rejected(self):
        for name, version in [('other', v.VERSION), (v.PACKAGE, '0.7.1')]:
            with self.assertRaises(ValueError):
                v.check_metadata({'name': name, 'version': version})
        v.check_metadata({'name': v.PACKAGE, 'version': v.VERSION})

    def test_different_bytes_are_rejected(self):
        with self.assertRaises(ValueError):
            v.check_bytes(b'wrong', {'dist': {}})

    def test_sri_and_sha1_are_checked_independently(self):
        data = b'synthetic test artifact'
        meta = {'dist': {'integrity': 'sha512-' + base64.b64encode(hashlib.sha512(data).digest()).decode(),
                         'shasum': hashlib.sha1(data).hexdigest()}}
        with patch.object(v, 'SHA256', hashlib.sha256(data).hexdigest()):
            v.check_bytes(data, meta)
            for member in ('integrity', 'shasum'):
                bad = {'dist': {**meta['dist'], member: 'wrong'}}
                with self.assertRaises(ValueError):
                    v.check_bytes(data, bad)

    def test_unexpected_hosts_rejected_before_network(self):
        for url in ('http://registry.npmjs.org/a', 'https://example.com/a', 'https://user@registry.npmjs.org/a'):
            with self.assertRaises(ValueError):
                v.read(url)


if __name__ == '__main__':
    unittest.main()
