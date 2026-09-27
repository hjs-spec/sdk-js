# npm publication

Current package: **`@hjs-api-db/jep-sdk-js`**, software **0.7.2**.
GitHub source and OIDC owner remain **`hjs-spec/sdk-js`**.
No new npm organization, account conversion or paid plan is required for this public package.

## First publication — owner action

This release changes the npm account scope. It does not transfer an old package,
recover another account, rewrite historical tarballs or change Core 0.7.
The new package needs an initial publication before a Trusted Publisher can be configured.
Do not use the old @hjs-spec tarball or rename a tarball filename to change its package name.

### Browser-only option

No workstation Node.js installation is necessary for this option. The owner
configures npm and a GitHub repository secret; GitHub runs the upload.

1. Log in to npm as `hjs-api-db`, verify the correct email and complete any interactive security challenge. At https://www.npmjs.com/settings/hjs-api-db/tokens create a temporary Granular Access Token named `jep-sdk-first-publish`. Use **Read and write (publish and stage)**, enable **Bypass 2FA** for this non-interactive first upload, and select only the `@hjs-api-db` package scope. Do not select the unrelated old packages or grant organization-management access. If the personal scope is not offered, stop and review the available restrictions rather than silently granting all-package access. Leave IP restrictions empty for the GitHub-hosted runner; set the shortest practical expiry (one day or a custom next-day date). This token can publish without a human prompt, so use it only for this one-time bootstrap and revoke promptly. It does not disable account 2FA.
2. Copy the token directly into https://github.com/hjs-spec/sdk-js/settings/secrets/actions/new as the repository secret **`NPM_BOOTSTRAP_TOKEN`**. Never send it, a recovery code or an authentication link through chat or commit it to the repository. A saved secret is not itself a successful publication.
3. Open https://github.com/hjs-spec/sdk-js/actions/workflows/bootstrap-npm.yml, select **Run workflow**, keep branch **main**, enter **`publish-0.7.2`** as the confirmation and run. This is the only workflow that reads the bootstrap secret; old release/registry tasks do not use it.
4. Require the complete workflow to succeed. It verifies the existing GitHub tarball's pinned SHA-256, package name/version/source and clean offline import before uploading. It checks npm identity `hjs-api-db`, then independently downloads the registry tarball and checks its hash and clean installation. Identical already-published versions are not uploaded again; a differing existing artifact stops the workflow. PR checks do not publish and do not read the npm token. No SDK package is rebuilt.
5. After successful publication, revoke this temporary token in npm and remove the GitHub secret. Configure the package's `release.yml` Trusted Publisher below for future versions. The bootstrap deliberately does not generate or claim OIDC provenance.

Current npm documentation allows this temporary direct-publish token path; its
planned January 2027 removal is another reason not to retain it for ongoing
publishing. A **stage-only** token cannot perform this bootstrap's direct
`npm publish`. Follow account/package enforcement and never weaken an existing
policy requiring fully enforced 2FA just to make this workflow pass.

### Alternative: owner workstation

Use a current Node.js LTS installation. In an empty directory, download the
`hjs-api-db-jep-sdk-js-0.7.2.tgz` asset from this repository's v0.7.2 GitHub release.
Use the actual reviewed SDK, not an empty placeholder. Confirm your npm account's
email is verified and enable two-factor authentication when required by npm.

```sh
npm login --auth-type=web --registry=https://registry.npmjs.org/
npm whoami --registry=https://registry.npmjs.org/
# Stop unless whoami returns exactly hjs-api-db.
npm publish ./hjs-api-db-jep-sdk-js-0.7.2.tgz --access public --registry=https://registry.npmjs.org/
npm view @hjs-api-db/jep-sdk-js@0.7.2 version dist.integrity --registry=https://registry.npmjs.org/
```

On Windows PowerShell, use `npm.cmd` instead of `npm` to avoid execution-policy
issues with npm.ps1. Complete login/2FA in npm's own UI. Never send passwords,
recovery codes, access tokens or authentication links in chat. A local bootstrap
upload has no GitHub OIDC provenance; do not claim otherwise.

## Configure automatic publishing after the package exists

Open https://www.npmjs.com/package/@hjs-api-db/jep-sdk-js/access and locate
Settings / Trusted publishing. Add GitHub Actions with:

| Field | Value |
|---|---|
| Organization or user | `hjs-spec` — the GitHub owner, NOT the npm username |
| Repository | `sdk-js` |
| Workflow filename | `release.yml` |
| Environment name | Leave blank |
| Allowed actions | Permit direct `npm publish` |

The workflow uses GitHub-hosted runners, Node 24 and `id-token: write`.
It no longer supplies the historical NPM_TOKEN as a fallback. Future VERSION
changes on main build/test a new archive and publish through OIDC. A configured
publisher is not itself proof that an OIDC upload has succeeded.

## Recovery and historical releases

`registry.yml` is manual-only and can publish an existing GitHub release without
recreating it. Authorize a separate Trusted Publisher for `registry.yml` only
when this recovery path is needed; authorizing `release.yml` does not authorize
`registry.yml`. Both use the GitHub owner `hjs-spec`, repository `sdk-js`, no environment,
and direct-publish permission.

Do not rerun old failed 0.7.1 jobs: they retain the old npm package name.
Do not rerun a full release for an existing GitHub version. The workflow refuses
to overwrite releases. After an initial upload, do not attempt to upload
0.7.2 again; configure OIDC for subsequent versions. Existing packages
`hjs-client`, `jep-snap`, and organization `jep-eth` are unrelated and unchanged.

Official references:
- https://docs.npmjs.com/creating-and-viewing-access-tokens/
- https://docs.npmjs.com/about-access-tokens/
- https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/
- https://docs.npmjs.com/trusted-publishers/
