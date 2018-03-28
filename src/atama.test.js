import atama from './atama';
import { state, connect, listen } from './atama';

describe('load', () => {
  it('can be loaded in several ways', () => {
    expect(atama.state).toEqual(state);
    expect(atama.connect).toEqual(connect);
  });
});


describe('listen', () => {
  it('it can listen to anything', () => {
    let list = false;
    listen(() => {
      list = true;
    });
    state.bla = true;
    expect(list).toEqual(true);
  });
});
