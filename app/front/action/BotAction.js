import BotMessage from "app/front/message/BotMessage";
import BotService from "app/front/service/BotService";

export function initialize(params) {
  return (dispatch, getState) => {
    return BotService.read(getState, params)
      .then(({ data: { botList, runningStreamBotIdList } }) => dispatch({
        type: BotMessage.SET_BOTS,
        data: { botList, runningStreamBotIdList },
      }));
  };
}

export function runScriptBot(botJobId) {
  const params = { type: "run-script", botJobId };
  return (dispatch, getState) => {
    return BotService.create(getState, params, {})
      .then(({ data: isSuccess }) => dispatch({
        type: BotMessage.RUN_SCRIPT_BOT,
        isSuccess, botJobId,
      }));
  };
}

export function startStreamBot(botJobId) {
  const params = { type: "start-stream", botJobId };
  return (dispatch, getState) => {
    return BotService.create(getState, params, {})
      .then(({ data: isSuccess }) => dispatch({
        type: BotMessage.START_STREAM_BOT,
        isSuccess, botJobId,
      }));
  };
}

export function stopStreamBot(botJobId) {
  const params = { type: "stop-stream", botJobId };
  return (dispatch, getState) => {
    return BotService.create(getState, params, {})
      .then(({ data: isSuccess }) => dispatch({
        type: BotMessage.STOP_STREAM_BOT,
        isSuccess, botJobId,
      }));
  };
}
