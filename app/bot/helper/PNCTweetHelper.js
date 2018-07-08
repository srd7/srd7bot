import _                   from "underscore";
import Inject              from "app/lib/di/Inject";
import PNCUnreactedReplies from "app/model/PNCUnreactedReplies";
import PNCChallengeHelper  from "app/bot/helper/PNCChallengeHelper";
import PNCPointHelper      from "app/bot/helper/PNCPointHelper";
import PNCMypageHelper     from "app/bot/helper/PNCMypageHelper";

/**
 * PNCBot.js が肥大化してきたので、ツイートを処理する部分のみを切り出し。
 * 各機能はそれぞれのヘルパに投げられる。
 */
@Inject({
  pncUnreactedReplies: PNCUnreactedReplies,
  pncChallengeHelper : PNCChallengeHelper,
  pncPointHelper     : PNCPointHelper,
  pncMypageHelper    : PNCMypageHelper,
})
export default class PNCTweetHelper {
  static injectionName = "PNCTweetHelper";

  constructor({
    pncUnreactedReplies,
    pncChallengeHelper,
    pncPointHelper,
    pncMypageHelper,
  }) {
    this.pncUnreactedReplies = pncUnreactedReplies;
    this.pncChallengeHelper  = pncChallengeHelper;
    this.pncPointHelper      = pncPointHelper;
    this.pncMypageHelper     = pncMypageHelper;
  }

  handleTweet(tweet, account) {
    // クソリプに対するリプライ。
    // 他の処理に影響を及ぼさない。
    this.handleDirtyReply(tweet, account);

    // ブラックリストに入っていないかどうかの確認。
    // ブラックリストに入っていた場合、後ろの処理は行われなくなる。
    this.isInBlack(tweet, account) ||
    // ミュートクライアントを使っていないかどうかの確認。
    // ミュートクライアントを使っていた場合、後ろの処理は行われなくなる。
    this.isMuteClient(tweet, account) ||
    // RTへの反応。
    // これが行われると後ろの処理は行われなくなる。
    this.handleRetweet(tweet, account) ||
    // チャレンジおよびそれに類するリプへの反応。
    // これが行われると後ろの処理は行われなくなる。
    this.pncChallengeHelper.handleChallengeReply(tweet, account) ||
    // ポイントおよびそれに類するリプへの反応。
    // これが行われると後ろの処理は行われなくなる。
    this.pncPointHelper.handlePointReply(tweet, account) ||
    // マイページおよびそれに類するリプへの反応
    // これが行われると後ろの処理は行われなくなる
    this.pncMypageHelper.handleMypageReply(tweet, account) ||
    // 数字のリプライへの反応。
    // これが行われると後ろの処理は行われなくなる。
    this.pncChallengeHelper.handleNumberReply(tweet, account) ||
    // ツイート時刻への反応。
    this.pncChallengeHelper.handleTweetTime(tweet, account);
  }

  /**
   * クソリプに対するリプライを処理。
   *
   * クソリプに対して本人からリプライが来た場合、
   * 未反応リプライリストから除外する。
   *
   * これはその他の反応（チャレンジリプとか）とは別に処理し、
   * その他の反応に影響しない。
   */
  handleDirtyReply(tweet, account) {
    const {
      // リプ先のツイートに反応があるかの検証
      inReplyToStatusId : statusId,
      inReplyToTwitterId: twitterId,
      quotedStatus,
    } = tweet;

    if (statusId && twitterId === account.twitterId) {
      // クソリプに対するリプライ
      this.pncUnreactedReplies.delete(tweet.user.twitterId, tweet.inReplyToStatusId);
      return true;
    } else if (quotedStatus && quotedStatus.user.twitterId === account.twitterId) {
      // クソリプに対するクオート
      this.pncUnreactedReplies.delete(tweet.user.twitterId, quotedStatus.statusId);
      return true;
    } else {
      return false;
    }
  }

  /**
   * ブラックリストに入っているどうかの確認。
   *
   * ブラックリストに入っていれば true を返し、後続の処理を行わない。
   * 入っていれば false を返す。
   */
  isInBlack(tweet, account) {
    const blackIdList = account.botConfig.blackIdList || [];
    return _.includes(blackIdList, tweet.user.twitterId);
  }

  /**
   * ミュートクライアントを使っていないかどうかの確認。
   *
   * ミュートクライアントであれば true を返し、後続の処理を行わない。
   * 入っていれば false を返す。
   */
  isMuteClient(tweet, account) {
    const muteClientList = account.botConfig.muteClientList || [];
    return _.includes(muteClientList, tweet.source);
  }

  /**
   * RT への反応。
   *
   * クソリプに対する RT であれば、
   * 未反応リプライリストから除外する。
   *
   * RT であれば、反応対象でなくても true を返す。
   */
  handleRetweet(tweet, _account) {
    const { retweetedStatus } = tweet;
    if (! retweetedStatus) {
      return false;
    } else {
      // クソリプに対する RT の処理
      this.pncUnreactedReplies.delete(tweet.user.twitterId, retweetedStatus.statusId);
      return true;
    }
  }

}
