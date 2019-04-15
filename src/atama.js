// The engine that will bind listeners
import state, { listeners } from "./engine";

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

export const subscribe = (...args) => {
  const { string: path, function: callback } = byType(args);
  const cb = (state, stack, previous) => {
    const props = stack.map(({ property }) => property).join(".");
    // If we are listening to a path and the modification is in the path
    if (path) {
      // We know this is not a change in our path
      // subscribe('a.b') => state.a.b.c = 10 ~> keep comparing
      // subscribe('a.b') => state.a = { b: 10 } ~> keep comparing
      // subscribe('a.b') => state.d = 10 ~> skip
      if (path.slice(0, props.length) !== props) {
        return;
      }
    }
    callback(state, stack);
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
  if (!path) return state;
  return path.split(".").reduce((state, part) => state[part], state);
};

export const connect = () => console.error("This API is not available yet");

export const init = () => console.error("This API is not available yet");

export const merge = (state, added = {}) =>
  freeze(state, temp => {
    Object.assign(temp, added);
  });

export const freeze = async (state, cb) => {
  const temp = engine.detach(state);
  await cb(temp);
  Object.assign(state, temp);
  engine.attach(temp);
};

// Export it as a default/object and as many args
export default {
  state,
  subscribe,
  useStore,
  connect,
  init,
  merge,
  freeze
};
