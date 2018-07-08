import Inject          from "app/lib/di/Inject";
import { serviceName } from "app/front/service/CounterService";

@Inject()
export default class CounterService {
  static injectionName = "CounterService";
  constructor() {
    this.count = 0;
  }
  name = serviceName
  read(_req, _resource, _params, _config, callback) {
    // TODO: Promise にしたいけど無理っぽい
    // ref: https://github.com/yahoo/fetchr/issues/111
    callback(null, { count: this.count });
  }
  update(_req, _resource, params, _body, _config, callback) {
    switch(params.type) {
      case "increment": this.count += 1; break;
      case "decrement": this.count -= 1; break;
      default         :             break;
    }
    callback(null, { count: this.count });
  }
}
