# JEP JavaScript SDK — JEP Core 0.7

JavaScript client for the current [JEP Core 0.7](https://github.com/hjs-spec/jep-core) reference API.

The default client uses:

```text
POST /v0.7/events/create
POST /v0.7/events/verify
GET  /health
```

Historical pre-0.7 compatibility is explicit through `createEventLegacy()` and
`verifyEventLegacy()`. A failed 0.7 validation is never heuristically retried
as 0.6.

## Status

Experimental reference SDK. It does not define new JEP Core semantics and
does not determine factual truth, authorization validity, legal effect,
causality, regulatory compliance, or policy outcome.

## Installation

```bash
npm install @hjs-spec/jep-sdk-js
```

## Quick start

```js
import { JEPClient, Verb } from "@hjs-spec/jep-sdk-js";

const client = new JEPClient({
  baseUrl: "http://127.0.0.1:8000",
});

const created = await client.createEvent({
  verb: Verb.Judgment,
  who: "did:example:agent-789",
  what: { claim: "approve" },
});

console.log(created.event.id);
console.log(created.event_hash);

const verified = await client.verifyEvent({
  event: created.event,
  mode: "archival",
});

console.log(verified.status, verified.checks);
```

## JEP Core 0.7 model

- Event Identity is `(who,id)`; `id` is required.
- Core does not require a top-level nonce.
- Event Hash identifies an exact signed artifact, not Event Identity.
- Validation uses independent checks rather than cumulative Validation Levels.
- Acceptance may return `accepted` or `already_accepted`.
- D requires `what.delegatee` and `what.scope`.
- T requires `ref` and `what.termination_scope`.
- V requires `ref`, `what.verification_scope`, and `what.result`.
- Logical JEP event references use Event Identity; exact-artifact pinning may
  additionally carry Event Hash.

The normative Core source and schemas are maintained in
[jep-core](https://github.com/hjs-spec/jep-core).

## Legacy pre-0.7

Legacy handling is explicit:

```js
await client.verifyEventLegacy({
  event: legacyEvent,
  mode: "archival",
});
```

Do not interpret a failed 0.7 validation as permission to retry a legacy decoder.

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

## Testing

```bash
npm test
```

## Related repositories

- JEP Core 0.7: https://github.com/hjs-spec/jep-core
- JEP API: https://github.com/hjs-spec/jep-api
- Python SDK: https://github.com/hjs-spec/sdk-py
- Go SDK: https://github.com/hjs-spec/sdk-go

## License

MIT
