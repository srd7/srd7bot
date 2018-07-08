class Bot {
  name = "BotName";
  description = "Bot description";
  configTemplate = {};
}

export class ScriptBot extends Bot {
  name = "ScriptBot";
  description = "Script bot description";

  run() {
    throw "ScriptBot must have `run` method.";
  }
}

export class StreamBot extends Bot {
  name = "StreamBot";
  description = "Stream bot description";
  configTemplate = {
    startOnBoot: true,
  };

  start() {
    throw "StreamBot must have `start` method.";
  }
}
