export { default as history } from "../history";

// Where the different listeners are attached
export const listeners = [];
export const detached = [];
export const getKey = stack => stack.map(one => one.property).join(".");
