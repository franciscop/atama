import local from './local';

describe('It can store basic state', () => {
  it('Is defined properly!', () => {
    expect(typeof local).toBe('object');
  });

  it('Can load some data', () => {
    localStorage.setItem('_____state', JSON.stringify({ data: { foo: 'bar' } }));
    const state = {};
    local.load(state);
    expect(state.foo).toBe('bar');
  });

  it('works without localStorage', () => {
    delete global.localStorage;
    const state = { foo: 'bar' };
    const mock = {};
    local.save(state);
    local.load(mock);
    expect(mock.foo).toBe(undefined);
  });
});
