import BotJobMessage from "app/front/message/BotJobMessage";
import BotJobService from "app/front/service/BotJobService";

import {
  initialize as initializeTwitterAccount,
}                    from "app/front/action/TwitterAccountAction";
import {
  initialize     as initializeBot,
  runScriptBot   as botActionRunScriptBot,
  startStreamBot as botActionStartStreamBot,
  stopStreamBot  as botActionStopStreamBot,
}                    from "app/front/action/BotAction";

function initializeBotAction(params) {
  return (dispatch, getState) => {
    return BotJobService.read(getState, params)
      .then(({ data: botJobList }) => dispatch({
        type: BotJobMessage.SET_BOT_JOBS,
        botJobList,
      }));
  };
}

export function initialize(params) {
  return (dispatch, getState) => Promise.all([
    initializeBotAction(params)(dispatch, getState),
    initializeTwitterAccount(params)(dispatch, getState),
    initializeBot(params)(dispatch, getState),
  ]);
}

export function createBotAction({ twitterAccountId, botName, config }) {
  const body = { twitterAccountId, botName, config };
  return (dispatch, getState) => {
    return BotJobService.create(getState, {}, body)
      .then(({ data: botJob }) => dispatch({
        type: BotJobMessage.CREATE_BOT_JOB,
        botJob,
      }));
  };
}

export function updateBotAction({ id, twitterAccountId, botName, config }) {
  const params = { id };
  const body = { twitterAccountId, botName, config };
  return (dispatch, getState) => {
    return BotJobService.update(getState, params, body)
      .then(() => dispatch({
        type  : BotJobMessage.UPDATE_BOT_JOB,
        botJob: { id, twitterAccountId, botName, config },
      }));
  };
}

export function deleteBotAction({ id }) {
  const params = { id };
  return (dispatch, getState) => {
    return BotJobService.delete(getState, params)
      .then(() => dispatch({
        type: BotJobMessage.DELETE_BOT_JOB,
        id,
      }));
  };
}

export function runScriptBot(id) {
  return botActionRunScriptBot(id);
}

export function startStreamBot(id) {
  return botActionStartStreamBot(id);
}

export function stopStreamBot(id) {
  return botActionStopStreamBot(id);
}
