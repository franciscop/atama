# Atama.js

> Note: this is early work in progress! This documentation describes an API that is not yet available.

[![[Status]](https://circleci.com/gh/franciscop/atama.svg?style=shield)](https://circleci.com/gh/franciscop/atama)

> 頭|あたま|atama: head, the part where the brain is.

A smart state manager for React or plain Javascript:

```js
import { connect } from 'atama';

const initial = { counter: 0 };

export default connect(initial)(({ state }) => (
  <button onClick={e => {state.counter++}}>
    Add one! {state.counter}
  </button>
));
```

Atama.js is focused on:

- **productivity** because state should just work: a really smooth learning curve while allowing for more advanced patterns.
- **testing** to avoid things going wrong: writing a test is trivial and you can test very advanced features and mutations.
- **debugging** for when things go wrong: detailed CRUD history is stored to a great detail on development.



## Guides and examples

Here are of the most common patterns with React and how to solve them with Atama.js.

A big note if you come from Redux, [one of the principles]() of Atama.js is exactly the opposite of Redux regarding the state: Always Be Mutating.



### Events

Modify the counter when the button is clicked:

```js
// Counter.js
import { connect } from 'atama';

// Initial (default) data structure
const init = { counter: 0 };

// Pass the global state defaulting to the init state when undefined
export default connect(init)(({ state }) => (
  <div>
    <p>Counter: {state.counter}</p>
    <button onClick={e => { state.counter++; }}>Click me!</button>
  </div>
));
```



### AJAX loading data

Loading data when a component is loaded. No error handling:

```js
import { connect } from 'atama';

// Load the items asynchronously when starting the component
const init = async ({ state }) => {
  state.items = [];
  state.items = await fetch('/items/').then(res => res.json());
};

// Initialize the global state, but this time with a function!
export default connect(init)(({ state }) => {
  <ul>
    {state.items.map(item => <li>{item}</li>)}
  </ul>
});
```

With error handling, the init function would become:

```js
// This function will be called when initializing the component
const init = async ({ state }) => {
  state.items = [];

  // If there was an error render it as the first item
  const onError = err => { state.items = [err.message]; };

  // Load the items through AJAX asynchronously
  state.items = await fetch('/items/').then(res => res.json()).catch(onError);
};
```



### Testing

To test a component, just import it straight from the exported file, with `connect()` and all. For the previous Counter.js:

```js
// Counter.js
import { connect } from 'atama';

// Initial (default) data structure
const init = { counter: 0 };

// Pass the global state defaulting to the init state when undefined
export default connect(init)(({ state }) => (
  <div>
    <p>Counter: {state.counter}</p>
    <button onClick={e => { state.counter++; }}>Click me!</button>
  </div>
));
```

You can test it with [Enzyme](https://github.com/airbnb/enzyme) and [Jest](https://facebook.github.io/jest/) by creating a small piece of state and passing it manually like this:

```js
// Counter.test.js
import Counter from './Counter';
import { shallow } from 'enzyme';

describe('Counter.js', () => {
  it('loads the default state properly', () => {
    const state = {};
    const rendered = shallow(<Counter state={state} />).text();
    expect(state.counter).toBe(0);
    expect(rendered).toMatch('Counter: 0');
  });

  it('loads the default state properly', () => {
    const state = { counter: 0 };
    const button = shallow(<Counter state={state} />).find('button');
    expect(state.counter).toBe(0);

    button.simulate('click');
    expect(state.counter).toBe(1);

    button.simulate('click');
    expect(state.counter).toBe(2);
  });
});
```



### Trivia

I am learning Japanese and I know three expressions so far with 頭:

- 頭がいい: smart, intelligent.
- 頭が痛い: my head hurts (after too much Redux). Luckily it will never hurt again with Atama.js.
- 頭が悪い: stupid. Not like you <3




## API

The full, detailed list of all of the parts that Atama.js provides and their applications.

### state

### local

### listen()

### connect()

### bind()

### init()

### merge()

### freeze()







Debugging made easy. Is your state not as you expected? Peek inside with its history:

```js
state.todos = [];
state.todos.push('I am pushed');
state.todos.push('And I am pumped');

console.log(state._____history.type('create').slice(10));
// [
//   { key: 'todos.0', value: 'I am pushed', ...},
//   { key: 'todos.1', value: 'And I am pumped', ...},
// ];
```


## Install

Using npm:

```
$ npm install statux
```

Then import it into your code to use it:

```js
// New syntax
import state from 'statux';

// Old syntax
const state = require('statux');
```

Or with [the CDN unpkg](https://unpkg.com/statux@0/state.min.js), which doesn't need you to import it manually since it'll define the global `state`:

```html
<script src="https://unpkg.com/statux@0/state.min.js"></script>
```



## React

Perfect for React as well:

```js
import state from 'statux';
state.todos = state.todos || [];

export default class TodoList extends Component {
  constructor (props) {
    super(props);
    state.$todos(this);  // Added special handlers for React
  }

  render () {
    return (
      <ul>
        {state.todos.map((todo, i) => (
          <li onClick={() => { state.todos[i].done = true; }}>
            { todo.title }
          </li>
        ))}
      </ul>
    );
  }
}
```


## Persist state

State will persist data on [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage). The initialization of each state property will determine whether you take advantage of it or not. This is a convention we strongly encourage you to follow:

```js
// PERSIST state
state.books = state.books || [];
state.user = state.user || {};

// DO NOT PERSIST state
state.books = [];
state.user = {};
```

If you are persisting **basic data types be careful with falsy values**. The convention here it to use a default value of what would be considered falsy in whatever your data type is:

```js
// PERFECT; convention is falsy by default
state.display = state.display || false;
state.count = state.count || 0;
state.name = state.name || "";

// ERROR; this is buggy
state.display = state.display || true;
state.count = state.count || 5;
state.name = state.name || "Anonymous";
```

The reason to not use the latter is that a falsy value will be converted to the default even if set to false on purpose on the previous session. If you really want/need a non-null default value, you can do so with `typeof`:

```js
// ACCEPTABLE; but extra verbose
state.display = typeof state.display === 'undefined' ? true : state.display;
state.count = typeof state.count === 'undefined' ? 5 : state.count;
state.name = typeof state.name === 'undefined' ? 'Anonymous' : state.name;
```



### History

Undocumented; just DEV right now. Log `state._____history` to see it so far, taking into account the [Conventions](#conventions) (unstable naming).



## Listeners

A listener is a function that will be triggered when the state associated to it has changed. This allows us to scope our code changes. They are accessed like if a part of the state was a function, but prepended by a dollar $.

They have to be associated to a data point, so the corresponding data cannot be undefined. Example:

```js
// Has to be initialized first
state.todos = [];

// Listening to any change in this todos
state.$todos(list => {
  console.log(list);
});

// Trigger the listener above
state.todos.push('Hey there!');

// ERROR; this data point hasn't been defined before:
state.$whatever(() => {});
```

You should normally make the scope as specific as possible. Let's say you only want to listen to changes on the friends of the current user, you can do that like this:

```js
state.user = { friends: ['Peter', 'Maria'] };

// Listen only to changes on "friends"
state.user.$friends(friends => {
  console.log(friends);
});

state.user.friends.push('John');
```

The reverse is also true, a generic listener will listen to deeper changes as well:

```js
state.user = { friends: ['Peter', 'Maria'] };

// Listen to any change in user, including "friends"
state.$user(user => {
  console.log(user);
});

// Each of these trigger the listener:
state.user.friends.push('John');
state.user.name = 'Francisco';
```

You also get a generic state listener, useful for smaller projects where you might want to listen to anything. This is only valid in the root level:

```js
// Listen to any state change
state.$(() => {
  console.log(state.clicks);
});

state.clicks = 10;
```

It is recommended that all data manipulation goes through the main state object. This is to avoid many issues that can happen later on. Example: fixing a small typo:

```js
// Init to demonstrate the bug
state.users = ['Peter1', 'Maria'];
state.$users(() => {
  console.log('Added user');
});

// PERFECT; this will always trigger the listener
state.users[0] = 'Peter';

// BAD; this seems like it will always work
const $users = state.users;
$users.push('One more time');

// ERROR; this won't work since simple variables are created by value
let peter = state.users[0];
peter = 'Peter';
```




## Conventions

In this readme there are many conventions. Some of them are outright needed, while some other are just a rule of thumb to avoid many bugs. They are tagged as:

- **PERFECT**: follow this code style as much as possible. This is the official recommended way.
- **ACCEPTABLE**: it is not the best way, but code some times is messy.
- **BAD**: this will very likely lead to bugs. Really advanced users might break this.
- **ERROR**: this is just an error and won't work as expected.

If no rule is added in the beginning of a code block, consider that whole code block as **PERFECT**.

Any bit of code that includes a variable that starts by `_____` should be considered unstable. Example of unstable:

```js
// BAD; this code is unstable, easy to recognize because of the "_____"
console.log(state._____history);
```


## Why?

I really like some of the ideas behind Redux, and watching the Egghead videos was amazing. However, in real life things get messy and Redux has a lot of boilerplate.

Accordingly, these are the principles of Statux:

- Single source of truth. Same as Redux, everything is stored into a tree.
- Observable state. When you change a part of the tree, statux is listening for it and will update the rest of the website accordingly. It must be serializable at any point, so only basic types, Array and plain objects are allowed.
- Changes from the root. Always trigger a change starting from `state.` and avoid any other kind of change. This prevents subtle bugs and issues.

Advantages:

- Intuitive to use. Just an object, modify it and listen to its changes natively.
- Easy to set-up, no configuration needed and 0 boilerplate.
- Integration with React to make it easier to use. Also works with plain javascript greatly (see `/examples`).
- Detailed CRUD history for easier debugging.

Disadvantages:

- `Proxy()` is only available on modern browsers. No IE at all.
- The history is not *named* by event, just by data fragment access.
- No dev tools built around it.
- Early dev/test version.
