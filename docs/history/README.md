# Historical first publication

`bootstrap-npm-0.7.2.yml.txt` preserves the exact final one-time workflow bytes from
[PR #14](https://github.com/hjs-spec/sdk-js/pull/14). It is outside `.github/workflows`
and is not an active GitHub Actions entry. The original run history remains intact.

The owner-authorized first upload of `@hjs-api-db/jep-sdk-js@0.7.2` and independent
public download/install verification are complete. The owner subsequently confirmed
that the `release.yml` Trusted Publisher was saved and temporary npm tokens and
`NPM_BOOTSTRAP_TOKEN` were removed. Those account settings are owner-confirmed;
this does not claim an actual OIDC publication has been exercised.

Do not create a new bootstrap token, restore this workflow, or re-upload 0.7.2.
Use `verify-npm.yml` for read-only checks. Use the normal `release.yml` for the next
intended software release. `registry.yml` is a separate manual recovery workflow
with its own trust requirement. See [PUBLISHING.md](../../PUBLISHING.md).
