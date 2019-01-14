// The engine that will bind listeners
import { createEngine } from "./engine";

export const createStateManager = (options = {}) => {
  const engine = createEngine(options);

  const state = engine.attach();

  const listen = cb => {
    engine.listen(cb);
  };

  const connect = () => {};

  const init = () => {};

  const merge = (state, added = {}) =>
    freeze(state, temp => {
      Object.assign(temp, added);
    });

  const freeze = async (state, cb) => {
    const temp = engine.detach(state);
    await cb(temp);
    Object.assign(state, temp);
    engine.attach(temp);
  };

  const history = () => {};

  const local = () => {};

  return {
    engine,
    state,
    connect,
    freeze,
    init,
    merge,
    local,
    history,
    listen
  };
};
