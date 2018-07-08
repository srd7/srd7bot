import _            from "underscore";

import Inject       from "app/lib/di/Inject";
import Cache        from "app/lib/external/Cache";
import TwitterModel from "app/lib/twitter/model";

const env = process.env.NODE_ENV || "develop";
const isDevelop = env === "develop";

// キャッシュの生存時間。
// Twitter API 制限のリセット間隔である 15 分とする。
const LIMIT_15_MIN = 900000;

@Inject({ cache: Cache, twitterModel: TwitterModel })
export default class TwitterApi {
  static injectionName = "TwitterApi";
  constructor({ cache, twitterModel }) {
    this.cache = cache;
    this.twitterModel = twitterModel;

    // UserStream の接続については
    // クラスのインスタンスにキャッシュする
    this.userStreams = {};
  }

  debugLog() {
    if (isDevelop) {
      console.log.apply(console, arguments);
    }
  }

  ////////////////////////////////////////////////////////////////
  // GET
  get(account, url, params) {
    const key = url + "-" + JSON.stringify(params);

    return this.cache.get(key).then(data => {
      if (data) {
        this.debugLog("[TwitterApi] Cache found: %s", key);
        return data;
      } else {
        return new Promise((resolve, reject) => {
          account.get(url, params, (err, data) => {
            if (err) {
              reject(err);
            } else {
              this.debugLog(
                "[TwitterApi] GET url: %s, params: %s, result: %s",
                url,
                JSON.stringify(params),
                JSON.stringify(data)
              );
              this.cache.set(key, data, LIMIT_15_MIN);
              // console.log("Set cache: %s", key);
              return resolve(data);
            }
          });
        });
      }
    });
  }

  getProfile(account, userId) {
    return this.get(account, "users/show", { user_id: userId }).then(rawProfile =>
      this.twitterModel.formatProfile(rawProfile)
    );
  }

  getFollowings(account, userId) {
    return this.get(account, "friends/ids", { user_id: userId, count: 5000, stringify_ids: true });
  }

  getFollowers(account, userId) {
    return this.get(account, "followers/ids", { user_id: userId, count: 5000, stringify_ids: true });
  }

  ////////////////////////////////////////////////////////////////
  // POST
  post(account, url, params) {
    return new Promise((resolve, reject) => {
      account.post(url, params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          this.debugLog("[TwitterApi] POST url: %s, params: %s, result: %s",
            url,
            JSON.stringify(params),
            JSON.stringify(data)
          );
          resolve(data);
        }
      });
    });
  }

  tweet(account, status) {
    return this.post(account, "statuses/update", { status: status }).then(rawTweet =>
      this.twitterModel.formatTweet(rawTweet)
    );
  }

  reply(account, statusId, status) {
    return this.post(account, "statuses/update", {
      status               : status,
      in_reply_to_status_id: statusId,
    }).then(rawTweet => this.twitterModel.formatTweet(rawTweet));
  }

  directMessage(account, userId, text) {
    return this.post(account, "direct_messages/new", { user_id: userId, text })
      .then(rawTweet => this.twitterModel.formatTweet(rawTweet));
  }

  deleteTweet(account, statusId) {
    return this.post(account, "statuses/destroy/:id", {
      id: statusId,
    }).then(rawTweet => this.twitterModel.formatTweet(rawTweet));
  }

  follow(account, userId) {
    return this.post(account, "friendships/create", { user_id: userId });
  }

  remove(account, userId) {
    return this.post(account, "friendships/destroy", { user_id: userId });
  }

  ////////////////////////////////////////////////////////////////
  // UserStream
  connectUserStream(account, botName, reply = false) {
    const key = botName + account.twitterId + account.accessToken;

    if (! this.userStreams[key]) {
      const params = _.assign(
        { stringify_friend_ids: true },
        reply? { replies: "all" } : {},
      );
      const stream = account.stream("user", params);

      this.userStreams[key] = stream;

      stream.on("connected", () => {
        console.log(`@${account.screenName} connected to user stream.`);
      });

      //
      stream.on("stop", () => {
        console.log(`@${account.screenName} disconnect from user stream.`);
        delete this.userStreams[key];
        stream.stop();
      });

      stream.on("error", (err) => console.error(err));
    }

    return this.userStreams[key];
  }
}
