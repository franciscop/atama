import { createSetProxy } from "./set";
import { getProxy } from "./get";

export const createProxy = (value, stack, options) => {
  return new Proxy(value, {
    get: getProxy(stack),
    set: createSetProxy(stack, options),
    deleteProperty: delProxy(stack)
  });
};
