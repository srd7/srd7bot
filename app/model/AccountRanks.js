import _                  from "underscore";
import { Schema }         from "mongoose";

import Inject             from "app/lib/di/Inject";
import MongooseConnection from "app/lib/external/MongooseConnection";

const BOT_RECHECK_DAY = parseInt(process.env.BOT_RECHECK_DAY, 10) || 10;
const DAY = 86400000;


// 「最近更新した」アカウントランクの境界。
// 更新期間の 95% 以内に更新されたものとする。
const defaultRecentLimit = DAY * BOT_RECHECK_DAY * 0.95;

@Inject({ mongooseConnection: MongooseConnection })
export default class AccountRanks {
  static injectionName = "AccountRanks";
  ACCOUNT_RANK_SUSPENDED = 3;
  ACCOUNT_RANK_BLACK     = 2;
  ACCOUNT_RANK_GRAY      = 1;
  ACCOUNT_RANK_WHITE     = 0;
  constructor({ mongooseConnection }) {
    this.mongooseConnection = mongooseConnection;

    const accountRanks = mongooseConnection.MModel("AccountRanks", new Schema({
      twitterId : String,
      screenName: String,
      rank      : Number,
      updatedAt : Date,
    }));

    this.schema = accountRanks;
  }

  upsert(profile, rank) {
    const { twitterId, screenName } = profile;
    const updatedAt = new Date();

    return this.schema.findOneAndUpdate(
      { twitterId },
      { twitterId, screenName, rank, updatedAt },
      { upsert: true }
    ).exec();
  }

  remove(twitterId) {
    return this.schema.remove({ twitterId }).exec();
  }

  getRecentList(limitMillis = defaultRecentLimit) {
    const dateBound = new Date(Date.now() - limitMillis);

    return this.schema.find(
      { updatedAt: { $gte: dateBound } },
      { _id: 0, twitterId: 1, rank: 1 }
    ).exec();
  }

  getRecentCondList(limitMillis, cond) {
    return this.getRecentList(limitMillis).then(accountRankList => accountRankList.filter(cond));
  }

  getRecentBlackList(limitMillis = defaultRecentLimit) {
    return this.getRecentCondList(limitMillis, ::this.isBlack);
  }

  getRecentWhiteList(limitMillis = defaultRecentLimit) {
    return this.getRecentCondList(limitMillis, ::this.isWhite);
  }

  getRecentSuspendedList(limitMillis = defaultRecentLimit) {
    return this.getRecentCondList(limitMillis, ::this.isSuspended);
  }

  getOldList(limitMillis = defaultRecentLimit) {
    const dateBound = new Date(Date.now() - limitMillis);

    return this.schema.find(
      { updatedAt: { $lte: dateBound } },
      { _id: 0, twitterId: 1 },
    ).exec();
  }

  isBlack(accountRank) {
    return accountRank.rank === this.ACCOUNT_RANK_BLACK;
  }

  isWhite(accountRank) {
    return accountRank.rank === this.ACCOUNT_RANK_WHITE;
  }

  isSuspended(accountRank) {
    return accountRank.rank === this.ACCOUNT_RANK_SUSPENDED;
  }

  canFollow(accountRank) {
    const followableRankList = [
      this.ACCOUNT_RANK_WHITE,
      this.ACCOUNT_RANK_GRAY,
    ];

    return _.contains(followableRankList, accountRank);
  }
}
