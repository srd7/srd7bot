/**
 * 素数ポイント。
 * 素数なツイートをすることでたまるポイント（ベータ版）
 *
 * 後で利用したくなるのは明白なので、
 * ログを取っておく。
 */
import { Schema }         from "mongoose";

import Inject             from "app/lib/di/Inject";
import MongooseConnection from "app/lib/external/MongooseConnection";

@Inject({ mongooseConnection: MongooseConnection })
export default class PNCPointLogs {
  static injectionName = "PNCPointLogs";
  // 各種定数。
  // 未発見の素数
  NOBODY_OBTAINED = 0;
  // すでにそのユーザーがポイントを獲得している場合
  ALREADY_OBTAINED = 1;
  // すでに他のユーザーがポイントを獲得している場合
  OTHER_USER_OBTAINED = 2;

  // 互換性のため（しばらくポイント種類を記録していなかった）
  POINT_UNKNOWN = 0;
  // チャレンジによるポイント獲得
  POINT_CHALLENGE = 1;
  // TLのツイートによるポイント獲得
  POINT_TL = 2;
  // 数字リプによるポイント獲得
  POINT_NUMBER = 3;

  constructor({ mongooseConnection }) {
    this.mongooseConnection = mongooseConnection;

    const pncPointLogs = mongooseConnection.MModel("PNCPointLogs", new Schema({
      twitterId: String,
      statusId : String,
      number   : Number,
      point    : Number,
      pointType: Number,
      createdAt: Date,
    }));

    this.schema = pncPointLogs;
  }

  insert(twitterId, statusId, number, point, pointType) {
    const createdAt = new Date();
    const pncPointLog = new this.schema({ twitterId, statusId, number, point, pointType, createdAt });
    return pncPointLog.save();
  }

  /**
   * その数字について、
   * すでにポイントを獲得しているかどうかを調べる。
   */
  checkObtained(twitterId, number) {
    return this.schema.find({ number })
      .then(recordList => {
        if (recordList.length === 0) {
          return this.NOBODY_OBTAINED;
        } else if (recordList.filter(record => record.twitterId === twitterId).length > 0) {
          return this.ALREADY_OBTAINED;
        } else {
          return this.OTHER_USER_OBTAINED;
        }
      });
  }

  /**
   * そのアカウントのログを削除する
   */
  deletePointLog(twitterId) {
    return this.schema.remove({ twitterId }).exec();
  }

  /**
   * そのアカウントのログを全権取得する。
   * 日付降順。
   */
  readByTwitterId(twitterId) {
    return this.schema.find(
      { twitterId },
      {},
      { sort: { createdAt: -1 }}
    );
  }
}
