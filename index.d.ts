export const JEP_WIRE_VERSION: "1";
export const JEP_CORE_PROFILE: "jep-core-0.7";
export const LEGACY_JEP_CORE_PROFILE: "jep-core-0.6";

export const Verb: Readonly<{
  Judgment: "J";
  Delegation: "D";
  Termination: "T";
  Verification: "V";
}>;

export type JEPVerb = "J" | "D" | "T" | "V";
export type CheckStatus = "pass" | "fail" | "not_checked" | "not_applicable" | "unsupported" | "indeterminate";
export type ValidationStatus = "valid" | "invalid" | "indeterminate";

export interface JEPEvent {
  jep: string;
  id: string;
  verb: JEPVerb;
  who: string;
  when: number;
  what: unknown;
  aud?: string;
  ref?: string | { type: string; value: unknown; hash?: string } | null;
  ext?: Record<string, unknown>;
  ext_crit?: string[];
  sig?: string | Record<string, unknown>;
}

export interface CreateEventRequest {
  id?: string;
  verb: JEPVerb;
  who?: string;
  what: unknown;
  aud?: string;
  ref?: string | { type: string; value: unknown; hash?: string } | null;
  ttl_minutes?: number;
  digest_only_who?: boolean;
  ext?: Record<string, unknown>;
  ext_crit?: string[];
}

export interface ValidationResult {
  status: ValidationStatus;
  mode: string;
  profile: string;
  conformance_class?: string;
  event_identity?: { who: string; id: string } | null;
  event_hash?: string | null;
  checks: Record<string, CheckStatus>;
  acceptance?: { outcome: "accepted" | "already_accepted" | "rejected" | "indeterminate"; effect_applied: boolean };
  warnings?: Array<Record<string, unknown>>;
  errors?: Array<Record<string, unknown>>;
}

export interface EventResponse {
  event: JEPEvent;
  event_hash: string;
  validation: ValidationResult;
}

export interface VerifyEventRequest {
  event: JEPEvent | Record<string, unknown>;
  mode?: "archival" | "acceptance";
  expected_audience?: string;
  max_age_seconds?: number;
}

export interface HealthResponse {
  ok: boolean;
  profile: string;
}

export class JEPValidationError extends Error {}
export class JEPAPIError extends Error {
  status: number;
  payload?: unknown;
}

export interface JEPClientOptions {
  baseUrl?: string;
  apiKey?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export class JEPClient {
  constructor(options?: JEPClientOptions);
  createEvent(request: CreateEventRequest): Promise<EventResponse>;
  verifyEvent(request: VerifyEventRequest): Promise<ValidationResult>;
  createEventLegacy(request: Record<string, unknown>): Promise<Record<string, unknown>>;
  verifyEventLegacy(request: Record<string, unknown>): Promise<Record<string, unknown>>;
  health(): Promise<HealthResponse>;
  judgment(who: string, what: unknown, options?: Partial<CreateEventRequest>): Promise<EventResponse>;
  delegation(who: string, what: unknown, options?: Partial<CreateEventRequest>): Promise<EventResponse>;
  termination(who: string, what: unknown, ref: string | { type: string; value: unknown; hash?: string }, options?: Partial<CreateEventRequest>): Promise<EventResponse>;
  verification(who: string, what: unknown, ref: string | { type: string; value: unknown; hash?: string }, options?: Partial<CreateEventRequest>): Promise<EventResponse>;
}

export function eventToJSON(event: unknown): string;
export function isValidationResult(value: unknown): value is ValidationResult;
