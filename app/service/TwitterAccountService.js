import Inject              from "app/lib/di/Inject";
import TwitterAccounts     from "app/model/TwitterAccounts";
import { serviceName }     from "app/front/service/TwitterAccountService";

@Inject({ twitterAccounts: TwitterAccounts })
export default class TwitterAccountService {
  static injectionName = "TwitterAccountService";
  constructor({ twitterAccounts }) {
    this.twitterAccounts = twitterAccounts;
  }
  name = serviceName
  read(_req, _resource, _params, _config, callback) {
    this.twitterAccounts.listWithAppKey()
      .then(accountWithAppKeyList => {
        callback(null, accountWithAppKeyList);
      })
      .catch(err => callback(err));
  }
  create(_req, _resource, _params, _body, _config, callback) {
    // TwitterAccount.create(body.label, body.consumerKey, body.consumerSecret)
    //   .then(result => callback(null, result))
    //   .catch(err => callback(err));
    callback("Not implemented yet.");
  }
  update(_req, _resource, _params, _body, _config, callback) {
    // TwitterAccount.update(params.id, body.label, body.consumerKey, body.consumerSecret)
    //   .then(result => callback(null, result))
    //   .catch(err => callback(err));
    callback("Not implemented yet.");
  }
  delete(_req, _resource, params, _config, callback) {
    this.twitterAccounts.delete(params.id)
      .then(result => callback(null, result))
      .catch(err => callback(err));
  }
}
