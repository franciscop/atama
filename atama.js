(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.atama = {}));
}(this, function (exports) { 'use strict';

  // The current total history
  // import history from './old/history';

  // Where the different listeners are attached
  const listeners = [];

  const basicTypes = ["boolean", "number", "null", "undefined", "string"];

  const getKey = stack => stack.map(one => one.property).join(".");

  const plain = value => JSON.stringify(value);

  // TODO: map this to a higher-level change in the way of:
  // { path: 'a.b.c', previous: { x: 10, y: 20 }, value: { x: 20, y: 30 }}
  const handleChange = stack => {
    listeners.forEach(one => one(state, stack));
  };

  // Receives the ancestor stack and returns the Proxy() handler
  const getProxy = (stack = []) => (target, property) => {
    // To allow logging the state: https://github.com/nodejs/node/issues/10731
    if (typeof property === "symbol") {
      return target[property];
    }

    // Plain access, just return it
    const key = getKey([...stack, property]);
    // history.add({ type: 'read', key, value: target[property] });
    return target[property];
  };

  // Set values
  const setProxy = (stack = []) => (target, property, value) => {
    // Log it into the history
    const type = typeof target[property] === "undefined" ? "create" : "update";
    // history.add({ type, key: getKey([...stack, property]), value });

    // First of all set it in the beginning
    const previous = target[property];
    // We only want to set it if the value is different
    if (plain(previous) === plain(value)) {
      return true;
    }
    target[property] = value;

    const newStack = [...stack, { property, previous, value }];

    const proxify = (value, stack) => {
      if (basicTypes.includes(typeof value) || value === null) {
        return value;
      }
      if (Array.isArray(value)) {
        value = value.map((value, property, target) => {
          return proxify(value, newStack);
        });
      }
      if (/^\{/.test(JSON.stringify(value))) {
        for (let property in value) {
          const current = { target, property, value: value[property] };
          value[property] = proxify(value[property], [...stack, current]);
        }
      }

      return new Proxy(value, {
        get: getProxy(stack),
        set: setProxy(stack),
        deleteProperty: delProxy(stack)
      });
    };

    // Proxify the value in-depth
    target[property] = proxify(value, newStack);

    // Trigger the root listener for any change
    // listeners.forEach(one => one(state));
    handleChange(newStack);

    return true;
  };

  const delProxy = (stack = []) => (target, property) => {
    // history.add({ type: 'delete', key: getKey([...stack, property]) });

    // First of all set it in the beginning
    delete target[property];

    // Trigger the root listener for any change
    handleChange(stack);
    // listeners.forEach(one => one(state));

    return true;
  };

  // Main state function. Has to be defined here to be accessible inside
  const state = new Proxy(
    {},
    {
      get: getProxy(),
      set: setProxy(),
      deleteProperty: delProxy()
    }
  );

  // The engine that will bind listeners

  let useState = () => {};
  let useEffect = () => {};
  if (typeof require !== "undefined") {
    try {
      useState = require("react").useState;
      useEffect = require("react").useEffect;
    } catch (error) {}
  }

  const byType = args =>
    args.reduce((args, arg) => ({ ...args, [typeof arg]: arg }), {});

  const subscribe = (...args) => {
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

  const useStore = (...args) => {
    const [_, update] = useState({});
    useEffect(() => subscribe(...args, data => update(data)));
    return state;
  };

  const connect = () => console.error("This API is not available yet");

  const init = () => console.error("This API is not available yet");

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

  // Export it as a default/object and as many args
  var atama = {
    state,
    subscribe,
    connect,
    init,
    merge,
    freeze
  };

  exports.connect = connect;
  exports.default = atama;
  exports.freeze = freeze;
  exports.init = init;
  exports.merge = merge;
  exports.state = state;
  exports.subscribe = subscribe;
  exports.useStore = useStore;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
