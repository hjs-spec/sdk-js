# Implementation hardening — September 2026

Align client types and request validation with the v0.6 API.

## Changes

References can be digest strings, structured objects or null. Object signature containers are representable. Verify requests expose expected_audience. Explicit null what is permitted for J; the API performs verb-specific validation.

## Validation

```sh
npm test
```

## Compatibility and remaining limits

Returned signed objects remain unchanged. Type additions are compatible with existing string-reference callers.
