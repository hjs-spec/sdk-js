# JEP Core 0.7 migration

- Default API path is `/v0.7/events/*`.
- Events use stable `id` and no longer require a Core `nonce`.
- Validation results use `status`, independent `checks`, `event_identity`, and optional `acceptance`.
- D/T/V Core minimum shapes are validated before requests are sent.
- Historical pre-0.7 handling remains explicit; there is no automatic fallback.
- Event Hash remains exact-artifact identity and MUST NOT be treated as stable Event Identity.
- Chain and policy semantics are not inferred as JEP Core behavior.
- `conformance_class` is preserved when the API returns it.

Protocol target: JEP Core 0.7, wire major `jep: "1"`.

npm publication is currently paused; repository tests remain the release gate.
