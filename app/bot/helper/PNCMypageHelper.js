import _                   from "underscore";

import Inject              from "app/lib/di/Inject";

import Cache               from "app/lib/external/Cache";

import TwitterApi          from "app/lib/twitter/api";

import StringHelper        from "app/helper/StringHelper";
import RandomHelper        from "app/helper/RandomHelper";

import PNCAccessKeys       from "app/model/PNCAccessKeys";

const BASE_URL = process.env.BOT_BASE_URL;
const LIMIT_24_HOUR = 86400000;

/**
 * 「マイページ」リプに対する処理。
 */
@Inject({
  cache        : Cache,
  twitterApi   : TwitterApi,
  stringHelper : StringHelper,
  randomHelper : RandomHelper,
  pncAccessKeys: PNCAccessKeys,
})
export default class PNCMypageHelper {
  static injectionName = "PNCMypageHelper";

  constructor({ cache, twitterApi, stringHelper, randomHelper, pncAccessKeys }) {
    this.cache         = cache;
    this.twitterApi    = twitterApi;
    this.stringHelper  = stringHelper;
    this.randomHelper  = randomHelper;
    this.pncAccessKeys = pncAccessKeys;
  }

  handleMypageReply(tweet, account) {
    const { text, user } = tweet;
    const { screenName, botConfig } = account;

    const isMypageReply =
      text.indexOf(`@${screenName}`) > -1 &&
      _.some(botConfig.mypageTriggerKeywordList.map(keyword =>
        text.indexOf(keyword) > -1
      ));

    if (! isMypageReply) {
      return false;
    } else {
      const { twitterId } = user;
      this.twitterApi.getProfile(account, twitterId).then(profile => {
        if (profile.following) {
          const key = `PNCBot-handleMypageReply-${twitterId}`;
          // キャッシュがある場合は、マイページを通知したばかりなので何もしない
          this.cache.get(key).then(data => {
            if (! data) {
              const accessKey = this.randomHelper.randomUUID();
              this.pncAccessKeys.insert(twitterId, accessKey, account.botActionId)
                .then(() => {
                  const params = {
                    url: `${BASE_URL}pnc/mypage/${accessKey}`,
                  };
                  return this.stringHelper.format(botConfig.mypageMessage, params);
                })
                .then(message => {
                  // DM送信
                  console.log(message);
                  return this.twitterApi.directMessage(account, twitterId, message);
                })
                .then(() => {
                  // キャッシュのセット
                  this.cache.set(key, 1, LIMIT_24_HOUR);
                });
            }
          });
        }
      });
      return true;
    }
  }
}
