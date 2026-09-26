# JEP JavaScript SDK

JavaScript client for the current **JEP Core 0.7** API contract.

Default methods use the versioned 0.7 routes:

```text
createEvent()       -> POST /v0.7/events/create
verifyEvent()       -> POST /v0.7/events/verify
```

Explicit pre-0.7 compatibility remains available:

```text
createLegacyEvent() -> POST /events/create
verifyLegacyEvent() -> POST /events/verify
```

No current-method failure triggers legacy fallback.

## Core 0.7 model

Current events use stable Event Identity `(who,id)` and do not require a
top-level Core nonce.

Validation results use:

```text
status = valid | invalid | indeterminate
checks = independent check statuses
acceptance.outcome =
  accepted | already_accepted | rejected | indeterminate
```

A repeated valid Event Identity is not a cryptographic failure.

## Example

```js
import { JEPClient, Verb } from "@hjs-spec/jep-sdk-js";

const client = new JEPClient({ baseUrl: "http://127.0.0.1:8000" });

const created = await client.createEvent({
  verb: Verb.Judgment,
  who: "did:example:agent",
  what: { claim: "approve-result" }
});

console.log(created.event.id);

const result = await client.verifyEvent({
  event: created.event,
  mode: "acceptance"
});

console.log(result.status, result.acceptance?.outcome);
```

For the normative Core definition see:
https://github.com/hjs-spec/jep-core

Legacy types are exposed separately as `LegacyJEPEvent` and
`LegacyValidationResult`; they do not redefine Core 0.7.
