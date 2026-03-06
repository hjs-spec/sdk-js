/**
 * JEP JavaScript SDK Type Definitions
 * Updated: March 2026 for JEP Protocol Alignment
 */

declare module '@jep/sdk-js' {
  // ========== Core Types ==========

  /** Immutability anchor configuration */
  export interface ImmutabilityAnchor {
    type: 'ots' | 'none';
    options?: Record<string, any>;
  }

  /** Base record interface with common fields */
  export interface BaseRecord {
    id: string;
    status: string;
    created_at: string;
  }

  // ========== Judgment Types ==========

  /** Request parameters for creating a judgment */
  export interface JudgmentRequest {
    entity: string;
    action: string;
    scope?: Record<string, any>;
    timestamp?: string;
    immutability?: ImmutabilityAnchor;
  }

  /** Response after creating a judgment */
  export interface JudgmentResponse extends BaseRecord {
    status: 'recorded';
    protocol: 'JEP/1.0';  // 原 HJS/1.0 已更新
    timestamp: string;
    immutability_anchor?: {
      type: string;
      reference?: string;
      anchored_at?: string;
    };
  }

  /** Full judgment record (when querying) */
  export interface FullJudgment extends JudgmentResponse {
    entity: string;
    action: string;
    scope: Record<string, any>;
    recorded_at: string;
  }

  // ========== Delegation Types ==========

  /** Request parameters for creating a delegation */
  export interface DelegationRequest {
    delegator: string;
    delegatee: string;
    judgmentId?: string;
    scope?: Record<string, any>;
    expiry?: string;
    idempotency_key?: string;
  }

  /** Response after creating a delegation */
  export interface DelegationResponse extends BaseRecord {
    status: 'active' | 'revoked';
    delegator: string;
    delegatee: string;
    judgment_id?: string;
    scope: Record<string, any>;
    expiry?: string;
    revoked_at?: string;
  }

  /** Full delegation record */
  export interface FullDelegation extends DelegationResponse {
    // Same as response, but with all fields
  }

  // ========== Termination Types ==========

  /** Request parameters for creating a termination */
  export interface TerminationRequest {
    terminator: string;
    targetId: string;
    targetType: 'judgment' | 'delegation';
    reason?: string;
    idempotency_key?: string;
  }

  /** Response after creating a termination */
  export interface TerminationResponse extends BaseRecord {
    terminator: string;
    target_id: string;
    target_type: 'judgment' | 'delegation';
    reason?: string;
  }

  // ========== Verification Types ==========

  /** Request parameters for verification */
  export interface VerificationRequest {
    verifier: string;
    targetId: string;
    targetType?: 'judgment' | 'delegation' | 'termination';
  }

  /** Response after verification */
  export interface VerificationResponse extends BaseRecord {
    result: 'VALID' | 'INVALID' | 'PENDING';
    details: Record<string, any>;
  }

  /** Quick verification response */
  export interface QuickVerifyResponse {
    id: string;
    type: 'judgment' | 'delegation' | 'termination';
    status: 'VALID' | 'INVALID';
    [key: string]: any;
  }

  // ========== List Types ==========

  /** Paginated list response */
  export interface ListResponse<T> {
    page: number;
    limit: number;
    total: number;
    data: T[];
  }

  /** List judgments query parameters */
  export interface ListJudgmentsParams {
    entity?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }

  /** List delegations query parameters */
  export interface ListDelegationsParams {
    delegator?: string;
    delegatee?: string;
    judgment_id?: string;
    status?: 'active' | 'revoked';
    page?: number;
    limit?: number;
  }

  // ========== Client Options ==========

  /** Client configuration options */
  export interface ClientOptions {
    /** API base URL (default: 'https://api.jep-protocol.org') */
    baseURL?: string;
    /** API key for authentication */
    apiKey?: string;
  }

  // ========== Main Client Class ==========

