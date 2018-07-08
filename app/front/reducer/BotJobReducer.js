import _             from "underscore";
import update        from "react-addons-update";
import BotJobMessage from "app/front/message/BotJobMessage";

export default (state = [], action) => {
  switch (action.type) {
    case BotJobMessage.SET_BOT_JOBS: {
      // 一番最初の一覧読み込み
      return action.botJobList;
    }
    case BotJobMessage.CREATE_BOT_JOB: {
      // BotAction を新規作成時
      return state.concat([action.botJob]);
    }
    case BotJobMessage.UPDATE_BOT_JOB: {
      // BotAction を編集時
      const index = _.findIndex(state, botJob => botJob.id === action.botJob.id);
      return update(state, { [index]: { $set: action.botJob } });
    }
    case BotJobMessage.DELETE_BOT_JOB: {
      // BotAction を削除時
      const index = _.findIndex(state, botJob => botJob.id === action.id);
      return update(state, { $splice: [[index, 1]] });
    }
    default: {
      return state;
    }
  }
};
