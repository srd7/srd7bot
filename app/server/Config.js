import path    from "path";
import webpack from "webpack";

import Inject  from "app/lib/di/Inject";

@Inject()
export default class ServerConfig {
  static injectionName = "ServerConfig";
  webpack = {
    entry: {
      inside: [
        "webpack/hot/dev-server",
        "webpack-hot-middleware/client",
        path.resolve(process.cwd(), "app", "entry", "inside.js"),
      ],
      pnc: [
        "webpack/hot/dev-server",
        "webpack-hot-middleware/client",
        path.resolve(process.cwd(), "app", "entry", "pnc.js"),
      ],
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
      filename  : "[name].js",
      publicPath: "/",
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.DefinePlugin({
        "process.env": {
          "BROWSER": JSON.stringify(true),
        },
      }),
    ],
    module: {
      rules: [
        {
          test: /\.jsx?/,
          loader: "babel-loader",
          exclude: /node_modules/,
          query  : {
            plugins: ["transform-decorators-legacy"],
            presets: ["react", "env", "stage-0"],
          },
        },
      ],
    },
    // status: false,
    devtool: "#source-map",
  };

  authentication = {
    formMethod  : "GET",
    formPath    : "/login",
    loginMethod : "POST",
    loginPath   : "/login",
    logoutMethod: "GET",
    logoutPath  : "/logout",
    sessionKey  : "login",
  };
}

