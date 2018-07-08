import { Schema }         from "mongoose";

import Inject             from "app/lib/di/Inject";
import MongooseConnection from "app/lib/external/MongooseConnection";

@Inject({ mongooseConnection: MongooseConnection })
export default class BotFollowings {
  static injectionName = "BotFollowings";
  constructor({ mongooseConnection }) {
    this.mongooseConnection = mongooseConnection;

    const botFollowings = mongooseConnection.MModel("BotFollowings", new Schema({
      twitterId  : String,
      screenName : String,
      botTwtterId: String,
      updatedAt  : Date,
    }));

    this.schema = botFollowings;
  }

  isFollowing(twitterId, botTwitterId) {
    return this.schema.findOne({ twitterId, botTwitterId }).then(data => !!data);
  }

  upsert(profile, botTwtterId) {
    const { twitterId, screenName } = profile;
    const updatedAt = new Date();

    return this.schema.findOneAndUpdate(
      { twitterId, botTwtterId },
      { twitterId, screenName, botTwtterId, updatedAt },
      { upsert: true }
    ).exec();
  }

  /**
   * 複数の twitterIdList に対して、updatedAt のみを更新する
   */
  upsertAll(twitterIdList, botTwitterId) {
    const updatedAt = new Date();

    return this.schema.update(
      { twitterId: { $in: twitterIdList }, botTwitterId },
      { updatedAt },
      { multi: true },
    ).exec();
  }

  getFollowingList(botTwtterId) {
    return this.schema.find({ botTwtterId }).exec();
  }

  remove(twitterId, botTwtterId) {
    return this.schema.find({ twitterId, botTwtterId }).remove().exec();
  }
}
