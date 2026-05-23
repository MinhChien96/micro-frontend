const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');
const remotes = require('../remotes.config');
const { optimization, output: outputOpts } = require('../webpack.optimization');

module.exports = {
  entry: './src/index.js',
  output: {
    ...outputOpts,
    path: path.resolve(__dirname, 'dist'),
    publicPath: process.env.PUBLIC_URL || 'http://localhost:3006/',
    clean: true,
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      'shared/auth':           path.resolve(__dirname, '../shared/src/auth'),
      'shared/ui':             path.resolve(__dirname, '../shared/src/ui/index'),
      'shared/PermissionGate': path.resolve(__dirname, '../shared/src/components/PermissionGate'),
    },
  },
  module: {
    rules: [
      { test: /\.(js|jsx)$/, exclude: /node_modules/, use: { loader: 'babel-loader', options: { rootMode: 'upward' } } },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },
  optimization,
  plugins: [
    new ModuleFederationPlugin({
      name: 'mfe_loans',
      filename: 'remoteEntry.js',
      exposes: {
        './LoansApp': './src/components/LoansApp',
      },
      remotes: {},
      shared: {
        react:              { singleton: true, requiredVersion: '^18.2.0', import: false },
        'react-dom':        { singleton: true, requiredVersion: '^18.2.0', import: false },
        'react-router-dom': { singleton: true, requiredVersion: '^6.22.0', import: false },
      },
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' }),
  ],
  devServer: {
    port: 3006,
    historyApiFallback: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    hot: false,
    liveReload: false,
    client: false,
  },
};
