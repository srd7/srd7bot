/**
 * 外部向けアプリ。
 * とりあえずログイン画面のみを表示する。
 */
import express                  from "express";
import React                    from "react";
import { renderToString }       from "react-dom/server";

import Inject                   from "app/lib/di/Inject";
import Config                   from "app/server/Config";

import AccessLogs               from "app/model/AccessLogs";

import pncRoutes                from "app/front/route/OutsidePncRoute";
import pncConfigureStore        from "app/front/store/OutsidePncStore";
import PncHtml                  from "app/front/component/outside/pnc/Html";

import NotFound                 from "app/front/container/common/NotFound";

import createReduxHandler       from "app/server/helper/createReduxHandler";

@Inject({ accessLogs: AccessLogs, config: Config })
export default class OutsideAppMiddleware {
  static injectionName = "OutsideAppMiddleware";
  constructor({ accessLogs, config }) {
    const outsideAppMiddleware = express();
    const pncReduxHandler = createReduxHandler(pncRoutes, pncConfigureStore, PncHtml);

    outsideAppMiddleware.use((req, _res, next) => {
      // アクセスログを取る
      const headers = req.headers;

      const url = `${req.protocol}://${headers["host"]}${req.originalUrl}`;
      const referer = headers["referer"];
      const ip = headers["x-forwarded-for"] || req.connection.remoteAddress;
      const userAgent = headers["user-agent"];
      const accessedAt = new Date();

      accessLogs.insert(url, referer, ip, userAgent, accessedAt);
      next();
    });

    outsideAppMiddleware.use((req, res, next) => {
      if (req[config.authentication.sessionKey]) {
        // ログインしていればスルー
        next();
      } else {
        pncReduxHandler(req, res, next);
      }
    });

    outsideAppMiddleware.use((_req, res, _next) => {
      const html = renderToString(
        <NotFound />
      );
      res.status(401).send(`<!DOCTYPE html>${html}`);
    });

    this.middleware = outsideAppMiddleware;
  }
}
