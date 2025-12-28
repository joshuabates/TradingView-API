// Vite-optimized browser entry point
// This handles Vite's pre-bundling and ensures WebSocket is available

// Ensure WebSocket is available globally for Vite's pre-bundling
if (typeof window !== 'undefined' && !window.WebSocket && typeof WebSocket !== 'undefined') {
  window.WebSocket = WebSocket;
}

// Import the regular browser module
export * from './browser.js';
export { default } from './browser.js';