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
    publicPath: process.env.PUBLIC_URL || 'http://localhost:3000/',
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
      name: 'shell',
      remotes: {
        shared:       remotes.shared,
        mfe_auth:     remotes.mfe_auth,
        mfe_products: remotes.mfe_products,
        mfe_cart:     remotes.mfe_cart,
      },
      shared: {
        react:              { singleton: true, requiredVersion: '^18.2.0' },
        'react-dom':        { singleton: true, requiredVersion: '^18.2.0' },
        'react-router-dom': { singleton: true, requiredVersion: '^6.22.0' },
        zustand:            { singleton: true, requiredVersion: '^4.5.0' },
      },
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' }),
  ],
  devServer: {
    port: 3000,
    historyApiFallback: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
};
