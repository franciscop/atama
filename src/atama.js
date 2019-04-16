// The engine that will bind listeners
import state, { listeners } from "./engine";
import deepmerge from "deepmerge";

let useState = () => {};
let useEffect = () => {};
if (typeof require !== "undefined") {
  try {
    useState = require("react").useState;
    useEffect = require("react").useEffect;
  } catch (error) {}
}

export { state };

const byType = args =>
  args.reduce((args, arg) => ({ ...args, [typeof arg]: arg }), {});

const find = (state, path) => {
  if (!path) return state;
  return path.split(".").reduce((state, part) => state[part], state);
}

export const subscribe = (...args) => {
  const { string: path, function: callback } = byType(args);
  let previous = JSON.stringify(find(state, path));
  const cb = (state, stack) => {
    const current = JSON.stringify(find(state, path));
    // It has not actually changed skip calling the listeners
    if (previous === current) return;
    previous = current;
    return callback(find(state, path), stack);
  };
  listeners.push(cb);
  return () => {
    const index = listeners.indexOf(cb);
    if (index === -1) return;
    listeners.splice(index, 1);
  };
};

export const useStore = (...args) => {
  const { string: path, function: callback } = byType(args);
  const [_, update] = useState({});
  useEffect(() => subscribe(...args, data => update(data)));
  return find(state, path);
};

export const connect = () => console.error("This API is not available yet");

export const merge = (state, added = {}) =>
  freeze(state, temp => deepmerge(temp, added));

// Note: NEEDS to be sync, otherwise we get into nasty race conditions
export const freeze = (state, cb) => {
  const temp = [...listeners];
  listeners.splice(0, listeners.length);
  cb(temp);
  listeners.push(...temp);
};

// Export it as a default/object and as many args
export default {
  state,
  subscribe,
  useStore,
  connect
};
