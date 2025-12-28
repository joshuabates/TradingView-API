const TradingView = require('../main');

/**
 * This example creates a BTCEUR daily chart
 */

const client = new TradingView.Client({
  authToken: 'eyJhbGciOiJSUzUxMiIsImtpZCI6IkdaeFUiLCJ0eXAiOiJKV1QifQ.eyJ1c2VyX2lkIjo3MzA4Njg0NCwiZXhwIjoxNzQxNjUwNzg4LCJpYXQiOjE3NDE2MzYzODgsInBsYW4iOiJwcm9fcHJlbWl1bSIsImRlY2xhcmVkX3N0YXR1cyI6Im5vbl9wcm8iLCJleHRfaG91cnMiOjEsInBlcm0iOiJhbWV4LG90YyxuYXNkYXEsdXMtc3RvY2tzLG5hc2RhcV9naWRzLG55c2UiLCJzdHVkeV9wZXJtIjoidHYtcHJvc3R1ZGllcyx0di1jaGFydHBhdHRlcm5zLHR2LXZvbHVtZWJ5cHJpY2UsdHYtY2hhcnRfcGF0dGVybnMiLCJtYXhfc3R1ZGllcyI6MjUsIm1heF9mdW5kYW1lbnRhbHMiOjEwLCJtYXhfY2hhcnRzIjo4LCJtYXhfYWN0aXZlX2FsZXJ0cyI6NDAwLCJtYXhfc3R1ZHlfb25fc3R1ZHkiOjI0LCJmaWVsZHNfcGVybWlzc2lvbnMiOlsicmVmYm9uZHMiXSwibWF4X292ZXJhbGxfYWxlcnRzIjoyMDAwLCJtYXhfb3ZlcmFsbF93YXRjaGxpc3RfYWxlcnRzIjo1LCJtYXhfYWN0aXZlX3ByaW1pdGl2ZV9hbGVydHMiOjQwMCwibWF4X2FjdGl2ZV9jb21wbGV4X2FsZXJ0cyI6NDAwLCJtYXhfYWN0aXZlX3dhdGNobGlzdF9hbGVydHMiOjIsIm1heF9jb25uZWN0aW9ucyI6NTB9.QxkLKnRyercmNQRX8M_pOWmqD1f6QKVAvdiUtIaNDhgF4fJXxXP5i4ahoTLzsn4nBemX1EJoCvjds3qdKC0HsctQk0wr89kFplUExOKFZkQAEPBJ_xPTtOd8_kzg2CxOP11YnnG4zTWk92WtwtOFKyVVs3P8xubz6Sc8OxEpLWc',
}); // Creates a websocket client

const chart = new client.Session.Chart(); // Init a Chart session

chart.setMarket('NASDAQ:TSLA', { // Set the market
  timeframe: 'D',
});

chart.onError((...err) => { // Listen for errors (can avoid crash)
  console.error('Chart error:', ...err);
  // Do something...
});

chart.onSymbolLoaded(() => { // When the symbol is successfully loaded
  console.log(`Market "${chart.infos.description}" loaded !`);
});

chart.onUpdate(() => { // When price changes
  if (!chart.periods[0]) return;
  console.log(`[${chart.infos.description}]: ${chart.periods[0].close} ${chart.infos.currency_id}`);
  // Do something...
});

// // Wait 5 seconds and set the market to BINANCE:ETHEUR
// setTimeout(() => {
//   console.log('\nSetting market to BINANCE:ETHEUR...');
//   chart.setMarket('BINANCE:ETHEUR', {
//     timeframe: 'D',
//   });
// }, 5000);
//
// // Wait 10 seconds and set the timeframe to 15 minutes
// setTimeout(() => {
//   console.log('\nSetting timeframe to 15 minutes...');
//   chart.setSeries('15');
// }, 10000);
//
// // Wait 15 seconds and set the chart type to "Heikin Ashi"
// setTimeout(() => {
//   console.log('\nSetting the chart type to "Heikin Ashi"s...');
//   chart.setMarket('BINANCE:ETHEUR', {
//     timeframe: 'D',
//     type: 'HeikinAshi',
//   });
// }, 15000);

// Wait 20 seconds and close the chart
setTimeout(() => {
  console.log('\nClosing the chart...');
  chart.delete();
}, 20000);

// Wait 25 seconds and close the client
setTimeout(() => {
  console.log('\nClosing the client...');
  client.end();
}, 25000);
