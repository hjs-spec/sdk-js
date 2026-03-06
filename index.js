// Universal JEP SDK (works in browser and Node.js)
// JEP Protocol - Complete SDK with all 4 primitives
// IETF Draft: draft-wang-jep-judgment-event-00

class JEPClient {
  /**
   * Create a new JEP client
   * @param {Object} options - Configuration options
   * @param {string} options.baseURL - The base URL of the JEP API (default: https://api.jep-protocol.org)
   * @param {string} options.apiKey - API key for authentication
   */
  constructor(options = {}) {
    // 默认地址统一更新为 jep-protocol.org
    this.baseURL = options.baseURL || 'https://api.jep-protocol.org';
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
   * @param {string} id - The judgment ID (starts with 'jep_')
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
   */
  async verification(params) {
    const { verifier, targetId, targetType } = params;
    
    if (!verifier || !targetId || !targetType) {
      throw new Error('verifier, targetId, and targetType are required');
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
   * @param {string} id - Record ID (jep_, dlg_, or trm_)
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
   */
  async health() {
    const response = await this.fetch(`${this.baseURL}/health`);
    return response.json();
  }

  /**
   * Get API documentation
   */
  async docs() {
    const response = await this.fetch(`${this.baseURL}/api/docs`);
    return response.json();
  }

  /**
   * Generate a new API key
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

// Export for ES modules
export default JEPClient;

// Also expose as global for browser
if (typeof window !== 'undefined') {
  window.JEPClient = JEPClient;
}
