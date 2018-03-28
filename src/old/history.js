const History = function (initial = []) {
  this.push(...initial);
};

// It is an array
History.prototype = new Array;

// Limit the amout of items to preserve in the history
History.prototype.limit = Infinity;

// Error message if this browser does not support the error stack
const noStack = `\nStack not available for ${navigator.userAgent}`;

// Depth: Remove the latest 2 ones: one for history.add(), and another for setProxy
History.prototype.clean = ({ stack = noStack } = {}) => {

  // Filter: no empty ones, and no internal ones
  const onlyValid = trace => trace && !/^(_____|persistence\.)/.test(trace);

  // Slice: remove the history entry
  return stack.split('\n').slice(1).filter(onlyValid);
};


// Add an item to the history
History.prototype.add = function (entry) {

  // This is to order them in the console and to add some defaults
  this.push(Object.assign({}, entry, {
    timestamp: new Date().getTime(),
    stack: this.clean(new Error(), entry.key === 'length'),
  }, entry));

  if (this.length > this.limit) {
    this.splice(this.length - this.limit);
  }

  // Allow for concatenation
  return this;
};

// Filter by type
// history.type('create|read|update|delete').filter('')
History.prototype.type = function (type) {

  // Return new object with the filtered items
  return new History(this.filter(one => one.type === type));
};

// Filter by key
// history.key('name|name.subname|name.sub.name')
History.prototype.key = function (key) {
  const current = one => {
    const keyLength = key.split('.').length;
    return one.key.split('.').slice(0, keyLength).join('.') === key;
  };
  return new History(this.filter(current));
};

// Retrieve the recent ones within the specified milliseconds
History.prototype.latest = function (ms = Infinity) {
  return new History(this.filter(one => new Date().getTime() - one.timestamp < ms));
};

export default new History();
export { History };
