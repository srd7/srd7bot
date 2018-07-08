/**
 * 素数チャレンジbotのマイページの情報
 */
import { Schema }         from "mongoose";

import Inject             from "app/lib/di/Inject";
import MongooseConnection from "app/lib/external/MongooseConnection";

@Inject({ mongooseConnection: MongooseConnection })
export default class PNCAccessKeys {
  static injectionName = "PNCAccessKeys";

  constructor({ mongooseConnection }) {
    this.mongooseConenction = mongooseConnection;

    const pncAccessKey = mongooseConnection.MModel("PNCAccessKeys", new Schema({
      twitterId  : String,
      botActionId: Number,
      accessKey  : String,
      isEnable   : Boolean,
      createdAt  : Date,
      updatedAt  : Date,
    }));

    this.schema = pncAccessKey;
  }

  insert(twitterId, accessKey, botActionId) {
    const now = new Date();
    // すでに作成済みのデータがあれば disable にする
    this.schema.update(
      { twitterId, botActionId, isEnable: true },
      { isEnable: false, updatedAt: now },
    ).exec();
    const pncAccessKey = new this.schema({
      twitterId, botActionId, accessKey,
      isEnable: true, createdAt: now, updatedAt: now,
    });
    return pncAccessKey.save();
  }

  findByTwitterId(twitterId) {
    return this.schema.findOne({ twitterId, isEnable: true });
  }

  findByAccessKey(accessKey) {
    return this.schema.findOne({ accessKey, isEnable: true });
  }
}
