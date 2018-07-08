import AuthMessage from "app/front/message/AuthMessage";

export function setToken(token) {
  return {
    type: AuthMessage.SET_CSRF,
    token,
  };
}
