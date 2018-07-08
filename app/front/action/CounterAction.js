import CounterMessage from "app/front/message/CounterMessage";
import CounterService from "app/front/service/CounterService";

export function initialize(params) {
  return (dispatch, getState) => {
    return CounterService.read(getState, params)
      .then(({ data }) => dispatch({
        type : CounterMessage.SET_COUNTER,
        count: data.count,
      }));
  };

}

export function increment() {
  return (dispatch, getState) => {
    return CounterService.update(getState, { type: "increment" })
      .then(({ data }) => dispatch({
        type : CounterMessage.SET_COUNTER,
        count: data.count,
      }))
      .catch(err => {
        console.error(err);
      });
  };
}

export function decrement() {
  return (dispatch, getState) => {
    return CounterService.update(getState, { type: "decrement" })
      .then(({ data }) => dispatch({
        type : CounterMessage.SET_COUNTER,
        count: data.count,
      }))
      .catch(err => {
        console.error(err);
      });
  };
}
