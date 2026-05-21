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
        './authStore': './src/store/authStore',
        './cartStore': './src/store/cartStore',
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
    port: 3004,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
};
