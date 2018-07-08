/**
 * イベントログ。
 * Heroku の PostgreSQL の無料プランでは
 * 合計 10000 行しかレコードを保持できないため、
 * いい感じに定期的に削除する必要がある。
 */
import Sequelize           from "sequelize";

import Inject              from "app/lib/di/Inject";
import SequelizeConnection from "app/lib/external/SequelizeConnection";

const EVENT_LOG_TO_DB = parseInt(process.env.EVENT_LOG_TO_DB, 10) || 1;

@Inject({ sequelizeConnection: SequelizeConnection })
export default class EventLogs {
  static injectionName = "EventLogs";
  constructor({ sequelizeConnection }) {
    const eventLogs = sequelizeConnection.sequelize.define("eventLog", {
      kind   : { type: Sequelize.STRING, allowNull: false },
      trigger: { type: Sequelize.STRING, allowNull: false },
      message: { type: Sequelize.STRING, allowNull: false },
    });

    this.schema = eventLogs;
  }

  insert(kind, trigger, message) {
    if (EVENT_LOG_TO_DB === 1) {
      return this.schema.create({ kind, trigger, message });
    } else {
      console.log(`[EVENT_LOG] kind: ${kind}; trigger: ${trigger}; ${message}: message`);
    }
  }
}
