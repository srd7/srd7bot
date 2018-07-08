/**
 * 素数チャレンジbotがクソリプを送る対象である
 * アウティブユーザーのリスト。
 *
 * 凍結対策として、
 * クソリプに対して何らかの反応を見せてくれる人にのみ
 * クソリプを送り続ける。
 *
 * このリストに入っているユーザーにのみ
 * クソリプを送る。
 */
import { Schema }         from "mongoose";

import Inject             from "app/lib/di/Inject";
import MongooseConnection from "app/lib/external/MongooseConnection";

// 「しばらくアクティブじゃない」アカウントの境界。
// 3日間チャレンジ等をしていないアカウントとする。

const defaultRecentLimit = 1000 * 86400 * 3;

@Inject({ mongooseConnection: MongooseConnection })
export default class PNCActiveAccounts {
  static injectionName = "PNCActiveAccounts";
  constructor({ mongooseConnection }) {
    this.mongooseConnection = mongooseConnection;

    const pncActiveAccounts = mongooseConnection.MModel("PNCActiveAccounts", new Schema({
      twitterId   : String,
      lastActiveAt: Date,
      updatedAt   : Date,
    }));

    this.schema = pncActiveAccounts;
  }

  getOldList(limitMillis = defaultRecentLimit) {
    const dateBound = new Date(Date.now() - limitMillis);
    return this.schema.find({ lastActiveAt: { $lt: dateBound }}).exec();
  }

  activate(twitterId) {
    const updatedAt = new Date();

    return this.schema.findOneAndUpdate(
      { twitterId },
      { twitterId, lastActiveAt: updatedAt, updatedAt },
      { upsert: true }
    ).exec();
  }

  isActive(twitterId) {
    return this.schema.findOne({ twitterId }).then(data => !!data);
  }

  deactivate(twitterId) {
    return this.schema.remove({ twitterId }).exec();
  }
}
