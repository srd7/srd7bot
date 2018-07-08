import Inject        from "app/lib/di/Inject";

import TwitterApi    from "app/lib/twitter/api";
import EventRegulators from "app/model/EventRegulators";
import { ScriptBot } from "app/bot";

@Inject({
  twitterApi     : TwitterApi,
  eventRegulators: EventRegulators,
})
export default class CleanBot extends ScriptBot {
  static injectionName = "CleanBot";
  name = "CleanBot";
  description = "clean bot";

  constructor({ twitterApi, eventRegulators }) {
    super();
    this.twitterApi      = twitterApi;
    this.eventRegulators = eventRegulators;
  }

  run(_account, _trigger) {
    const key = "CLEAN_BOT";
    this.eventRegulators.canExecuteDay(key)
      .then(canTweet => {
        if (canTweet) {
          this.eventRegulators.removeOld(30);
        }
      });
  }
}
