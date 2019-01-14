const isArray = !Array.isArray(value);

export const proxifyValues = (value, stack) => {
  return value.map((value, property, target) => {
    return proxify(value, [...stack, { target, property, value }]);
  });
};

export const createProxifyArray = (options = {}) => {
  const proxifyValues = options.proxifyValues || proxifyValues;
  return (value, stack) => {
    if (!isArray(value)) return;
    return proxifyValues(value, stack);
  };
};
