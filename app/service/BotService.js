import Inject              from "app/lib/di/Inject";
import Supervisor          from "app/bot/Supervisor";
import { serviceName }     from "app/front/service/BotService";

@Inject({ supervisor: Supervisor })
export default class BotService {
  static injectionName = "BotService";
  constructor({ supervisor }) {
    this.supervisor = supervisor;
  }
  name = serviceName;
  read(_req, _resource, _params, _config, callback) {
    callback(null, {
      botList               : this.supervisor.getBotList(),
      runningStreamBotIdList: this.supervisor.getRunningStreamBotIdList(),
    });
  }
  /**
   * Create に Bot の実行等の処理を記述する。
   * イメージ的にはイベントの create。
   */
  create(_req, _resource, params, _body, _config, callback) {
    const supervisor = this.supervisor;
    const { type, botJobId } = params;
    const trigger = "BotService.create()";
    switch (type) {
      case "run-script"  : {
        return callback(null, supervisor.runScript(botJobId, trigger));
      }
      case "start-stream": {
        return callback(null, supervisor.startStream(botJobId, trigger));
      }
      case "stop-stream" : {
        return callback(null, supervisor.stopStream(botJobId, trigger));
      }
      default: {
        return callback(`Unknown message type "${type}"`);
      }
    }
  }

  update(_req, _resource, _params, _body, _config, callback) {
    callback("Not implemented yet.");
  }

  delete(_req, _resource, _params, _config, callback) {
    callback("Not implemented yet.");
  }
}
