import Inject        from "app/lib/di/Inject";

import TwitterApi    from "app/lib/twitter/api";
import { ScriptBot } from "app/bot";

@Inject({ twitterApi: TwitterApi })
export default class TestScriptBot extends ScriptBot {
  static injectionName = "TestScriptBot";
  name = "TestScriptBot";
  description = "Test script bot";

  constructor({ twitterApi }) {
    super();
    this.twitterApi  = twitterApi;
  }

  run(account, _trigger) {
    this.twitterApi.tweet(account, "Test");
    console.log(account);
    console.log(Object.keys(account));
  }
}
