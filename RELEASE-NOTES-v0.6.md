# JEP JavaScript SDK v0.6.0 Release Notes

## Summary

This release upgrades the earlier JavaScript SDK line into a JEP v0.6 API SDK seed.

## Added

- JEP v0.6 API client.
- `/events/create` client.
- `/events/verify` client.
- `/health` client.
- J/D/T/V verb constants.
- Convenience helpers for Judgment, Delegation, Termination, and Verification.
- Support for `ext`, `ext_crit`, `event_hash`, and validation results.
- Node built-in test suite.
- GitHub Actions workflow.

## Changed

- Replaced legacy endpoint assumptions with the current JEP v0.6 API shape.
- Updated README and examples.

## Boundary

This SDK is an implementation seed. It does not define new protocol semantics or claim production conformance.
