# npm publication

Current package: **`@hjs-api-db/jep-sdk-js`**, software **0.7.2**.
GitHub source and OIDC owner remain **`hjs-spec/sdk-js`**.
No new npm organization, account conversion or paid plan is required.

## First publication completed — 2026-09-27

The [owner-authorized bootstrap](https://github.com/hjs-spec/sdk-js/actions/runs/36293757071/job/108550074854) published `@hjs-api-db/jep-sdk-js@0.7.2` at 04:25 UTC. The version endpoint and tarball hash then passed, but the immediate npm install request for the package index returned E404. That post-upload failure did not undo publication. Do not upload 0.7.2 again or create another token.

The [independent read-only verification](https://github.com/hjs-spec/sdk-js/actions/runs/36294562815) passed at 04:31 UTC:

- Anonymous version, full-package and install-v1 metadata were readable.
- Actual npm tarball bytes matched GitHub SHA-256 `18e557ea6cbe6c46b42f18ddfb2368d4f7a3eb1ab75916fd7a0031d128010e40`; SHA-512 integrity and SHA-1 metadata also matched.
- An empty consumer directory, fresh cache, empty npm configuration and an allowlisted environment installed the exact version without a credential and imported its expected SDK exports and Core 0.7 profile.
- Five verifier isolation/negative tests passed; existing SDK tests remained unchanged.

The original verification inherited setup-node v4's authentication configuration and had no retry around the install request. Both anonymous and public-placeholder probes returned 200 during the later check, so these results do **not** establish that the placeholder caused the earlier 404. Brief registry/index propagation or caching is consistent with the observed timing, but the exact initial cause is not proven. The repaired verifier isolates npm configuration and bounds propagation retries without weakening byte-integrity checks.

`verify-npm.yml` and `scripts/verify_npm_public.py` provide the read-only repeat check. They never publish, request an OIDC token or use a repository npm secret. The bootstrap's post-upload check now reuses the same isolated verifier. Historical failed runs are retained; a green read-only verification is not an OIDC-publication test.

```sh
npm install @hjs-api-db/jep-sdk-js@0.7.2
```

This initial release used a temporary npm token, not OIDC provenance. No SDK source, package version, signed event format or historical tarball was changed by the verification repair.

## Configure future automatic publishing

Log in to npm as `hjs-api-db`, open https://www.npmjs.com/package/@hjs-api-db/jep-sdk-js/access and locate Settings / Trusted publishing. Add GitHub Actions with:

| Field | Value |
|---|---|
| Organization or user | `hjs-spec` — the GitHub owner, NOT the npm username |
| Repository | `sdk-js` |
| Workflow filename | `release.yml` |
| Environment name | Leave blank |
| Allowed actions | Permit direct `npm publish` |

The existing release workflow uses GitHub-hosted runners, Node 24 and `id-token: write`. It does not use `NPM_BOOTSTRAP_TOKEN` or the historical `NPM_TOKEN`. Future VERSION changes on main build/test a new archive and attempt OIDC publication. Saving this configuration alone does not prove a later upload will succeed; verify it during the next intended release, not by republishing 0.7.2.

Revoke the temporary first-publication token(s) at https://www.npmjs.com/settings/hjs-api-db/tokens and remove only `NPM_BOOTSTRAP_TOKEN` from https://github.com/hjs-spec/sdk-js/settings/secrets/actions . Account 2FA and unrelated package credentials stay unchanged. The first-publication credential is no longer needed for the now-published version or the read-only verification. Never send credentials or recovery codes through chat.

## Recovery and historical releases

`registry.yml` is manual-only and may publish an unpublished existing GitHub release without rebuilding it. It needs its own Trusted Publisher when used; `release.yml` authorization does not cover `registry.yml`.

Do not rerun old 0.7.1 publication jobs: they retain the historical `@hjs-spec` name. Do not rerun a full release for an existing GitHub version. The workflow refuses to overwrite releases. Existing `hjs-client`, `jep-snap`, and `jep-eth` are unrelated and unchanged.

The one-time bootstrap and its setup history remain in [PR #13](https://github.com/hjs-spec/sdk-js/pull/13). Do not create an empty placeholder package or weaken account security to repeat it.

Official references: https://docs.npmjs.com/trusted-publishers/ and https://docs.npmjs.com/revoking-access-tokens/ .
