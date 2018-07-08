import _                  from "underscore";
import update             from "react-addons-update";

import Inject             from "app/lib/di/Inject";
import TwitterApi         from "app/lib/twitter/api";

import RankLogic          from "app/logic/RankLogic";

import PromiseHelper      from "app/helper/PromiseHelper";

import AccountRanks       from "app/model/AccountRanks";
import BotFollowings      from "app/model/BotFollowings";
import EventLogs          from "app/model/EventLogs";

const DAY = 86400000;

const initialLoopResult = {
  removeSuccess: [],
  removeFailure: [],
  removeSkip   : [],
};

@Inject({
  twitterApi   : TwitterApi,
  rankLogic    : RankLogic,
  promiseHelper: PromiseHelper,
  accountRanks : AccountRanks,
  botFollowings: BotFollowings,
  eventLogs    : EventLogs,
})
export default class RemoveLogic {
  static injectionName = "RemoveLogic";
  constructor({ twitterApi, rankLogic, promiseHelper, accountRanks, botFollowings, eventLogs }) {
    this.twitterApi    = twitterApi;
    this.rankLogic     = rankLogic;
    this.promiseHelper = promiseHelper;
    this.accountRanks  = accountRanks;
    this.botFollowings = botFollowings;
    this.eventLogs     = eventLogs;
  }

  /**
   * リムーブ返し対象アカウントの id を取得する。
   * 一度にリムーブするアカウント数などに関係なく、
   * 対象をすべて取得する。
   */
  getRemoveBackIdList(account) {
    const { twitterId, botConfig } = account;
    return Promise.all([
      this.twitterApi.getProfile(account, twitterId),
      this.twitterApi.getFollowings(account, twitterId),
      this.twitterApi.getFollowers(account, twitterId),
      this.botFollowings.getFollowingList(twitterId),
    ])
      .then(([_profile, followingList, followerList, botFollowingList]) => {
        // フォロー中
        const followingIdList = followingList.ids;
        // フォロワー
        const followerIdList = followerList.ids;

        // 指定期間以上フォローされていないアカウントがリムーブ対象
        const removeBackLimit = new Date(Date.now() - botConfig.removebackLimitDay * DAY);

        return _.chain(botFollowingList)
          .filter(botFollowing => botFollowing.updatedAt < removeBackLimit)
          .map(botFollowing => botFollowing.twitterId)
          .intersection(followingIdList)
          .difference(followerIdList)
          .value();
      });
  }

  /**
   * ブラック認定されたアカウントをリムーブするのだが、
   * その対象となるアカウントの id を割り出す。
   */
  getRemoveBlackIdList(account) {
    const { twitterId } = account;
    return Promise.all([
      this.twitterApi.getFollowings(account, twitterId),
      this.accountRanks.getRecentBlackList(),
    ])
      .then(([followingList, blackAccountList]) => {
        // フォロー中
        const followingIdList = followingList.ids;

        return _.chain(blackAccountList)
          .map(accountRank => accountRank.twitterId)
          .intersection(followingIdList);
      });
  }

  /**
   * ターゲットに対してリムーブを実行する。
   *
   * リムーブ対象のリストが与えられ、
   * それに対して上から順番にリムーブを試みる。
   *
   * 指定件数のリムーブに成功した段階で終了する。
   */
  loopExecuteRemove(account, trigger, targetIdList, count, result = initialLoopResult) {
    // const accountRanks = this.accountRanks;
    if (count === 0 || targetIdList.length === 0) {
      // 既に限界数リムーブしている or もうリムーブ対象がいない場合
      return result;
    } else {
      const twitterId = targetIdList[0];
      const tail = targetIdList.slice(1);
      // フォローの場合と違い、リムーブ対象は絶対リムーブする。
      // ログのためにプロフィールの取得は行う。
      return this.twitterApi.getProfile(account, twitterId)
        .then(profile => {
          return this.executeRemove(account, profile, trigger)
            // 1秒間待機してから次へ進む
            .then(() => this.promiseHelper.wait(1000))
            .then(() => {
              const nextResult = update(result, {
                removeSuccess: { $push: [profile] },
              });
              return this.loopExecuteRemove(account, trigger, tail, count - 1, nextResult);
            })
            .catch(e => {
              // リムーブに失敗
              console.error(e);
              const nextResult = update(result, {
                removeFailure: { $push: [profile] },
              });
              return this.loopExecuteRemove(account, trigger, tail, count, nextResult);
            });
        })
        .catch(e =>
          this.rankLogic.handleProfileError(twitterId)(e)
            .then(() =>
              this.loopExecuteRemove(account, trigger, tail, count, result)
            )
        );
    }
  }

  /**
   * リムーブを実行する。
   * リムーブ後、そのレコードが BotFollowing にあれば削除する。
   * その後ログに記録する。
   */
  executeRemove(account, profile, trigger) {
    const logMessage = `@${account.screenName} removed @${profile.screenName}`;

    return this.twitterApi.remove(account, profile.twitterId)
      .then(() => this.botFollowings.remove(profile.twitterId, account.twitterId))
      .then(() => this.eventLogs.insert("EXECUTE_REMOVE", trigger, logMessage));
  }

}
