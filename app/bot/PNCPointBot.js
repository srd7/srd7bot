import moment              from "moment";

import Inject              from "app/lib/di/Inject";

import TwitterApi          from "app/lib/twitter/api";

import ConfigLogic         from "app/logic/ConfigLogic";

import StringHelper        from "app/helper/StringHelper";

import BotFollowings       from "app/model/BotFollowings";
import PNCPoints           from "app/model/PNCPoints";
import PNCActiveAccounts   from "app/model/PNCActiveAccounts";
import PNCUnreactedReplies from "app/model/PNCUnreactedReplies";
import PNCPointLogs        from "app/model/PNCPointLogs";
import AccountRanks        from "app/model/AccountRanks";
import EventLogs           from "app/model/EventLogs";
import EventRegulators     from "app/model/EventRegulators";

import { ScriptBot }       from "app/bot";

const REGURATOR_EVENT_NAME = "PNC_POINT_RECORD";

@Inject({
  twitterApi         : TwitterApi,
  configLogic        : ConfigLogic,
  stringHelper       : StringHelper,
  botFollowings      : BotFollowings,
  pncPoints          : PNCPoints,
  pncActiveAccounts  : PNCActiveAccounts,
  pncUnreactedReplies: PNCUnreactedReplies,
  pncPointLogs       : PNCPointLogs,
  accountRanks       : AccountRanks,
  eventLogs          : EventLogs,
  eventRegulators    : EventRegulators,
})
export default class PNCPointBot extends ScriptBot {
  static injectionName = "PNCPointBot";
  name = "PNCPointScriptBot";
  description = "PrimeNumberChallenge bot point handler";
  configTemplate = {
    dailyTemplate    : "素数ポイントデイリーランキング (${date}集計)\n${ranking}",
    totalTemplate    : "素数ポイント総合ランキング (${date}集計)\n${ranking}",
    dailyRankTemplate: "${rank}位 @${screenName} ${point}PT",
    totalRankTemplate: "${rank}位 @${screenName} ${point}PT",
  };

  constructor({
    twitterApi,
    configLogic, stringHelper,
    botFollowings,
    pncPoints, pncActiveAccounts, pncUnreactedReplies, pncPointLogs,
    accountRanks,
    eventLogs, eventRegulators,
  }) {
    super();
    this.twitterApi          = twitterApi;
    this.configLogic         = configLogic;
    this.stringHelper        = stringHelper;
    this.botFollowings       = botFollowings;
    this.pncPoints           = pncPoints;
    this.pncActiveAccounts   = pncActiveAccounts;
    this.pncUnreactedReplies = pncUnreactedReplies;
    this.pncPointLogs        = pncPointLogs;
    this.accountRanks        = accountRanks;
    this.eventLogs           = eventLogs;
    this.eventRegulators     = eventRegulators;
  }

  run(account, trigger) {
    // ランキングツイート
    this.runRankingTweet(account, trigger);
    // 未反応クソリプに対する検挙
    this.runUnreactedReplyDeactivate(account, trigger);
    // フォロー外のアクティブアカウントの削除
    this.runUnfollowerDeactivate(account, trigger);
    // 凍結済みアカウントのポイント削除
    this.removeSuspendedAccountPoint(account, trigger);
  }

  /**
   * その日1番の実行時に、ランキングを発表する。
   */
  runRankingTweet(account, _trigger) {
    this.eventRegulators.canExecuteDay(REGURATOR_EVENT_NAME)
      .then(canRecord => {
        if (canRecord) {
          this.executeRunRecord(account)
            .then(() => {
              this.eventRegulators.execute(REGURATOR_EVENT_NAME);
            });
        }
      })
      .catch(e => console.error(e));
  }

  /*
   * ポイントとは関係ないが、
   * 素数チャレンジbotのクソリプに未反応のリプをここで検挙する。
   */
  runUnreactedReplyDeactivate(_account, _trigger) {
    this.pncUnreactedReplies.getUnreactedReplies()
      .then(unreactedReplyList => {
        const now = Date.now();

        unreactedReplyList.forEach(({ twitterId, tweetedAt }) => {
          // とりあえず、
          // スルー時間数 * 10% の確率で、
          // 反応リストから除外する。
          // 10時間以上スルーしていたら確定除外。
          const spanHour = (now - tweetedAt) / 3600000;

          if (Math.random() < spanHour * 0.1) {
            this.pncActiveAccounts.deactivate(twitterId);
            this.pncUnreactedReplies.deleteUserAll(twitterId);
            const message = `twitterId: ${twitterId}, spanHour: ${spanHour}`;
            this.eventLogs.insert("DEACTIVATE_PNC", "PNCPointBot.run()", message);
          }
        });
      })
      .catch(e => console.error(e));
  }

