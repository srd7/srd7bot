/**
 * webpackのミドルウェアを読み込むミドルウェア。
 * コンフィグの依存性を無くすために、関数での読み込みを行う。
 */
import express              from "express";

import webpack              from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";
import webpackHotMiddleware from "webpack-hot-middleware";

import Inject               from "app/lib/di/Inject";

import Config               from "app/server/Config";

@Inject({ config: Config })
export default class WebpackMiddleware {
  static injectionName = "WebpackMiddleware";
  constructor({ config: fullConfig }) {
    const { webpack: config } = fullConfig;

    const webpackMiddleware = express();

    const compiler = webpack(config);
    webpackMiddleware.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }));
    webpackMiddleware.use(webpackHotMiddleware(compiler));

    this.middleware = webpackMiddleware;
  }
}
