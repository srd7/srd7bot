/**
 * イベントの発生タイミングを調整するレギュレータ。
 *
 * イベント発生時刻を記録し、
 * 1日に1回や1時間に1回しか発生してほしくないイベントの
 * 発生を制限および調整する。
 *
 * 24時間や1時間発生させないのではなく、
 * 日付が変わって最初、時間が変わって最初のみ実行可能にする。
 * そのため例えば前回の実行が 1:20 であったとして、
 *   1:59 には実行しないが 2:00 には実行する。
 */
import { Schema }         from "mongoose";
import moment             from "moment";

import Inject             from "app/lib/di/Inject";
import MongooseConnection from "app/lib/external/MongooseConnection";

@Inject({ mongooseConnection: MongooseConnection })
export default class EventRegulators {
  static injectionName = "EventRegulators";
  constructor({ mongooseConnection }) {
    this.mongooseConnection = mongooseConnection;

    const eventRegulators = mongooseConnection.MModel("EventRegulators", new Schema({
      name: String,
      date: Date,
    }));

    this.schema = eventRegulators;
  }

  execute(name) {
    const now = new Date();
    // 古いレコードを削除
    return this.schema.remove({ name, date: { $lt: now }}).exec()
      .then(() => {
        const eventRegulator = new this.schema({ name, date: new Date() });
        return eventRegulator.save();
      });
  }

  canExecute(name, format) {
    return this.schema.findOne({ name }, null, { sort: { date: -1 } })
      .then(log => {
        if (! log) {
          // レコードがないので実行可能
          return true;
        } else {
          const last = moment(log.date).format(format);
          const now  = moment().format(format);

          return now !== last;
        }
      });
  }

  canExecuteDay(name) {
    return this.canExecute(name, "YYYYMMDD");
  }

  canExecuteHour(name) {
    return this.canExecute(name, "YYYYMMDDHH");
  }

  /** 指定日数以上前のレコードを削除 */
  removeOld(days) {
    const limit = new Date(Date.now() - days * 86400000);
    return this.schema.remove({ date: { $lt: limit }}).exec();
  }
}
