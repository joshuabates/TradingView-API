// Browser entry point that properly exports ES modules
// This file is meant to be imported directly in browser environments

// Load the browser bundle (sets window.TradingViewAPI)
import './dist/tradingview-api.browser.js';

// Get the global TradingViewAPI object
const TradingViewAPI = window.TradingViewAPI;

// Export everything
export const {
  Client,
  BuiltInIndicator, 
  PineIndicator,
  PinePermManager,
  Datafeed,
  getTA,
  searchMarket,
  searchMarketV3,
  searchIndicator,
  getIndicator,
  loginUser,
  getUser,
  getPrivateIndicators,
  getChartToken,
  getDrawings
} = TradingViewAPI;

export default TradingViewAPI;