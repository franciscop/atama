# Statux

A state manager. Simplify your Javascript development with all the modern features:

```js
// Initialize it with an empty todo list:
state.todos = [];

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


## Configuration

All of the configuration should be set at the root level. They start by a dollar `$` and use a set method like this:

```js
// Start to record the history
state.$history = true;
```



### Persistence

> Note: this option only works with a number or boolean!

Store the data among browser refresh. This defaults to false, but it can be changed to true. An optional cache time can be set, in which situation if the user takes that long to return the state will be reset:

```js
// Configuration
state.$persist = true;   // Infinite preservation
state.$persist = 3600;   // Cache it for 3600 seconds
state.$persist = { cache: 3600 };   // Cache it for 3600 seconds
```



### History

> Note: this option is not working yet!

```js
// Set the history options
state.$history = true;
state.$history = 1000;
state.$history = { max: 1000 };
state.$history = { methods: ['set', 'delete'] };
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
- Integration with React to make it easier to use. Also works with plain javascript greatly (see index.html).

Disadvantages:

- `Proxy()` is only available on modern browsers. No IE at all.
- A bit harder to track changes since more things are logged => harder to debug.
- No dev tools built around it.
- Early dev/test version.
