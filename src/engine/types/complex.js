export const createProxifyComplex = (options = {}) => {
  const createProxy = options.createProxy || $createProxy;
  return (value, stack, options) => {
    const { createProxifyJson } = Object.assign(typeProxifiers, options);
    const proxifyJson = createProxifyJson(options);
    proxifyJson(value);
    return createProxy(value, stack, options);
  };
};
