import Inject              from "app/lib/di/Inject";
import BotActions          from "app/model/BotActions";
import { serviceName }     from "app/front/service/BotJobService";

@Inject({ botActions: BotActions })
export default class BotJobService {
  static injectionName = "BotActionService";
  constructor({ botActions }) {
    this.botActions = botActions;
  }
  name = serviceName;
  read(_req, _resource, _params, _config, callback) {
    this.botActions.list()
      .then(botActios => {
        callback(null, botActios);
      })
      .catch(err => callback(err));
  }
  create(_req, _resource, _params, body, _config, callback) {
    this.botActions.create(body.twitterAccountId, body.botName, body.config)
      .then(result => callback(null, result))
      .catch(err => callback(err));
  }
  update(_req, _resource, params, body, _config, callback) {
    this.botActions.update(params.id, body.twitterAccountId, body.botName, body.config)
      .then(result => callback(null, result))
      .catch(err => callback(err));
  }
  delete(_req, _resource, params, _config, callback) {
    this.botActions.delete(params.id)
      .then(result => callback(null, result))
      .catch(err => callback(err));
  }
}
