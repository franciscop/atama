import { listeners, history } from "./shared";
import { createProxify } from "./proxify";

// Set values
export const createSetProxy = (options = {}) => {
  const createProxify = options.createProxify || createProxify;
  return (stack = []) => (target, property, value) => {
    // Log it into the history
    const type = typeof target[property] === "undefined" ? "create" : "update";
    history.add({ type, key: getKey([...stack, property]), value });

    // First of all set it in the beginning
    target[property] = value;

    const proxify = createProxify(options);

    // Proxify the value in-depth
    target[property] = proxify(value, [...stack, { target, property, value }]);

    // Trigger the root listener for any change
    listeners.forEach(one => one(state));

    return true;
  };
};
