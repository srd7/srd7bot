/**
 * 各種 Middleware をまとめて読み込むための Middleware
 */
import express                  from "express";

import Inject                   from "app/lib/di/Inject";

import LibraryMiddleware        from "app/server/middleware/LibraryMiddleware";
import WebpackMiddleware        from "app/server/middleware/WebpackMiddleware";
import AuthenticationMiddleware from "app/server/middleware/AuthenticationMiddleware";
import TwitterLoginMiddleware   from "app/server/middleware/TwitterLoginMiddleware";
import InsideAppMiddleware      from "app/server/middleware/InsideAppMiddleware";
import LoginAppMiddleware       from "app/server/middleware/LoginAppMiddleware";
import OutsideAppMiddleware     from "app/server/middleware/OutsideAppMiddleware";
import ServiceMiddleware        from "app/server/middleware/ServiceMiddleware";
import SchedulerMiddleware      from "app/server/middleware/SchedulerMiddleware";

import SequelizeConnection      from "app/lib/external/SequelizeConnection";

const env = process.env.NODE_ENV || "develop";
const isDevelop = env === "develop";

@Inject({
  libraryMiddleware       : LibraryMiddleware,
  webpackMiddleware       : WebpackMiddleware,
  authenticationMiddleware: AuthenticationMiddleware,
  twitterLoginMiddleware  : TwitterLoginMiddleware,
  insideAppMiddleware     : InsideAppMiddleware,
  loginAppMiddleware      : LoginAppMiddleware,
  outsideAppMiddleware    : OutsideAppMiddleware,
  serviceMiddleware       : ServiceMiddleware,
  schedulerMiddleware     : SchedulerMiddleware,
  sequelizeConnection     : SequelizeConnection,
})
export default class Middlewares {
  static injectionName = "Middlewares";
  constructor({
    libraryMiddleware,
    webpackMiddleware,
    authenticationMiddleware,
    twitterLoginMiddleware,
    insideAppMiddleware,
    loginAppMiddleware,
    outsideAppMiddleware,
    serviceMiddleware,
    schedulerMiddleware,
    sequelizeConnection,
  }) {
    const middleware = express();

    // 各種ライブラリの読み込み
    middleware.use(libraryMiddleware.middleware);

    // Webpack のミドルウェアは開発中のみ使う。
    if (isDevelop) {
      middleware.use(webpackMiddleware.middleware);
    }

    // 認証まわり
    middleware.use(authenticationMiddleware.middleware);

    // Twitter ログイン
    middleware.use(twitterLoginMiddleware.middleware);

    // スケジューラー
    middleware.use(schedulerMiddleware.middleware);

    // 本体
    middleware.use(insideAppMiddleware.middleware);

    // ログインフォーム
    middleware.use(loginAppMiddleware.middleware);

    // Fetchr
    middleware.use(serviceMiddleware.middleware);

    // 外部向け
    middleware.use(outsideAppMiddleware.middleware);

    // 開発時はとりあえず再起動のたびに sync する
    if (isDevelop) {
      sequelizeConnection.sync(false);
    }

    this.middleware = middleware;
  }
}
