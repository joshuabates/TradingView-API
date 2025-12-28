/**
 * HTTP client wrapper that provides axios in Node.js and fetch-based client in browsers
 */

const { isBrowser } = require('./environment');

let httpClient;

if (isBrowser) {
  // Use fetch-based client in browsers
  httpClient = require('./http-client');
} else {
  // Use axios in Node.js
  httpClient = require('axios');
}

module.exports = httpClient;