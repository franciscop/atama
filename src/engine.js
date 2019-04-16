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

export { listeners };
export default state;
