import CounterMessage from "app/front/message/CounterMessage";

export default (state = 0, action) => {
  switch (action.type) {
    case CounterMessage.SET_COUNTER: return action.count;
    default                        : return state;
  }
};
