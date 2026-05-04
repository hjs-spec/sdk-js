# JEP JavaScript SDK v0.6

JavaScript SDK for the JEP v0.6 API seed.

This SDK targets the current JEP API shape:

```text
POST /events/create
POST /events/verify
GET  /health
```

It is aligned with:

- `draft-wang-jep-judgment-event-protocol-06`
- `draft-wang-jep-profiles-00`
- `draft-wang-jep-conformance-00`
- `hjs-spec/jep-api`

## Status

Experimental implementation seed.

This SDK does not define new JEP-Core semantics and does not determine legal liability, factual truth, regulatory compliance, or complete-log availability.

## Installation

```bash
npm install @hjs-spec/jep-sdk-js
```

For local development:

```bash
npm test
```

## Quick Start

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

Supported verbs:

```js
Verb.Judgment
Verb.Delegation
Verb.Termination
Verb.Verification
```

## API

### Create event

```js
const resp = await client.createEvent({
  verb: Verb.Judgment,
  who: "did:example:agent",
  what: "sha256:...",
});
```

### Verify event

```js
const result = await client.verifyEvent({
  event: resp.event,
  mode: "archival",
});
```

### Convenience helpers

```js
await client.judgment("did:example:agent", what);
await client.delegation("did:example:agent", what);
await client.termination("did:example:agent", what, "sha256:parent");
await client.verification("did:example:agent", what, "sha256:parent");
```

### Health

```js
const health = await client.health();
```

## Extensions

```js
await client.createEvent({
  verb: Verb.Judgment,
  who: "did:example:agent",
  what: { claim: "approve" },
  ext: {
    "https://example.org/profile": { name: "demo" },
  },
  ext_crit: ["https://example.org/profile"],
});
```

## Testing

```bash
npm test
```

Tests use a local in-process HTTP server and do not require a live JEP API.

## Related Repositories

- JEP v0.6: https://github.com/hjs-spec/jep-v06
- JEP API v0.6: https://github.com/hjs-spec/jep-api
- JEP Python SDK v0.6: https://github.com/hjs-spec/jep-sdk-py
- JEP Go SDK v0.6: https://github.com/hjs-spec/jep-sdk-go
- JEP CLI v0.6: https://github.com/hjs-spec/jep-cli
- HJS v0.5: https://github.com/hjs-spec/hjs-05
- JAC v0.5: https://github.com/hjs-spec/jac-agent-02

## Public Drafts

- JEP-Core: https://datatracker.ietf.org/doc/draft-wang-jep-judgment-event-protocol/
- JEP-Profiles: https://datatracker.ietf.org/doc/draft-wang-jep-profiles/
- JEP-Conformance: https://datatracker.ietf.org/doc/draft-wang-jep-conformance/

## License

MIT
