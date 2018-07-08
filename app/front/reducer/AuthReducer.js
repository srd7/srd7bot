import update      from "react-addons-update";
import AuthMessage from "app/front/message/AuthMessage";

const initialState = {
  token: "",
};

export default function HomeReducer(state = initialState, action) {
  switch (action.type) {
    case AuthMessage.SET_CSRF: return update(state, { token: { $set: action.token }});
    default                  : return state;
  }
}
