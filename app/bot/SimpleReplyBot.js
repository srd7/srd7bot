import Inject        from "app/lib/di/Inject";

import TwitterApi    from "app/lib/twitter/api";
import TwitterModel  from "app/lib/twitter/model";

import { StreamBot } from "app/bot";

@Inject({ twitterApi: TwitterApi, twitterModel: TwitterModel })
export default class SimpleReplyBot extends StreamBot {
  static injectionName = "SimpleReplyBot";
  name = "SimpleReplyBot";
  description = "Reply bot to specific user.";
  configTemplate = {
    targetTwitterIdList: [""],
    replyList: [
      ["^test", "テストです"],
    ],
    isIgnoreReply: true,
  };

  constructor({ twitterApi, twitterModel }) {
    super();
    this.twitterApi   = twitterApi;
    this.twitterModel = twitterModel;
  }

  start(account) {
    const stream = this.twitterApi.connectUserStream(account, this.name);
    const twitterModel = this.twitterModel;

    const { targetTwitterIdList, replyList, isIgnoreReply } = account.botConfig;

    stream.on("tweet", (rawTweet) => {
      const tweet = twitterModel.formatTweet(rawTweet);

      const isRetweet = tweet.retweetedStatus;
      const isReply = tweet.inReplyToStatusId;

      const isTargetUser = targetTwitterIdList.length === 0 || targetTwitterIdList.includes(tweet.user.twitterId);
      const isIgnoredAsReply = isReply && isIgnoreReply;

      if (! isRetweet && ! isIgnoredAsReply && isTargetUser) {
        const reply = this.getReply(replyList, tweet.text);
        if (reply) {
          this.twitterApi.reply(account, tweet.statusId, `@${tweet.user.screenName} ${reply}`);
        }
      }
    });

    return stream;
  }

  getReply(replyList, text) {
    const match = replyList.find(item => text.match(new RegExp(item[0])));
    return match && match[1];
  }
}
