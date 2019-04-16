import atama from "./atama";
import { state, merge, connect, subscribe } from "./atama";

const any = {
  object: expect.any(Object)
};

describe("atama", () => {
  beforeEach(() => {
    delete state.test;
  });
  it("can iterate with a for in", () => {
    state.test = { a: 1, b: 2, c: 3 };
    const keys = [];
    for (let key in state.test) {
      keys.push(key);
    }
    expect(keys).toEqual(["a", "b", "c"]);
  });

  it("can iterate with a for of", () => {
    state.test = { a: 1, b: 2, c: 3 };
    const values = [];
    for (let val of state.test) {
      values.push(val);
    }
    expect(values).toEqual([1, 2, 3]);
  });

  it("can get all keys", () => {
    state.test = { a: 1, b: 2, c: 3 };
    expect(Object.keys(state.test)).toEqual(["a", "b", "c"]);
  });

  it("can get all values", () => {
    state.test = { a: 1, b: 2, c: 3 };
    expect(Object.values(state.test)).toEqual([1, 2, 3]);
  });

  it("can get all entries", () => {
    state.test = { a: 1, b: 2, c: 3 };
    expect(Object.entries(state.test)).toEqual([["a", 1], ["b", 2], ["c", 3]]);
  });
});

describe("initial value", () => {
  it("canNOT set an initial value", () => {
    const fn = jest.fn();
    const unsubscribe = subscribe({ test: 0 }, fn);
    state.test++;
    expect(state.test).not.toBe(0);
    expect(state.test).not.toBe(1);
    expect(fn).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});

describe("subscribe", () => {
  it("can unsubscribe", () => {
    state.test = 0;
    const fn = jest.fn();
    const unsubscribe = subscribe(fn);
    state.test++;
    expect(state.test).toBe(1);
    expect(fn).toHaveBeenCalledTimes(1);
    unsubscribe();
    state.test++;
    expect(state.test).toBe(2);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  describe("with types", () => {
    beforeEach(() => {
      delete state.test;
    });
    it("listens to undefined changes", () => {
      const fn = jest.fn();
      const unsubscribe = subscribe(fn);
      state.test = true;
      unsubscribe();
      expect(fn).toBeCalled();
      expect(fn).toBeCalledWith({ test: true }, any.object);
    });

    it("listens to boolean changes", () => {
      const fn = jest.fn();
      state.test = false;
      const unsubscribe = subscribe(fn);
      state.test = true;
      unsubscribe();
      expect(fn).toBeCalled();
      expect(fn).toBeCalledWith({ test: true }, any.object);
    });

    it("listens to number changes", () => {
      const fn = jest.fn();
      state.test = 0;
      const unsubscribe = subscribe(fn);
      state.test++;
      unsubscribe();
      expect(fn).toBeCalled();
      expect(fn).toBeCalledWith({ test: 1 }, any.object);
    });

    it("listens to string changes", () => {
      const fn = jest.fn();
      state.test = "aaa";
      const unsubscribe = subscribe(fn);
      state.test = "bbb";
      unsubscribe();
      expect(fn).toBeCalled();
      expect(fn).toBeCalledWith({ test: "bbb" }, any.object);
    });

    it("only triggers when there is a change", () => {
      state.test = false;
      const fn = jest.fn();
      const unsubscribe = subscribe(fn);
      state.test = false;
      unsubscribe();
      expect(fn).not.toBeCalled();
    });
  });

  describe("with objects", () => {
    beforeEach(() => {
      state.test = { id: 1, name: "Francisco", valid: false };
    });

    it("changing a number", () => {
      const fn = jest.fn();
      const unsubscribe = subscribe(fn);
      state.test.id = 5;
      unsubscribe();
      expect(fn).toBeCalledWith(
        { test: { id: 5, name: "Francisco", valid: false } },
        any.object
      );
    });

    it("changing a string", () => {
      const fn = jest.fn();
      const unsubscribe = subscribe(fn);
      state.test.name = "Paco";
      unsubscribe();
      expect(fn).toBeCalledWith(
        { test: { id: 1, name: "Paco", valid: false } },
        any.object
      );
    });

    it("changing an boolean", () => {
      const fn = jest.fn();
      const unsubscribe = subscribe(fn);
      state.test.valid = true;
      unsubscribe();
      expect(fn).toBeCalledWith(
        { test: { id: 1, name: "Francisco", valid: true } },
        any.object
      );
    });

    it("changing an undefined value", () => {
      const fn = jest.fn();
      const unsubscribe = subscribe(fn);
      state.test.confirmed = true;
      unsubscribe();
      expect(fn).toBeCalledWith(
        { test: { id: 1, name: "Francisco", valid: false, confirmed: true } },
        any.object
      );
    });

    it("can remove an item", () => {
      const fn = jest.fn();
      const unsubscribe = subscribe(fn);
      delete state.test.id;
      unsubscribe();
      expect(fn).toBeCalledWith(
        { test: { name: "Francisco", valid: false } },
        any.object
      );
    });

    it("ignores a non-changed object", () => {
      const fn = jest.fn();
      const unsubscribe = subscribe(fn);
      state.test = { id: 1, name: "Francisco", valid: false };
      unsubscribe();
      expect(fn).not.toBeCalled();
    });

    it("ignores a non-changed property", () => {
      const fn = jest.fn();
      const unsubscribe = subscribe(fn);
      state.test.valid = false;
      unsubscribe();
      expect(fn).not.toBeCalled();
    });
  });

  describe("with arrays", () => {
    beforeEach(() => {
      state.test = [1, "a", false];
    });
    it("can append to an array", () => {
      const fn = jest.fn();
      const unsubscribe = subscribe(fn);
      state.test.push("x");
      unsubscribe();
      expect(fn).toBeCalledWith({ test: [1, "a", false, "x"] }, any.object);
    });

    it("can modify an array item", () => {
      const fn = jest.fn();
      const unsubscribe = subscribe(fn);
      state.test[1] = "b";
      unsubscribe();
      expect(fn).toBeCalledWith({ test: [1, "b", false] }, any.object);
    });

    it("can remove an array item", () => {
      const fn = jest.fn();
      const unsubscribe = subscribe(fn);
      delete state.test[1];
      unsubscribe();
      expect(fn).toBeCalledWith({ test: [1, false] }, any.object);
    });
    //   it("changing a string", () => {
    //     state.test = { id: 1, name: "Francisco", valid: false };
    //     const fn = jest.fn();
    //     subscribe(fn);
    //     state.test.name = "Paco";
    //     expect(fn).toBeCalledWith(
    //       { test: { id: 1, name: "Paco", valid: false } },
    //       any.object
    //     );
    //   });
    //   it("changing an boolean", () => {
    //     state.test = { id: 1, name: "Francisco", valid: false };
    //     const fn = jest.fn();
    //     subscribe(fn);
    //     state.test.valid = true;
    //     expect(fn).toBeCalledWith(
    //       { test: { id: 1, name: "Francisco", valid: true } },
    //       any.object
    //     );
    //   });
    //   it("changing an undefined value", () => {
    //     state.test = { id: 1, name: "Francisco" };
    //     const fn = jest.fn();
    //     subscribe(fn);
    //     state.test.valid = true;
    //     expect(fn).toBeCalledWith(
    //       { test: { id: 1, name: "Francisco", valid: true } },
    //       any.object
    //     );
  });

  describe("fragments", () => {
    it("can subscribe to a fragment", () => {
      state.test = false;
      const fn = jest.fn();
      const unsubscribe = subscribe("test", fn);
      state.test = true;
      unsubscribe();
      expect(fn).toBeCalled();
      expect(fn).toBeCalledWith(true, any.object);
    });

    it("will skip if it's the wrong fragment", () => {
      state.test = false;
      const fn = jest.fn();
      const unsubscribe = subscribe("aaaa", fn);
      state.test = true;
      unsubscribe();
      expect(fn).not.toBeCalled();
      expect(fn).not.toBeCalledWith({ test: true }, any.object);
    });

    it("works with an object", () => {
      state.test = { b: "b" };
      const fn = jest.fn();
      const unsubscribe = subscribe("test.c", fn);
      Object.assign(state.test, { a: "a", c: "c" });
      unsubscribe();
      expect(fn).toBeCalled();
      expect(fn).toBeCalledWith("c", any.object);
    });

    it("calls it once per assignment", () => {
      state.test = { a: "b" };
      const fn1 = jest.fn();
      const fn2 = jest.fn();
      const fn3 = jest.fn();
      const unsub1 = subscribe("test.a", fn1);
      const unsub2 = subscribe("test.b", fn2);
      const unsub3 = subscribe("test", fn3);
      Object.assign(state.test, { a: "a", b: "b" });
      unsub1();
      unsub2();
      unsub3();
      expect(fn1).toHaveBeenCalledTimes(1);
      expect(fn2).toHaveBeenCalledTimes(1);
      expect(fn3).toHaveBeenCalledTimes(2);
      expect(fn1).toBeCalledWith("a", any.object);
      expect(fn2).toBeCalledWith("b", any.object);
      expect(fn3).toBeCalledWith({ a: "a", b: "b" }, any.object);
    });

    it("is called once when the whole subtree is modified", () => {
      state.test = { a: "b" };
      const fn1 = jest.fn();
      const fn2 = jest.fn();
      const fn3 = jest.fn();
      const unsub1 = subscribe("test.a", fn1);
      const unsub2 = subscribe("test.b", fn2);
      const unsub3 = subscribe("test", fn3);
      state.test = { a: "a", b: "b" };
      unsub1();
      unsub2();
      unsub3();
      expect(fn1).toHaveBeenCalledTimes(1);
      expect(fn2).toHaveBeenCalledTimes(1);
      expect(fn3).toHaveBeenCalledTimes(1);
      expect(fn1).toBeCalledWith("a", any.object);
      expect(fn2).toBeCalledWith("b", any.object);
      expect(fn3).toBeCalledWith({ a: "a", b: "b" }, any.object);
    });
  });
});
