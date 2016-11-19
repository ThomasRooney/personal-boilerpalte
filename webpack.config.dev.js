var CopyWebpackPlugin = require('copy-webpack-plugin');
var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: [
    'react-hot-loader/patch',
    'babel-polyfill',
    'webpack-dev-server/client?http://0.0.0.0:3000', // WebpackDevServer host and port
    'webpack/hot/dev-server', // "only" prevents reload on syntax errors
    "./frontend/src/init.jsx"
  ],
  output: {
    path: path.resolve(__dirname, 'frontend', 'lib', 'script'),
    filename: "main.js",
    publicPath: '/script/'
  },
  externals: {
    "Stripe": "Stripe"
  },
  module: {
    preLoaders: [
    ],
    loaders: [
      {
        test: /\.css?$/,
        loader: 'style-loader!css-loader',
      },
      {
        test: /\.js$/,
        include: /node_modules/,
        loaders: ['strip-sourcemap-loader']
      },
      {
        test: /\.(jsx|js)?$/,
        loaders: ['babel'],
        exclude: /node_modules/,
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.(eot|woff|woff2|ttf|svg|png|jpg)$/,
        loader: 'url-loader?limit=30000&name=[name]-[hash].[ext]'
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
};
