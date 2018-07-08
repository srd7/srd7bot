import moment          from "moment";

import Inject          from "app/lib/di/Inject";

import TwitterApi      from "app/lib/twitter/api";
import EventRegulators from "app/model/EventRegulators";
import ConfigLogic     from "app/logic/ConfigLogic";
import { ScriptBot }   from "app/bot";

/**
 * とりあえず簡単のために毎日同じツイートをつぶやくだけの bot。
 * 同じ日に1回しかツイートしないようには調整する。
 */
@Inject({
  twitterApi     : TwitterApi,
  eventRegulators: EventRegulators,
  configLogic    : ConfigLogic,
})
export default class SimpleTweetBot extends ScriptBot {
  static injectionName = "SimpleTweetBot";
  name = "SimpleTweetBot";
  description = "Simple tweet bot";
  configTemplate = {
    contents: [
      { tweet: "Hello!", time: { $hour: { $eq: 12 } } },
    ],
  };

  constructor({ twitterApi, eventRegulators, configLogic }) {
    super();
    this.twitterApi      = twitterApi;
    this.eventRegulators = eventRegulators;
    this.configLogic     = configLogic;
  }

  run(account, _trigger) {
    const contentList = account.botConfig.contents;

    const conditionFunc = this.configLogic.getCheckConditionFunc(null, moment());

    const tweetableContentList = contentList
      .filter(({ time }) => conditionFunc(time));

    // とりあえず先頭のみ
    const { tweet } = tweetableContentList[0] || {};

    if (tweet) {
      const key = `SIMPLE_TWEET_BOT--${account.twitterId}`;
      this.eventRegulators.canExecuteDay(key)
        .then(canTweet => {
          if (canTweet) {
            this.twitterApi.tweet(account, tweet)
              .then(() => {
                this.eventRegulators.execute(key);
              });
          }
        });
    }
  }
}
