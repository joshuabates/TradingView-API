# Browser Usage Guide

This guide explains how to use the TradingView API in web browsers.

## Building for Browser

First, build the browser bundle:

```bash
npm run build:browser
```

This creates `dist/tradingview-api.browser.js` which can be included in your HTML pages.

### Using with Bundlers (Webpack, Vite, etc.)

The package supports multiple import styles:

#### ES6 Modules (Vite, Modern Webpack)
```javascript
// Import specific exports
import { Client, BuiltInIndicator } from '@mathieuc/tradingview';

// Or import everything
import * as TradingView from '@mathieuc/tradingview';

// Or import as default
import TradingView from '@mathieuc/tradingview';
```

#### CommonJS (Older bundlers)
```javascript
const TradingView = require('@mathieuc/tradingview');
const { Client } = require('@mathieuc/tradingview');
```

#### Direct browser import
```javascript
// Import the browser build directly
import TradingView from '@mathieuc/tradingview/dist/tradingview-api.browser.mjs';
```

## Basic Usage

### 1. Include the Script

```html
<script src="path/to/tradingview-api.browser.js"></script>
```

### 2. Create a Client

```javascript
// The API is available as a global TradingView object
const client = new TradingView.Client({
    DEBUG: false // Enable debug logging
});
```

### 3. Handle Events

```javascript
client.onConnected(() => {
    console.log('Connected to TradingView!');
});

client.onDisconnected(() => {
    console.log('Disconnected from TradingView');
});

client.onError((error) => {
    console.error('Error:', error);
});
```

### 4. Get Real-time Quotes

```javascript
// Create a quote session
const quoteSession = new client.Session.Quote();

// Subscribe to market data
quoteSession.onData((data) => {
    console.log('Quote data:', data);
});

// Add symbols to watch
await quoteSession.add('AAPL');
await quoteSession.add('BTCUSD');
```

### 5. Chart Data

```javascript
// Create a chart session
const chartSession = new client.Session.Chart();

// Set up the market
await chartSession.setMarket('NASDAQ:AAPL', {
    timeframe: '60',    // 1 hour
    range: 100,         // 100 bars
});

// Listen for updates
chartSession.onUpdate(() => {
    console.log('Chart updated!');
});
```

## CORS Considerations

When using the API in browsers, you may encounter CORS (Cross-Origin Resource Sharing) issues. The TradingView WebSocket endpoints should work fine, but HTTP requests to TradingView's REST APIs may be blocked by CORS policies.

### Solutions:

1. **Use WebSocket-only features**: Most real-time data is available through WebSocket connections which don't have CORS restrictions.

2. **Proxy Server**: Set up a proxy server to forward HTTP requests:
   ```javascript
   // Instead of direct requests to TradingView
   // Use your proxy server
   const proxyUrl = 'https://your-proxy.com/tradingview-api';
   ```

3. **Use authenticated features carefully**: Some features require authentication cookies which may not work in browser environments due to security restrictions.

## Browser-Specific Limitations

1. **No File System Access**: Features that save data to disk won't work in browsers.

2. **Cookie Restrictions**: Browser security policies may prevent access to TradingView cookies for authentication.

3. **Memory Constraints**: Be mindful of memory usage when subscribing to many symbols or storing large amounts of historical data.

## Example Application

See `examples/browser-example.html` for a complete working example that demonstrates:
- Connecting to TradingView
- Subscribing to real-time quotes
- Handling errors
- Debug mode toggle
- Clean disconnection

## Webpack Configuration

If you're building your own bundle, here's a minimal webpack configuration:

```javascript
module.exports = {
  entry: './your-app.js',
  output: {
    filename: 'bundle.js',
  },
  resolve: {
    fallback: {
      "ws": false,
      "fs": false,
      "os": false,
      "path": false,
      "crypto": false
    }
  }
};
```

## TypeScript Support

The library includes TypeScript definitions. In a browser environment, you may need to add type definitions for the global `TradingView` object:

```typescript
declare global {
  interface Window {
    TradingView: typeof import('@mathieuc/tradingview');
  }
}
```

## Security Notes

1. **Never expose authentication tokens** in client-side code.
2. **Use HTTPS** for your web application to ensure secure WebSocket connections.
3. **Validate and sanitize** any user input before using it with the API.
4. **Rate limiting**: Be aware of TradingView's rate limits to avoid being blocked.

## Troubleshooting

### WebSocket Connection Failed
- Check browser console for specific error messages
- Ensure you're using HTTPS if your site is served over HTTPS
- Check if WebSockets are blocked by browser extensions or corporate firewalls

### No Data Received
- Verify the symbol format (e.g., "NASDAQ:AAPL" not just "AAPL")
- Check if the market is open
- Enable debug mode to see detailed logs

### Memory Leaks
- Always call `client.end()` when done
- Remove event listeners when no longer needed
- Limit the number of concurrent subscriptions