import _                   from "underscore";
import moment              from "moment";

import Inject              from "app/lib/di/Inject";
import TwitterApi          from "app/lib/twitter/api";
import StringHelper        from "app/helper/StringHelper";
import PNCUnreactedReplies from "app/model/PNCUnreactedReplies";
import PNCActiveAccounts   from "app/model/PNCActiveAccounts";
import PNCPointLogs        from "app/model/PNCPointLogs";
import PNCPointHelper      from "app/bot/helper/PNCPointHelper";

const SEED_MAX = 10000000;

const NUMBER_FORMAT = "YYYYMMDDHHmmss";
// TODO: i18n したい？
const DATE_FORMAT = "YYYY年MM月DD日 HH時mm分ss秒";

function getSmallPrimeList(max) {
  const primes = [];

  // 十分に小さな数字について、素数かどうか判定。
  // 現在わかっている素数リストで割り切れるものがないか判定する。
  function isPrimeSmall(n) {
    // even number includes 2 is not considered
    const sqrtN = Math.floor(Math.sqrt(n));
    let i = 0;
    let result = true;
    while(result && primes[i] <= sqrtN) {
      result = n % primes[i] !== 0;
      i += 1;
    }
    return result;
  }

  const result = [2];
  let n = 3;
  while (n < max) {
    if (isPrimeSmall(n)) {
      result.push(n);
    }
    n += 2;
  }
  return result;
}

function calcPrime() {
  const start = Date.now();
  const max = SEED_MAX;
  const primeList = getSmallPrimeList(max);
  console.log("Calculation of seed prime to %d spended %d ms.", max, Date.now() - start);
  return primeList;
}

/**
 * 割り切れる最小の素数を求める。
 * 素数の場合は -1 を返す。
 */
function getSmallestDivisor(primeList, n) {
  const limit = SEED_MAX * SEED_MAX;
  if (n > limit) {
    throw Error(`Out of range error. Number must be smaller than ${limit} and ${n} is too big.`);
  } else {
    const sqrtN = Math.floor(Math.sqrt(n));
    let i = 0;
    let result = -1;
    while(result < 0 && primeList[i] <= sqrtN) {
      const prime = primeList[i];
      if (n % prime === 0) {
        result = prime;
      } else {
        i += 1;
      }
    }
    return result;
  }
}

/**
 * PNCBot.js が肥大化してきたので、チャレンジを処理する部分のみを切り出し。
 */
@Inject({
  twitterApi         : TwitterApi,
  stringHelper       : StringHelper,
  pncUnreactedReplies: PNCUnreactedReplies,
  pncActiveAccounts  : PNCActiveAccounts,
  pncPointLogs       : PNCPointLogs,
  pncPointHelper     : PNCPointHelper,
})
export default class PNCChallengeHelper {
  static injectionName = "PNCChallengeHelper";

  constructor({
    twitterApi,
    stringHelper,
    pncUnreactedReplies,
    pncActiveAccounts,
    pncPointLogs,
    pncPointHelper,
  }) {
    this.twitterApi          = twitterApi;
    this.stringHelper        = stringHelper;
    this.pncUnreactedReplies = pncUnreactedReplies;
    this.pncActiveAccounts   = pncActiveAccounts;
    this.pncPointLogs        = pncPointLogs;
    this.pncPointHelper      = pncPointHelper;

    const primeList = calcPrime();
    this.check = getSmallestDivisor.bind(this, primeList);
  }

  /**
   * 「チャレンジ」およびそれに類するリプによる反応。
   */
  handleChallengeReply(tweet, account) {
    const { statusId, text, createdAt } = tweet;
    const { screenName, botConfig } = account;

    const isChallengeReply =
      text.indexOf(`@${screenName}`) > -1 &&
      _.some(botConfig.challengeTriggerKeywordList.map(keyword =>
        text.indexOf(keyword) > -1
      ));

    if (! isChallengeReply) {
      return false;
    } else {
      // チャレンジリプを受けると、
      // クソリプ機能をオンにする。
      // TODO: フォローされているアカウントからのみ受け付ける
      this.pncActiveAccounts.activate(tweet.user.twitterId);

      const number = parseInt(moment(createdAt).format(NUMBER_FORMAT), 10);
      const date = moment(createdAt).format(DATE_FORMAT);

      const result = this.check(number);
      if (result === -1) {
        // 素数の時
        // 獲得する素数ポイントを計算。
        this.pncPointHelper.obtainPoint(tweet.user.twitterId, tweet.statusId, number, this.pncPointLogs.POINT_CHALLENGE)
          .then(point => {
            const params = { screenName: tweet.user.screenName, date, number, point };

            if (point > 0) {
              return this.stringHelper.format(botConfig.challengeReplySuccessWithPoint, params);
            } else {
              return this.stringHelper.format(botConfig.challengeReplySuccess, params);
            }
          })
          .then(message => {
            // 返信する
            return this.twitterApi.reply(account, statusId, message);
          });
      } else {
        // 素数じゃない時
        const params = { screenName: tweet.user.screenName, date, number, divisor: result };
        const message = this.stringHelper.format(botConfig.challengeReplyFailure, params);
        this.twitterApi.reply(account, statusId, message);
      }

      return true;
    }
  }

