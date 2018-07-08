import update              from "react-addons-update";
import PNCAccessKeyMessage from "app/front/message/PNCAccessKeyMessage";

const initialState = {
  accessKey: "",
  twitterId: "",
  profile  : {},
  isSuccess: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case PNCAccessKeyMessage.CONFIRMATION: {
      // 一番最初の一覧読み込み
      return update(state, {
        accessKey: { $set: action.accessKey },
        twitterId: { $set: action.twitterId },
        profile  : { $set: action.profile },
        isSuccess: { $set: action.isSuccess },
      });
    }
    default: {
      return state;
    }
  }
};
