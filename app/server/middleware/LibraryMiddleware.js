/**
 * 外部ライブラリのミドルウェアを読み込むミドルウェア。
 * ここでは
 * - セッション
 * - クッキー
 * - bodyParser
 * - CSRF
 * に関するミドルウェアを読み込んでいる。
 */
import express              from "express";

import helmet               from "helmet";
import session              from "express-session";
import ConnectRedis         from "connect-redis";
import bodyParser           from "body-parser";
import cookieParser         from "cookie-parser";
import csrf                 from "csurf";

import Inject               from "app/lib/di/Inject";

const RedisStore = ConnectRedis(session);

const sessionParameter = {
  name             : process.env.SESSION_NAME,
  secret           : process.env.SESSION_KEY,
  resave           : false,
  saveUninitialized: true,
  cookie           : {
    httpOnly: false,
    secure  : false,
  },
  store            : new RedisStore({ url: process.env.REDIS_URL }),
};

@Inject()
export default class LibraryMiddleware {
  static injectionName = "LibraryMiddleware";
  constructor() {
    const libraryMiddleware = express();

    libraryMiddleware.use(helmet());

    libraryMiddleware.use(session(sessionParameter));
    libraryMiddleware.use(bodyParser.json());
    libraryMiddleware.use(bodyParser.urlencoded({ extended: false }));
    libraryMiddleware.use(cookieParser());
    libraryMiddleware.use(csrf({ cookie: true }));
    libraryMiddleware.use((err, _req, res, next) => {
      if (err.code !== "EBADCSRFTOKEN") {
        next(err);
      } else {
        res.status(403).end();
      }
    });

    this.middleware = libraryMiddleware;
  }
}