  /*
   * これもポイントとは関係ないが、
   * フォロー外のアクティブアカウントを削除する。
   */
  runUnfollowerDeactivate(account, _trigger) {
    this.pncActiveAccounts.getOldList()
      .then(pncActiveAccountList => {
        pncActiveAccountList.forEach(({ twitterId }) => {
          this.botFollowings.isFollowing(twitterId, account.twitterId)
            .then(isFollowing => {
              if (! isFollowing) {
                this.pncActiveAccounts.deactivate(twitterId);
              }
            });
        });
      });
  }

  /**
   * これもポイントとは関係ないが、
   * 凍結済みアカウントのポイントを削除する
   */
  removeSuspendedAccountPoint(_account, _trigger) {
    this.accountRanks.getRecentSuspendedList()
      .then(suspendedAccountList =>
        Promise.all(suspendedAccountList.map(suspendedAccount =>
          this.pncPoints.deletePoint(suspendedAccount.twitterId)
            .then(() => this.pncPointLogs.deletePointLog(suspendedAccount.twitterId))
            .then(() => {
              const message = `@${suspendedAccount.screenName}`;
              return this.eventLogs.insert("DELETE_SUSPENDED_POINT_PNC", "PNCPointBot.run()", message);
            })
        ))
      );
  }

  /**
   * ランキングツイートを生成する。
   * 140字を超えそうなら、掲載人数を減らす。
   */
  genRankingTweet(profileWithPointList, template) {
    const tweet = profileWithPointList.map(({ profile, point }, i) =>
      this.stringHelper.format(
        template,
        {
          rank      : i + 1,
          screenName: profile.screenName,
          name      : profile.name,
          point     : point,
        }
      )
    ).join("\n");
    if (tweet.length < 100) {
      return tweet;
    } else {
      return this.genRankingTweet(profileWithPointList.slice(0, -1), template);
    }
  }

  getProfileWithPoint(account, pncPointList, toPoint) {
    return Promise.all(pncPointList.map(pncPoint =>
      this.twitterApi.getProfile(account, pncPoint.twitterId)
        .then(profile => {
          return { profile, point: toPoint(pncPoint) };
        })
        .catch(e => {
          // 垢消し、凍結など
          console.warn(e);
          return this.pncPointLogs.deletePointLog(pncPoint.twitterId)
            .then(() => this.pncPoints.deletePoint(pncPoint.twitterId))
            .then(() => null);
        })
    )).then(list => list.filter(item => item));
  }

  tweetRanking(account, ranking, template) {
    // 誰もランキングにいなければ何もしない
    if (ranking) {
      const params = {
        date: moment().format("YYYY.MM.DD HH:mm:ss"),
        ranking,
      };
      return this.twitterApi.tweet(account, this.stringHelper.format(template, params));
    } else {
      return Promise.resolve();
    }
  }

  executeRunRecord(account) {
    // まずデイリーランキング
    return this.pncPoints.getDailyRanking()
      .then(pncPointList =>
        this.getProfileWithPoint(account, pncPointList, pncPoint => pncPoint.dailyPoint)
      )
      .then(profileWithPointList =>
        this.genRankingTweet(profileWithPointList, account.botConfig.dailyRankTemplate)
      )
      .then(ranking =>
        this.tweetRanking(account, ranking, account.botConfig.dailyTemplate)
      )
      .then(() => this.pncPoints.dailyReset())
      // 続いて総合ランキング
      .then(() => this.pncPoints.getTotalRanking())
      .then(pncPointList =>
        this.getProfileWithPoint(account, pncPointList, pncPoint => pncPoint.totalPoint)
      )
      .then(profileWithPointList =>
        this.genRankingTweet(profileWithPointList, account.botConfig.totalRankTemplate)
      )
      .then(ranking =>
        this.tweetRanking(account, ranking, account.botConfig.totalTemplate)
      );
  }
}
