import _                    from "underscore";
import update               from "react-addons-update";
import TwitterClientMessage from "app/front/message/TwitterClientMessage";

export default (state = [], action) => {
  switch (action.type) {
    case TwitterClientMessage.SET_CLIENTS: {
      // 一番最初の一覧読み込み
      return action.twitterClientList;
    }
    case TwitterClientMessage.CREATE_CLIENT: {
      // TwitterClient を新規作成時
      return state.concat([action.twitterClient]);
    }
    case TwitterClientMessage.UPDATE_CLIENT: {
      // TwitterClient を編集時
      const index = _.findIndex(state, twitterClient => twitterClient.id === action.twitterClient.id);
      return update(state, { [index]: { $set: action.twitterClient } });
    }
    case TwitterClientMessage.DELETE_CLIENT: {
      // TwitterClient を削除時
      const index = _.findIndex(state, twitterClient => twitterClient.id === action.id);
      return update(state, { $splice: [[index, 1]] });
    }
    default: {
      return state;
    }
  }
};
