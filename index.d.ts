export const JEP_WIRE_VERSION: "1";
export const JEP_CORE_PROFILE: "jep-core-0.7";

export const Verb: Readonly<{
  Judgment: "J";
  Delegation: "D";
  Termination: "T";
  Verification: "V";
}>;

export type JEPVerb = "J" | "D" | "T" | "V";
export type CheckStatus = "pass" | "fail" | "not_checked" | "not_applicable" | "unsupported" | "indeterminate";
export type ValidationStatus = "valid" | "invalid" | "indeterminate";
export type AcceptanceOutcome = "accepted" | "already_accepted" | "rejected" | "indeterminate";

export interface JEPEventIdentity {
  who: string;
  id: string;
}

export interface JEPEvent {
  jep: "1" | string;
  id: string;
  verb: JEPVerb;
  who: string;
  when: number;
  what: unknown;
  aud?: string;
  ref?: string | { type: string; value: unknown; hash?: string };
  ext?: Record<string, unknown>;
  ext_crit?: string[];
  sig?: string | Record<string, unknown>;
}

export interface LegacyJEPEvent {
  jep: string;
  verb: JEPVerb;
  who: string;
  when: number;
  what?: unknown;
  nonce: string;
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
  ref?: string | { type: string; value: unknown; hash?: string };
  ttl_minutes?: number;
  digest_only_who?: boolean;
  ext?: Record<string, unknown>;
  ext_crit?: string[];
}

export interface ValidationDiagnostic {
  code: string;
  message: string;
  check?: string;
  recoverable?: boolean;
  evidence?: string[];
  [key: string]: unknown;
}

export interface ValidationResult {
  status: ValidationStatus;
  mode: "archival" | "acceptance" | "chain" | "policy" | string;
  profile: string;
  conformance_class?: string;
  event_identity?: JEPEventIdentity | null;
  event_hash?: string | null;
  checks: Record<string, CheckStatus>;
  acceptance?: {
    outcome: AcceptanceOutcome;
    effect_applied: boolean;
  };
  warnings?: ValidationDiagnostic[];
  errors?: ValidationDiagnostic[];
}

export interface LegacyValidationResult {
  valid: boolean;
  level: number;
  mode: string;
  profile: string;
  conformance_class?: string;
  scopes?: string[];
  event_hash?: string | null;
  warnings?: Array<Record<string, unknown>>;
  errors?: Array<Record<string, unknown>>;
}

export interface EventResponse {
  event: JEPEvent;
  event_hash: string;
  validation: ValidationResult;
}

export interface LegacyEventResponse {
  event: LegacyJEPEvent;
  event_hash: string;
  validation: LegacyValidationResult;
}

export interface VerifyEventRequest {
  event: JEPEvent | Record<string, unknown>;
  mode?: "archival" | "acceptance" | string;
  expected_audience?: string;
  max_age_seconds?: number;
  /** Ignored by the current 0.7 route; retained only to ease source migration. */
  consume_nonce?: boolean;
}

export interface LegacyVerifyEventRequest {
  event: LegacyJEPEvent | Record<string, unknown>;
  mode?: string;
  consume_nonce?: boolean;
  expected_audience?: string;
}

export interface HealthResponse {
  ok: boolean;
  profile: string;
}

export class JEPValidationError extends Error {
  constructor(message: string);
}

export class JEPAPIError extends Error {
  status: number;
  payload?: unknown;
  constructor(status: number, message: string, payload?: unknown);
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
  createLegacyEvent(request: CreateEventRequest): Promise<LegacyEventResponse>;
  verifyLegacyEvent(request: LegacyVerifyEventRequest): Promise<LegacyValidationResult>;
  health(): Promise<HealthResponse>;
  judgment(who: string, what: unknown, options?: Partial<CreateEventRequest>): Promise<EventResponse>;
  delegation(who: string, what: unknown, options?: Partial<CreateEventRequest>): Promise<EventResponse>;
  termination(who: string, what: unknown, ref?: string | { type: string; value: unknown; hash?: string }, options?: Partial<CreateEventRequest>): Promise<EventResponse>;
  verification(who: string, what: unknown, ref: string | { type: string; value: unknown; hash?: string }, options?: Partial<CreateEventRequest>): Promise<EventResponse>;
}

export function eventToJSON(event: unknown): string;
export function isValidationResult(value: unknown): value is ValidationResult;
export function isLegacyValidationResult(value: unknown): value is LegacyValidationResult;
