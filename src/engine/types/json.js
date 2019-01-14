export const isJson = value => /^\{/.test(JSON.stringify(value));

export const proxifyJsonValues = (value, stack) => {
  for (let property in value) {
    const current = { target, property, value: value[property] };
    value[property] = proxify(value[property], [...stack, current]);
  }
};

export const createProxifyJson = (options = {}) => {
  const proxifyJsonValues = options.proxifyJsonValues || proxifyJsonValues;
  return value => {
    if (!isJson(value)) return;
    proxifyJsonValues(value);
  };
};
