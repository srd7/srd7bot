import { connect }               from "react-redux";

export const withCurrentPath = connect(state => {
  const { locationBeforeTransitions: loc } = state.routing;
  return { currentPath: loc && loc.pathname };
});

export const withPNCAccessKey = connect(state => {
  const { accessKey, twitterId, profile, isSuccess } = state.pncAccessKey;
  return { accessKey, twitterId, profile, isSuccess };
});
