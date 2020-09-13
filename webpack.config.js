const path = require('path');

module.exports = {
  devtool: 'source-map',
  entry: './src/js/main.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist/js'),
  },
};
