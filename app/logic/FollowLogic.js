import _                from "underscore";
import update           from "react-addons-update";

import Inject           from "app/lib/di/Inject";
import TwitterApi       from "app/lib/twitter/api";

import RankLogic        from "app/logic/RankLogic";

import PromiseHelper    from "app/helper/PromiseHelper";

import AccountRanks     from "app/model/AccountRanks";
import BotFollowings    from "app/model/BotFollowings";
import EventLogs        from "app/model/EventLogs";

const initialLoopResult = {
  followSuccess: [],
  followFailure: [],
  followSkip   : [],
};

@Inject({
  twitterApi   : TwitterApi,
  rankLogic    : RankLogic,
  promiseHelper: PromiseHelper,
  accountRanks : AccountRanks,
  botFollowings: BotFollowings,
  eventLogs    : EventLogs,
})
export default class FollowLogic {
  static injectionName = "FollowLogic";
  constructor({ twitterApi, rankLogic, promiseHelper, accountRanks, botFollowings, eventLogs }) {
    this.twitterApi    = twitterApi;
    this.rankLogic     = rankLogic;
    this.promiseHelper = promiseHelper;
    this.accountRanks  = accountRanks;
    this.botFollowings = botFollowings;
    this.eventLogs     = eventLogs;
  }

  /**
   * フォロー返し対象アカウントの id を取得する。
   * 一度にフォローするアカウント数などに関係なく、
   * 対象をすべて取得する。
   */
  getFollowBackIdList(account) {
    const { twitterId } = account;
    return Promise.all([
      this.twitterApi.getProfile(account, twitterId),
      this.twitterApi.getFollowings(account, twitterId),
      this.twitterApi.getFollowers(account, twitterId),
      this.accountRanks.getRecentBlackList(),
    ])
      .then(([_profile, followingList, followerList, blackAccountList]) => {
        // フォロー中
        const followingIdList = followingList.ids;
        // フォロワー
        const followerIdList = followerList.ids;

        // ブラックリストのアカウントはフォローしない
        const blackIdList = blackAccountList.map(accountRank => accountRank.twitterId);

        return _.chain(followerIdList)
          .difference(followingIdList)
          .difference(blackIdList)
          .value();
      });
  }

  /**
   * 他のアカウントのフォロワーで、
   * ホワイトリストからのフォロー対象の id を取得する。
   * フォロー返し対象は除外。
   */
  getFollowWhiteIdList(account) {
    const { twitterId, botConfig } = account;
    return Promise.all([
      this.twitterApi.getProfile(account, twitterId),
      Promise.all(botConfig.followWhiteTarget.map(twitterId =>
        this.twitterApi.getFollowers(account, twitterId))
      ),
      this.twitterApi.getFollowings(account, twitterId),
      this.twitterApi.getFollowers(account, twitterId),
      this.accountRanks.getRecentWhiteList(),
    ])
      .then(([_profile, targetAccountFollowers, followingList, followerList, whiteAccountList]) => {
        // フォロー中
        const followingIdList = followingList.ids;
        // フォロワー
        const followerIdList = followerList.ids;

        // ホワイトリストに入っているアカウントからしかフォローしない
        const whiteIdList = whiteAccountList.map(accountRank => accountRank.twitterId);

        // 対象アカウントのフォロワーのうち、
        // ホワイトリストに入っているアカウントのみをピックアップし、
        // さらにその中からフォロー中・フォロワーを取り除いたものが
        // こちらから自発する対象。
        return _.chain(targetAccountFollowers)
          .map(targetAccountFollowerList => targetAccountFollowerList.ids)
          .flatten()
          .uniq()
          .intersection(whiteIdList)
          .difference(followingIdList)
          .difference(followerIdList)
          .value();
      });
  }

  /**
   * ターゲットに対してフォローを実行する。
   *
   * フォロー対象のリストが与えられ、
   * それに対して上から順番にフォローを試みる。
   *
   * 指定件数のフォローに成功した段階で終了する。
   */
  loopExecuteFollow(account, trigger, targetIdList, count, result = initialLoopResult) {
    if (count === 0 || targetIdList.length === 0) {
      // 既に限界数フォローしている or もうフォロー対象がいない場合
      return result;
    } else {
      const twitterId = targetIdList[0];
      const tail = targetIdList.slice(1);
      // そのアカウントがフォロー可能かどうか
      // （ブラックじゃないか？等）をチェックする。
      // そのためにプロフィールを取得。
      return this.twitterApi.getProfile(account, twitterId)
        .then(profile => this.handleAccount(account, profile, trigger, tail, count, result))
        .catch(e =>
          this.rankLogic.handleProfileError(twitterId)(e)
            .then(() => this.loopExecuteFollow(account, trigger, tail, count, result))
        );
    }
  }

