// Test that the package exports are working correctly
console.log('Testing package exports...\n');

// Test 1: CommonJS require
try {
  const TradingView = require('./main.js');
  console.log('✓ CommonJS default:', typeof TradingView);
  console.log('✓ CommonJS Client:', typeof TradingView.Client);
  console.log('✓ CommonJS exports:', Object.keys(TradingView).join(', '));
} catch (e) {
  console.error('✗ CommonJS failed:', e.message);
}

// Test 2: Check browser files exist
const fs = require('fs');
const files = [
  'dist/tradingview-api.browser.js',
  'dist/tradingview-api.browser.mjs'
];

console.log('\nBrowser files:');
files.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    console.log(`✓ ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
  } else {
    console.log(`✗ ${file} - MISSING`);
  }
});

console.log('\nPackage version:', require('./package.json').version);
console.log('Last modified:', new Date(fs.statSync('./src/client.js').mtime).toISOString());