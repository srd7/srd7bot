import express                  from "express";

import Inject                   from "app/lib/di/Inject";

// ミドルウェアたち
import Middlewares              from "app/server/middleware";

// 開始時に起動する bot の処理
import Supervisor               from "app/bot/Supervisor";

// メインサーバー
const server = express();

// 静的ファイル
server.use(express.static("dist"));

// ミドルウェアをまとめて読み込む
const middlewares = Inject.getInstance(Middlewares);
server.use(middlewares.middleware);

// 起動時に bot を実行
const supervisor = Inject.getInstance(Supervisor);
supervisor.start();

// Temporarily app
server.get("/check", (req, res) => {
  if (req.login) {
    res.send("Inside");
  } else {
    res.send("Outside");
  }
});

const port = process.env.PORT || 3000;
server.listen(port);
console.log(`Listen to port ${port}...`);

