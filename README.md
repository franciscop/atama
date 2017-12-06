# Statux

A smart state manager with persistence and history:

```js
// Persist from previous session or init it:
state.todos = state.todos || [];

// Add a listener for changes on 'todos':
state.$todos(list => console.log(list));

// Change it and trigger the listener:
state.todos.push('Try statux! <3');
```


Debugging made easy. Is your state not as you expected? Peek inside with its history:

```js
// Start storing the history
state.$history = true;

state.todos = [];
state.todos.push('I am pushed');
state.todos.push('And I am pumped');

console.log(state._____history.filter(s => s.explicit && s.type === 'set').slice(10));
// [
//   { key: 'todos.0', value: 'I am pushed', ...},
//   { key: 'todos.1', value: 'And I am pumped', ...},
// ];
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

> Note: history is just available but this option is not available yet. As of this dev version history will leak memory, since it will grow unbounded:

```js
// Infinite history records; leaks memory
state.$history = true;

// Maximum number of history entries
state.$history = 1000;
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