  /**
   * 取得したプロフィールに応じて各種対応を行う。
   * 1. 既にフォロー中 or フォロリク出ているなら、スキップ
   * 2. フォロー可能ならフォローし、1秒待機
   * 3. フォロー不可能ならスキップ
   */
  handleAccount(account, profile, trigger, targetIdList, count, result) {
    const accountRanks = this.accountRanks;

    if (profile.following || profile.followRequestSent) {
      // 既にフォロー中の場合（あるのか？） や
      // 既にフォロリク送信済みの場合
      const nextResult = update(result, {
        followSkip: { $push: [profile] },
      });
      return this.loopExecuteFollow(account, trigger, targetIdList, count, nextResult);
    } else {
      // まだフォローしていない場合
      const rank = this.rankLogic.checkRank(account, profile);

      // ランクを更新する。結果は取らなくて問題なし。
      accountRanks.upsert(profile, rank);

      if (this.accountRanks.canFollow(rank)) {
        // ブラックでなければフォローする
        return this.executeFollow(account, profile, trigger)
          // 1秒間待機してから次へ進む
          .then(() => this.promiseHelper.wait(1000))
          .then(() => {
            const nextResult = update(result, {
              followSuccess: { $push: [profile] },
            });
            return this.loopExecuteFollow(account, trigger, targetIdList, count - 1, nextResult);
          })
          .catch(e => {
            // フォローに失敗
            console.error(e);
            const nextResult = update(result, {
              followFailure: { $push: [profile] },
            });
            return this.loopExecuteFollow(account, trigger, targetIdList, count, nextResult);
          });
      } else {
        // フォローしないアカウントの場合は特に何も記録しない
        return this.loopExecuteFollow(account, trigger, targetIdList, count, result);
      }
    }
  }

  /**
   * フォローを実行する。
   * フォロー後、そのレコードを BotFollowing に登録する。
   * その後ログに記録する。
   */
  executeFollow(account, profile, trigger) {
    const logMessage = `@${account.screenName} followed @${profile.screenName}`;

    return this.twitterApi.follow(account, profile.twitterId)
      .then(() => this.botFollowings.upsert(profile, account.twitterId))
      .then(() => this.eventLogs.insert("EXECUTE_FOLLOW", trigger, logMessage));
  }

  /**
   * BotFollowing の情報を更新する。
   * 1. フォローしているが BotFollowing に入っていないレコードは insert
   *   => DB初期化時や、手動フォロー等
   * 2. 相互フォローが確認できたら BotFollowing を update
   */
  updateBotFollowing(account, max) {
    // const accountRanks = this.accountRanks;
    const { twitterId: botTwitterId } = account;
    return Promise.all([
      this.twitterApi.getFollowings(account, botTwitterId),
      this.twitterApi.getFollowers(account, botTwitterId),
      this.botFollowings.getFollowingList(botTwitterId),
    ])
      .then(([followingList, followerList, botFollowingList]) => {
        // フォロー中
        const followingIdList = followingList.ids;
        // フォロワー
        const followerIdList = followerList.ids;

        // 相互フォロワー
        const mutualIdList = _.intersection(followingIdList, followerIdList);
        // 未登録フォロー
        const unmarkedFollowingIdList = _.chain(followingIdList)
          .difference(botFollowingList.map(botFollowing => botFollowing.twitterId))
          .slice(0, max);

        // 未登録フォローを登録する。
        unmarkedFollowingIdList.forEach(twitterId => {
          this.twitterApi.getProfile(account, twitterId)
            .then(profile => this.botFollowings.upsert(profile, botTwitterId))
            .catch(this.rankLogic.handleProfileError(twitterId));
        });

        // 相互フォロワーを更新する。
        this.botFollowings.upsertAll(mutualIdList, botTwitterId);
      });
  }
}
