# Electron Usage Guide

This guide explains how to use the TradingView API in Electron applications where you need different builds for main and renderer processes.

## The Challenge

Electron apps have two types of processes:
- **Main process**: Node.js environment (uses `main.js` with ws package)
- **Renderer process**: Browser environment (needs `dist/tradingview-api.browser.js`)

The package.json `browser` field doesn't distinguish between these contexts in Electron.

## Solutions

### Option 1: Direct Import Paths (Recommended)

Import the specific build you need:

```javascript
// In Main Process (Node.js environment)
const TradingView = require('@mathieuc/tradingview'); // Uses main.js

// In Renderer Process (Browser environment)
const TradingView = require('@mathieuc/tradingview/dist/tradingview-api.browser.js');
```

### Option 2: Webpack Configuration

Configure your bundler to use different builds for different targets:

```javascript
// webpack.main.config.js (for main process)
module.exports = {
  target: 'electron-main',
  // Will use main.js
};

// webpack.renderer.config.js (for renderer process)
module.exports = {
  target: 'electron-renderer',
  resolve: {
    alias: {
      '@mathieuc/tradingview': require.resolve('@mathieuc/tradingview/dist/tradingview-api.browser.js')
    }
  }
};
```

### Option 3: Conditional Imports

Create a wrapper module:

```javascript
// tradingview-wrapper.js
const isRenderer = process && process.type === 'renderer';

module.exports = isRenderer 
  ? require('@mathieuc/tradingview/dist/tradingview-api.browser.js')
  : require('@mathieuc/tradingview');
```

### Option 4: Package Exports (Future)

Once this package adopts the exports field (requires package.json update), you could use:

```javascript
// This would require updating the package.json with exports field
const TradingView = require('@mathieuc/tradingview/node'); // for main
const TradingView = require('@mathieuc/tradingview/browser'); // for renderer
```

## Example Usage

### Main Process
```javascript
// main.js
const { app, BrowserWindow } = require('electron');
const TradingView = require('@mathieuc/tradingview');

let mainWindow;
let client;

app.whenReady().then(() => {
  // Create TradingView client in main process
  client = new TradingView.Client({
    token: process.env.SESSION,
    signature: process.env.SIGNATURE
  });

  client.onConnected(() => {
    console.log('Connected in main process');
  });

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
});
```

### Renderer Process
```javascript
// renderer.js
const TradingView = require('@mathieuc/tradingview/dist/tradingview-api.browser.js');

const client = new TradingView.Client({
  // Note: Be careful with credentials in renderer process
  DEBUG: true
});

client.onConnected(() => {
  console.log('Connected in renderer process');
  
  const quote = new client.Session.Quote();
  quote.onData((data) => {
    console.log('Quote data:', data);
  });
  
  quote.add('AAPL');
});
```

## Security Considerations

1. **Avoid exposing credentials in renderer**: If you need authenticated access, consider:
   - Making API calls from main process and using IPC to communicate with renderer
   - Using a secure bridge pattern with contextBridge API

2. **Example secure pattern**:
```javascript
// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('tradingViewAPI', {
  subscribeToQuotes: (symbol) => ipcRenderer.invoke('subscribe-quotes', symbol),
  onQuoteData: (callback) => ipcRenderer.on('quote-data', callback)
});

// main.js
ipcMain.handle('subscribe-quotes', async (event, symbol) => {
  const quote = new client.Session.Quote();
  quote.onData((data) => {
    event.sender.send('quote-data', data);
  });
  await quote.add(symbol);
});
```

## Build Considerations

If you're building the browser bundle yourself:

```bash
# Build browser bundle first
npm run build:browser

# Then package your Electron app
npm run package
```

Make sure the `dist/` directory is included in your Electron app's build.