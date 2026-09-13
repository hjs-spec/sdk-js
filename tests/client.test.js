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
      res.end(JSON.stringify({ ok: true, profile: "jep-core-0.6" }));
      return;
    }

    if (req.method === "POST" && req.url === "/events/create") {
      const event = {
        jep: "1",
        verb: payload.verb,
        who: payload.who || "did:example:agent",
        when: 1234567890,
        what: payload.what,
        nonce: "nonce-1",
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
          valid: true,
          level: 1,
          mode: "archival",
          profile: "jep-core-0.6",
          scopes: ["syntax"],
          event_hash: "sha256:abc",
          warnings: [],
          errors: [],
        },
      }));
      return;
    }

    if (req.method === "POST" && req.url === "/events/verify") {
      res.end(JSON.stringify({
        valid: true,
        level: 1,
        mode: payload.mode || "archival",
        profile: "jep-core-0.6",
        scopes: ["syntax"],
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

test("createEvent calls /events/create", async () => {
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
    assert.equal(resp.validation.valid, true);
    assert.equal(resp.event.ext["https://example.org/profile"].name, "demo");
  } finally {
    await srv.close();
  }
});

test("verifyEvent calls /events/verify", async () => {
  const srv = await startServer();
  try {
    const client = new JEPClient({ baseUrl: srv.url });
    const result = await client.verifyEvent({
      event: {
        jep: "1",
        verb: "J",
        who: "did:example:agent",
        when: 123,
        what: "sha256:abc",
        nonce: "nonce-1",
        sig: "header..sig",
      },
      mode: "archival",
    });
    assert.equal(result.valid, true);
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
    assert.equal(health.profile, "jep-core-0.6");
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
    return new Response(JSON.stringify({valid:true}), {status:200, headers:{"content-type":"application/json"}});
  }});
  await client.createEvent({verb:"J", what:null});
  assert.equal(requests[0].what, null);
  await client.verifyEvent({event:{jep:"1", ref:null}, mode:"acceptance", expected_audience:"receiver"});
  assert.equal(requests[1].expected_audience, "receiver");
  assert.equal(requests[1].event.ref, null);
});

test("retains complete conformance results and supports older responses", async () => {
  for (const payload of [
    {valid:true,level:1,mode:"archival",profile:"jep-core-0.6",conformance_class:"JEP-Baseline-Ed25519-JWS-JCS-0.6",event_hash:null,warnings:[{code:"ACCEPTANCE_NOT_CHECKED",message:"archival",level:1,recoverable:false}],errors:[]},
    {valid:true,level:1,mode:"archival",profile:"jep-core-0.6"}
  ]) {
    const client = new JEPClient({fetchImpl: async () => new Response(JSON.stringify(payload), {status:200})});
    assert.deepEqual(await client.verifyEvent({event:{jep:"1"}}), payload);
  }
});
