# JEP JavaScript SDK — JEP Core 0.7

JavaScript client for the current [JEP Core 0.7](https://github.com/hjs-spec/jep-core) reference API.

## Status

Experimental HTTP client. Event creation and verification run on the configured
API. Start the [local reference API](https://github.com/hjs-spec/jep-quickstart#start-a-local-api)
before running the examples below.

## Installation

```bash
npm install @hjs-api-db/jep-sdk-js@0.7.2
```

The package and import name is `@hjs-api-db/jep-sdk-js`. When upgrading from
`@hjs-spec/jep-sdk-js`, update both the dependency and imports.
[Release and installation evidence](PUBLISHING.md).

## Quick start

```js
import { JEPClient, Verb } from "@hjs-api-db/jep-sdk-js";

const client = new JEPClient({ baseUrl: "http://127.0.0.1:8000" });
const created = await client.createEvent({
  verb: Verb.Judgment,
  who: "did:example:agent-789",
  what: { claim: "approve" },
});
console.log(created.event.id);
console.log(created.event_hash);
const verified = await client.verifyEvent({ event: created.event, mode: "archival" });
console.log(verified.status, verified.checks);
```

## Core exports

- `JEPClient`
- `Verb`
- `JEPValidationError`
- `JEPAPIError`
- `eventToJSON`
- `isValidationResult`
- `JEP_CORE_PROFILE`
- `LEGACY_JEP_CORE_PROFILE`

## Validation results

Current 0.7 results expose:

- `status`: `valid | invalid | indeterminate`
- `checks`: independent check results
- `event_identity`
- `event_hash`
- optional `acceptance`
- `warnings` / `errors`

## Extensions

Application metadata belongs in `ext`. Unknown critical extensions fail
`extension_processing`; non-critical unknown extensions may be ignored by a
generic Core verifier.

## Legacy pre-0.7

Legacy handling is explicit:

```js
await client.verifyEventLegacy({ event: legacyEvent, mode: "archival" });
```

Do not interpret a failed 0.7 validation as permission to retry a legacy decoder.

## Testing

```bash
npm test
```

Tests include real loopback HTTP client behavior, npm scope/metadata checks and
an offline installation/import of the actual packed archive in a fresh directory.

## Related repositories

- Core contract and implementation path: https://github.com/hjs-spec/jep-core#current-contract
- JEP API: https://github.com/hjs-spec/jep-api
- Python SDK: https://github.com/hjs-spec/sdk-py
- Go SDK: https://github.com/hjs-spec/sdk-go

## License

MIT
