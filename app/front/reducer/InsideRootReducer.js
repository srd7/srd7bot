import { combineReducers } from "redux";
import { routerReducer }   from "react-router-redux";

import auth                from "app/front/reducer/AuthReducer";
import counter             from "app/front/reducer/CounterReducer";
import twitterClient       from "app/front/reducer/TwitterClientReducer";
import twitterAccount      from "app/front/reducer/TwitterAccountReducer";
import botJob              from "app/front/reducer/BotJobReducer";
import bot                 from "app/front/reducer/BotReducer";

export default combineReducers({
  routing: routerReducer,
  auth,
  counter,
  twitterClient,
  twitterAccount,
  botJob,
  bot,
});
