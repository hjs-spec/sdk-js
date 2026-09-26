> Current default: **JEP Core 0.7**. Historical pre-0.7 compatibility, where exposed, is explicit and never selected by heuristic fallback.

# JEP JavaScript SDK — JEP Core 0.7

JavaScript client for the current [JEP Core 0.7](https://github.com/hjs-spec/jep-core) reference API. SDK release versions are separate from the protocol version; wire major remains `jep: "1"`.

Default endpoints:

```text
POST /v0.7/events/create
POST /v0.7/events/verify
GET  /health
```

Historical pre-0.7 compatibility is available only through explicit legacy methods. A failed 0.7 validation is never reinterpreted as 0.6.

## Status

Experimental reference SDK. It does not define new JEP Core semantics and does not determine legal liability, factual truth, authorization validity, regulatory compliance, causality, policy outcome, or complete-log availability.

## Installation

The repository version is 0.7.x. npm publication remains paused; see [PUBLISHING.md](PUBLISHING.md). For development:

```bash
npm install
npm test
```

## Quick Start

Start the [local API](https://github.com/hjs-spec/jep-api#run-locally) before running this example.

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

- Event Identity is `(who,id)`; `id` is required on signed events.
- Core does not require a top-level nonce.
- Event Hash identifies an exact signed artifact, not the logical Event Identity.
- Validation returns `status` and independent `checks`, not cumulative Validation Levels.
- Acceptance may return `accepted` or `already_accepted`.
- D requires `what.delegatee` and `what.scope`.
- T requires `ref` and `what.termination_scope`.
- V requires `ref`, `what.verification_scope`, and `what.result`.
- Chain, termination-cascade, authorization-consequence, and domain-policy semantics remain outside Core.

The current schema is maintained in [jep-core](https://github.com/hjs-spec/jep-core/blob/main/schemas/jep-event.schema.json).

## Core Exports

- `JEPClient`
- `Verb`
- `JEPValidationError`
- `JEPAPIError`
- `eventToJSON`
- `isValidationResult`

## Legacy pre-0.7

Use `createEventLegacy()` or `verifyEventLegacy()` only when the caller already knows that the artifact uses the historical format.

```js
await client.verifyEventLegacy({ event: historicalEvent });
```

The SDK MUST NOT use a failed 0.7 validation as a signal to retry with a historical decoder.

## Extensions

Non-critical application metadata may be carried in `ext`. Mark an extension critical only when the selected verifier/profile implements it.

## Validation results

Current results expose:

- `status: valid | invalid | indeterminate`
- `checks`
- `event_identity`
- `event_hash`
- optional `acceptance`
- `warnings` and `errors`
- optional `conformance_class`

Legacy response fields are preserved only on explicit legacy paths.

## Testing

```bash
npm test
```

Tests use a local in-process HTTP server and do not require a live JEP API.

## Related Repositories

- JEP Core 0.7: https://github.com/hjs-spec/jep-core
- JEP API: https://github.com/hjs-spec/jep-api
- JEP Python SDK: https://github.com/hjs-spec/sdk-py
- JEP Go SDK: https://github.com/hjs-spec/sdk-go
- JEP CLI: https://github.com/hjs-spec/cli
- HJS: https://github.com/hjs-spec/hjs-05
- JAC: https://github.com/hjs-spec/jac-agent-02

## License

MIT
