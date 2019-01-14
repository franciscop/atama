import state from './state';

describe('Basic definition', () => {
  it('is an object', () => {
    expect(state instanceof Object).toBe(true);
  });

  it('can be logged', () => {
    require('util').inspect(state);
  });

  it('starts empty', () => {
    expect(Object.keys(state)).toEqual([]);
    expect(state._____listeners).toEqual({});
    expect(state._____history instanceof Array).toBe(true);
  });

  it('is initialized with an empty object', () => {
    expect(Object.keys(state)).toEqual([]);
  });

  it('can set some basic state', () => {
    state.a = 'Hello world';
    expect(Object.keys(state)).toEqual(['a']);
    expect(state.a).toEqual('Hello world');
  });
});

describe('listeners', () => {
  it('Can listen to simple changes', () => {
    state.aaa = 0;
    let changed = false;
    state.$aaa(aaa => { changed = aaa; });
    state.aaa = 1;
    expect(changed).toBe(1);
  });

  it('has a very generic listener', () => {
    state.bbb = 0;
    let changed = 0;
    state.$(() => changed++);
    state.bbb = 1;
    expect(changed).toBe(2);
  });

  it('Changes it first then triggers the CB', () => {
    state.id = 0;
    let changed = false;
    let changedFirst = false;
    state.$id(id => {
      changed = id;
      changedFirst = state.id;
    });
    state.id = 1;
    expect(changed).toBe(1);
    expect(changedFirst).toBe(1);
  });

  it('triggers on listen once', () => {
    state.items = ['a', 'b'];
    let changed = 0;
    state.$items(items => { changed++; });
    expect(changed).toBe(1);
  });

  it('triggers from an object fragment', () => {
    state.fragment = {sub: {}};
    let changed = 0;
    state.$fragment(items => { changed++; });
    const $frag = state.fragment;
    $frag.sub.id = 10;
    expect(changed).toBe(2);
    expect(state.fragment.sub.id).toBe(10);
  });

  it('triggers from an state callback', () => {
    state.frag = [{id: 0}];
    let changed = 0;
    let modify;
    state.$frag(items => {
      modify = () => {
        items[0].id = 10;
      };
      changed++;
    });

    // First it only triggers once
    expect(changed).toBe(1);
    expect(state.frag[0].id).toBe(0);

    // Then we trigger an internal change
    modify();

    // Finally check the modified value
    expect(changed).toBe(2);
    expect(state.frag[0].id).toBe(10);
  });

  it('triggers from an array fragment', () => {
    state.fragment = [{id: 0}];
    let changed = 0;
    state.$fragment(items => { changed++; });
    const $frag = state.fragment[0];
    $frag.id = 10;
    expect(changed).toBe(2);
    expect(state.fragment[0].id).toBe(10);
  });

  it('does not trigger from a variable rewrite', () => {
    state.fragment = [{id: 0}];
    let changed = 0;
    state.$fragment(items => { changed++; });
    let $frag = state.fragment[0];
    $frag = { id: 20 };
    expect(changed).toBe(1);
    expect(state.fragment[0].id).toBe(0);
  });

  it('listens to deep changes with array', () => {
    state.deeparray = ['a', 'b'];
    let changed = false;
    state.$deeparray(deeparray => {
      changed = deeparray.length;
    });
    state.deeparray.push('c');
    expect(changed).toBe(3);
  });

  it('listens to deep changes with objects', () => {
    state.deepobject = { name: {} };
    let changed = false;
    state.deepobject.$name(() => { changed++; });
    state.deepobject.name.first = 'Francisco';
    expect(changed).toBe(2);
    expect(state.deepobject.name.first).toBe('Francisco');
  });

  it('Changes through the right listener', () => {
    state.id = 0;
    let changed = 0;
    state.$id(id => { changed++; });
    state.bla = 1;
    expect(changed).toBe(1);
  });

  it('triggers the listener with deep changes', () => {
    state.user = {
      id: 0,
      name: { first: 'Francisco', last: 'Presencia' }
    };
    let changed = 0;
    let nickname;
    let nickname2;
    state.$user(user => {
      changed++;
      nickname = user.name.first;
      nickname2 = state.user.name.first;
    });
    state.user.name.first = 'Paco';
    expect(changed).toBe(2);
    expect(nickname).toBe('Paco');
    expect(nickname2).toBe('Paco');
  });

  it('can remove shallow properties', () => {
    state.id = 0;
    let changed = 0;
    state.$id(id => { changed++ });
    delete state.id;
    expect(changed).toBe(2);
    expect(state.id).toBe(undefined);
  });

  it('can remove properties deep in the tree', () => {
    state.remove = { id: 0 };
    let changed = 0;
    state.$remove(() => { changed++ });
    delete state.remove.id;
    expect(changed).toBe(2);
    expect(state.remove.id).toBe(undefined);
  });
});


describe('Works with React', () => {
  it('does not trigger on the first load', () => {
    state.react = {};
    let changed = 0;
    state.$react({ setState: () => { changed++; } });
    expect(changed).toBe(0);
  });

  it('triggers on change', () => {
    state.react = {};
    let changed = 0;
    let stat;
    state.$react({ setState: (state) => { changed++; stat = state; } });
    state.react.id = 10;
    expect(changed).toBe(1);
    expect(stat.__state).toBeGreaterThan(0);
    expect(stat.__state).toBeLessThan(1);
  });

  it('triggers on change from the root', () => {
    state.react = {};
    let changed = 0;
    let stat;
    state.$({ setState: (state) => { changed++; stat = state; } });
    state.react.id = 10;
    expect(changed).toBe(1);
    expect(stat.__state).toBeGreaterThan(0);
    expect(stat.__state).toBeLessThan(1);
  });

  it('triggers on change from the root', () => {
    state.reactb = {};
    let changed = 0;
    state.$({ setState: () => { changed++; } });
    delete state.reactb;
    expect(changed).toBe(1);
    expect(state.reactb).toBe(undefined);
  });

  it('triggers on change from the root', () => {
    delete state._____listeners._____root;
    state.reactc = {};
    delete state.reactc;
    expect(state.reactc).toBe(undefined);
  });
});


describe('Error handling', () => {
  it('throws when SETTING a dollar', () => {
    expect(() => {
      state.$id = 5;
    }).toThrow();
  });

  it ('throws when SETTING a double undescore', () => {
    expect(() => {
      state.__id = 5;
    }).toThrow();
  });

  it('throws when DELETING a dollar', () => {
    expect(() => {
      delete state.$id;
    }).toThrow();
  });

  it ('throws when DELETING a double undescore', () => {
    expect(() => {
      delete state.__id;
    }).toThrow();
  });
});
