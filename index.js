// Universal HJS SDK (works in browser and Node.js)
// HJS Protocol - Complete SDK with all 4 primitives
// IETF Draft: draft-wang-hjs-judgment-event-00

class HJSClient {
  /**
   * Create a new HJS client
   * @param {Object} options - Configuration options
   * @param {string} options.baseURL - The base URL of the HJS API (default: https://api.hjs.sh)
   * @param {string} options.apiKey - API key for authentication
   */
  constructor(options = {}) {
    this.baseURL = options.baseURL || 'https://api.hjs.sh';
    this.apiKey = options.apiKey || null;
    this.fetch = this._getFetchImplementation();
  }

  // Automatically detect environment and use native fetch (Node 18+ or browser)
  _getFetchImplementation() {
    if (typeof globalThis !== 'undefined' && globalThis.fetch) {
      return globalThis.fetch.bind(globalThis);
    }
    throw new Error('Fetch API not available. Please use Node 18+ or modern browser');
  }

  // Get headers with optional API key
  _getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }
    return headers;
  }

  // Helper for handling API responses
  async _handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // ==================== JUDGMENT API (Core Primitive #1) ====================
  
  /**
   * Record a judgment
   * @param {Object} params - Judgment parameters
   * @param {string} params.entity - The entity making the judgment
   * @param {string} params.action - The action being judged
   * @param {Object} params.scope - Optional scope data
   * @param {Object} params.immutability - Optional anchoring options
   * @returns {Promise<Object>} - The recorded judgment
   */
  async judgment(params) {
    const { entity, action, scope = {}, immutability } = params;
    
    if (!entity || !action) {
      throw new Error('entity and action are required');
    }

    const response = await this.fetch(`${this.baseURL}/judgments`, {
      method: 'POST',
      headers: this._getHeaders(),
      body: JSON.stringify({ entity, action, scope, immutability })
    });

    return this._handleResponse(response);
  }

  /**
   * Get a judgment by ID
   * @param {string} id - The judgment ID (starts with 'jgd_')
   * @returns {Promise<Object>} - The judgment data
   */
  async getJudgment(id) {
    if (!id) throw new Error('id is required');

    const response = await this.fetch(`${this.baseURL}/judgments/${id}`, {
      headers: this._getHeaders()
    });

    return this._handleResponse(response);
  }

  /**
   * List judgments
   * @param {Object} params - Query parameters
   * @param {string} params.entity - Filter by entity
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @returns {Promise<Object>} - Paginated list of judgments
   */
  async listJudgments(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${this.baseURL}/judgments${query ? '?' + query : ''}`;
    
    const response = await this.fetch(url, { headers: this._getHeaders() });
    
    return this._handleResponse(response);
  }

  // ==================== DELEGATION API (Core Primitive #2) ====================

  /**
   * Create a delegation
   * @param {Object} params - Delegation parameters
   * @param {string} params.delegator - Who is delegating
   * @param {string} params.delegatee - Who receives the delegation
   * @param {string} params.judgmentId - Optional linked judgment
   * @param {Object} params.scope - Delegation scope/permissions
   * @param {string} params.expiry - ISO date when delegation expires
   * @returns {Promise<Object>} - The created delegation
   */
  async delegation(params) {
    const { delegator, delegatee, judgmentId, scope = {}, expiry } = params;
    
    if (!delegator || !delegatee) {
      throw new Error('delegator and delegatee are required');
    }

    const response = await this.fetch(`${this.baseURL}/delegations`, {
      method: 'POST',
      headers: this._getHeaders(),
      body: JSON.stringify({ 
        delegator, 
        delegatee, 
        judgment_id: judgmentId, 
        scope, 
        expiry 
      })
    });

    return this._handleResponse(response);
  }

  /**
   * Get a delegation by ID
   * @param {string} id - The delegation ID (starts with 'dlg_')
   * @returns {Promise<Object>} - The delegation data
   */
  async getDelegation(id) {
    if (!id) throw new Error('id is required');

    const response = await this.fetch(`${this.baseURL}/delegations/${id}`, {
      headers: this._getHeaders()
    });

    return this._handleResponse(response);
  }

  /**
   * List delegations
   * @param {Object} params - Query parameters
   * @param {string} params.delegator - Filter by delegator
   * @param {string} params.delegatee - Filter by delegatee
   * @param {string} params.status - Filter by status ('active', 'revoked')
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @returns {Promise<Object>} - Paginated list of delegations
   */
  async listDelegations(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${this.baseURL}/delegations${query ? '?' + query : ''}`;
    
    const response = await this.fetch(url, { headers: this._getHeaders() });
    
    return this._handleResponse(response);
  }

  // ==================== TERMINATION API (Core Primitive #3) ====================

  /**
   * Create a termination
   * @param {Object} params - Termination parameters
   * @param {string} params.terminator - Who is terminating
   * @param {string} params.targetId - ID of judgment or delegation to terminate
   * @param {string} params.targetType - 'judgment' or 'delegation'
   * @param {string} params.reason - Optional reason for termination
   * @returns {Promise<Object>} - The created termination
   */
  async termination(params) {
    const { terminator, targetId, targetType, reason } = params;
    
    if (!terminator || !targetId || !targetType) {
      throw new Error('terminator, targetId, and targetType are required');
    }
    if (!['judgment', 'delegation'].includes(targetType)) {
      throw new Error('targetType must be "judgment" or "delegation"');
    }

    const response = await this.fetch(`${this.baseURL}/terminations`, {
      method: 'POST',
      headers: this._getHeaders(),
      body: JSON.stringify({ 
        terminator, 
        target_id: targetId, 
        target_type: targetType, 
        reason 
      })
    });

    return this._handleResponse(response);
  }

  /**
   * Get a termination by ID
   * @param {string} id - The termination ID (starts with 'trm_')
   * @returns {Promise<Object>} - The termination data
   */
  async getTermination(id) {
    if (!id) throw new Error('id is required');

    const response = await this.fetch(`${this.baseURL}/terminations/${id}`, {
      headers: this._getHeaders()
    });

    return this._handleResponse(response);
  }

  // ==================== VERIFICATION API (Core Primitive #4) ====================

  /**
   * Verify any record (judgment, delegation, or termination)
   * @param {Object} params - Verification parameters
   * @param {string} params.verifier - Who is verifying
   * @param {string} params.targetId - ID of record to verify
   * @param {string} params.targetType - 'judgment', 'delegation', or 'termination'
   * @returns {Promise<Object>} - Verification result
   */
  async verification(params) {
    const { verifier, targetId, targetType } = params;
    
    if (!verifier || !targetId || !targetType) {
      throw new Error('verifier, targetId, and targetType are required');
    }
    if (!['judgment', 'delegation', 'termination'].includes(targetType)) {
      throw new Error('targetType must be "judgment", "delegation", or "termination"');
    }

    const response = await this.fetch(`${this.baseURL}/verifications`, {
      method: 'POST',
      headers: this._getHeaders(),
      body: JSON.stringify({ 
        verifier, 
        target_id: targetId, 
        target_type: targetType 
      })
    });

    return this._handleResponse(response);
  }

  /**
   * Quick verify (auto-detects type from ID prefix)
   * @param {string} id - Record ID (jgd_, dlg_, or trm_)
   * @returns {Promise<Object>} - Quick verification result
   */
  async verify(id) {
    if (!id) throw new Error('id is required');

    const response = await this.fetch(`${this.baseURL}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });

    return this._handleResponse(response);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Check API health
   * @returns {Promise<Object>} - Health status
   */
  async health() {
    const response = await this.fetch(`${this.baseURL}/health`);
    return response.json();
  }

  /**
   * Get API documentation
   * @returns {Promise<Object>} - API documentation
   */
  async docs() {
    const response = await this.fetch(`${this.baseURL}/api/docs`);
    return response.json();
  }

  /**
   * Generate a new API key (no authentication required)
   * @param {string} email - User email
   * @param {string} name - Key name/description
   * @returns {Promise<Object>} - Generated API key
   */
  async generateKey(email, name = 'default') {
    if (!email) throw new Error('email is required');

    const response = await this.fetch(`${this.baseURL}/developer/keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    });

    return this._handleResponse(response);
  }
}

// Export for ES modules (Node.js with "type": "module" or bundlers)
export default HJSClient;

// Also expose as global for browser
if (typeof window !== 'undefined') {
  window.HJSClient = HJSClient;
}
