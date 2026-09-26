# Contributing to JEP JavaScript SDK

Use the [issue tracker](https://github.com/hjs-spec/sdk-js/issues) for reproducible bugs or focused proposals. Follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Develop

Node.js 18 or newer is required; release workflows use Node 24.

```sh
git clone https://github.com/hjs-spec/sdk-js.git
cd sdk-js
npm install
npm test
```

Keep changes focused, cover changed behavior, and update public types and documentation together. Protocol definitions stay in [Core](https://github.com/hjs-spec/jep-core). Keep historical decoding explicit.

See [PUBLISHING.md](PUBLISHING.md) for release and registry recovery. Contact: signal@humanjudgment.org.
