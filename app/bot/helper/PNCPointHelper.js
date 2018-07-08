import _                   from "underscore";
import moment              from "moment";
import Inject              from "app/lib/di/Inject";

import Cache               from "app/lib/external/Cache";

import TwitterApi          from "app/lib/twitter/api";

import PNCPointLogic       from "app/logic/PNCPointLogic";

import StringHelper        from "app/helper/StringHelper";

import PNCPoints           from "app/model/PNCPoints";
import PNCPointLogs        from "app/model/PNCPointLogs";

// TODO: i18n したい？
const DATE_FORMAT = "YYYY年MM月DD日 HH時mm分ss秒";

const LIMIT_10_MIN = 600000;

/**
 * PNCBot.js が肥大化してきたので、ポイントに関連する部分のみを切り出し。
 */
@Inject({
  cache        : Cache,
  twitterApi   : TwitterApi,
  pncPointLogic: PNCPointLogic,
  stringHelper : StringHelper,
  pncPoints    : PNCPoints,
  pncPointLogs : PNCPointLogs,
})
export default class PNCPointHelper {
  static injectionName = "PNCPointHelper";

  constructor({ cache, twitterApi, pncPointLogic, stringHelper, pncPoints, pncPointLogs }) {
    this.cache         = cache;
    this.twitterApi    = twitterApi;
    this.pncPointLogic = pncPointLogic;
    this.stringHelper  = stringHelper;
    this.pncPoints     = pncPoints;
    this.pncPointLogs  = pncPointLogs;
  }

  /**
   * 数字に応じたポイントを獲得する。
   * とりあえずポイント算出のロジックはここに直書きする。
   * 頑張りたければ StringHelper に実装して config から読もう。
   *
   * また、既にポイント獲得済みの数字に対しては
   * ポイントが発生しない。
   * また別の人が既に獲得しているポイントについては
   * 点数を減らす。
   * そんなこんなを考慮して、
   * 得られる実際のポイントを考慮する。
   */
  obtainPoint(twitterId, statusId, number, pointType) {
    return this.pncPointLogic.calcPoint(twitterId, number, pointType)
      .then(point => {
        if (point > 0) {
          // ログに記録するのと、
          // ポイントを加算する。
          this.pncPointLogs.insert(twitterId, statusId, number, point, pointType);
          this.pncPoints.obtainPoint(twitterId, point);
        }
        return point;
      });
  }

  /**
   * 「ポイント」およびそれに類するリプによる反応。
   */
  handlePointReply(tweet, account) {
    const { statusId, text } = tweet;
    const { screenName, botConfig } = account;

    const isPointReply =
      text.indexOf(`@${screenName}`) > -1 &&
      _.some(botConfig.pointTriggerKeywordList.map(keyword =>
        text.indexOf(keyword) > -1
      ));

    if (! isPointReply) {
      return false;
    } else {
      const key = `PNCBot-handlePointReply-${tweet.user.twitterId}`;
      // キャッシュがある場合は、
      // ポイントの確認を行ったばかりなので何もしない
      this.cache.get(key)
        .then(data => {
          if (! data) {
            this.pncPoints.getPointStatus(tweet.user.twitterId)
              .then(result => {
                const params = _.assign({}, result, {
                  screenName  : tweet.user.screenName,
                  // ランキングが 0 はじまりなので 1 足す
                  dailyRank   : result.dailyRank + 1,
                  totalRank   : result.totalRank + 1,
                  aggregatedAt: moment(result.aggregatedAt).format(DATE_FORMAT),
                });
                if (result.dailyPoint === 0 && result.totalPoint === 0) {
                  // まだポイントを持っていない
                  return this.stringHelper.format(botConfig.pointReplyTotalEmpty, params);
                } else if (result.dailyPoint === 0) {
                  // まだ今日ポイントを獲得していない
                  return this.stringHelper.format(botConfig.pointReplyDailyEmpty, params);
                } else {
                  // 今日に入ってからポイントを獲得している
                  return this.stringHelper.format(botConfig.pointReplyFull, params);
                }
              })
              .then(message => {
                // 返信する
                return this.twitterApi.reply(account, statusId, message);
              })
              .then(() => {
                // キャッシュのセット
                this.cache.set(key, 1, LIMIT_10_MIN);
              });
          }
        });
      return true;
    }
  }

}
