const History = function (initial = []) {
	this.push(...initial);
};

History.prototype = new Array;


// Depth: Remove the latest 2 ones: one for history.add(), and another for setProxy
const clean = error => {
  if (!error.stack) return new Error('Stack not available in ' + navigator.userAgent);

  // Slice: remove the history entry
  // Filter: no empty ones, and no internal ones
  return error.stack.split('\n').slice(1).filter(one => one).filter(trace => !/^_____/.test(trace));
};


History.prototype.add = function (entry) {

  // This is to order them in the console
  this.push(Object.assign({}, entry, {
    timestamp: new Date().getTime(),
    stack: clean(new Error(), entry.key === 'length'),
  }, entry));
  return this;
};

// history.type('create|read|update|delete').filter('')
History.prototype.type = function (type) {
  return new History(this.filter(one => one.type === type));
};

// history.key('name|name.subname|name.sub.name')
History.prototype.key = function (key) {
  const current = one => {
    const keyLength = key.split('.').length;
    return one.key.split('.').slice(0, keyLength).join('.') === key;
  };
  return new History(this.filter(current));
};

History.prototype.latest = function (ms = Infinity) {
  return new History(this.filter(one => new Date().getTime() - one.time < ms));
};

export default new History();
export { History };
