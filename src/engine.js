// The current total history
import history from './old/history';

// Where the different listeners are attached
const listeners = [];
const detached = [];

const basicTypes = ['boolean', 'number', 'null', 'undefined', 'string'];

const getKey = stack => stack.map(one => one.property).join('.');



// Receives the ancestor stack and returns the Proxy() handler
const getProxy = (stack = []) => (target, property) => {

  // To allow logging the state: https://github.com/nodejs/node/issues/10731
  if (typeof property === 'symbol') {
    return target[property];
  }

  // Plain access, just return it
  const key = getKey([...stack, property]);
  history.add({ type: 'read', key, value: target[property] });
  return target[property];
};



// Set values
const setProxy = (stack = []) => (target, property, value) => {

  // Log it into the history
  const type = typeof target[property] === 'undefined' ? 'create' : 'update';
  history.add({ type, key: getKey([...stack, property]), value });

  // First of all set it in the beginning
  target[property] = value;

  const proxify = (value, stack) => {
    if (basicTypes.includes(typeof value) || value === null) {
      return value;
    }
    if (Array.isArray(value)) {
      value = value.map((value, property, target) => {
        return proxify(value, [...stack, { target, property, value }]);
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
  target[property] = proxify(value, [...stack, { target, property, value }]);

  // Trigger the root listener for any change
  listeners.forEach(one => one(state));

  return true;
};

const delProxy = (stack = []) => (target, property) => {

  history.add({ type: 'delete', key: getKey([...stack, property]) });

  // First of all set it in the beginning
  delete target[property];

  // Trigger the root listener for any change
  listeners.forEach(one => one(state));

  return true;
}

// Main state function. Has to be defined here to be accessible inside
const state = new Proxy({}, {
  get: getProxy(),
  set: setProxy(),
  deleteProperty: delProxy()
});

const engine = {};

engine.attach = (arg) => {
  if (detached.length) {
    listeners.push(...detached.splice(0, detached.length));
  }
  return state;
};

engine.detatch = (temp) => {
  detached.push(...listeners.splice(0, listeners.length));
  // TODO: build the raw tree here
  return state;
};

engine.listen = cb => listeners.push(cb);

export default engine;
