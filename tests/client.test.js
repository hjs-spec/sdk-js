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
  isLegacyValidationResult,
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
        aud: payload.aud,
        ref: payload.ref,
        ext: payload.ext,
        ext_crit: payload.ext_crit,
        sig: "header..sig",
      };
      res.end(JSON.stringify({
        event,
        event_hash: "sha256:abc",
        validation: {
          status: "valid",
          mode: "archival",
          profile: "jep-core-0.7",
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
        checks: { syntax: "pass", cryptographic: "pass", event_identity: "pass" },
        event_hash: "sha256:def",
        warnings: [],
        errors: [],
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ message: "not found" }));
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({
        url: `http://127.0.0.1:${port}`,
        close: () => new Promise((done) => server.close(done)),
      });
    });
  });
}

test("createEvent calls /v0.7/events/create", async () => {
  const srv = await startServer();
  try {
    const client = new JEPClient({ baseUrl: srv.url });
    const resp = await client.createEvent({
      verb: Verb.Judgment,
      who: "did:example:agent",
      what: { claim: "approve" },
      ext: { "https://example.org/profile": { name: "demo" } },
      ext_crit: ["https://example.org/profile"],
    });
    assert.equal(resp.event_hash, "sha256:abc");
    assert.equal(resp.event.verb, "J");
    assert.equal(resp.validation.status, "valid");
    assert.equal(resp.event.ext["https://example.org/profile"].name, "demo");
  } finally {
    await srv.close();
  }
});

test("verifyEvent calls /v0.7/events/verify", async () => {
  const srv = await startServer();
  try {
    const client = new JEPClient({ baseUrl: srv.url });
    const result = await client.verifyEvent({
      event: {
        jep: "1",
        id: "urn:uuid:00000000-0000-7000-8000-000000000001",
        verb: "J",
        who: "did:example:agent",
        when: 123,
        what: "sha256:" + "a".repeat(64),
        sig: "header..sig",
      },
      mode: "archival",
    });
    assert.equal(result.status, "valid");
    assert.equal(result.profile, "jep-core-0.6");
    assert.equal(isValidationResult(result), true);
  } finally {
    await srv.close();
  }
});

test("health calls /health", async () => {
  const srv = await startServer();
  try {
    const client = new JEPClient({ baseUrl: srv.url });
    const health = await client.health();
    assert.equal(health.ok, true);
    assert.equal(health.profile, "jep-core-0.7");
  } finally {
    await srv.close();
  }
});

test("convenience helpers set verbs", async () => {
  const srv = await startServer();
  try {
    const client = new JEPClient({ baseUrl: srv.url });
    assert.equal((await client.judgment("agent", "judge")).event.verb, "J");
    assert.equal((await client.delegation("agent", "delegate")).event.verb, "D");
    assert.equal((await client.termination("agent", "terminate", "sha256:parent")).event.verb, "T");
    assert.equal((await client.verification("agent", "verify", "sha256:parent")).event.verb, "V");
  } finally {
    await srv.close();
  }
});

test("validates create request", async () => {
  const client = new JEPClient({ fetchImpl: async () => ({}) });
  await assert.rejects(() => client.createEvent({ verb: "X", what: "x" }), JEPValidationError);
  await assert.rejects(() => client.createEvent({ verb: "J" }), JEPValidationError);
});

test("throws JEPAPIError on HTTP error", async () => {
  const fetchImpl = async () => ({
    ok: false,
    status: 500,
    statusText: "server error",
    text: async () => JSON.stringify({ message: "boom" }),
  });
  const client = new JEPClient({ fetchImpl });
  await assert.rejects(
    () => client.health(),
    (err) => err instanceof JEPAPIError && err.status === 500
  );
});

test("eventToJSON returns formatted JSON", () => {
  const text = eventToJSON({ jep: "1", verb: "J" });
  assert.match(text, /"jep": "1"/);
});


test("preserves explicit null judgment content and acceptance context", async () => {
  const requests = [];
  const client = new JEPClient({fetchImpl: async (_url, options) => {
    requests.push(JSON.parse(options.body));
    return new Response(JSON.stringify({status:"valid",profile:"jep-core-0.7",checks:{}}), {status:200, headers:{"content-type":"application/json"}});
  }});
  await client.createEvent({verb:"J", what:null});
  assert.equal(requests[0].what, null);
  await client.verifyEvent({event:{jep:"1", id:"urn:uuid:x", verb:"J", who:"a", when:1, what:{claim:"x"}, sig:"h..s"}, mode:"acceptance", expected_audience:"receiver"});
  assert.equal(requests[1].expected_audience, "receiver");
  assert.equal(requests[1].event.id, "urn:uuid:x");
});

test("recognizes current and legacy validation results explicitly", () => {
  const current = {status:"valid",mode:"archival",profile:"jep-core-0.7",checks:{syntax:"pass"}};
  const legacy = {valid:true,level:1,mode:"archival",profile:"jep-core-0.6"};
  assert.equal(isValidationResult(current), true);
  assert.equal(isValidationResult(legacy), false);
  assert.equal(isLegacyValidationResult(legacy), true);
});

test("legacy methods use explicit pre-0.7 routes", async () => {
  const requests = [];
  const client = new JEPClient({fetchImpl: async (url, options) => {
    requests.push({url, body: options.body ? JSON.parse(options.body) : null});
    return new Response(JSON.stringify({valid:true,level:1,mode:"archival",profile:"jep-core-0.6"}), {status:200});
  }});
  await client.verifyLegacyEvent({event:{jep:"1",verb:"J",who:"a",when:1,what:{claim:"x"},nonce:"n",sig:"h..s"}});
  assert.match(requests[0].url, /\/events\/verify$/);
});
