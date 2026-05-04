import { JEPClient, Verb } from "../src/index.js";

const client = new JEPClient({
  baseUrl: process.env.JEP_API_URL || "http://127.0.0.1:8000",
  apiKey: process.env.JEP_API_KEY || "",
});

const created = await client.createEvent({
  verb: Verb.Judgment,
  who: "did:example:agent-789",
  what: {
    claim: "approve",
    subject: "demo",
  },
  aud: "https://api.example.org",
});

console.log("event_hash:", created.event_hash);
console.log("valid:", created.validation.valid);

const verified = await client.verifyEvent({
  event: created.event,
  mode: "archival",
});

console.log("verification profile:", verified.profile);
