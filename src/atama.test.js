import atama from "./atama";
import { state, connect, subscribe } from "./atama";
import { spy } from "sinon";

const any = {
  object: expect.any(Object)
};

describe("load", () => {
  it("can be loaded in several ways", () => {
    expect(atama.state).toEqual(state);
    expect(atama.connect).toEqual(connect);
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
      subscribe(fn);
      state.test = true;
      expect(fn).toBeCalled();
      expect(fn).toBeCalledWith({ test: true }, any.object);
    });

    it("listens to boolean changes", () => {
      const fn = jest.fn();
      state.test = false;
      subscribe(fn);
      state.test = true;
      expect(fn).toBeCalled();
      expect(fn).toBeCalledWith({ test: true }, any.object);
    });

    it("listens to number changes", () => {
      const fn = jest.fn();
      state.test = 0;
      subscribe(fn);
      state.test++;
      expect(fn).toBeCalled();
      expect(fn).toBeCalledWith({ test: 1 }, any.object);
    });

    it("listens to string changes", () => {
      const fn = jest.fn();
      state.test = "aaa";
      subscribe(fn);
      state.test = "bbb";
      expect(fn).toBeCalled();
      expect(fn).toBeCalledWith({ test: "bbb" }, any.object);
    });

    it("only triggers when there is a change", () => {
      state.test = false;
      const fn = jest.fn();
      subscribe(fn);
      state.test = false;
      expect(fn).not.toBeCalled();
    });
  });

  describe("with objects", () => {
    beforeEach(() => {
      state.test = { id: 1, name: "Francisco", valid: false };
    });

    it("changing a number", () => {
      const fn = jest.fn();
      subscribe(fn);
      state.test.id = 5;
      expect(fn).toBeCalledWith(
        { test: { id: 5, name: "Francisco", valid: false } },
        any.object
      );
    });
    it("changing a string", () => {
      const fn = jest.fn();
      subscribe(fn);
      state.test.name = "Paco";
      expect(fn).toBeCalledWith(
        { test: { id: 1, name: "Paco", valid: false } },
        any.object
      );
    });
    it("changing an boolean", () => {
      const fn = jest.fn();
      subscribe(fn);
      state.test.valid = true;
      expect(fn).toBeCalledWith(
        { test: { id: 1, name: "Francisco", valid: true } },
        any.object
      );
    });
    it("changing an undefined value", () => {
      const fn = jest.fn();
      subscribe(fn);
      state.test.confirmed = true;
      expect(fn).toBeCalledWith(
        { test: { id: 1, name: "Francisco", valid: false, confirmed: true } },
        any.object
      );
    });
    it("ignores a non-changed object", () => {
      const fn = jest.fn();
      subscribe(fn);
      state.test = { id: 1, name: "Francisco", valid: false };
      expect(fn).not.toBeCalled();
    });
    it("ignores a non-changed property", () => {
      const fn = jest.fn();
      subscribe(fn);
      state.test.valid = false;
      expect(fn).not.toBeCalled();
    });
  });

  // describe("with arrays", () => {
  //   beforeEach(() => {
  //     state.test = [1, "a", false];
  //   });
  //   it("changing a number", () => {
  //     state.test = { id: 1, name: "Francisco", valid: false };
  //     const fn = jest.fn();
  //     subscribe(fn);
  //     state.test.id = 5;
  //     expect(fn).toBeCalledWith(
  //       { test: { id: 5, name: "Francisco", valid: false } },
  //       any.object
  //     );
  //   });
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
  //   });

  describe("fragments", () => {
    it("can subscribe to a fragment", () => {
      state.test = false;
      const fn = jest.fn();
      subscribe("test", fn);
      state.test = true;
      expect(fn).toBeCalled();
      expect(fn).toBeCalledWith({ test: true }, any.object);
    });

    it("will skip if it's the wrong fragment", () => {
      state.test = false;
      const fn = jest.fn();
      subscribe("aaaa", fn);
      state.test = true;
      expect(fn).not.toBeCalled();
      expect(fn).not.toBeCalledWith({ test: true }, any.object);
    });
  });
});
