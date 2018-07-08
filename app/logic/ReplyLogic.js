// import _                  from "underscore";

import Inject             from "app/lib/di/Inject";

import TwitterApi         from "app/lib/twitter/api";
import TwitterModel       from "app/lib/twtter/model";

@Inject({
  twitterApi  : TwitterApi,
  twitterModel: TwitterModel,
})
export default class ReplyLogic {
  static injectionName = "ReplyLogic";
  constructor({ twitterApi, twitterModel }) {
    this.twitterApi   = twitterApi;
    this.twitterModel = twitterModel;
  }
}
