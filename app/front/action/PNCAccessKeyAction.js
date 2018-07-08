import PNCAccessKeyMessage from "app/front/message/PNCAccessKeyMessage";
import PNCAccessKeyService from "app/front/service/PNCAccessKeyService";

export function confirmAccessKey(params) {
  return (dispatch, getState) => {
    return PNCAccessKeyService.read(getState, params)
      .then(({ data }) => {
        dispatch({
          type     : PNCAccessKeyMessage.CONFIRMATION,
          accessKey: params.accessKey,
          twitterId: data.twitterId,
          profile  : data.profile,
          isSuccess: data.isSuccess,
        });
      });
  };
}
