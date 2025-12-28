/**
 * TradingView Advanced Charts Datafeed implementation using TradingView-API
 */

const { isBrowser } = require('../environment');
const {
  convertTimeframe,
  transformBar,
  transformSymbolInfo,
  transformQuote,
  calculateBarCount,
} = require('./helpers');

class Datafeed {
  constructor(options = {}) {
    this.options = {
      debug: false,
      ...options,
    };

    // Initialize client based on environment
    if (isBrowser) {
      // In browser, TradingView is a global
      this.TradingView = window.TradingView;
    } else {
      // In Node.js, require the module
      this.TradingView = require('../../main');
    }

    this.client = null;
    this.chartSessions = new Map(); // Map of listenerGuid to chart session
    this.quoteSessions = new Map(); // Map of listenerGuid to quote markets
    this.symbolInfoCache = new Map(); // Cache resolved symbols
    this.isConnected = false;

    this._initClient();
  }

  _initClient() {
    this.client = new this.TradingView.Client({
      token: this.options.token,
      signature: this.options.signature,
      DEBUG: this.options.debug,
    });

    this.client.onConnected(() => {
      this.isConnected = true;
      if (this.options.debug) console.log('[Datafeed] Connected to TradingView');
    });

    this.client.onDisconnected(() => {
      this.isConnected = false;
      if (this.options.debug) console.log('[Datafeed] Disconnected from TradingView');
    });

    this.client.onError((error) => {
      console.error('[Datafeed] Client error:', error);
    });
  }

  // IExternalDatafeed implementation
  onReady(callback) {
    const configuration = {
      supported_resolutions: ['1', '3', '5', '15', '30', '45', '60', '120', '180', '240', '1D', '1W', '1M'],
      exchanges: [
        { value: '', name: 'All Exchanges', desc: '' },
        { value: 'NASDAQ', name: 'NASDAQ', desc: 'NASDAQ' },
        { value: 'NYSE', name: 'NYSE', desc: 'NYSE' },
        { value: 'BINANCE', name: 'Binance', desc: 'Binance' },
        { value: 'COINBASE', name: 'Coinbase', desc: 'Coinbase' },
      ],
      symbols_types: [
        { name: 'All', value: '' },
        { name: 'Stock', value: 'stock' },
        { name: 'Forex', value: 'forex' },
        { name: 'Crypto', value: 'crypto' },
        { name: 'Index', value: 'index' },
      ],
      supports_marks: false,
      supports_time: true,
      supports_timescale_marks: false,
    };

    // Wait for connection if not already connected
    if (this.isConnected) {
      setTimeout(() => callback(configuration), 0);
    } else {
      this.client.onConnected(() => {
        callback(configuration);
      });
    }
  }

  // IDatafeedChartApi implementation
  async searchSymbols(userInput, exchange, symbolType, onResult) {
    try {
      const results = await this.TradingView.searchMarketV3(userInput, symbolType);
      
      const symbols = results
        .filter(item => !exchange || item.exchange === exchange)
        .map(item => ({
          symbol: item.symbol,
          full_name: item.id,
          description: item.description,
          exchange: item.exchange,
          type: item.type,
        }));

      onResult(symbols);
    } catch (error) {
      console.error('[Datafeed] Search error:', error);
      onResult([]);
    }
  }

  resolveSymbol(symbolName, onResolve, onError, extension) {
    // Check cache first
    if (this.symbolInfoCache.has(symbolName)) {
      setTimeout(() => onResolve(this.symbolInfoCache.get(symbolName)), 0);
      return;
    }

    // Create a temporary chart session to get symbol info
    const chart = new this.client.Session.Chart();

    chart.onError((error) => {
      onError(`Failed to resolve symbol: ${error}`);
    });

    chart.onSymbolLoaded(() => {
      const symbolInfo = transformSymbolInfo(chart.infos, symbolName);
      this.symbolInfoCache.set(symbolName, symbolInfo);
      onResolve(symbolInfo);
      
      // Clean up temporary session
      setTimeout(() => chart.delete(), 100);
    });

    // Set market to resolve symbol
    chart.setMarket(symbolName, {
      timeframe: 'D',
      range: 1, // Only need 1 bar to get symbol info
    });
  }

