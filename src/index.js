/**
 * JEP JavaScript SDK v0.6.
 *
 * Targets:
 * - POST /events/create
 * - POST /events/verify
 * - GET /health
 *
 * This SDK is an implementation seed. It does not define new JEP-Core
 * semantics and does not perform legal, factual, or compliance validation.
 */

export const JEP_WIRE_VERSION = "1";
export const JEP_CORE_PROFILE = "jep-core-0.6";

export const Verb = Object.freeze({
  Judgment: "J",
  Delegation: "D",
  Termination: "T",
  Verification: "V",
});

export class JEPValidationError extends Error {
  constructor(message) {
    super(`JEP validation error: ${message}`);
    this.name = "JEPValidationError";
  }
}

export class JEPAPIError extends Error {
  constructor(status, message, payload = undefined) {
    super(`JEP API error (${status}): ${message}`);
    this.name = "JEPAPIError";
    this.status = status;
    this.payload = payload;
  }
}

export class JEPClient {
  constructor({ baseUrl = "http://127.0.0.1:8000", apiKey = "", fetchImpl = globalThis.fetch, timeoutMs = 30000 } = {}) {
    if (!fetchImpl) {
      throw new JEPValidationError("fetch is required. Use Node 18+ or pass fetchImpl.");
    }
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.apiKey = apiKey;
    this.fetchImpl = fetchImpl;
    this.timeoutMs = timeoutMs;
  }

  async createEvent(request) {
    this.#validateCreateRequest(request);
    return this.#request("POST", "/events/create", request);
  }

  async verifyEvent(request) {
    if (!request || !request.event) {
      throw new JEPValidationError("event is required");
    }
    return this.#request("POST", "/events/verify", {
      mode: "archival",
      consume_nonce: false,
      ...request,
    });
  }

  async health() {
    return this.#request("GET", "/health");
  }

  judgment(who, what, options = {}) {
    return this.createEvent({ verb: Verb.Judgment, who, what, ...options });
  }

  delegation(who, what, options = {}) {
    return this.createEvent({ verb: Verb.Delegation, who, what, ...options });
  }

  termination(who, what, ref = undefined, options = {}) {
    return this.createEvent({ verb: Verb.Termination, who, what, ref, ...options });
  }

  verification(who, what, ref, options = {}) {
    return this.createEvent({ verb: Verb.Verification, who, what, ref, ...options });
  }

  #validateCreateRequest(request) {
    if (!request || typeof request !== "object") {
      throw new JEPValidationError("request is required");
    }
    if (!["J", "D", "T", "V"].includes(request.verb)) {
      throw new JEPValidationError("verb must be J, D, T, or V");
    }
    if (!Object.prototype.hasOwnProperty.call(request, "what") || request.what === undefined || request.what === null) {
      throw new JEPValidationError("what is required");
    }
  }

  async #request(method, path, payload = undefined) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    const headers = {
      "content-type": "application/json",
      "user-agent": "JEP-JS-SDK/0.6.0",
    };
    if (this.apiKey) {
      headers.authorization = `Bearer ${this.apiKey}`;
      headers["x-api-key"] = this.apiKey;
    }

    try {
      const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: payload === undefined ? undefined : JSON.stringify(payload),
        signal: controller.signal,
      });

      const text = await response.text();
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }
      }

      if (!response.ok) {
        throw new JEPAPIError(response.status, data.message || data.error || text || response.statusText, data);
      }

      return data;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function eventToJSON(event) {
  return JSON.stringify(event, null, 2);
}

export function isValidationResult(value) {
  return Boolean(value && typeof value === "object" && "valid" in value && "profile" in value);
}
