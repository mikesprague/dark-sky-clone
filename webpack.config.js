require('dotenv').config();
const path = require('path');
const webpack = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

const mode = process.env.NODE_ENV;

const webpackRules = [
  {
    test: /\.(sa|sc|c)ss$/,
    exclude: [/old/],
    use: [
      MiniCssExtractPlugin.loader,
      {
        loader: 'css-loader',
        options: {
          importLoaders: true,
          sourceMap: true,
        },
      },
      {
        loader: 'postcss-loader',
      },
      {
        loader: 'sass-loader',
        options: {
          sourceMap: true,
        },
      },
    ],
  },
  {
    test: /\.(js|jsx)$/,
    exclude: [/node_modules/, /lambda/, /service-worker.js/],
    use: [{
      loader: 'babel-loader',
    }],
  },
];

const webpackPlugins = [
  new webpack.DefinePlugin({
    'process.env.OPENWEATHERMAP_API_KEY': JSON.stringify(process.env.OPENWEATHERMAP_API_KEY),
  }),
  new MiniCssExtractPlugin({
    filename: './css/styles.css',
    chunkFilename: './css/[id].css',
  }),
  new CopyWebpackPlugin({
    patterns: [
      {
        from: './public/images/**/*',
        to: './images',
        flatten: true,
        force: true,
      },
    ],
  }),
  new CopyWebpackPlugin({
    patterns: [
      {
        from: `./public/manifest.json`,
        to: './',
        flatten: true,
        force: true,
      },
    ],
  }),
  new CopyWebpackPlugin({
    patterns: [
      {
        from: `./public/index.html`,
        to: './index.html',
        force: true,
        flatten: true,
      },
    ],
  }),
  new WorkboxPlugin.GenerateSW({
    cleanupOutdatedCaches: true,
    clientsClaim: true,
    skipWaiting: true,
  }),
  new webpack.HotModuleReplacementPlugin(),
];

if (mode === 'production') {
  webpackPlugins.push(
    new CompressionPlugin({
      filename: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
  );
}

module.exports = {
  entry: [
    './src/index.js',
  ],
  devtool: 'source-map',
  resolve: {
    extensions: ['*', '.js', '.jsx'],
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
  },
  output: {
    filename: './js/bundle.js',
    chunkFilename: './js/[name].bundle.js',
    path: path.resolve(__dirname, 'build'),
  },
  mode,
  devServer: {
    contentBase: path.join(__dirname, 'public/'),
    hotOnly: true,
    open: true,
    port: 3000,
    publicPath: 'http://localhost:3000/',
    stats: 'minimal',
  },
  module: {
    rules: webpackRules,
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    minimizer: [
      new TerserPlugin({
        parallel: true,
        sourceMap: true,
      }),
      new OptimizeCSSAssetsPlugin(),
    ],
  },
  plugins: webpackPlugins,
};
