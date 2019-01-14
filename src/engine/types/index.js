import { createProxifyPrimitive } from "./primitive";
import { createProxifyArray } from "./array";
import { createProxifyJson } from "./json";
import { createProxifyComplex } from "./complex";

export const factories = {
  createProxifyPrimitive,
  createProxifyArray,
  createProxifyJson,
  createProxifyComplex
};