  /**
   * 数字ツイートに対する反応。
   */
  handleNumberReply(tweet, account) {
    const { statusId, text } = tweet;
    const { screenName, botConfig } = account;

    const twitterApi = this.twitterApi;
    const stringHelper = this.stringHelper;

    const tweetBody = text.replace(/@[a-zA-Z0-9_]+/g, "").trim();

    const isNumberReply =
      text.indexOf(`@${screenName}`) > -1 &&
      tweetBody.match(new RegExp(botConfig.numberReplyTargetRegexp));

    if (! isNumberReply) {
      return false;
    } else {
      const number = parseInt(tweetBody, 10);
      const specialReply = botConfig.numberReplySpecial[number];
      if (specialReply) {
        // 特別な反応をする特定の数字について。
        twitterApi.reply(account, statusId, stringHelper.format(specialReply, { screenName: tweet.user.screenName }));
        return true;
      } else if (number < 2) {
        // 1 や負の数などは反応しない
        return false;
      } else {
        const numberStr = number.toString();
        const isImmu = _.some(botConfig.numberReplyImmuKeywordList, key => numberStr.indexOf(key) > -1);
        const result = this.check(number);

        if (result === -1) {
          // 素数の時。
          // ポイント計算を行う。
          this.pncPointHelper.obtainPoint(tweet.user.twitterId, tweet.statusId, number, this.pncPointLogs.POINT_NUMBER)
            .then(point => {
              const params = { screenName: tweet.user.screenName, number, point };
              if (point > 0) {
                if (isImmu) {
                  return stringHelper.format(botConfig.numberReplySuccessImmuWithPoint, params);
                } else {
                  return stringHelper.format(botConfig.numberReplySuccessWithPoint, params);
                }
              } else {
                if (isImmu) {
                  return stringHelper.format(botConfig.numberReplySuccessImmu, params);
                } else {
                  return stringHelper.format(botConfig.numberReplySuccess, params);
                }
              }
            })
            .then(message => twitterApi.reply(account, statusId, message));
        } else {
          // 素数じゃない時
          const params = { screenName: tweet.user.screenName, number, divisor: result };
          let messageTemplate;
          if (!isImmu) {
            messageTemplate = botConfig.numberReplyFailure;
          } else if (result < 10) {
            messageTemplate = botConfig.numberReplyFailureImmu1;
          } else if (result < 100) {
            messageTemplate = botConfig.numberReplyFailureImmu2;
          } else if (result < 1000) {
            messageTemplate = botConfig.numberReplyFailureImmu3;
          } else if (result < 10000) {
            messageTemplate = botConfig.numberReplyFailureImmu4;
          } else {
            messageTemplate = botConfig.numberReplyFailureImmu5;
          }

          twitterApi.reply(account, statusId, stringHelper.format(messageTemplate, params));
        }
        return true;
      }
    }
  }

  /*
   * ツイートの時刻を見て、
   * クソリプ送信対象ならクソリプを送る。
   * クソリプを送った場合は、その情報をDBに入れる。
   */
  handleTweetTime(tweet, account) {
    const { statusId, createdAt } = tweet;
    const { botConfig } = account;

    if (tweet.user.twitterId === account.twitterId) {
      // そもそも自分自身のツイートには何もしない
      return false;
    } else {

      const number = parseInt(moment(createdAt).format(NUMBER_FORMAT), 10);
      const date = moment(createdAt).format(DATE_FORMAT);

      const result = this.check(number);
      if (result !== -1) {
        // 素数じゃないので何もしない
        return false;
      } else {
        const twitterId = tweet.user.twitterId;

        // アクティブかどうかをチェック
        this.pncActiveAccounts.isActive(twitterId)
          .then(isActive => {
            // アクティブな場合のみポイントを加算
            if (isActive) {
              return this.pncPointHelper.obtainPoint(twitterId, tweet.statusId, number, this.pncPointLogs.POINT_TL)
                .then(point => {
                  return { isActive, point };
                });
            } else {
              return Promise.resolve({ isActive, point: 0 });
            }
          })
          .then(({ point, isActive }) => {
            if (isActive) {
              // クソリプ送信
              const params = {
                screenName: tweet.user.screenName,
                date      : date,
                number    : number,
                point     : point,
              };
              const message = point > 0 ? (
                this.stringHelper.format(botConfig.dirtyReplyWithPoint, params)
              ) : (
                this.stringHelper.format(botConfig.dirtyReply, params)
              );

              this.twitterApi.reply(account, statusId, message)
                .then(tweet => {
                  this.pncUnreactedReplies.insert(tweet);
                });
            }
          });
      }
    }
  }
}
