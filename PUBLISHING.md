# npm publication

GitHub release **v0.7.1** contains the installable tarball. The npm job failed with `ENEEDAUTH`; it is awaiting publisher authorization, not a code fix. See [installation](README.md#installation) and the dated [delivery record](https://github.com/hjs-spec/.github/blob/main/DELIVERY-2026-09-26.md).

## Workflow behavior

- `release.yml` runs when `VERSION` changes on `main`, or by manual dispatch. It creates the GitHub release, then attempts npm publication.
- `registry.yml` downloads the tarball for the checked-out `VERSION` and publishes it without recreating the GitHub release. It runs by manual dispatch or a change to that workflow on `main`.
- A documentation change does not publish a package.

## Publisher configuration

The npm account must be authorized to publish `@hjs-spec/jep-sdk-js` in the `@hjs-spec` scope. GitHub organization ownership alone is insufficient.

The workflows support npm trusted publishing for `hjs-spec/sdk-js`, with workflow filename `release.yml` or `registry.yml` and no GitHub environment. If a bootstrap publish token is needed, configure an authorized `NPM_TOKEN` in repository Actions secrets. The workflows supply it only to the publish step. Consult [npm's publisher documentation](https://docs.npmjs.com/trusted-publishers/) for the account setup.

## Recover the existing release

After authorization is configured, rerun **only the failed npm job** of the v0.7.1 release, or dispatch `registry.yml` with a revision whose `VERSION` is `0.7.1`.

Do not rerun the complete release workflow for an existing version: the GitHub release job refuses to overwrite it. Verify the result with:

```sh
npm view @hjs-spec/jep-sdk-js@0.7.1 version
```

Keep registry status blocked until that publication is confirmed. The original v0.6.2 failure is historical evidence, not the current release.