  /**
   * JEP JavaScript SDK Client
   * * Provides access to all JEP core primitives:
   * - Judgment: Record structured decisions
   * - Delegation: Transfer authority
   * - Termination: End responsibility chains
   * - Verification: Validate records
   */
  export default class JEPClient {
    /**
     * Create a new JEP client instance
     * * @param options - Client configuration options
     * @example
     * ```javascript
     * const client = new JEPClient({
     * baseURL: '[https://api.jep-protocol.org](https://api.jep-protocol.org)',
     * apiKey: 'your-api-key'
     * });
     * ```
     */
    constructor(options?: ClientOptions);

    /** API key used for authentication */
    apiKey?: string;

    // ========== Judgment Methods ==========

    /**
     * Create a new judgment record
     * * @param params - Judgment request parameters
     * @returns Created judgment record
     * @throws {Error} If entity or action is missing
     * @throws {Error} If API request fails
     * * @example
     * ```javascript
     * const result = await client.judgment({
     * entity: 'user@example.com',
     * action: 'approve',
     * scope: { amount: 1000 }
     * });
     * ```
     */
    judgment(params: JudgmentRequest): Promise<JudgmentResponse>;

    /**
     * Get a judgment record by ID
     * * @param id - Judgment ID (starts with 'jep_')
     * @returns Full judgment record
     * @throws {Error} If record not found
     */
    getJudgment(id: string): Promise<FullJudgment>;

    /**
     * List judgment records with optional filters
     * * @param params - Query parameters
     * @returns Paginated list of judgments
     */
    listJudgments(params?: ListJudgmentsParams): Promise<ListResponse<FullJudgment>>;

    // ========== Delegation Methods ==========

    /**
     * Create a new delegation
     * * @param params - Delegation request parameters
     * @returns Created delegation record
     * @throws {Error} If delegator or delegatee is missing
     * * @example
     * ```javascript
     * const result = await client.delegation({
     * delegator: 'manager@company.com',
     * delegatee: 'employee@company.com',
     * scope: { permissions: ['read'] }
     * });
     * ```
     */
    delegation(params: DelegationRequest): Promise<DelegationResponse>;

    /**
     * Get a delegation record by ID
     * * @param id - Delegation ID (starts with 'dlg_')
     * @returns Full delegation record
     */
    getDelegation(id: string): Promise<FullDelegation>;

    /**
     * List delegation records with optional filters
     * * @param params - Query parameters
     * @returns Paginated list of delegations
     */
    listDelegations(params?: ListDelegationsParams): Promise<ListResponse<FullDelegation>>;

    // ========== Termination Methods ==========

    /**
     * Create a new termination record
     * * @param params - Termination request parameters
     * @returns Created termination record
     * @throws {Error} If terminator, targetId, or targetType is missing
     * * @example
     * ```javascript
     * const result = await client.termination({
     * terminator: 'admin@company.com',
     * targetId: 'dlg_1234567890abcd',
     * targetType: 'delegation',
     * reason: 'Employee left company'
     * });
     * ```
     */
    termination(params: TerminationRequest): Promise<TerminationResponse>;

    /**
     * Get a termination record by ID
     * * @param id - Termination ID (starts with 'trm_')
     * @returns Full termination record
     */
    getTermination(id: string): Promise<TerminationResponse>;

    // ========== Verification Methods ==========

    /**
     * Verify a record (detailed verification)
     * * @param params - Verification request parameters
     * @returns Verification result
     */
    verification(params: VerificationRequest): Promise<VerificationResponse>;

    /**
     * Quick verify a record (auto-detects type from ID)
     * * @param id - Record ID (any type)
     * @returns Quick verification result
     * * @example
     * ```javascript
     * const result = await client.verify('jep_1234567890abcd');
     * console.log(result.status); // 'VALID' or 'INVALID'
     * ```
     */
    verify(id: string): Promise<QuickVerifyResponse>;

    // ========== Utility Methods ==========

    /**
     * Check API health
     * * @returns Health status
     */
    health(): Promise<{ status: string; version: string; timestamp: string }>;

    /**
     * Get API documentation
     * * @returns API documentation
     */
    docs(): Promise<Record<string, any>>;

    /**
     * Generate a new API key
     * * @param email - User email
     * @param name - Key name
     * @returns Generated API key
     */
    generateKey(email: string, name?: string): Promise<{ key: string; email: string; name: string; created: string }>;
  }
}
