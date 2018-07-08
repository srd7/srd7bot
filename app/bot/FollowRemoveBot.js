import _                from "underscore";
import moment           from "moment";

import Inject           from "app/lib/di/Inject";

import TwitterApi       from "app/lib/twitter/api";

import ConfigLogic      from "app/logic/ConfigLogic";
import FollowLogic      from "app/logic/FollowLogic";
import RemoveLogic      from "app/logic/RemoveLogic";
import RankLogic        from "app/logic/RankLogic";
import FollowRemoveLogs from "app/model/FollowRemoveLogs";
import EventRegulators  from "app/model/EventRegulators";

import { ScriptBot }    from "app/bot";

const BOT_MAX_FOLLOW = parseInt(process.env.BOT_MAX_FOLLOW || 5, 10);
const BOT_MAX_REMOVE = parseInt(process.env.BOT_MAX_REMOVE || 5, 10);
const BOT_MAX_RANK_CHECK = parseInt(process.env.BOT_MAX_RANK_CHECK || 10, 10);

@Inject({
  twitterApi: TwitterApi,
  configLogic: ConfigLogic, followLogic: FollowLogic, removeLogic: RemoveLogic, rankLogic: RankLogic,
  followRemoveLogs: FollowRemoveLogs, eventRegulators: EventRegulators,
})
export default class FollowRemoveBot extends ScriptBot {
  static injectionName = "FollowRemoveBot";
  name = "FollowRemoveBot";
  description = "Follow back, follow white, remove back and remove black script bot.";
  configTemplate = {
    isFollowBack          : true,
    isFollowWhite         : { $hour: { $gte: 10, $lte: 23 } },
    isRemoveBack          : true,
    isRemoveBlack         : { $hour: { $gte: 10, $lte: 23 } },
    followWhiteTarget     : [""],
    followOnceFriendRate  : 0.001,
    followOnceFollowerRate: 0.002,
    removeOnceFriendRate  : 0.001,
    removeOnceFollowerRate: 0.002,
    removebackLimitDay    : 15,
    permitLangList        : ["ja", "en"],
  };

  constructor({
    twitterApi,
    configLogic, followLogic, removeLogic, rankLogic,
    followRemoveLogs, eventRegulators,
  }) {
    super();
    this.twitterApi       = twitterApi;
    this.configLogic      = configLogic;
    this.followLogic      = followLogic;
    this.removeLogic      = removeLogic;
    this.rankLogic        = rankLogic;
    this.followRemoveLogs = followRemoveLogs;
    this.eventRegulators  = eventRegulators;
  }

  run(account, trigger) {
    // その時間で最初の実行時にフォローを実行する。
    const key = `FOLLOW_REMOVE_BOT--@${account.twitterId}`;

    this.eventRegulators.canExecuteHour(key)
      .then(canExec => {
        if (canExec) {
          // Bot のフォローフォロワー状況を最新に更新する
          this.followLogic.updateBotFollowing(account, BOT_MAX_RANK_CHECK);
          // アカウントランクの更新を実行
          this.rankLogic.updateRank(account, BOT_MAX_RANK_CHECK);

          return Promise.all([
            this.executeFollowEvent(account, trigger),
            this.executeRemoveEvent(account, trigger),
          ])
            .then(([followResult, removeResult]) =>
              this.followRemoveLogs.insert(account.twitterId, followResult, removeResult)
            )
            .then(() =>
              this.eventRegulators.execute(key)
            );
        }
      })
      .catch(e => console.error(e));
  }

  /**
   * 一度にフォローできる人数を取得する。
   * フォロー数フォロワー数に依存する。
   * どんな状態であっても、1以上 $BOT_MAX_FOLLOW 以下の値に落ち着く。
   */
  calcMaxFollowOnce(account, profile) {
    const { followOnceFriendRate, followOnceFollowerRate } = account.botConfig;
    const profileValue = _.max([
      1,
      Math.round(profile.friendsCount   * followOnceFriendRate),
      Math.round(profile.followersCount * followOnceFollowerRate),
    ]);
    return _.min([profileValue, BOT_MAX_FOLLOW]);
  }

  executeFollowEvent(account, trigger) {
    const {
      isFollowBack, isFollowWhite,
      followWhiteTarget,
    } = account.botConfig;

    const conditionFunc = this.configLogic.getCheckConditionFunc(account, moment());

    return Promise.all([
      // プロフィール
      this.twitterApi.getProfile(account, account.twitterId),
      // フォロー返しを行うのか？
      conditionFunc(isFollowBack || false)?
        this.followLogic.getFollowBackIdList(account) : Promise.resolve([]),
      // 他の人のフォロワーのホワイトリストをフォローするのか？
      conditionFunc(isFollowWhite || false)?
        this.followLogic.getFollowWhiteIdList(account, followWhiteTarget || []) : Promise.resolve([]),
    ])
      .then(([profile, followBackIdList, followWhiteIdList]) => {
        const targetIdList = followBackIdList.concat(followWhiteIdList);
        const maxFollowOnce = this.calcMaxFollowOnce(account, profile);
        return this.followLogic.loopExecuteFollow(account, trigger, targetIdList, maxFollowOnce);
      });
  }

  /**
   * 一度にリムーブできる人数を取得する。
   * フォロー数フォロワー数に依存する。
   * どんな状態であっても、1以上 $BOT_MAX_REMOVE 以下の値に落ち着く。
   */
  calcMaxRemoveOnce(account, profile) {
    const { removeOnceFriendRate, removeOnceFollowerRate } = account.botConfig;
    const profileValue = _.max([
      1,
      Math.round(profile.friendsCount   * removeOnceFriendRate),
      Math.round(profile.followersCount * removeOnceFollowerRate),
    ]);
    return _.min([profileValue, BOT_MAX_REMOVE]);
  }

  executeRemoveEvent(account, trigger) {
    const {
      isRemoveBack, isRemoveBlack,
    } = account.botConfig;

    const conditionFunc = this.configLogic.getCheckConditionFunc(account, moment());

    return Promise.all([
      // プロフィール
      this.twitterApi.getProfile(account, account.twitterId),
      // リムーブ返しを行うのか？
      conditionFunc(isRemoveBack || false)?
        this.removeLogic.getRemoveBackIdList(account) : Promise.resolve([]),
      // ブラックアカウントをリムーブするのか？
      conditionFunc(isRemoveBlack || false)?
        this.removeLogic.getRemoveBlackIdList(account) : Promise.resolve([]),
    ])
      .then(([profile, removeBackIdList, removeBlackIdList]) => {
        const targetIdList = removeBackIdList.concat(removeBlackIdList);
        const maxRemoveOnce = this.calcMaxRemoveOnce(account, profile);
        return this.removeLogic.loopExecuteRemove(account, trigger, targetIdList, maxRemoveOnce);
      });
  }
}
