# npm publication is paused

The 0.6.2 source/types and GitHub tarball can be used now. Automatic releases do not publish to npm; the release workflow defaults `publish_npm` to false. The existing registry recovery workflow is reserved for a future explicit publication request.

# Recover npm publication

The current GitHub release is `v0.6.2`. Earlier registry attempts returned authentication/authorization errors (`E404`); this is historical failure evidence, not a fresh diagnosis of the account. Publication remains paused until explicitly requested. The recovery workflow publishes the existing release tarball and does not create or replace a GitHub release.

## Configure the npm account

The publishing account must be allowed to publish `@hjs-spec/jep-sdk-js` in the npm `@hjs-spec` scope. Owning the GitHub organization alone does not establish npm scope permissions.

When the npm package exists, configure trusted publishing in its npm package settings:

| Field | Value |
|---|---|
| GitHub organization | `hjs-spec` |
| Repository | `sdk-js` |
| Workflow filename | `registry.yml` for recovery; add `release.yml` for future versions |
| GitHub environment | Leave empty |
| Allowed action | Enable direct `npm publish` |

If initial publication needs a token, add an authorized npm publish token as the repository Actions secret `NPM_TOKEN` in [GitHub settings](https://github.com/hjs-spec/sdk-js/settings/secrets/actions). Both publishing workflows expose it only to the publish step. The token must satisfy the npm account/package publishing policy. npm attempts OIDC first and can then use the supplied token. After trusted publishing succeeds, remove the temporary token.

See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) for the account fields and authentication behavior.

## Run recovery

After publication is explicitly resumed, open [Publish existing release to npm](https://github.com/hjs-spec/sdk-js/actions/workflows/registry.yml), choose **Run workflow**, and select `main`. Run the current workflow after adding credentials; rerunning an older run uses its older workflow definition.

Keep the failure status until publication succeeds. Do not rerun the entire `release.yml` workflow for this version: its GitHub release step intentionally refuses to overwrite an existing version.

After success, verify the actual registry result:

```sh
npm view @hjs-spec/jep-sdk-js@0.6.2 version
```
