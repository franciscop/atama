import { createProxy } from "./proxy";

export const createState = (options = {}) => {
  const createProxy = options.createProxy || createProxy;
  return createProxy({}, undefined, options);
};
