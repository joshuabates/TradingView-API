/**
 * Browser-compatible HTTP client using fetch API
 * Provides axios-like interface for compatibility
 */

/**
 * Convert headers object to Headers instance
 */
function normalizeHeaders(headers = {}) {
  const normalized = new Headers();
  Object.entries(headers).forEach(([key, value]) => {
    normalized.append(key, value);
  });
  return normalized;
}

/**
 * Create axios-compatible response object
 */
function createResponse(response, data) {
  return {
    data,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    config: {},
    request: response,
  };
}

/**
 * Browser HTTP client with axios-like interface
 */
const httpClient = {
  async get(url, config = {}) {
    // Handle params like axios does
    if (config.params) {
      const params = new URLSearchParams();
      Object.entries(config.params).forEach(([key, value]) => {
        params.append(key, value);
      });
      url = `${url}?${params.toString()}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: normalizeHeaders(config.headers),
      ...config,
    });

    if (!response.ok) {
      const error = new Error(`Request failed with status ${response.status}`);
      error.response = createResponse(response, await response.text());
      throw error;
    }

    const data = await response.json();
    return createResponse(response, data);
  },

  async post(url, data, config = {}) {
    const headers = normalizeHeaders(config.headers);
    
    // Set content-type if not already set
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: typeof data === 'string' ? data : JSON.stringify(data),
      ...config,
    });

    if (!response.ok) {
      const error = new Error(`Request failed with status ${response.status}`);
      error.response = createResponse(response, await response.text());
      throw error;
    }

    const responseData = await response.json();
    return createResponse(response, responseData);
  },
};

module.exports = httpClient;