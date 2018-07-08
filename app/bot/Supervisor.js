import _               from "underscore";
import Twit            from "twit";

import Inject          from "app/lib/di/Inject";

import BotActions      from "app/model/BotActions";
import EventLogs       from "app/model/EventLogs";

import TestScriptBot   from "app/bot/TestScriptBot";
import TestStreamBot   from "app/bot/TestStreamBot";
import FollowRemoveBot from "app/bot/FollowRemoveBot";
import SimpleTweetBot  from "app/bot/SimpleTweetBot";
import SimpleReplyBot  from "app/bot/SimpleReplyBot";
import PNCBot          from "app/bot/PNCBot";
import PNCPointBot     from "app/bot/PNCPointBot";
import CleanBot        from "app/bot/CleanBot";

/**
 * Bot の挙動を管理するクラス。
 * Bot の状態を把握し、開始や停止の処理を行う。
 */
@Inject({
  botActions      : BotActions,
  eventLogs       : EventLogs,
  testScriptBot   : TestScriptBot,
  testStreamBot   : TestStreamBot,
  followRemoveBot : FollowRemoveBot,
  simpleTweetBot  : SimpleTweetBot,
  simpleReplyBot  : SimpleReplyBot,
  pncBot          : PNCBot,
  pncPointBot     : PNCPointBot,
  cleanBot        : CleanBot,
})
export default class Supervisor {
  static injectionName = "Supervisor";
  constructor({
    botActions, eventLogs,
    testScriptBot, testStreamBot,
    followRemoveBot, simpleTweetBot, simpleReplyBot,
    pncBot, pncPointBot,
    cleanBot,
  }) {
    this.botActions = botActions;
    this.eventLogs  = eventLogs;

    this.botList = [
      testScriptBot, testStreamBot,
      followRemoveBot, simpleTweetBot, simpleReplyBot,
      pncBot, pncPointBot,
      cleanBot,
    ];

    this.runningStreamBotList = [];
  }

  getTwit(botActionWithToken) {
    const twit = new Twit({
      consumer_key       : botActionWithToken.consumerKey,
      consumer_secret    : botActionWithToken.consumerSecret,
      access_token       : botActionWithToken.accessToken,
      access_token_secret: botActionWithToken.accessSecret,
    });

    twit.twitterId   = botActionWithToken.twitterId;
    twit.screenName  = botActionWithToken.screenName;
    twit.consumerKey = botActionWithToken.consumerKey;
    twit.accessToken = botActionWithToken.accessToken;
    twit.botActionId = botActionWithToken.id;
    twit.botConfig   = botActionWithToken.botConfig;

    return twit;
  }

  /*
   * レコードを全件チェックし、
   * botConfig を見て起動時に実行する bot を作動させる。
   */
  start() {
    return this.botActions.listBotWithToken()
      .then(botActionWithTokenList => {
        botActionWithTokenList.forEach(botActionWithToken => {
          if (botActionWithToken.botConfig.startOnBoot) {
            this.startStreamWithLog(botActionWithToken, "Supervisor.start()");
          }
        });
      });
  }

  /**
   * 強制的に Bot の Steraming を開始する。
   */
  startStream(botActionId, trigger) {
    if (this.runningStreamBotList.find(item => item.botActionId === botActionId)) {
      return false;
    } else {
      this.botActions.findByIdWithToken(botActionId)
        .then(botActionWithToken => {
          this.startStreamWithLog(botActionWithToken, trigger);
        });
      return true;
    }
  }

  /**
   * Bot の Streaming を開始し、ログに記録する。
   * 実行すべきかどうかについての判定はここでは行われない。
   */
  startStreamWithLog(botActionWithToken, trigger) {
    const bot = this.botList.find(bot => bot.name === botActionWithToken.botName);
    if (bot && _.isFunction(bot.start)) {
      const twit = this.getTwit(botActionWithToken);
      // Bot を開始
      const stream = bot.start(twit);
      const botKey = `${bot.name} - @${botActionWithToken.screenName}`;
      // 稼働中 bot 一覧に入れる
      this.runningStreamBotList.push({ botActionId: botActionWithToken.id, botKey, stream });
      // 開始ログを記入
      this.eventLogs.insert("START_STREAM", trigger, botKey);
    }
  }

  /**
   * 強制的に Bot の Streaming を停止する。
   */
  stopStream(botActionId, trigger) {

    const runningBotIndex = _.findIndex(this.runningStreamBotList, item =>
      item.botActionId === botActionId
    );

    if (runningBotIndex === -1) {
      return false;
    } else {
      const { botKey, stream } = this.runningStreamBotList[runningBotIndex];
      // Bot を停止。
      // TwitterApi 側のキャッシュを破棄するためにメッセージを使う。
      stream.emit("stop");
      stream.stop();
      // 稼働中 bot 一覧から除外
      this.runningStreamBotList.splice(runningBotIndex, 1);
      // 終了ログを記入
      this.eventLogs.insert("STOP_STREAM", trigger, botKey);

      return true;
    }
  }

  /*
   * レコードを全件チェックし、
   * botConfig を見て現在実行すべき bot を実行する。
   */
  run(trigger = "Supervisor.run()") {
    return this.botActions.listBotWithToken()
      .then(botActionWithTriggerList => {
        botActionWithTriggerList.forEach(botActionWithTrigger => {
          // TODO: botConfig のチェック
          this.runScriptWithLog(botActionWithTrigger, trigger);
        });
      })
      .catch(e => console.error(e));
  }

  /**
   * 強制的に Bot の Script を実行する。
   */
  runScript(botActionId, trigger) {
    this.botActions.findByIdWithToken(botActionId)
      .then(botActionWithToken => {
        this.runScriptWithLog(botActionWithToken, trigger);
      });
    return true;
  }

  /**
   * Bot の Script を開始し、ログに記録する。
   * 実行すべきかどうかについての判定はここでは行われない。
   */
  runScriptWithLog(botActionWithToken, trigger) {
    const bot = this.botList.find(bot => bot.name === botActionWithToken.botName);
    if (bot && _.isFunction(bot.run)) {
      const twit = this.getTwit(botActionWithToken);
      // スクリプト実行
      bot.run(twit, trigger);
      // 実行ログを記入
      this.eventLogs.insert("RUN_SCRIPT", trigger, `${bot.name} - @${botActionWithToken.screenName}`);
    }
  }

  /**
   * Bot List のうち、
   * Bot 本体の情報のみをオブジェクト化して返す
   */
  getBotList() {
    return this.botList.map(({ name, description, configTemplate, run, start }) => {
      return {
        name, description, configTemplate,
        isScript: _.isFunction(run),
        isStream: _.isFunction(start),
      };
    });
  }

  /**
   * 現在動作中の Stream bot の id 一覧を取得する。
   */
  getRunningStreamBotIdList() {
    return this.runningStreamBotList.map(item => item.botActionId);
  }
}
