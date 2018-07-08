import TwitterAccountMessage from "app/front/message/TwitterAccountMessage";

export default (state = [], action) => {
  switch (action.type) {
    case TwitterAccountMessage.SET_ACCOUNTS: {
      // 一番最初の一覧読み込み
      return action.twitterAccountList;
    }
    case TwitterAccountMessage.DELETE_ACCOUNT: {
      console.log(state, action);
      return state.filter(account => account.id !== action.id);
    }
    default: {
      return state;
    }
  }
};
