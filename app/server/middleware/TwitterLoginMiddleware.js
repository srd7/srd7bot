/**
 * Twitter ログイン実行のミドルウェア。
 */

// ref: http://creator.cotapon.org/articles/node-js/node_js-oauth-twitter
import express         from "express";
import { OAuth }       from "oauth";

import Inject          from "app/lib/di/Inject";

import TwitterClients  from "app/model/TwitterClients";
import TwitterAccounts from "app/model/TwitterAccounts";

@Inject({
  twitterClients : TwitterClients,
  twitterAccounts: TwitterAccounts,
})
export default class TwitterLoginMiddleware {
  static injectionName = "TwitterLoginMiddleware";
  constructor({ twitterClients, twitterAccounts }) {
    this.twitterClients = twitterClients;
    this.twitterAccounts = twitterAccounts;

    const twitterLoginMiddleware = express();

    twitterLoginMiddleware.use("/tw/login/:appId", this.startLogin.bind(this));
    twitterLoginMiddleware.get("/tw/callback"    , this.saveToken.bind(this));

    this.middleware = twitterLoginMiddleware;
  }

  getOAuth(consumerKey, consumerSecret, callbackURL) {
    return new OAuth(
      "https://api.twitter.com/oauth/request_token",
      "https://api.twitter.com/oauth/access_token",
      consumerKey,
      consumerSecret,
      "1.0A",
      callbackURL,
      "HMAC-SHA1"
    );
  }

  startLogin(req, res, _next) {
    const { appId } = req.params;
    this.twitterClients.findById(appId)
      .then(app => {
        const { host } = req.headers;
        const { consumerKey, consumerSecret } = app;
        const callbackURL = "http://" + host + "/tw/callback";

        const oauth = this.getOAuth(consumerKey, consumerSecret, callbackURL);

        oauth.getOAuthRequestToken((err, oauthToken, oauthTokenSecret, results) => {
          if (err) {
            console.error(err);
            res.status(500).send(err.message);
          } else {
            console.log(oauthToken, oauthTokenSecret, results);
            req.session.oauth = {
              appId,
              consumerKey, consumerSecret,
              oauthToken, oauthTokenSecret,
            };
            res.redirect("https://twitter.com/oauth/authenticate?oauth_token=" + oauthToken);
          }
        });
      })
      .catch(err => {
        console.error(err);
        res.status(500).send(err.message);
      });
  }

  saveToken(req, res, _next) {
    const oauthVerifier = req.query.oauth_verifier;
    const {
      appId,
      consumerKey, consumerSecret,
      oauthToken, oauthTokenSecret,
    } = req.session.oauth;

    const oauth = this.getOAuth(consumerKey, consumerSecret, null);

    oauth.getOAuthAccessToken(
      oauthToken, oauthTokenSecret, oauthVerifier,
      (err, accessToken, accessTokenSecret, results) => {
        if (err) {
          console.error(err);
          res.status(500).send(err.message);
        } else {
          // 認証が終わったら自プロフィールのレコード登録を行う。

          const { user_id: twitterId, screen_name: screenName } = results;

          this.twitterAccounts.upsert(twitterId, screenName, accessToken, accessTokenSecret, appId)
            .then(() => res.redirect("/accounts"))
            .catch(err => {
              console.error(err);
              res.status(500).send(err.message);
            });
        }
      }
    );
  }
}
