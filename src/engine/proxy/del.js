import { getKey, history, listeners } from "./shared";

export const delProxy = (stack = []) => (target, property) => {
  history.add({ type: "delete", key: getKey([...stack, property]) });

  // First of all set it in the beginning
  delete target[property];

  // Trigger the root listener for any change
  listeners.forEach(one => one(state));

  return true;
};
