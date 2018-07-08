import { match }           from "react-router";
import { LOCATION_CHANGE } from "react-router-redux";

export default function createDataFetchMiddleware(routes) {
  // ref: http://blog.ryhmrt.com/entry/2016/02/29/183217
  const dataFetchMiddleware = store => next => {
    // Utility method for API call
    function updateDataFromAPI(action) {
      const location = action.payload;
      match({ routes, location }, (error, redirectLocation, renderProps) => {
        if (error || renderProps && ! renderProps.routes) {
          console.error(error.message);
          next(action);
        } else if (redirectLocation || ! renderProps) {
          next(action);
        } else {
          // Find API
          return Promise.all(
            renderProps.routes
              .filter(route => typeof route.action === "function")
              .map(({ action }) => store.dispatch(action(renderProps.params))) // TODO: set params
          ).then(() => next(action));
        }
      });
    }
    // Return core middleware function
    return action => {
      // Fetch data on update location
      if (action.type === LOCATION_CHANGE) {
        return updateDataFromAPI(action);
      } else {
        return next(action);
      }
    };
  };

  return dataFetchMiddleware;
}
