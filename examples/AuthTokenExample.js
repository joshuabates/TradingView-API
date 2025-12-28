const TradingView = require('../main');

// Example 1: Using authToken directly (bypasses getUser)
const client1 = new TradingView.Client({
  authToken: 'your_auth_token_here'
});

client1.onConnected(() => {
  console.log('Client 1 connected with direct authToken');
});

// Example 2: Using token (sessionid) - will call getUser
const client2 = new TradingView.Client({
  token: process.env.SESSION,
  signature: process.env.SIGNATURE
});

client2.onConnected(() => {
  console.log('Client 2 connected with sessionid cookie');
});

// Example 3: Anonymous user
const client3 = new TradingView.Client();

client3.onConnected(() => {
  console.log('Client 3 connected as anonymous user');
});

// Log any errors
[client1, client2, client3].forEach((client, i) => {
  client.onError((...err) => {
    console.error(`Client ${i + 1} error:`, ...err);
  });
});

// Close connections after 5 seconds
setTimeout(() => {
  Promise.all([
    client1.end(),
    client2.end(),
    client3.end()
  ]).then(() => {
    console.log('All connections closed');
    process.exit(0);
  });
}, 5000);