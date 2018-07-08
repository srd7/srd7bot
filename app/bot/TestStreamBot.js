import Inject        from "app/lib/di/Inject";

import TwitterApi    from "app/lib/twitter/api";
import TwitterModel  from "app/lib/twitter/model";

import { StreamBot } from "app/bot";

@Inject({ twitterApi: TwitterApi, twitterModel: TwitterModel })
export default class TestStreamBot extends StreamBot {
  static injectionName = "TestStreamBot";
  name = "TestStreamBot";
  description = "Test stream bot";

  constructor({ twitterApi, twitterModel }) {
    super();
    this.twitterApi   = twitterApi;
    this.twitterModel = twitterModel;
  }

  start(account) {
    const stream = this.twitterApi.connectUserStream(account, this.name);
    const twitterModel = this.twitterModel;
    stream.on("tweet", (rawTweet) => {
      console.log(rawTweet);
      const tweet = twitterModel.formatTweet(rawTweet);

      if (tweet.retweetedStatus) {
        console.log("***** Retweet *****");
        console.log(tweet.retweetedStatus);
      } else if (tweet.quotedStatus) {
        console.log("***** Quote *****");
        console.log(tweet.quotedStatus);
      } else {
        console.log("***** Tweet *****");
        console.log(tweet);
      }
    });

    stream.on("favorite", (data) => {
      const source = twitterModel.formatProfile(data.source);
      const target = twitterModel.formatProfile(data.target);
      const targetObject = twitterModel.formatTweet(data.target_object);

      console.log("***** favorite *****");
      console.log({ source, target, targetObject });
    });

    stream.on("***** retweeted_retweet *****", (data) => {
      console.log("retweeted_retweet", data);
    });

    stream.on("***** favorited_retweet *****", (data) => {
      console.log("favorited_retweet", data);
    });

    return stream;
  }
}
