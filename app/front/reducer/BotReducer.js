import update     from "react-addons-update";
import BotMessage from "app/front/message/BotMessage";

export default (state = { botList: [], runningStreamBotIdList: [] }, action) => {
  switch (action.type) {
    case BotMessage.SET_BOTS: {
      // 一番最初の一覧読み込み
      return action.data;
    }
    case BotMessage.START_STREAM_BOT: {
      // ストリーミング開始
      return action.isSuccess? update(state, {
        runningStreamBotIdList: { $push: [action.botJobId] },
      }) : state;
    }
    case BotMessage.STOP_STREAM_BOT: {
      // ストリーミング終了
      return action.isSuccess? update(state, {
        runningStreamBotIdList: {
          $apply: list => list.filter(id => id !== action.botJobId),
        },
      }) : state;
    }
    default: {
      return state;
    }
  }
};
