import Inject              from "app/lib/di/Inject";

import TwitterApi          from "app/lib/twitter/api";
import TwitterModel        from "app/lib/twitter/model";

import PNCUnreactedReplies from "app/model/PNCUnreactedReplies";

import { StreamBot }       from "app/bot";
import PNCTweetHelper      from "app/bot/helper/PNCTweetHelper";

@Inject({
  twitterApi         : TwitterApi,
  twitterModel       : TwitterModel,
  pncUnreactedReplies: PNCUnreactedReplies,
  pncTweetHelper     : PNCTweetHelper,
})
export default class PNCBot extends StreamBot {
  static injectionName = "PNCBot";
  name = "PNCBot";
  description = "PNC stream bot";
  configTemplate = {
    startOnBoot                    : true,
    challengeTriggerKeywordList    : ["チャレンジ"],
    challengeReplySuccessWithPoint : "@${screenName} 今は${date}。${number} は素数です！素数ポイントを ${point} ポイント獲得！",
    challengeReplySuccess          : "@${screenName} 今は${date}。${number} は素数です！",
    challengeReplyFailure          : "@${screenName} 今は${date}。${number} は ${divisor} で割り切れちゃいました。",
    pointTriggerKeywordList        : ["ポイント"],
    mypageTriggerKeywordList       : ["マイページ"],
    mypageMessage                  : "マイページのURLは ${url} です。このURLを他の人に知られた場合、あなたの素数チャレンジポイントの詳細などが知られてしまうのでご注意ください。",
    pointReplyFull                 : "@${screenName} ${aggregatedAt}現在、総合${totalPoint}ポイント(${totalAccountCount}人中${totalRank}位)、本日${dailyPoint}ポイント(${dailyAccountCount}人中${dailyRank}位)でした！",
    pointReplyDailyEmpty           : "@${screenName} ${aggregatedAt}現在、総合${totalPoint}ポイント(${totalAccountCount}人中${totalRank}位)でした！",
    pointReplyTotalEmpty           : "@${screenName} ${aggregatedAt}現在、まだポイントを獲得していません！チャレンジしてポイントを貯めよう！",
    numberReplyTargetRegexp        : "^\\d{1,14}$",
    numberReplySpecial             : { 57: "@${screenName} #57は素数", 334: "@${screenName} なんでや！阪神関係ないやろ！" },
    numberReplyImmuKeywordList     : ["1919", "114514", "810", "893", "364364"],
    numberReplySuccessWithPoint    : "@${screenName} おめでとう！${number} は素数です！素数ポイントを ${point} ポイント獲得！",
    numberReplySuccess             : "@${screenName} おめでとう！${number} は素数です！",
    numberReplyFailure             : "@${screenName} 残念、${number} は ${divisor} で割り切れちゃいました。",
    numberReplySuccessImmuWithPoint: "@${screenName} ${number} は素数だったゾ～素数ポイント ${point} ポイントぶち込んでやるぜ～",
    numberReplySuccessImmu         : "@${screenName} ${number} は素数だったゾ～",
    numberReplyFailureImmu1        : "@${screenName} ${number} は ${divisor} で割り切れる。はっきりわかんだね",
    numberReplyFailureImmu2        : "@${screenName} ${number} は ${divisor} で割り切れる。ま、多少はね？",
    numberReplyFailureImmu3        : "@${screenName} ${number} は ${divisor} で割り切れる。これもうわかんねぇな",
    numberReplyFailureImmu4        : "@${screenName} ${number} は ${divisor} で割り切れる。まずいですよ！",
    numberReplyFailureImmu5        : "@${screenName} ${number} は ${divisor} で割り切れる。大きすぎィ！",
    dirtyReplyWithPoint            : "@${screenName} このツイートの時刻 ${number} は素数です！素数ポイントを ${point} ポイント獲得！",
    dirtyReply                     : "@${screenName} このツイートの時刻 ${number} は素数です！",
    blackIdList                    : [""],
    muteClientList                 : ["twittbot.net"],
  };

  constructor({ twitterApi, twitterModel, pncUnreactedReplies, pncTweetHelper }) {
    super();
    this.twitterApi          = twitterApi;
    this.twitterModel        = twitterModel;
    this.pncUnreactedReplies = pncUnreactedReplies;
    this.pncTweetHelper      = pncTweetHelper;
  }

  start(account) {
    const stream = this.twitterApi.connectUserStream(account, this.name);
    // ツイートを受け取った時。
    stream.on("tweet", (rawTweet) => {
      // TODO: stream を自作してマッピング後のツイートを直接取得したい
      const tweet = this.twitterModel.formatTweet(rawTweet);
      this.pncTweetHelper.handleTweet(tweet, account);
    });

    stream.on("favorite", (data) => {
      const sourceProfile = this.twitterModel.formatProfile(data.source);
      const targetTweet = this.twitterModel.formatTweet(data.target_object);

      if (targetTweet.user.twitterId === account.twitterId) {
        this.pncUnreactedReplies.delete(sourceProfile.twitterId, targetTweet.statusId);
      }
    });

    return stream;
  }

  /**
   * ふぁぼに対する反応。
   *
   * クソリプがふぁぼられたら、未反応リプライリストから除外する。
   */
  handleFavorite({ sourceProfile, targetProfile, targetTweet }, account) {
    // 自分のツイートがふぁぼられた場合のみを考える。
    if (targetProfile.twitterId !== account.twitterId) {
      return false;
    } else {
      this.pncUnreactedReplies.delete(sourceProfile.twitterId, targetTweet.statusId);
      return true;
    }
  }
}
