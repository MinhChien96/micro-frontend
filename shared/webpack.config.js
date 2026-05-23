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
      filename: 'remoteEntry.js',  // ← Không bị ảnh hưởng bởi output.filename
      exposes: {
        './authStore':      './src/store/authStore',
        './accountStore':   './src/store/accountStore',
        './ui':             './src/ui/index',
        './PermissionGate': './src/components/PermissionGate',
      },
      shared: {
        // import: false → shared does NOT provide these to the share scope.
        // Without this, webpack creates a 'provide-module' async chunk for each
        // library. That chunk ends up in __webpack_require__.O's deferred list,
        // blocking `shared = __webpack_exports__` from executing synchronously
        // when the shell fetches only remoteEntry.js.
        // Shell provides all singletons; shared only consumes them.
        react:       { singleton: true, requiredVersion: '^18.2.0', import: false },
        'react-dom': { singleton: true, requiredVersion: '^18.2.0', import: false },
        zustand:     { singleton: true, requiredVersion: '^4.5.0',  import: false },
      },
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' }),
  ],
  devServer: {
    port: 3004,
    headers: { 'Access-Control-Allow-Origin': '*' },
    // HMR must be disabled for the shared container.
    // When hot: true, webpack-dev-server injects HMR client code into the entry
    // bundle AND eagerly initializes the MF share scope. Both operations add
    // chunks (webpack-dev-server vendor + provide-module) to the deferred list of
    // `__webpack_require__.O`, preventing `shared = __webpack_exports__` from
    // executing synchronously. Shell loads only remoteEntry.js (not those chunks)
    // → shared stays undefined → ScriptExternalLoadError.
    hot: false,
    liveReload: false,
    // Prevent webpack-dev-server from injecting its own client bundle into the
    // entry point. Without this, a 'vendors-webpack-dev-server-...' chunk is
    // added to __webpack_require__.O's deferred list, blocking synchronous init.
    client: false,
  },
};
