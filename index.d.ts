export const JEP_WIRE_VERSION: "1";
export const JEP_CORE_PROFILE: "jep-core-0.6";

export const Verb: Readonly<{
  Judgment: "J";
  Delegation: "D";
  Termination: "T";
  Verification: "V";
}>;

export type JEPVerb = "J" | "D" | "T" | "V";

export interface JEPEvent {
  jep: string;
  verb: JEPVerb;
  who: string;
  when: number;
  what?: unknown;
  nonce: string;
  aud?: string;
  ref?: string;
  ext?: Record<string, unknown>;
  ext_crit?: string[];
  sig?: string;
}

export interface CreateEventRequest {
  verb: JEPVerb;
  who?: string;
  what: unknown;
  aud?: string;
  ref?: string;
  ttl_minutes?: number;
  digest_only_who?: boolean;
  ext?: Record<string, unknown>;
  ext_crit?: string[];
}

export interface ValidationResult {
  valid: boolean;
  level: number;
  mode: string;
  profile: string;
  scopes?: string[];
  event_hash?: string;
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
  mode?: string;
  consume_nonce?: boolean;
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
  health(): Promise<HealthResponse>;
  judgment(who: string, what: unknown, options?: Partial<CreateEventRequest>): Promise<EventResponse>;
  delegation(who: string, what: unknown, options?: Partial<CreateEventRequest>): Promise<EventResponse>;
  termination(who: string, what: unknown, ref?: string, options?: Partial<CreateEventRequest>): Promise<EventResponse>;
  verification(who: string, what: unknown, ref: string, options?: Partial<CreateEventRequest>): Promise<EventResponse>;
}

export function eventToJSON(event: unknown): string;
export function isValidationResult(value: unknown): value is ValidationResult;
