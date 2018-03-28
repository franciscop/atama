import history from './history';

const basic = { type: 'create', key: 'hello there!' };

describe('History.js', () => {
  beforeEach(() => {
    history.splice(0);
    history.limit = Infinity;
    history.only = false;
    expect(history.length).toBe(0);
  });

  it('is defined', () => {
    expect(typeof history).toBe('object');
  });

  it('can clean the stack', () => {
    const ret = history.clean({ stack: '__remove\nHello\nThere!' });
    expect(ret instanceof Array).toBe(true);
    expect(ret[0]).toEqual('Hello');
    expect(ret[1]).toEqual('There!');
  });

  it('can work without stack', () => {
    const ret = history.clean();
    expect(ret instanceof Array).toBe(true);
    expect(ret[0]).toMatch(/Stack not available for/);
  });

  describe('add items', () => {
    history.add(basic);
    expect(history.length).toBe(1);

    it('follows the limit', () => {
      history.limit = 10;
      for (let i = 0; i < 100; i++) {
        history.add(basic);
      }
      expect(history.length).toBe(10);
    });

    it('follows the limit', () => {
      history.limit = 10;
      for (let i = 0; i < 100; i++) {
        history.add(basic);
      }
      expect(history.length).toBe(10);
    });
  });

  describe('retrieve items', () => {
    it('works as an array', () => {
      history.add(basic);
      expect(history[0]).toMatchObject(basic);
      expect(history[0].stack.length).toBeGreaterThan(0);
      expect(history[0].timestamp).toBeGreaterThan(new Date().getTime() - 1000);
    });
    it('works with filter by type', () => {
      history.add({ type: 'aaa' });
      history.add({ type: 'bbb' });
      history.add({ type: 'ccc' });
      history.add({ type: 'aaa' });
      history.add({ type: 'bbb' });
      expect(history.type('bbb').length).toEqual(2);
      expect(history.type('ccc').length).toEqual(1);
    });
    it('works with filter by key', () => {
      history.add({ key: 'a.a.a' });
      history.add({ key: 'a.a.b' });
      history.add({ key: 'a.b.a' });
      history.add({ key: 'a.b.b' });
      history.add({ key: 'b.b.b' });
      expect(history.key('a').length).toEqual(4);
      expect(history.key('b').length).toEqual(1);
      expect(history.key('a.a').length).toEqual(2);
      expect(history.key('a.b').length).toEqual(2);
      expect(history.key('a.a.a').length).toEqual(1);
      expect(history.key('a.a.b').length).toEqual(1);
    });
    it('can filter by time', () => {
      history.add({ timestamp: new Date().getTime()                             }); // 1 ms
      history.add({ timestamp: new Date().getTime() -                      1000 }); // 1 s
      history.add({ timestamp: new Date().getTime() -                 60 * 1000 }); // 1 min
      history.add({ timestamp: new Date().getTime() -            60 * 60 * 1000 }); // 1 h
      history.add({ timestamp: new Date().getTime() -       24 * 60 * 60 * 1000 }); // 1 day
      history.add({ timestamp: new Date().getTime() - 365 * 24 * 60 * 60 * 1000 }); // 1 year
      expect(history.latest(              ).length).toEqual(6);
      expect(history.latest(            10).length).toEqual(1);
      expect(history.latest(     10 * 1000).length).toEqual(2);
      expect(history.latest(10 * 60 * 1000).length).toEqual(3);
    });
  });
});
