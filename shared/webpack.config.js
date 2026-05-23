const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');
const { optimization, output: outputOpts } = require('../webpack.optimization');

module.exports = {
  entry: './src/index.js',
  output: {
    ...outputOpts,
    path: path.resolve(__dirname, 'dist'),
    publicPath: process.env.PUBLIC_URL || 'http://localhost:3004/',
    clean: true,
  },
  resolve: { extensions: ['.js', '.jsx'] },
  module: {
    rules: [
      { test: /\.(js|jsx)$/, exclude: /node_modules/, use: 'babel-loader' },
    ],
  },
  optimization,
  plugins: [
    new ModuleFederationPlugin({
      name: 'shared',
      filename: 'remoteEntry.js',
      exposes: {
        './auth':        './src/auth',
        './ui':          './src/ui/index',
        './PermissionGate': './src/components/PermissionGate',
      },
      shared: {
        // import: false — shared container does NOT provide react/react-dom.
        // Shell (host) is the provider; all remotes consume from shell's share scope.
        // This removes the provide-module chunk from remoteEntry.js, so the
        // container initialises synchronously in dev mode (no __webpack_require__.O deferral).
        react:       { singleton: true, requiredVersion: '^18.2.0', import: false },
        'react-dom': { singleton: true, requiredVersion: '^18.2.0', import: false },
      },
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' }),
  ],
  devServer: {
    port: 3004,
    headers: { 'Access-Control-Allow-Origin': '*' },
    hot: false,
    liveReload: false,
    client: false,
  },
};
