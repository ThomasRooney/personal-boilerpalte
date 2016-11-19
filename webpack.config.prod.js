var CopyWebpackPlugin = require('copy-webpack-plugin');
var ClosureCompiler = require('google-closure-compiler-js').webpack;

var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: [
    'babel-polyfill',
    "./frontend/src/init.jsx"
  ],
  output: {
    path: path.resolve(__dirname, 'frontend', 'lib'),
    filename: "script/main.js",
    publicPath: '/script/'
  },
  externals: {
    "Stripe": "Stripe"
  },
  devtool: '#inline-source-map',
  module: {
    preLoaders: [
    ],
    loaders: [
      {
        test: /\.css?$/,
        loader: 'style-loader!css-loader',
      },
      {
        test: /\.(jsx|js)?$/,
        loaders: ['babel'],
        exclude: /node_modules/,
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        sequences: true,
        dead_code: true,
        conditionals: true,
        booleans: true,
        unused: true,
        if_return: true,
        join_vars: true,
        drop_console: true
      },
      output: {
        comments: false
      }
    })
  ]
};
