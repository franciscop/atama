import { factories as typeFactories } from "./types";

export const createProxify = (options = {}) => {
  const {
    createProxifyPrimitive,
    createProxifyArray,
    createProxifyComplex
  } = Object.assign(typeFactories, options);

  const proxifyPrimitive = createProxifyPrimitive(options);
  const proxifyArray = createProxifyArray(options);
  const proxifyComplex = createProxifyComplex(options);

  return (value, stack) => {
    return (
      proxifyPrimitive(value) ||
      proxifyArray(value, options) ||
      proxifyComplex(value, stack, options)
    );
  };
};
