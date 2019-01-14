import { createState } from "./state";

export const createEngine = (options = {}) => {
  const engine = {};
  const createState = options.createState || $createState;
  const state = createState(options);

  engine.attach = arg => {
    if (detached.length) {
      listeners.push(...detached.splice(0, detached.length));
    }
    return state;
  };

  engine.detatch = temp => {
    detached.push(...listeners.splice(0, listeners.length));
    // TODO: build the raw tree here
    return state;
  };

  engine.listen = cb => listeners.push(cb);
};

export default createEngine;
