import update             from "react-addons-update";
import PNCPointLogMessage from "app/front/message/PNCPointLogMessage";

const initialState = {
  pointLogList  : [],
  loadedPageList: [],
  hasNext       : false,
  aggregatedAt  : null,
  isInvalid     : false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case PNCPointLogMessage.SET_INITIAL_POINT: {
      return {
        pointLogList  : action.pointLogList,
        loadedPageList: [action.page],
        hasNext       : action.hasNext,
        aggregatedAt  : action.aggregatedAt,
        isInvalid     : false,
      };
    }
    case PNCPointLogMessage.LOAD_NEXT_POINT: {
      if (state.aggregatedAt !== action.aggregatedAt) {
        return update(state, {
          isInvalid: { $set: true },
        });
      } else {
        return update(state, {
          pointLogList  : { $push: action.pointLogList },
          loadedPageList: { $push: [action.page] },
          hasNext       : { $set: action.hasNext },
        });
      }
    }
    default: {
      return state;
    }
  }
};