  getBars(symbolInfo, resolution, periodParams, onResult, onError) {
    const { from, to, countBack, firstDataRequest } = periodParams;
    
    // Create a temporary chart session for historical data
    const chart = new this.client.Session.Chart();
    const timeframe = convertTimeframe(resolution);

    chart.onError((error) => {
      onError(`Failed to get bars: ${error}`);
    });

    chart.onSymbolLoaded(() => {
      // Get all available periods
      const bars = chart.periods
        .filter(period => period.time >= from && period.time <= to)
        .map(transformBar)
        .sort((a, b) => a.time - b.time);

      const meta = {
        noData: bars.length === 0,
        nextTime: bars.length > 0 ? null : null,
      };

      onResult(bars, meta);
      
      // Clean up temporary session
      setTimeout(() => chart.delete(), 100);
    });

    // Calculate range based on the time period
    const range = countBack || calculateBarCount(from, to, resolution) || 300;

    // Set market with the specified timeframe
    chart.setMarket(symbolInfo.name, {
      timeframe,
      range,
      to: to, // End timestamp
    });
  }

  subscribeBars(symbolInfo, resolution, onTick, listenerGuid, onResetCacheNeededCallback) {
    // Create a new chart session for this subscription
    const chart = new this.client.Session.Chart();
    const timeframe = convertTimeframe(resolution);

    // Store the session
    this.chartSessions.set(listenerGuid, {
      chart,
      lastBar: null,
    });

    chart.onError((error) => {
      console.error(`[Datafeed] Chart error for ${symbolInfo.name}:`, error);
    });

    chart.onUpdate(() => {
      if (!chart.periods[0]) return;

      const bar = transformBar(chart.periods[0]);
      const session = this.chartSessions.get(listenerGuid);

      // Only send update if bar has changed
      if (!session.lastBar || session.lastBar.time !== bar.time || session.lastBar.close !== bar.close) {
        session.lastBar = bar;
        onTick(bar);
      }
    });

    // Set market for real-time updates
    chart.setMarket(symbolInfo.name, {
      timeframe,
      range: 100, // Keep some historical bars
    });
  }

  unsubscribeBars(listenerGuid) {
    const session = this.chartSessions.get(listenerGuid);
    if (session) {
      session.chart.delete();
      this.chartSessions.delete(listenerGuid);
    }
  }

  getServerTime(callback) {
    // Return current server time in seconds
    callback(Math.floor(Date.now() / 1000));
  }

  // IDatafeedQuotesApi implementation
  getQuotes(symbols, onDataCallback, onErrorCallback) {
    // Create a temporary quote session
    const quoteSession = new this.client.Session.Quote();
    const results = [];
    let completed = 0;

    symbols.forEach(symbol => {
      const market = new quoteSession.Market(symbol);

      market.onData((data) => {
        results.push(transformQuote(symbol, data));
        completed++;

        if (completed === symbols.length) {
          onDataCallback(results);
          // Clean up session
          setTimeout(() => quoteSession.delete(), 100);
        }
      });

      market.onError((error) => {
        results.push({
          s: 'error',
          n: symbol,
          v: {},
        });
        completed++;

        if (completed === symbols.length) {
          onDataCallback(results);
          setTimeout(() => quoteSession.delete(), 100);
        }
      });
    });

    // Handle empty symbols array
    if (symbols.length === 0) {
      onDataCallback([]);
    }
  }

  subscribeQuotes(symbols, fastSymbols, onRealtimeCallback, listenerGuid) {
    // Create a quote session for this subscription
    const quoteSession = new this.client.Session.Quote();
    const markets = new Map();

    this.quoteSessions.set(listenerGuid, {
      session: quoteSession,
      markets,
    });

    // Subscribe to all symbols
    [...new Set([...symbols, ...fastSymbols])].forEach(symbol => {
      const market = new quoteSession.Market(symbol);
      markets.set(symbol, market);

      market.onData((data) => {
        const quote = transformQuote(symbol, data);
        onRealtimeCallback([quote]);
      });

      market.onError((error) => {
        console.error(`[Datafeed] Quote error for ${symbol}:`, error);
        onRealtimeCallback([{
          s: 'error',
          n: symbol,
          v: {},
        }]);
      });
    });
  }

  unsubscribeQuotes(listenerGuid) {
    const quoteData = this.quoteSessions.get(listenerGuid);
    if (quoteData) {
      quoteData.session.delete();
      this.quoteSessions.delete(listenerGuid);
    }
  }

  // Cleanup method
  destroy() {
    // Clean up all chart sessions
    this.chartSessions.forEach(session => {
      session.chart.delete();
    });
    this.chartSessions.clear();

    // Clean up all quote sessions
    this.quoteSessions.forEach(quoteData => {
      quoteData.session.delete();
    });
    this.quoteSessions.clear();

    // Clear cache
    this.symbolInfoCache.clear();

    // Close client connection
    if (this.client) {
      this.client.end();
    }
  }
}

module.exports = Datafeed;