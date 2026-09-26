import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";

import {
  JEPAPIError,
  JEPClient,
  JEPValidationError,
  Verb,
  eventToJSON,
  isValidationResult,
} from "../src/index.js";

function startServer() {
  const server = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString("utf8");
    const payload = body ? JSON.parse(body) : {};
    res.setHeader("content-type", "application/json");

    if (req.method === "GET" && req.url === "/health") {
      res.end(JSON.stringify({ ok: true, profile: "jep-core-0.7" }));
      return;
    }
    if (req.method === "POST" && req.url === "/v0.7/events/create") {
      const event = {
        jep: "1",
        id: payload.id || "urn:uuid:00000000-0000-7000-8000-000000000001",
        verb: payload.verb,
        who: payload.who || "did:example:agent",
        when: 1234567890,
        what: payload.what,
        ...(payload.aud !== undefined ? { aud: payload.aud } : {}),
        ...(payload.ref !== undefined ? { ref: payload.ref } : {}),
        ...(payload.ext !== undefined ? { ext: payload.ext } : {}),
        ...(payload.ext_crit !== undefined ? { ext_crit: payload.ext_crit } : {}),
        sig: "header..sig",
      };
      res.end(JSON.stringify({
        event,
        event_hash: "sha256:abc",
        validation: {
          status: "valid",
          mode: "archival",
          profile: "jep-core-0.7",
          event_identity: { who: event.who, id: event.id },
          checks: { syntax: "pass", cryptographic: "pass", event_identity: "pass" },
          event_hash: "sha256:abc",
          warnings: [],
          errors: [],
        },
      }));
      return;
    }
    if (req.method === "POST" && req.url === "/v0.7/events/verify") {
      res.end(JSON.stringify({
        status: "valid",
        mode: payload.mode || "archival",
        profile: "jep-core-0.7",
        event_identity: { who: payload.event.who, id: payload.event.id },
        checks: { syntax: "pass", cryptographic: "pass", event_identity: "pass" },
        event_hash: "sha256:def",
        ...(payload.mode === "acceptance"
          ? { acceptance: { outcome: "accepted", effect_applied: true } }
          : {}),
        warnings: [],
        errors: [],
      }));
      return;
    }
    if (req.method === "POST" && req.url === "/events/verify-legacy") {
      res.end(JSON.stringify({ valid: true, level: 1, profile: "jep-core-0.6" }));
      return;
    }
    res.statusCode = 404;
    res.end(JSON.stringify({ message: "not found" }));
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ url: `http://127.0.0.1:${port}`, close: () => new Promise((done) => server.close(done)) });
    });
  });
}

test("createEvent uses JEP Core 0.7 endpoint and model", async () => {
  const srv = await startServer();
  try {
    const client = new JEPClient({ baseUrl: srv.url });
    const resp = await client.createEvent({
      verb: Verb.Judgment,
      who: "did:example:agent",
      what: { claim: "approve" },
    });
    assert.equal(resp.event_hash, "sha256:abc");
    assert.equal(resp.event.verb, "J");
    assert.ok(resp.event.id);
    assert.equal(resp.validation.status, "valid");
  } finally {
    await srv.close();
  }
});

test("verifyEvent returns independent-check result", async () => {
  const srv = await startServer();
  try {
    const client = new JEPClient({ baseUrl: srv.url });
    const result = await client.verifyEvent({
      event: {
        jep: "1",
        id: "urn:uuid:00000000-0000-7000-8000-000000000002",
        verb: "J",
        who: "did:example:agent",
        when: 123,
        what: { claim: "approve" },
        sig: "header..sig",
      },
      mode: "acceptance",
    });
    assert.equal(result.status, "valid");
    assert.equal(result.profile, "jep-core-0.7");
    assert.equal(result.acceptance.outcome, "accepted");
    assert.equal(isValidationResult(result), true);
  } finally {
    await srv.close();
  }
});

test("verb-specific Core minimums are enforced", async () => {
  const client = new JEPClient({ fetchImpl: async () => ({}) });
  await assert.rejects(() => client.createEvent({ verb: "D", what: { delegatee: "b" } }), JEPValidationError);
  await assert.rejects(() => client.createEvent({ verb: "T", what: { termination_scope: "future" } }), JEPValidationError);
  await assert.rejects(() => client.createEvent({ verb: "V", ref: "x", what: { verification_scope: "syntax" } }), JEPValidationError);
});

test("legacy verification is explicit", async () => {
  const srv = await startServer();
  try {
    const client = new JEPClient({ baseUrl: srv.url });
    const result = await client.verifyEventLegacy({ event: { jep: "1", nonce: "legacy" } });
    assert.equal(result.profile, "jep-core-0.6");
  } finally {
    await srv.close();
  }
});

test("health reports current profile", async () => {
  const srv = await startServer();
  try {
    const client = new JEPClient({ baseUrl: srv.url });
    const health = await client.health();
    assert.equal(health.profile, "jep-core-0.7");
  } finally {
    await srv.close();
  }
});

test("throws JEPAPIError on HTTP error", async () => {
  const fetchImpl = async () => ({
    ok: false,
    status: 500,
    statusText: "server error",
    text: async () => JSON.stringify({ message: "boom" }),
  });
  const client = new JEPClient({ fetchImpl });
  await assert.rejects(() => client.health(), (err) => err instanceof JEPAPIError && err.status === 500);
});

test("eventToJSON returns formatted JSON", () => {
  const text = eventToJSON({ jep: "1", id: "urn:example:1", verb: "J" });
  assert.match(text, /"id": "urn:example:1"/);
});
