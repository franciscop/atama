export const basicTypes = ["boolean", "number", "null", "undefined", "string"];

export const isPrimitive = value =>
  basicTypes.includes(typeof value) || value === null;

export const createProxifyPrimitive = (options = {}) => {
  const isPrimitive = options.isPrimitive || isPrimitive;
  return value => {
    if (!isPrimitive) return;
    return value;
  };
};
