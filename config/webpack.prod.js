// 本番用の webpack config
// これはアプリで使われるわけではないので、
// 外側のディレクトリに書いておく。

var path    = require("path");
var webpack = require("webpack");

var client  = {
  entry: {
    inside: path.resolve(process.cwd(), "app", "entry", "inside.js"),
    pnc: path.resolve(process.cwd(), "app", "entry", "pnc.js"),
  },
  resolve: {
    modules   : ["node_modules"],
    extensions: [".js", ".jsx"],
    alias     : {
      "app": path.resolve(process.cwd(), "app"),
    },
  },
  output: {
    path      : path.resolve(process.cwd(), "dist"),
    filename  : "[name].min.js",
    publicPath: "/",
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production"),
      },
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?/,
        loader: "babel-loader",
        exclude: /node_modules/,
        query  : {
          plugins: ["transform-decorators-legacy"],
        },
      },
    ],
  },
};

var server = {
  entry: [
    path.resolve(process.cwd(), "app", "server", "index.js"),
  ],
  target: "node",
  // 純粋な JavaScript じゃないものは bundle しない
  externals: /^(express|fetchr|mongoose|pg|redis|request|sequelize|webpack)\/?/,
  resolve: {
    modules   : ["node_modules"],
    extensions: [".js", ".jsx", ".json"],
    alias     : {
      "app": path.resolve(process.cwd(), "app"),
    },
  },
  output: {
    path         : path.resolve(process.cwd(), "dist"),
    filename     : "server.min.js",
    libraryTarget: "commonjs2",
    publicPath   : "/",
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production"),
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      sourceMap: true,
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?/,
        loader: "babel-loader",
        exclude: /node_modules/,
        query  : {
          plugins: ["transform-decorators-legacy"],
        },
      },
      {
        test: /\.json$/,
        loader: "json-loader",
      },
    ],
  },
  devtool: "source-map",
  stats: {
    errorDetails: true,
  },
};

module.exports = { client: client, server: server };
