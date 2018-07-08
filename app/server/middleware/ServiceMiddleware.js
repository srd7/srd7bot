import express               from "express";
import Fetchr                from "fetchr";

import Inject                from "app/lib/di/Inject";

import CounterService        from "app/service/CounterService";
import TwitterClientService  from "app/service/TwitterClientService";
import TwitterAccountService from "app/service/TwitterAccountService";
import BotJobService         from "app/service/BotJobService";
import BotService            from "app/service/BotService";
import PNCAccessKeyService   from "app/service/PNCAccessKeyService";
import PNCPointLogService    from "app/service/PNCPointLogService";

@Inject({
  counterService       : CounterService,
  twitterClientService : TwitterClientService,
  twitterAccountService: TwitterAccountService,
  botJobService        : BotJobService,
  botService           : BotService,
  pncAccessKeyService  : PNCAccessKeyService,
  pncPointLogService   : PNCPointLogService,
})
export default class ServiceMiddleware {
  static injectionName = "ServiceMiddleware";
  constructor({
    counterService,
    twitterClientService,
    twitterAccountService,
    botJobService,
    botService,
    pncAccessKeyService,
    pncPointLogService,
  }) {
    const fetchrMiddleware = express();

    Fetchr.registerService(counterService);
    Fetchr.registerService(twitterClientService);
    Fetchr.registerService(twitterAccountService);
    Fetchr.registerService(botJobService);
    Fetchr.registerService(botService);
    Fetchr.registerService(pncAccessKeyService);
    Fetchr.registerService(pncPointLogService);

    fetchrMiddleware.use("/api", Fetchr.middleware());

    this.middleware = fetchrMiddleware;
  }
}
