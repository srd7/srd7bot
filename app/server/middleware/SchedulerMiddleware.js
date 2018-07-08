/**
 * スケジューラーによるスクリプトの定期実行。
 * と言っても、リクエストを受け付ける窓口を置いておくだけ。
 * スケジューラーに curl させる。
 *
 * 無関係者にこの API を叩かれてもさほど痛くないので、
 * セキュリティ的にはガバガバでいい。
 */
import express                  from "express";
import Inject                   from "app/lib/di/Inject";
import Supervisor               from "app/bot/Supervisor";

const schedulerKey = process.env.SCHEDULER_KEY || "key";

@Inject({ supervisor: Supervisor })
export default class SchedulerMiddleware {
  static injectionName = "SchedulerMiddleware";
  constructor({ supervisor }) {
    this.supervisor = supervisor;

    const schedulerMiddleware = express();

    schedulerMiddleware.get("/scheduler/:key", ::this.runScheduler);

    this.middleware = schedulerMiddleware;
  }

  runScheduler(req, res, next) {
    if (req.params.key !== schedulerKey) {
      next();
    } else {
      const user = req.query.user || "Unknown";
      this.supervisor.run(`SchedulerMiddleware--${user}`)
        .then(() => res.status(200).end())
        .catch((e) => res.status(500).end(e));
    }
  }
}
