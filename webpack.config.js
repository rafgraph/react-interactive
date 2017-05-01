const webpack = require('webpack');

module.exports = {
  output: {
    library: 'Interactive',
    libraryTarget: 'umd',
  },

  externals: {
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react',
    },
  },

  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
    ],
  },

  plugins: process.argv.indexOf('-p') === -1 ? [] : [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
  ],
};
