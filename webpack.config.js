const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: './browser-entry.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'tradingview-api.browser.js',
    library: 'TradingViewAPI',
    libraryTarget: 'window',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  resolve: {
    fallback: {
      // Node.js modules that need to be polyfilled or excluded for browser
      os: false,
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      buffer: false,
      util: false,
      assert: false,
      http: false,
      https: false,
      zlib: false,
      url: false,
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      'typeof process': JSON.stringify('undefined'),
      'globalThis': 'window',
    }),
  ],
  performance: {
    hints: false,
  },
};

