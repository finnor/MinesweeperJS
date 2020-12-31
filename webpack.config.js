const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'minesweeper.js',
    library: 'minesweeperjs',
    libraryTarget: 'umd'
  },
  module: {
    rules: [{
      test: /\.css$/,
      use: [
        MiniCssExtractPlugin.loader,
        "css-loader"
      ]
    }],
  },
  plugins: [
    new MiniCssExtractPlugin({filename: "minesweeperjs.css"})
  ]
};
