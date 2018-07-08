import Fetchr from "fetchr";

function createFetchr(getState) {
  return new Fetchr({
    xhrPath: "/api",
    context: {
      _csrf: getState().auth.token,
    },
  });
}

export default function createService(serviceName) {
  return {
    read: (getState, param) => createFetchr(getState).read(serviceName, param),
    create: (getState, param, body) => createFetchr(getState).create(serviceName, param, body),
    update: (getState, param, body) => createFetchr(getState).update(serviceName, param, body),
    delete: (getState, param) => createFetchr(getState).delete(serviceName, param),
  };
}
