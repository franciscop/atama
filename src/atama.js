// The engine that will bind listeners
import engine from './engine';
const state = engine.attach();

const listen = cb => {
  engine.listen(cb);
};

const connect = () => {};

const init = () => {};

const merge = (state, added = {}) => freeze(state, temp => {
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

// Export it as a default/object and as many args
export default { state, listen, connect, init, merge, freeze, history, local };
export         { state, listen, connect, init, merge, freeze, history, local };
