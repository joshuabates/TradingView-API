/**
 * Helper functions for TradingView Advanced Charts Datafeed
 */

/**
 * Convert Advanced Charts resolution to TradingView-API timeframe format
 * @param {string} resolution - Resolution from Advanced Charts (e.g., '1', '60', '1D')
 * @returns {string} Timeframe for TradingView-API
 */
function convertTimeframe(resolution) {
  // Handle special cases
  const resolutionMap = {
    '1D': 'D',
    '1W': 'W',
    '1M': 'M',
    'D': 'D',
    'W': 'W',
    'M': 'M',
  };

  if (resolutionMap[resolution]) {
    return resolutionMap[resolution];
  }

  // For numeric resolutions (minutes), return as-is
  return resolution;
}

/**
 * Transform PricePeriod from TradingView-API to Bar format for Advanced Charts
 * @param {Object} period - PricePeriod object from TradingView-API
 * @returns {Object} Bar object for Advanced Charts
 */
function transformBar(period) {
  return {
    time: period.time * 1000, // Convert to milliseconds
    open: period.open,
    high: period.max,
    low: period.min,
    close: period.close,
    volume: period.volume || 0,
  };
}

/**
 * Transform market info from TradingView-API to LibrarySymbolInfo for Advanced Charts
 * @param {Object} info - Market info from TradingView-API
 * @param {string} symbolName - Original symbol name requested
 * @returns {Object} LibrarySymbolInfo object
 */
function transformSymbolInfo(info, symbolName) {
  // Map TradingView types to Advanced Charts types
  const typeMap = {
    stock: 'stock',
    forex: 'forex',
    crypto: 'crypto',
    index: 'index',
    futures: 'futures',
    bond: 'bond',
    economic: 'economic',
  };

  // Determine supported resolutions based on symbol type
  const supportedResolutions = ['1', '3', '5', '15', '30', '45', '60', '120', '180', '240', '1D', '1W', '1M'];
  
  return {
    name: symbolName,
    ticker: info.symbol_id || symbolName,
    description: info.description || symbolName,
    type: typeMap[info.type] || 'stock',
    session: info.session || '24x7',
    timezone: info.timezone || 'Etc/UTC',
    exchange: info.exchange || '',
    listed_exchange: info.listed_exchange || info.exchange || '',
    format: 'price',
    pricescale: info.pricescale || 100,
    minmov: info.minmov || 1,
    has_intraday: true,
    supported_resolutions: supportedResolutions,
    has_seconds: false,
    has_daily: true,
    has_weekly_and_monthly: true,
    has_empty_bars: false,
    volume_precision: info.volume_precision || 2,
    data_status: 'streaming',
    currency_code: info.currency_id || 'USD',
    full_name: info.full_name || symbolName,
  };
}

/**
 * Transform quote data from TradingView-API to QuoteData format for Advanced Charts
 * @param {string} symbol - Symbol name
 * @param {Object} data - Quote data from TradingView-API
 * @returns {Object} QuoteData object
 */
function transformQuote(symbol, data) {
  if (!data) {
    return {
      s: 'error',
      n: symbol,
      v: {},
    };
  }

  return {
    s: 'ok',
    n: symbol,
    v: {
      ch: data.ch || 0,
      chp: data.chp || 0,
      short_name: data.short_name || symbol,
      exchange: data.exchange || '',
      description: data.description || '',
      lp: data.lp || 0,
      ask: data.ask || 0,
      bid: data.bid || 0,
      spread: data.ask && data.bid ? data.ask - data.bid : 0,
      open_price: data.open_price || 0,
      high_price: data.high_price || 0,
      low_price: data.low_price || 0,
      prev_close_price: data.prev_close_price || 0,
      volume: data.volume || 0,
    },
  };
}

/**
 * Parse resolution string to extract numeric value and unit
 * @param {string} resolution - Resolution string (e.g., '60', '1D')
 * @returns {Object} Object with value and unit
 */
function parseResolution(resolution) {
  const match = resolution.match(/^(\d+)([A-Z]?)$/);
  if (!match) {
    return { value: 1, unit: 'D' };
  }

  const value = parseInt(match[1], 10);
  const unit = match[2] || 'minute';

  return { value, unit };
}

/**
 * Calculate bar count based on date range and resolution
 * @param {number} from - Start timestamp in seconds
 * @param {number} to - End timestamp in seconds
 * @param {string} resolution - Resolution string
 * @returns {number} Estimated number of bars
 */
function calculateBarCount(from, to, resolution) {
  const duration = to - from;
  const { value, unit } = parseResolution(resolution);

  let barDuration;
  switch (unit) {
    case 'D':
      barDuration = value * 24 * 60 * 60;
      break;
    case 'W':
      barDuration = value * 7 * 24 * 60 * 60;
      break;
    case 'M':
      barDuration = value * 30 * 24 * 60 * 60; // Approximate
      break;
    default: // Minutes
      barDuration = value * 60;
  }

  return Math.ceil(duration / barDuration);
}

module.exports = {
  convertTimeframe,
  transformBar,
  transformSymbolInfo,
  transformQuote,
  parseResolution,
  calculateBarCount,
};