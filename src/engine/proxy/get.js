import { getKey, history } from "./shared";

// Receives the ancestor stack and returns the Proxy() handler
export const getProxy = (stack = []) => (target, property) => {
  // To allow logging the state: https://github.com/nodejs/node/issues/10731
  if (typeof property === "symbol") {
    return target[property];
  }

  // Plain access, just return it
  const key = getKey([...stack, property]);
  history.add({ type: "read", key, value: target[property] });
  return target[property];
};
