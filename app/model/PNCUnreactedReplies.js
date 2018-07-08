/**
 * 素数チャレンジbotによるクソリプの履歴。
 *
 * 凍結対策として、
 * クソリプに対して何らかの反応を見せてくれる人にのみ
 * クソリプを送り続ける。
 *
 * クソリプを送ったことを記録し、
 * ふぁぼなどの反応があればここから削除する。
 */
import { Schema }         from "mongoose";
import moment             from "moment";

import Inject             from "app/lib/di/Inject";
import MongooseConnection from "app/lib/external/MongooseConnection";

// 未反応認定する時間。
const DEACTIVATE_LIMIT = 3600000; // 1 hour

@Inject({ mongooseConnection: MongooseConnection })
export default class PNCUnreactedReplies {
  static injectionName = "PNCUnreactedReplies";
  constructor({ mongooseConnection }) {
    this.mongooseConnection = mongooseConnection;

    const pncUnreactedReplies = mongooseConnection.MModel("PNCUnreactedReplies", new Schema({
      twitterId: String,
      statusId : String,
      tweetedAt: Date,
    }));

    this.schema = pncUnreactedReplies;
  }

  // 一定時間以上未反応のツイートを返す。
  getUnreactedReplies() {
    const limit = moment(Date.now() - DEACTIVATE_LIMIT);

    return this.schema.find({ tweetedAt: { $lte: limit }});
  }

  insert(tweet) {
    const pncUnreactedReply = new this.schema({
      twitterId: tweet.inReplyToTwitterId,
      statusId : tweet.statusId,
      tweetedAt: tweet.createdAt,
    });
    return pncUnreactedReply.save();
  }

  delete(twitterId, statusId) {
    return this.schema.remove({ twitterId, statusId }).exec();
  }

  deleteUserAll(twitterId) {
    return this.schema.remove({ twitterId }).exec();
  }
}
