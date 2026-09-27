# npm publication

Current package: **`@hjs-api-db/jep-sdk-js`**, software **0.7.2**.
GitHub source and OIDC owner remain **`hjs-spec/sdk-js`**.
No new npm organization, account conversion or paid plan is required for this public package.

## First publication — owner action

This release changes the npm account scope. It does not transfer an old package,
recover another account, rewrite historical tarballs or change Core 0.7.
The new package needs an initial publication before a Trusted Publisher can be configured.
Do not use the old @hjs-spec tarball or rename a tarball filename to change its package name.

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
to overwrite releases. After a manual initial upload, do not attempt to upload
0.7.2 again; configure OIDC for subsequent versions. Existing packages
`hjs-client`, `jep-snap`, and organization `jep-eth` are unrelated and unchanged.

Official references: https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/
and https://docs.npmjs.com/trusted-publishers/ .
