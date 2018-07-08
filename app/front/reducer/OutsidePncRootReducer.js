import { combineReducers } from "redux";
import { routerReducer }   from "react-router-redux";

import auth                from "app/front/reducer/AuthReducer";
import pncAccessKey        from "app/front/reducer/PNCAccessKeyReducer";
import pncPointLog         from "app/front/reducer/PNCPointLogReducer";

export default combineReducers({
  routing: routerReducer,
  auth,
  pncAccessKey,
  pncPointLog,
});
