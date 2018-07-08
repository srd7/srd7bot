import TwitterClientMessage from "app/front/message/TwitterClientMessage";
import TwitterClientService from "app/front/service/TwitterClientService";

export function initialize(_params) {
  return (dispatch, getState) => {
    return TwitterClientService.read(getState, TwitterClientService, {})
      .then(({ data: twitterClientList }) => dispatch({
        type: TwitterClientMessage.SET_CLIENTS,
        twitterClientList,
      }));
  };
}

export function createClient({ label, consumerKey, consumerSecret }) {
  const body = { label, consumerKey, consumerSecret };
  return (dispatch, getState) => {
    return TwitterClientService.create(getState, {}, body)
      .then(({ data: twitterClient }) => dispatch({
        type: TwitterClientMessage.CREATE_CLIENT,
        twitterClient,
      }));
  };
}

export function updateClient({ id, label, consumerKey, consumerSecret }) {
  const params = { id };
  const body = { label, consumerKey, consumerSecret };
  return (dispatch, getState) => {
    return TwitterClientService.update(getState, params, body)
      .then(() => dispatch({
        type         : TwitterClientMessage.UPDATE_CLIENT,
        twitterClient: { id, label, consumerKey, consumerSecret },
      }));
  };
}

export function deleteClient({ id }) {
  const params = { id };
  return (dispatch, getState) => {
    return TwitterClientService.delete(getState, params)
      .then(() => dispatch({
        type: TwitterClientMessage.DELETE_CLIENT,
        id,
      }));
  };
}
