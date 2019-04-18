(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.atama = {}));
}(this, function (exports) { 'use strict';

  // Where the different listeners are attached
  const listeners = [];

  const basicTypes = ["boolean", "number", "null", "undefined", "string"];
  const plain = value => JSON.stringify(value);

  // TODO: map this to a higher-level change in the way of:
  // { path: 'a.b.c', previous: { x: 10, y: 20 }, value: { x: 20, y: 30 }}
  const handleChange = stack => {
    listeners.forEach(one => one(state, stack));
  };

  // Receives the ancestor stack and returns the Proxy() handler
  const getProxy = (stack = []) => (target, property) => {
    // For the `for (let key of value)` iteration
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of
    if (property === Symbol.iterator) {
      const all = Object.values(target);
      return function*() {
        while (all.length) yield all.shift();
      };
    }

    // To allow logging the state: https://github.com/nodejs/node/issues/10731
    if (typeof property === "symbol") {
      return target[property];
    }

    return target[property];
  };

  // Set values
  const setProxy = (stack = []) => (target, property, value) => {
    const previous = target[property];
    // We only want to set it if the value is different
    if (plain(previous) === plain(value)) {
      return true;
    }
    // First of all set it in the beginning
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
    handleChange(newStack);

    return true;
  };

  const delProxy = (stack = []) => (target, property) => {
    // First of all set it in the beginning
    if (Array.isArray(target)) {
      target.splice(property, 1);
    } else {
      delete target[property];
    }

    // Trigger the root listener for any change
    handleChange(stack);

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

  const find = (state, path) => {
    if (!path) return state;
    return path.split(".").reduce((state, part) => state[part], state);
  };

  const subscribe = (...args) => {
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

  const useStore = (...args) => {
    const { string: path, function: callback } = byType(args);
    const [_, update] = useState({});
    useEffect(() => subscribe(...args, data => update(data)));
    return find(state, path);
  };

  const connect = () => console.error("This API is not available yet");

  // Export it as a default/object and as many args
  var atama = {
    state,
    subscribe,
    useStore,
    connect
  };

  exports.connect = connect;
  exports.default = atama;
  exports.state = state;
  exports.subscribe = subscribe;
  exports.useStore = useStore;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
