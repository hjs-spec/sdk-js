# JEP JavaScript SDK v0.6

JavaScript client for the [JEP-Core-0.6](https://github.com/hjs-spec/jep-v06) API (wire version `"1"`). SDK release versions are separate from the protocol version. See the protocol repository for core semantics, profiles, and public drafts.

This SDK targets the current JEP API shape:

```text
POST /events/create
POST /events/verify
GET  /health
```

## Status

Experimental implementation seed.

This SDK does not define new JEP-Core semantics and does not determine legal liability, factual truth, regulatory compliance, or complete-log availability.

## Installation

The `v0.6.2` tarball is available from [GitHub Releases](https://github.com/hjs-spec/sdk-js/releases/tag/v0.6.2). npm publication is paused; see [publication recovery](https://github.com/hjs-spec/sdk-js/blob/main/PUBLISHING.md). Install the release asset directly:

```bash
npm install https://github.com/hjs-spec/sdk-js/releases/download/v0.6.2/hjs-spec-jep-sdk-js-0.6.2.tgz
```

## Quick Start

Start the [local API](https://github.com/hjs-spec/jep-api#run-locally) before running this example. Verification uses that API's configured trusted keys.

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

console.log(created.event_hash);

const verified = await client.verifyEvent({
  event: created.event,
  mode: "archival",
});

console.log(verified.valid);
```

## Core Exports

- `JEPClient`
- `Verb`
- `JEPValidationError`
- `JEPAPIError`
- `eventToJSON`
- `isValidationResult`

## API and helpers

The quickstart above demonstrates event creation and archival verification. The client also exposes helpers for the four verbs; see [client methods and types](src/index.js) for signatures and options.

Claim fields and reference requirements are defined in the [Core-0.6 event schema](https://github.com/hjs-spec/jep-v06/blob/main/schemas/jep-event.schema.json). For an event reference, use the actual returned event hash.

### Health

```js
const health = await client.health();
```

## Extensions

This example carries non-critical application metadata; the core API does not validate its semantics. Mark an extension critical only when the target verifier implements it, or the API will reject it.

```js
await client.createEvent({
  verb: Verb.Judgment,
  who: "did:example:agent",
  what: { claim: "approve" },
  ext: {
    "https://example.org/profile": { name: "demo" },
  },
});
```

## Validation results

Validation results preserve the API's `conformance_class` and diagnostic fields (`code`, `message`, `level`, `recoverable`). Older servers may omit the class; the SDK does not infer conformance.

## Testing

```bash
npm test
```

Tests use a local in-process HTTP server and do not require a live JEP API.

## Related Repositories

- JEP v0.6: https://github.com/hjs-spec/jep-v06
- JEP API v0.6: https://github.com/hjs-spec/jep-api
- JEP Python SDK v0.6: https://github.com/hjs-spec/sdk-py
- JEP Go SDK v0.6: https://github.com/hjs-spec/sdk-go
- JEP CLI v0.6: https://github.com/hjs-spec/cli
- HJS v0.5: https://github.com/hjs-spec/hjs-05
- JAC v0.5: https://github.com/hjs-spec/jac-agent-02

## License

MIT
