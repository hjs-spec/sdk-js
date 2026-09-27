# npm publication

Current package: **`@hjs-api-db/jep-sdk-js`**, software **0.7.2**.
GitHub source and OIDC owner remain **`hjs-spec/sdk-js`**.
No new npm organization, account conversion or paid plan is required.

## Current status — 2026-09-27

The first npm upload and independent public installation check are complete. The owner confirmed that the `release.yml` Trusted Publisher was added and that temporary npm tokens and the GitHub `NPM_BOOTSTRAP_TOKEN` secret were removed. These account settings are owner-confirmed, not independently read back. An actual OIDC publication remains to be verified during the next intended release; do not create a version solely to test authorization.

The one-time bootstrap workflow is retired from `.github/workflows`. Its exact source is retained as [historical text](docs/history/bootstrap-npm-0.7.2.yml.txt), with [context](docs/history/README.md); GitHub's old runs and published package files are unchanged. Do not create another bootstrap token or re-upload 0.7.2.

## First publication evidence

The [owner-authorized bootstrap](https://github.com/hjs-spec/sdk-js/actions/runs/36293757071/job/108550074854) published `@hjs-api-db/jep-sdk-js@0.7.2` at 04:25 UTC. The version endpoint and tarball hash then passed, but the immediate npm install request for the package index returned E404. That post-upload failure did not undo publication.

The [independent read-only verification](https://github.com/hjs-spec/sdk-js/actions/runs/36294562815) passed at 04:31 UTC:

- Anonymous version, full-package and install-v1 metadata were readable.
- Actual npm tarball bytes matched GitHub SHA-256 `18e557ea6cbe6c46b42f18ddfb2368d4f7a3eb1ab75916fd7a0031d128010e40`; SHA-512 integrity and SHA-1 metadata also matched.
- An empty consumer directory, fresh cache, empty npm configuration and an allowlisted environment installed the exact version without a credential and imported its expected SDK exports and Core 0.7 profile.
- Five verifier isolation/negative tests passed; existing SDK tests remained unchanged by that repair.

The original verification inherited setup-node v4's authentication configuration and had no retry around the install request. Both anonymous and public-placeholder probes returned 200 during the later check, so these results do **not** establish that the placeholder caused the earlier 404. Brief registry/index propagation or caching is consistent with the timing, but the exact initial cause is not proven. The verifier isolates npm configuration and bounds propagation retries without weakening integrity checks.

`verify-npm.yml` and `scripts/verify_npm_public.py` provide the read-only repeat check. They never publish, request an OIDC token or use a repository npm secret. Historical failed runs are retained; a green installation check is not an OIDC-publication test.

```sh
npm install @hjs-api-db/jep-sdk-js@0.7.2
```

The initial release used a temporary npm token, not OIDC provenance. No SDK source, package version, signed event format or historical tarball was changed by retiring the bootstrap.

## Future automatic publishing

The configured target is the npm package's [Trusted publishing settings](https://www.npmjs.com/package/@hjs-api-db/jep-sdk-js/access), using GitHub Actions:

| Field | Value |
|---|---|
| Organization or user | `hjs-spec` — GitHub owner, not npm username |
| Repository | `sdk-js` |
| Workflow filename | `release.yml` |
| Environment name | Blank |
| Allowed actions | Direct `npm publish` |

The release workflow uses GitHub-hosted runners, Node 24 and `id-token: write`. It does not use a bootstrap or legacy npm secret. A deliberate VERSION change on main tests/builds a new archive and attempts OIDC publication. Verify the registry artifact and anonymous installation after that upload. Merely saving trust is not proof that an upload will succeed.

## Recovery and historical releases

`registry.yml` is manual-only and may publish an unpublished existing GitHub release without rebuilding it. It needs its own Trusted Publisher when used; `release.yml` authorization does not cover it.

Do not rerun old 0.7.1 publication jobs: they retain the historical `@hjs-spec` name. Do not rerun a full release for an existing GitHub version. The workflow refuses to overwrite releases. Existing `hjs-client`, `jep-snap`, and `jep-eth` are unrelated and unchanged. Do not weaken account 2FA or restore retired tokens.

Official references: https://docs.npmjs.com/trusted-publishers/ and https://docs.npmjs.com/revoking-access-tokens/ .
