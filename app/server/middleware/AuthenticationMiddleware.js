/**
 * 認証チェックを行うミドルウェア。
 *
 * ログイン処理の判定と、
 * 現在ログインしているかどうかをチェックする。
 * ログインしているなら、リクエスト内の所定のキーにその情報を入れる。
 *
 * express-session に依存する。
 */
import express              from "express";

import Inject               from "app/lib/di/Inject";
import Config               from "app/server/Config";

@Inject({ config: Config })
export default class AuthenticationMiddleware {
  static injectionName = "AuthenticationMiddleware";
  constructor({ config: fullConfig }) {

    const { authentication: config } = fullConfig;

    const authenticationMiddleware = express();

    authenticationMiddleware.use((req, res, next) => {
      if (req.path === config.logoutPath && req.method === config.logoutMethod) {
        // まずログアウト処理を行う
        req.session.destroy();
        res.send("Logout done");
      } else if (req.path === config.loginPath && req.method === config.loginMethod) {
        // ログイン処理を行う

        const { email, password } = req.body;

        // 大したアプリでもないので、
        // 環境変数にパスワードを入れておく。
        if (!email && password === process.env.LOGIN_PASSWORD) {
          req.session[config.sessionKey] = true;
          res.redirect("/");
        } else {
          setTimeout(() => res.redirect("/"), 500);
        }
      } else {
        const isLoggedIn = req.session[config.sessionKey] || false;
        req[config.sessionKey] = isLoggedIn;
        next();
      }
    });

    this.middleware = authenticationMiddleware;
  }
}
