var path = require('path');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config;
if (process.argv.indexOf('-p') > -1) {
  console.log('Running production configuration');
  config = require ('./webpack.config.prod');
} else {
  console.log('Running development configuration');
  config = require('./webpack.config.dev');
}
new WebpackDevServer(webpack(config), {
  contentBase: path.resolve(__dirname, 'frontend', 'lib'),
  publicPath: config.output.publicPath,
  hot: true,
  noInfo: true,
  historyApiFallback: true,
}).listen(3000, 'localhost', function (err, result) {
  if (err) {
    return console.log(err);
  }

  console.log('Listening at http://localhost:3000/');
});
