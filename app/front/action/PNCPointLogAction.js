import _                  from "underscore";
import PNCPointLogMessage from "app/front/message/PNCPointLogMessage";
import PNCPointLogService from "app/front/service/PNCPointLogService";

export function initialize(params) {
  return (dispatch, getState) => {
    const paramsWithPage = _.extend({}, params, { page: 1 });
    return PNCPointLogService.read(getState, paramsWithPage)
      .then(({ data }) => {
        dispatch({
          type        : PNCPointLogMessage.SET_INITIAL_POINT,
          pointLogList: data.pointLogList,
          page        : 1,
          hasNext     : data.hasNext,
          aggregatedAt: data.aggregatedAt,
        });
      });
  };
}

export function loadNext() {
  return (dispatch, getState) => {
    const { pncAccessKey, pncPointLog } = getState();
    const { accessKey } = pncAccessKey;
    const nextPage = _.max(pncPointLog.loadedPageList) + 1;
    const params = { accessKey, page: nextPage };
    return PNCPointLogService.read(getState, params)
      .then(({ data }) => {
        dispatch({
          type        : PNCPointLogMessage.LOAD_NEXT_POINT,
          pointLogList: data.pointLogList,
          page        : nextPage,
          hasNext     : data.hasNext,
          aggregatedAt: data.aggregatedAt,
        });
      });
  };
}
