/**
 * Environment detection and platform-specific abstractions
 */

const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;

let WebSocket;
if (isBrowser) {
  // For browser/Electron renderer
  WebSocket = window.WebSocket || global.WebSocket || globalThis.WebSocket;
} else {
  // For Node.js
  WebSocket = require('ws');
}

/**
 * Get debug flag from environment
 */
function getDebugFlag() {
  if (isBrowser) {
    return window.TW_DEBUG || false;
  }
  return global.TW_DEBUG || false;
}

/**
 * Generate a random user agent string
 */
function generateUserAgent() {
  if (isNode) {
    // eslint-disable-next-line global-require
    const os = require('os');
    const nodeVersion = process.version.substring(1);
    const platform = `${os.type()}/${os.release()}`;
    const arch = os.arch();
    return `Node.js/${nodeVersion} (${platform}; ${arch})`;
  }

  // For browser, use a generic Chrome user agent
  return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
}

/**
 * Create a WebSocket instance with platform-specific implementation
 */
function createWebSocket(url, options = {}) {
  if (isBrowser) {
    return new WebSocket(url);
  }

  return new WebSocket(url, options);
}

/**
 * Normalize WebSocket event handling across platforms
 */
function addWebSocketEventHandlers(ws, handlers) {
  if (isBrowser) {
    // Browser uses addEventListener
    if (handlers.open) {
      ws.addEventListener('open', handlers.open);
    }
    if (handlers.message) {
      ws.addEventListener('message', (event) => {
        // Browser WebSocket passes data in event.data
        handlers.message(event.data);
      });
    }
    if (handlers.error) {
      ws.addEventListener('error', handlers.error);
    }
    if (handlers.close) {
      ws.addEventListener('close', handlers.close);
    }
  } else {
    // Node.js uses .on()
    if (handlers.open) {
      ws.on('open', handlers.open);
    }
    if (handlers.message) {
      ws.on('message', handlers.message);
    }
    if (handlers.error) {
      ws.on('error', handlers.error);
    }
    if (handlers.close) {
      ws.on('close', handlers.close);
    }
  }
}

/**
 * Get WebSocket ready state constant
 */
function getWebSocketReadyState(state) {
  return WebSocket[state];
}

/**
 * Send data through WebSocket with platform-specific handling
 */
function sendWebSocketData(ws, data) {
  if (ws.readyState === getWebSocketReadyState('OPEN')) {
    ws.send(data);
  }
}

/**
 * Close WebSocket connection
 */
function closeWebSocket(ws, code, reason) {
  if (ws && ws.readyState === getWebSocketReadyState('OPEN')) {
    ws.close(code, reason);
  }
}

module.exports = {
  isBrowser,
  isNode,
  getDebugFlag,
  generateUserAgent,
  createWebSocket,
  addWebSocketEventHandlers,
  sendWebSocketData,
  getWebSocketReadyState,
  closeWebSocket,
};

