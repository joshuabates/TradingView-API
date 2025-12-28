const TradingView = require('../main');

/**
 * Example of using the Datafeed class with TradingView Advanced Charts
 * This demonstrates all the key methods of the datafeed implementation
 */

// Create datafeed instance
const datafeed = new TradingView.Datafeed({
  debug: true,
  // Add credentials if needed for premium features
  // token: process.env.SESSION,
  // signature: process.env.SIGNATURE,
});

// Test onReady
console.log('\n1. Testing onReady():');
datafeed.onReady((config) => {
  console.log('Datafeed configuration:', JSON.stringify(config, null, 2));
  
  // Continue with other tests after connection is ready
  runTests();
});

async function runTests() {
  try {
    // Test searchSymbols
    console.log('\n2. Testing searchSymbols():');
    await new Promise((resolve) => {
      datafeed.searchSymbols('BTC', '', 'crypto', (results) => {
        console.log(`Found ${results.length} symbols`);
        console.log('First 3 results:', results.slice(0, 3));
        resolve();
      });
    });

    // Test resolveSymbol
    console.log('\n3. Testing resolveSymbol():');
    const symbolInfo = await new Promise((resolve, reject) => {
      datafeed.resolveSymbol('BINANCE:BTCUSDT', 
        (info) => {
          console.log('Symbol info:', {
            name: info.name,
            description: info.description,
            exchange: info.exchange,
            type: info.type,
            timezone: info.timezone,
            session: info.session,
            supported_resolutions: info.supported_resolutions,
          });
          resolve(info);
        },
        (error) => {
          console.error('Error resolving symbol:', error);
          reject(error);
        }
      );
    });

    // Test getBars
    console.log('\n4. Testing getBars():');
    const to = Math.floor(Date.now() / 1000);
    const from = to - (24 * 60 * 60); // 24 hours ago

    await new Promise((resolve, reject) => {
      datafeed.getBars(
        symbolInfo,
        '60', // 1 hour
        { from, to, countBack: 24, firstDataRequest: true },
        (bars, meta) => {
          console.log(`Received ${bars.length} bars`);
          if (bars.length > 0) {
            console.log('First bar:', {
              time: new Date(bars[0].time).toISOString(),
              open: bars[0].open,
              high: bars[0].high,
              low: bars[0].low,
              close: bars[0].close,
              volume: bars[0].volume,
            });
            console.log('Last bar:', {
              time: new Date(bars[bars.length - 1].time).toISOString(),
              open: bars[bars.length - 1].open,
              high: bars[bars.length - 1].high,
              low: bars[bars.length - 1].low,
              close: bars[bars.length - 1].close,
              volume: bars[bars.length - 1].volume,
            });
          }
          resolve();
        },
        (error) => {
          console.error('Error getting bars:', error);
          reject(error);
        }
      );
    });

    // Test subscribeBars
    console.log('\n5. Testing subscribeBars():');
    console.log('Subscribing to real-time updates for 20 seconds...');
    
    let updateCount = 0;
    datafeed.subscribeBars(
      symbolInfo,
      '1', // 1 minute for more frequent updates
      (bar) => {
        updateCount++;
        console.log(`Update #${updateCount}:`, {
          time: new Date(bar.time).toISOString(),
          close: bar.close,
          volume: bar.volume,
        });
      },
      'test_subscription',
      () => {
        console.log('Reset cache needed');
      }
    );

    // Test getQuotes
    console.log('\n6. Testing getQuotes():');
    await new Promise((resolve) => {
      datafeed.getQuotes(
        ['BINANCE:BTCUSDT', 'BINANCE:ETHUSDT', 'NASDAQ:AAPL'],
        (quotes) => {
          quotes.forEach(quote => {
            if (quote.s === 'ok') {
              console.log(`${quote.n}:`, {
                last: quote.v.lp,
                change: quote.v.ch,
                changePercent: quote.v.chp,
                volume: quote.v.volume,
                bid: quote.v.bid,
                ask: quote.v.ask,
              });
            } else {
              console.log(`${quote.n}: Error`);
            }
          });
          resolve();
        },
        (error) => {
          console.error('Error getting quotes:', error);
          resolve();
        }
      );
    });

    // Test subscribeQuotes
    console.log('\n7. Testing subscribeQuotes():');
    console.log('Subscribing to quote updates...');
    
    datafeed.subscribeQuotes(
      ['BINANCE:BTCUSDT', 'BINANCE:ETHUSDT'],
      ['BINANCE:BTCUSDT'], // Fast symbols
      (quotes) => {
        quotes.forEach(quote => {
          if (quote.s === 'ok') {
            console.log(`Quote update for ${quote.n}: $${quote.v.lp} (${quote.v.chp > 0 ? '+' : ''}${quote.v.chp}%)`);
          }
        });
      },
      'quote_subscription'
    );

    // Test getServerTime
    console.log('\n8. Testing getServerTime():');
    datafeed.getServerTime((time) => {
      console.log('Server time:', new Date(time * 1000).toISOString());
    });

    // Wait for some real-time updates
    await new Promise(resolve => setTimeout(resolve, 20000));

    // Cleanup
    console.log('\n9. Cleaning up subscriptions...');
    datafeed.unsubscribeBars('test_subscription');
    datafeed.unsubscribeQuotes('quote_subscription');

    // Wait a bit before destroying
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n10. Destroying datafeed...');
    datafeed.destroy();

    console.log('\nAll tests completed!');

  } catch (error) {
    console.error('Test error:', error);
    datafeed.destroy();
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT, cleaning up...');
  datafeed.destroy();
  process.exit(0);
});