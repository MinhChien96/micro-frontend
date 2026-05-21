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
    publicPath: process.env.PUBLIC_URL || 'http://localhost:3002/',
    clean: true,
  },
  resolve: { extensions: ['.js', '.jsx'] },
  module: {
    rules: [
      { test: /\.(js|jsx)$/, exclude: /node_modules/, use: 'babel-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },
  optimization,
  plugins: [
    new ModuleFederationPlugin({
      name: 'mfe_products',
      filename: 'remoteEntry.js',
      exposes: {
        './ProductList': './src/components/ProductList',
      },
      remotes: {
        shared: remotes.shared,
      },
      shared: {
        react:       { singleton: true, requiredVersion: '^18.2.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
        zustand:     { singleton: true, requiredVersion: '^4.5.0' },
      },
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' }),
  ],
  devServer: {
    port: 3002,
    historyApiFallback: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
};
