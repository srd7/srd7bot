/**
 * 外部向けアプリ。
 * とりあえずログイン画面のみを表示する。
 */
import express                  from "express";
import React                    from "react";
import { renderToString }       from "react-dom/server";

import Inject                   from "app/lib/di/Inject";
import Config                   from "app/server/Config";

import LoginForm                from "app/front/container/login/LoginForm";

const env = process.env.NODE_ENV || "develop";
const isDevelop = env === "develop";

@Inject({ config: Config })
export default class LoginAppMiddleware {
  static injectionName = "LoginAppMiddleware";
  constructor({ config }) {
    const loginAppMiddleware = express();

    loginAppMiddleware.use((req, res, next) => {
      if (req[config.authentication.sessionKey]) {
        // ログインしていればスルー
        next();
      } else if (req.path === config.authentication.formPath && req.method === config.authentication.formMethod) {
        // とりあえず ログインフォームを出すだけ。
        const token = req.csrfToken();
        const loginPath = config.authentication.loginPath;

        const html = renderToString(
          <LoginForm token={token} loginPath={loginPath} isDevelop={isDevelop} />
        );

        res.status(200).send(`<!DOCTYPE html>${html}`);
      } else {
        next();
      }
    });

    this.middleware = loginAppMiddleware;
  }
}
