import TwitterAccountMessage from "app/front/message/TwitterAccountMessage";
import TwitterAccountService from "app/front/service/TwitterAccountService";

export function initialize(_params) {
  return (dispatch, getState) => {
    return TwitterAccountService.read(getState, {})
      .then(({ data: twitterAccountList }) => dispatch({
        type: TwitterAccountMessage.SET_ACCOUNTS,
        twitterAccountList,
      }));
  };
}

export function deleteAccount(params) {
  return (dispatch, getState) => {
    return TwitterAccountService.delete(getState, params)
      .then(() => dispatch({
        type: TwitterAccountMessage.DELETE_ACCOUNT,
        id: params.id,
      }));
  };
}
