/**
 * 内部向け Redux の isomorphic 部の実装。
 */
import Inject                   from "app/lib/di/Inject";

import Config                   from "app/server/Config";

import routes                   from "app/front/route/InsideRoute";
import configurestore           from "app/front/store/InsideStore";
import Html                     from "app/front/component/inside/Html";

import createReduxHandler       from "app/server/helper/createReduxHandler";

@Inject({ config: Config })
export default class InsideAppMiddleware {
  static injectionName = "InsideAppMiddleware";
  constructor({ config }) {
    const reduxHandler = createReduxHandler(routes, configurestore, Html);
    this.middleware = (req, res, next) => {
      if (! req[config.authentication.sessionKey]) {
        // ログインしていなければスルー
        next();
      } else {
        // react-router による match
        reduxHandler(req, res, next);
      }
    };
  }
}
