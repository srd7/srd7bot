/**
 * フォローおよびリムーブの実行ログ。
 */
import { Schema }         from "mongoose";

import Inject             from "app/lib/di/Inject";
import MongooseConnection from "app/lib/external/MongooseConnection";

function pickupProfile(profile) {
  const { twitterId, screenName } = profile;
  return { twitterId, screenName };
}

@Inject({ mongooseConnection: MongooseConnection })
export default class FollowRemoveLogs {
  static injectionName = "FollowRemoveLogs";
  constructor({ mongooseConnection }) {
    this.mongooseConnection = mongooseConnection;

    const eventRegulators = mongooseConnection.MModel("FollowRemoveLogs", new Schema({
      twitterId    : String,
      followSuccess: [],
      followFailure: [],
      followSkip   : [],
      removeSuccess: [],
      removeFailure: [],
      removeSkip   : [],
      createdAt    : Date,
    }));

    this.schema = eventRegulators;
  }

  insert(twitterId, followResult, removeResult) {
    const { followSuccess, followFailure, followSkip } = followResult;
    const { removeSuccess, removeFailure, removeSkip } = removeResult;

    const createdAt = new Date();

    const frLog = new this.schema({
      twitterId,
      followSuccess: followSuccess.map(pickupProfile),
      followFailure: followFailure.map(pickupProfile),
      followSkip   : followSkip   .map(pickupProfile),
      removeSuccess: removeSuccess.map(pickupProfile),
      removeFailure: removeFailure.map(pickupProfile),
      removeSkip   : removeSkip   .map(pickupProfile),
      createdAt,
    });
    frLog.save();
  }
}
