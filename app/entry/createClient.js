import React                      from "react";
import { hydrate }                from "react-dom";
import { Provider }               from "react-redux";
import { Router, browserHistory } from "react-router";
import { syncHistoryWithStore }   from "react-router-redux";

export default function clientClient(routes, configureStore) {
  const preloadedState = window.data;
  const store = configureStore(preloadedState);
  const history = syncHistoryWithStore(browserHistory, store);


  hydrate(
    <Provider store={store}>
      <Router history={history} routes={routes} />
    </Provider>,
    document.getElementById("app"),
  );
}
