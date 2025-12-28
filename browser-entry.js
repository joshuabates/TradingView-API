// Browser entry point for webpack
const miscRequests = require('./src/miscRequests');
const Client = require('./src/client');
const BuiltInIndicator = require('./src/classes/BuiltInIndicator');
const PineIndicator = require('./src/classes/PineIndicator');
const PinePermManager = require('./src/classes/PinePermManager');
const Datafeed = require('./src/datafeed');

// Create the TradingView object with all exports
const TradingView = {
  ...miscRequests,
  Client,
  BuiltInIndicator,
  PineIndicator,
  PinePermManager,
  Datafeed
};

// Export for different module systems
module.exports = TradingView;