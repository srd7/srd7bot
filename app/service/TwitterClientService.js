import Inject          from "app/lib/di/Inject";
import TwitterClients  from "app/model/TwitterClients";
import { serviceName } from "app/front/service/TwitterClientService";

@Inject({ twitterClients: TwitterClients })
export default class TwitterClientService {
  static injectionName = "TwitterClientService";
  constructor({ twitterClients }) {
    this.twitterClients = twitterClients;
  }
  name = serviceName
  read(_req, _resource, _params, _config, callback) {
    this.twitterClients.list()
      .then(apps => callback(null, apps))
      .catch(err => callback(err));
  }
  create(_req, _resource, _params, body, _config, callback) {
    this.twitterClients.create(body.label, body.consumerKey, body.consumerSecret)
      .then(result => callback(null, result))
      .catch(err => callback(err));
  }
  update(_req, _resource, params, body, _config, callback) {
    this.twitterClients.update(params.id, body.label, body.consumerKey, body.consumerSecret)
      .then(result => callback(null, result))
      .catch(err => callback(err));
  }
  delete(_req, _resource, params, _config, callback) {
    this.twitterClients.delete(params.id)
      .then(result => callback(null, result))
      .catch(err => callback(err));
  }
}
