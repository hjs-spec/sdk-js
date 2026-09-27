# Release 0.7.2

- Publish the maintained JavaScript SDK under the owner-controlled npm scope `@hjs-api-db/jep-sdk-js`. The GitHub repository remains `hjs-spec/sdk-js`.
- Update installation and import instructions; document the one-time real-package bootstrap before Trusted Publisher configuration.
- Keep runtime source, public types, Core 0.7 paths and event/signature semantics unchanged. Existing consumers must explicitly update the dependency/import name; no registry redirect or package transfer is implied.
- Add metadata/self-import and isolated offline packed-install tests.
- Use OIDC without the historical NPM_TOKEN fallback; keep registry-only recovery manual to avoid a release/download race.

GitHub v0.7.1 and older assets remain unchanged under the historical scope. npm publication of the new scope is pending the owner's authenticated initial upload. No placeholder package, new protocol draft or production credential is created by this release.
