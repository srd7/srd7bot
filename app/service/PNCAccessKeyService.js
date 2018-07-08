import Inject              from "app/lib/di/Inject";

import TwitterApi          from "app/lib/twitter/api";

import Supervisor          from "app/bot/Supervisor";

import BotActions          from "app/model/BotActions";

import PNCAccessKeyHelper  from "app/service/helper/PNCAccessKeyHelper";

import { serviceName }     from "app/front/service/PNCAccessKeyService";

@Inject({
  twitterApi        : TwitterApi,
  supervisor        : Supervisor,
  botActions        : BotActions,
  pncAccessKeyHelper: PNCAccessKeyHelper,
})
export default class PNCAccessKeyService {
  static injectionName = "PNCAccessKeyService";
  constructor({ twitterApi, supervisor, botActions, pncAccessKeyHelper }) {
    this.twitterApi         = twitterApi;
    this.getTwit            = supervisor.getTwit;
    this.botActions         = botActions;
    this.pncAccessKeyHelper = pncAccessKeyHelper;
  }
  name = serviceName;

  read(_req, _resource, params, _config, callback) {
    const { accessKey } = params;
    this.pncAccessKeyHelper.confirmAccessKey(accessKey)
      .then(({ twitterId, botActionId }) => {
        if (!twitterId) {
          callback(null, { isSuccess: false });
        } else {
          return this.botActions.findByIdWithToken(botActionId)
            .then(botAction => {
              const account = this.getTwit(botAction);
              return this.twitterApi.getProfile(account, twitterId);
            })
            .then(profile => callback(null, {
              isSuccess: true,
              twitterId,
              profile,
            }));
        }
      })
      .catch(e => callback(e));
  }
  create(_req, _resource, _params, _body, _config, callback) {
    callback("Not implemented yet.");
  }
  update(_req, _resource, _params, _body, _config, callback) {
    callback("Not implemented yet.");
  }
  delete(_req, _resource, _params, _config, callback) {
    callback("Not implemented yet.");
  }
}
