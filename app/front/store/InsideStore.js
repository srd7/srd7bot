import { createStore, applyMiddleware } from "redux";
import thunkMiddleware                  from "redux-thunk";
import createLogger                     from "redux-logger";
import { browserHistory }               from "react-router";
import { routerMiddleware }             from "react-router-redux";

import routes                           from "app/front/route/InsideRoute";
import rootReducer                      from "app/front/reducer/InsideRootReducer";
import ceateDataFetchMiddleware         from "app/front/store/createDataFetchMiddleware";

export default function configureStore(preloadedState) {
  const store = createStore(
    rootReducer,
    preloadedState,
    applyMiddleware(
      thunkMiddleware,
      ceateDataFetchMiddleware(routes),
      routerMiddleware(browserHistory),
      createLogger({
        predicate: () => process.env.NODE_ENV !== "production",
      }),
    ),
  );

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept("app/front/reducer/InsideRootReducer", () => {
      store.replaceReducer(rootReducer);
    });
  }

  return store;
}
