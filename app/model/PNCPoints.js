/**
 * 素数ポイント。
 * 素数なツイートをすることでたまるポイント（ベータ版）
 */
import { Schema }         from "mongoose";

import Inject             from "app/lib/di/Inject";
import MongooseConnection from "app/lib/external/MongooseConnection";

@Inject({ mongooseConnection: MongooseConnection })
export default class PNCPoints {
  static injectionName = "PNCPoints";
  constructor({ mongooseConnection }) {
    this.mongooseConnection = mongooseConnection;

    const pncPoints = mongooseConnection.MModel("PNCPoints", new Schema({
      twitterId     : String,
      dailyPoint    : Number,
      totalPoint    : Number,
      lastObtainedAt: Date,
    }));

    this.schema = pncPoints;
  }

  obtainPoint(twitterId, point) {
    const lastObtainedAt = new Date();
    const pointObj = {
      dailyPoint  : point,
      totalPoint  : point,
    };

    // $setOnInsert と $inc は同時に使えないっぽい。。。
    return this.schema.findOne({ twitterId })
      .then(data => {
        if (data) {
          return this.schema.findOneAndUpdate(
            { twitterId },
            { $inc: pointObj, lastObtainedAt },
          ).exec();
        } else {
          const pncPoint = new this.schema({
            twitterId,
            dailyPoint: point,
            totalPoint: point,
            lastObtainedAt,
          });
          return pncPoint.save();
        }
      });
  }

  /**
   * そのアカウントの
   *   1. ポイント数
   *   2. 順位
   *   3. トータル集計人数
   * を取得する。
   * 集計を行う処理なので結果は10分キャッシュする。
   *
   * 返す形式としては
   *   {
   *     dailyPoint, dailyRank, dailyAccountCount,
   *     totalPoint, totalRank, totalAccountCount,
   *     aggregatedAt,
   *   }
   */
  getPointStatus(twitterId) {
    const aggregatedAt = new Date();
    return this.schema.findOne({ twitterId })
      .then(data => {
        if (data) {
          const { dailyPoint, totalPoint } = data;
          return Promise.all([
            // デイリー順位
            this.schema.count({ dailyPoint: { $gt: dailyPoint } }),
            // デイリー集計人数
            this.schema.count({ dailyPoint: { $gt: 0 } }),
            // トータル順位
            this.schema.count({ totalPoint: { $gt: totalPoint } }),
            // トータル集計人数
            this.schema.count({ totalPoint: { $gt: 0 } }),
          ])
            .then(([dailyRank, dailyAccountCount, totalRank, totalAccountCount]) => {
              const returnObj = {
                dailyPoint, dailyRank, dailyAccountCount,
                totalPoint, totalRank, totalAccountCount,
                aggregatedAt,
              };

              return returnObj;
            });
        } else {
          // そもそもレコード自体がないとき
          return { dailyPoint: 0, totalPoint: 0, aggregatedAt };
        }
      });
  }

  /**
   * デイリーランキングを取得
   */
  getDailyRanking() {
    return this.schema.find(
      { dailyPoint: { $gt: 0 }},
      {},
      { sort: { dailyPoint: -1 }, limit: 5 }
    );
  }

  /**
   * トータルランキングを取得
   */
  getTotalRanking() {
    return this.schema.find(
      { totalPoint: { $gt: 0 }},
      {},
      { sort: { totalPoint: -1 }, limit: 5 }
    );
  }

  dailyReset() {
    return this.schema.update({}, { dailyPoint: 0 }, { multi: true }).exec();
  }

  /**
   * アカウントのデータを削除
   */
  deletePoint(twitterId) {
    return this.schema.remove({ twitterId }).exec();
  }
}
