# Atama

> **Warning: discontinued!** please check out [my other library Statux](https://statux.dev/) instead.

> 頭|あたま|atama: head, the part where the brain is.

A smart and testable state manager for Javascript or React:

```js
// With React Hooks
import { useStore } from 'atama';

export default () => {
  const state = useStore({ count: 0 });
  return (
    <div onClick={e => state.count++}>
      {state.count}
    </div>
  );
};
```

```js
// Plain ol' javascript
import { state, subscribe } from 'atama';
state.counter = 0;
subscribe('counter', val => console.log(val));
state.counter++;
state.counter++;
state.counter++;
// Logs '1', '2', '3'
```

Atama is focused on:

- **productivity** because state just works: smooth learning curve while allowing for more advanced patterns, see [the getting started guide](#getting-started) or [the API](#api).
- **testing** to avoid things going wrong: easy to write tests for all kind of events, see [the Testing guide](#testing).
- **debugging** for when things go wrong: detailed CRUD history is stored to a great detail on development, see [the History guide](#history).

See [the comparison with Redux](#redux).



## Getting started

To install Atama in your project use npm or yarn:

```bash
npm install atama
```

Then include it in any project where you want to use it:

```js
import { state, connect, subscribe } from 'atama';
```

The main function and most useful for React is `connect()`, so make sure to [read the documentation of `connect()`](#connect-). For plain-text javascript, the equivalent is `subscribe()`.






## API

The full, detailed list of all of the parts that Atama.js provides and their applications.



### state

`state` is a property of Atama that also gets passed down to connected components and listening functions. It represents the full tree of state in your application (except for local state):

```js
// React
export default connect()(({ state }) => {
  console.log(state);  // Full state logging
});

// Javascript
subscribe(state => {
  ...
});
```

To work with atama and trigger React's `render()`, you **[must always mutate the state](#mutations)**. This is the most important rule and the only way to ensure that atama works as expected.

The shape of the state is totally up to you, however **every component must initialize the state it needs** even if it's an empty skeleton. This will be the default value, *merged with the parent state*. This ensures that we can test it later on (see [testing guide](#testing) for this):

```js
// YES: make sure the default state skeleton is defined here:
export default connect({ counter: 0 })(({ state }) => (
  <a onClick={e => state.counter++}>Add one</a>
));

// NO: "state.counter" is undefined so this will not work
export default connect()(({ state }) => (
  <a onClick={e => state.counter++}>Add one</a>
));
```

While *you can* access the global state through `import { state } from 'atama';`, this is *not testable* so strongly prefer connected components and passing the current state to actions:

```js
const login = await (state, { email, password }) => {
  state.loading = true;
  try {
    state.user = await axios.post('/login', { email, password });
  } catch (error) {
    state.error = error;
  } finally {
    state.loading = false;
  }
};

export default connect({ user: false })(({ state }) => {
  <form onSubmit={forn(data => login(state, data))}>
    // ...
  </form>
});
```

Now you know every small detail that you need to know about the state. Feel free to ask any question, since there are quite few more edge cases.



### local

### subscribe()

### connect()

### bind()

### init()

### merge()






## Guides

Here are of the most common patterns with React and how to solve them with Atama.js.

A big note if you come from Redux, [one of the principles]() of Atama.js is exactly the opposite of Redux regarding the state: always mutate the state.



### Mutations

To ensure that atama can trigger the `listen()`, `connect()` and other functions properly you **must always mutate the state**. There are many ways of achieving this, but some times they are not so intuitive.

> Note: *mutate* means to change/transform the original value. The opposite would be *immutable*, which means never change the original value and always create new variables.

The good news, if you use Javascript you are very likely used to mutate your state and variables. Simple values can be mutated in place or assigned a new value:

```js
// YES: ++ mutates the original "counter"
export default connect({ counter: 0 })(({ state }) => (
  <a onClick={e => state.counter++}>Click me</a>
));

// YES: assign the search string manually
export default connect({ search: '' })(({ state }) => (
  <input placeholder="Search" onInput={e => state.search = e.target.value} />
));

// NO: never extract a value locally, since the reference can be lost:
export default connect({ counter: 0 })(({ state }) => {
  const counter = state.counter;
  return (<a onClick={e => counter++}>Click me</a>);
});
```

For arrays, work with methods that mutate the original array such as `push`, `pop`, `splice`, etc:

```js
// YES: .push() mutates the original one
export default connect({ items: [] })(({ state }) => (
  <a onClick={e => state.items.push(Math.random())}>Add random item</a>
));

// NO: concat does not mutate in-place
export default connect({ items: [] })(({ state }) => (
  <a onClick={e => state.items.concat(Math.random())}>Add random item</a>
));
```

Finally, with objects you can assign them with the native `Object.assign()` for shallow merges (see next example for deep merges). `state` **must** always be the first parameter to ensure we are mutating it:

```js
// YES (but careful): the first argument of Object.assign() is mutated
export default connect({ user: 'Francisco' })(({ state }) => (
  <a onClick={e => Object.assign(state, { tos: true })}>Accept TOS</a>
));
// { user: 'Francisco', tos: true }

// NO: this does not mutate anything since the first arg is not "state"
export default connect({ user: 'Francisco' })(({ state }) => (
  <a onClick={e => Object.assign({}, state, { tos: true })}>Accept TOS</a>
));
```

For deep merges atama defines an export called `merge()`. `state` **must** always be the first parameter to ensure we are mutating it:

```js
// YES: merge() (method from atama) will deep-merge with mutation:
export default connect({ user: { name: 'Francisco' } })(({ state }) => (
  <a onClick={e => merge(state, { user: { tos: true } })}>Accept TOS</a>
));
// { user: { name: 'Francisco', tos: true } }

// NO: this will not deep-merge, but instead replace the whole subtree
export default connect({ user: { name: 'Francisco' } })(({ state }) => (
  <a onClick={e => Object.assign(state, { user: { tos: true } })}>Accept TOS</a>
));
```



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

Loading data with `axios` when a component is loaded. No error handling:

```js
// FriendList.js
import { connect } from 'atama';
import axios from 'axios';

// Load the items asynchronously when starting the component
const init = async ({ state }) => {
  state.items = [];
  state.items = (await axios.get('/friends')).data;
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
  const err = err => ({ data: [err.message] });

  // Load the items through AJAX asynchronously
state.items = (await axios.get('/friends').catch(err)).data;
};
```






## Testing

We highly recommend testing components with [Enzyme](https://github.com/airbnb/enzyme) and [Jest](https://facebook.github.io/jest/).

To write tests first import the component into the test, which will include the exported `connect()`. Then import the Enzyme testing framework as well:

```js
// Counter.test.js
import Counter from './Counter';
import { shallow, render } from 'enzyme';

// your tests here
```

Then write your tests as shown in the next sections.


### Default state loads

Let's test that the default state is loaded correctly:

```js
// Counter.test.js
import Counter from './Counter';
import { shallow, render } from 'enzyme';

describe('Counter.js', () => {
  it('loads the default state properly', () => {
    const state = {};
    const wrapper = shallow(<Counter state={state} />);
    expect(state.counter).toBe(0);
    expect(wrapper.text()).toMatch('Counter: 0');
  });
});
```

As we can see, we pass an empty state object and it gets a property `counter` with the default value of `0`. It seems our component has nice defaults, let's move on!


### Events

To test for events we can use Enzyme's `.simulate()`. Let's simulate clicking the button:

```js
// Counter.test.js
import Counter from './Counter';
import { shallow, render } from 'enzyme';

describe('Counter.js', () => {
  it('increases the counter onClick', () => {
    const state = {};
    const wrapper = shallow(<Counter state={state} />);
    expect(state.counter).toBe(0);

    // Select the button with the onClick={}
    const button = wrapper.find('button');

    button.simulate('click');
    expect(state.counter).toBe(1);

    button.simulate('click');
    expect(state.counter).toBe(2);
  });
});
```

We can see how the default value is still 0 as expected. But after each click it has increased by 1 as expected. Tests passing!



### Async loading

Finally let's see how to test our state asynchronously. This time we will be using `axios` to make a request, but also `axios-mock-adapter` to simulate the request and not make it:

```js
// FriendList.test.js
import FriendList from './FriendList';

// TODO: correct syntax
import axios from 'axios';
mock(axios, { delay: 500 });
mock.onGet('/friends').send(200, ['a', 'b']);

describe('FriendList.js', () => {
  it('loads an empty list first', () => {
    const state = {};
    const wrapper = shallow(<FriendList state={state} />);
    expect(state.items).toEqual([]);
    expect(wrapper.html()).toMatch('<ul></ul>');
  });

  it('has the items after axios has loaded', async () => {
    const state = {};
    const wrapper = shallow(<FriendList state={state} />);
    expect(state.items).toEqual([]);
    expect(wrapper.html()).toMatch('<ul></ul>');

    // Wait for 1000ms, the network delay is set to 500ms
    await new Promise(resolve => setTimeout(resolve, 1000));

    expect(state.items).toEqual(['a', 'b']);
    expect(wrapper.html()).toMatch('<ul><li>a</li><li>b</li></ul>');
  });
});
```






## Redux

Redux was a huge inspiration for Atama, so I'd like to try my best at explaining why I created Atama, how it's different from Redux and how I am attempting to fix the pain points I found while following some common practices with Redux.



### Easy testing

One of the big differences is that Redux creates a global store with `createStore()` that will load all of your reducers and logic. Because of this when you want to test a component you have to decide exactly how the state interacts with your tests:

- Full store with all the reducers. This makes it difficult to truly test a part of your application since you are testing a lot more.
- [Disconnected components](). This would be the opposite and test too little, incorrectly making your component looking like it's a function of it's inputs that doesn't interact with the state at all.
- Awkwardly split your action creators, reducers, etc for each subtree you want to test.

So with Redux and in my experience you end up either with only integration tests that are testing too much or with too many, very *disconnected* unit tests, while it's very costly to test the mid-to-large size components.

Atama will dynamically create the main *state* (which is also the store) dynamically on the highest `connect()` of the tree. So it is not very different, even creating a Provider and Consumer internally. But this dynamic state allows you to start you state tree at any component, both large and small if you follow [atama's recommendations for state](#state).

```js
// components/Counter.js
export default connect({ hello: 'world' })(({ state }) => (
  <p>I do not need a parent Provider! JSON.stringify(state, null, 2)</p>
));
// { hello: 'world' }
```

Not only that, if a `state` key is manually passed then it will use that as the initial state, allowing for even better testing as that will be filled by reference as our component does its work:

```js
// components/Counter.test.js
import Counter from './Counter';

it('correctly initializes a state fragment', () => {
  // Mocking an initial state as just {}
  // connect() will use this explicitly passed
  const state = {};
  // Note: only pass state for testing!
  const wrapper = shallow(<Counter state={state} />);
  expect(state.counter).toBe(0);

  wrapper.find('button').simulate('click');
  expect(state.counter).toBe(0);
});
```

If you had a child of Counter that also uses state, it'd use the local Counter's state instead of a global, non-existing state.

This makes Atama being a lot closer to `f(props, state)`. Of course there are still some other dependencies such as `fetch()`, `localstorage`, etc, but those are common for both.

At some point you start to realize that the whole HOC `connect()` is practically transparent when you pass a state manually. This makes things very, very easy to reason about.



### Clean and direct

Atama is more clear on your intentions. This can be seen like imperative vs declarative, with atama being more imperative and redux more declarative. When you want to do something with Atama you do it as normal with Javascript:

```js
// actions/increment.js
export default state => {
  state.counter++;
};
```

In Redux if you want to do something you state how you want it to be, not how to get it:

```js
// constants.js
export const INCREMENT = 'INCREMENT';

// actions/increment.js (action creator)
import { INCREMENT } from '../constants';
export default () => dispatch => {
  dispatch({ type: INCREMENT });
};

// reducers/counter.js
import { INCREMENT } from '../constants';
export default (state, { type }) => {
  switch (type) {
    case INCREMENT:
      return { ...state, counter: state.counter + 1 };
    default:
      return state;
  }
};
```

This makes atama code a lot shorter and clear. While you *can* make redux shorter, there are reasons why many projects end up with the `constant`, `actions` and `reducers` files/folders:

- reducers: the basic Redux functionality that returns the state changes; this has to exist as it's part of Redux core.
- actions: because writing dispatch inline can get really messy (applies to both Redux and Atama).
- constants: because making a typo with a string is easy so in this way we ensure the action and reducer have the same `type`.

With Atama the action directly modifies the store, so there's no need for a reducer. Since there is no reducer and the action is named (as per the file), there's also no need for the constant name.



### Easier prototyping

From the two previous points you can see how this is a big win for Atama; it's really easy to prototype different components quickly. Let's say I want to test a counter as above, with Atama you can set the whole logic in one:

```js
// components/Counter.js
import React from 'react';
import { connect } from 'atama';

const increment = state => state.counter++;

export default connect({ counter: 0 })(({ state }) => {
  <a onClick={e => increment(state)}>Click Me!</a>
});
```

That's it, you have your counter prototyped. You want to change something? Just do it in the same file. Write a `components/Counter.test.js` and you get easy testing for this component on its own without needing to start to worry about reducers or global state management.

Later, when you want to integrate the component with the rest of your code, split (if you want!) that `increment` function into its own `actions/increment.js` and import it as needed. No need to touch different files just to prototype and test a counter.



### Namespacing

One of the reason why Redux is designed this way is because reducers are normally namespaced to parts of your project. Redux makes it *easier to namespace* your reducers and state, while Atama does *not care* about it. Note: Redux does **not force** namespacing and **you can** use and enforce namespaces with Atama.

This is a weak difference in my opinion with no clear winner: for smaller teams no namespaces (Atama) make it easier to get started, while for larger teams namespaces (Redux) make it more robust. Move fast and break things (;



### Great debugging

Another one is that Redux can only add hooks to state mutations, while atama can *also* add hooks to state reads! This is quite a lot more advanced and you'll have to wait until a better tutorial is done, but you have the full CRUD history for your state:

```js
import { state, history } from 'atama';

state.val = 5;
const val = state.val;

console.log(history());
// Will log both events, the write and read
```

However consider this early work, as there is *too much data* being saved into history now (don't worry though, it is capped by default so your memory is safe).



### Internet Explorer support

Not all is good with Atama though, a big advantage of Redux is that it works with Internet Explorer. Atama does not since it uses [Proxy()](https://caniuse.com/Proxy) internally which cannot be polyfilled. This is probably not an issue for you with ~1% of IE usage globally, but it is for me since I'm in Japan and here the usage is 10~20%.



### Community

Again Redux is winning here. There is a huge Redux community that has created many useful plugins and middleware such as `redux-thunk`, time travel, etc. IMO the reason for this is that working with raw redux is *sometimes* difficult and you need some of those, but even considering this I still count this as a big win for Redux.

Atama is made by [Francisco Presencia](https://francisco.io/), but hopefully by now it is being used by many and you are contributing back with bug reports and PR! <3

Think about Atama more of a handcrafted solution, while Redux is a huge Facebook software product.











## Example: pokedex

Let's say that you want to make a modern Pokedex, where you have a list of all your pokemon and whether you have seen them and/or caught them.

While not necessary, it is useful to reason about the state first as with Redux. A good state structure could be:

```js
const state = {
  display: false,
  pokemon: [
    { id: 1, name: 'Bulbasaur', seen: true, caught: true, info: 'https://blabla.com/' },
    { id: 2, name: 'Venasaur', seen: true, caught: false, info: 'https://blabla.com/' },
    { id: 3, name: 'Megasaur', seen: false, caught: false, info: 'https://blabla.com/' },
    // ...
  ]
};
```

You have a simple list of pokemon and, when clicking on one, you display more information that is retrieved dynamically from AJAX. This is very, very similar [to how WebApp Store](https://web-app.store/) is made, only there are categories as well over there.

Since we are focusing on Atama here, I'll skip explanations for other tools such as React-Router since I'm doing the standard over there.

Get your project started with `create-react-app`:

```bash
npx create-react-app pokedex && cd pokedex
```



### Components

Let's define our components. We will split our architecture in 3 connected components and one pure component:

```js
// src/component/Pokedex.js
import { connect } from 'atama';
import Pokemon from './Pokemon';
import Display from './Display';

export default connect({ display: false, pokemon: [] })(({ state }) => (
  <div>
    <h1>Pokedex!</h1>
    {state.display ? (
      <Display pokemon={state.display} />
    ) : (
      <table>
        <tr><td>Name</td><td>Seen</td><td>Caught</td></tr>
        {state.pokemon.map(Pokemon)}
      </table>
    )}
  </div>
));
```

```js
// src/component/Pokemon.js
import { connect } from 'atama';

const show = (state, id) => {
  state.display = state.pokemon.find(p => p.id === id);
};

const see = (state, id) => {
  const i = state.pokemon.findIndex(p => p.id === id);
  state.pokemon[i].seen = !state.pokemon[i].seen;
};

const capture = (state, id) => {
  const i = state.pokemon.findIndex(p => p.id === id);
  state.pokemon[i].caught = !state.pokemon[i].caught;
};

export default connect({ pokemon: [] })(({ state, id, name, seen, caught }) => (
  <tr>
    <td><a onClick={e => show(state, id)}>{name}</a></td>
    <td><a onClick={e => see(state, id)}>{seen}</a></td>
    <td><a onClick={e => capture(state, id)}>{caught}</a></td>
  </tr>
));
```

```js
// src/component/Display.js
import { connect, merge } from 'atama';
import axios from 'axios';
import Details from './Details';

const load = async ({ state, id }) => {
  merge(state, { display: { loading: true, error: false } });
  try {
    const info = (await axios.get('/pokemon/' + id)).data;
    merge(state, { display: ...data });
  } catch (error) {
    merge(state, { display: { error } });
  } finally {
    merge(state, { display: { loading: false } });
  }
};

const close = (state) => {
  state.display = false;
};

export default connect(load)(({ state, id }) => (
  <div>
    <button onClick={e => close(state)}>Close</button>
    {state.display.loading ? (
      <div>Loading...</div>
    ) : state.display.error ? (
      <div>
        Connection error <button onClick={e => load({ state, id })}>Try again</button>
      </div>
    ) : (
      <Details {...state.display} />
    )}
  </div>
));
```

```js
// components/Details.js
export default ({ name, description, image, seen = false, caught = false }) => (
  <div>
    <div>Name: {name}</div>
    <img src={image} />
    <div>
      {seen ? 'seen!' : 'not seen yet'} |
      {caught ? 'caught!' : 'not caught yet'}
    </div>
    <div>{description}</div>
  </div>
);
```



### Refactoring

That should work! But now let's split those function on their separated files. While we could leave them as they are, it's better to separate them so we are able to test them individually at all levels.

```js
// actions/show.js
export default (state, id) => {
  state.display = state.pokemon.find(p => p.id === id);
};
```

```js
// actions/see.js
export default (state, id) => {
  const i = state.pokemon.findIndex(p => p.id === id);
  state.pokemon[i].seen = !state.pokemon[i].seen;
};
```

```js
// actions/capture.js
export default (state, id) => {
  const i = state.pokemon.findIndex(p => p.id === id);
  state.pokemon[i].caught = !state.pokemon[i].caught;
};
```

```js
// actions/load.js
import { merge } from 'atama';
import axios from 'axios';
export default async ({ state, id }) => {
  merge(state, { display: { loading: true, error: false } });
  try {
    const info = (await axios.get('/pokemon/' + id)).data;
    merge(state, { display: ...data });
  } catch (error) {
    merge(state, { display: { error } });
  } finally {
    merge(state, { display: { loading: false } });
  }
};
```

```js
// actions/close.js
export default state => {
  state.display = false;
};
```

Now that we have them into their own files we can see that there are two consecutive actions that could be joined together. In one step we are selecting a pokemon, and in the next one we are loading more data for it. So let's join the actions `show` and `load` together into a single `show`.

Since it does not need the preview data at all, we can just assign the id and that will work for both:

```js
// actions/load.js
import { merge } from 'atama';
import axios from 'axios';
export default async ({ state, id }) => {
  merge(state, { display: { id, loading: true, error: false } });
  try {
    const display = (await axios.get('/pokemon/' + id)).data;
    merge(state, { display });
  } catch (error) {
    merge(state, { display: { error } });
  } finally {
    merge(state, { display: { loading: false } });
  }
};
```

Then our components can be cleaned up as:

```js
// src/component/Pokedex.js
import { connect } from 'atama';
import Pokemon from './Pokemon';
import Display from './Display';

export default connect({ display: false, pokemon: [] })(({ state }) => (
  <div>
    <h1>Pokedex!</h1>
    {state.display ? (
      <Display pokemon={state.display} />
    ) : (
      <table>
        <tr><td>Name</td><td>Seen</td><td>Caught</td></tr>
        {state.pokemon.map(Pokemon)}
      </table>
    )}
  </div>
));
```

```js
// src/component/Pokemon.js
import { connect } from 'atama';
import { show, see, capture } from '../actions';

export default connect({ pokemon: [] })(({ state, id, name, seen, caught }) => (
  <tr>
    <td><a onClick={e => show(state, id)}>{name}</a></td>
    <td><a onClick={e => see(state, id)}>{seen}</a></td>
    <td><a onClick={e => capture(state, id)}>{caught}</a></td>
  </tr>
));
```

```js
// src/component/Display.js
import { connect } from 'atama';
import { show } from '../actions';
import Details from './Details';

export default connect({ display: {} })(({ state, id }) => (
  <div>
    <button onClick={e => close(state)}>Close</button>
    {state.display.loading ? (
      <div>Loading...</div>
    ) : state.display.error ? (
      <div>
        Connection error <button onClick={e => show({ state, id })}>Try again</button>
      </div>
    ) : (
      <Details {...state.display} />
    )}
  </div>
));
```

```js
// components/Details.js
// Same as before
```



### Testing

Cool, now we can start testing! Since most actions are quite similar, let's test one of the sync ones and the async one. Let's test the action that makes one pokemon to appear as `seen`:

```js
// actions/see.test.js
import see from './see';

describe('actions/see', () => {
  it('set pokemon that matches the id as seen', () => {
    const state = { pokemon: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] };
    see(state, 3);
    expect(state.pokemon[0].seen).toEqual(false);
    expect(state.pokemon[1].seen).toEqual(false);
    expect(state.pokemon[2].seen).toEqual(true);
    expect(state.pokemon[3].seen).toEqual(false);
  });

  // This fails! It's up to you whether you want the action to fail hard here
  // as seen in the test or fix it with what is called defensive programming:
  //   if (!state || !state.pokemon || !Array.isArray(state.pokemon)) return;
  //   if (typeof i === 'undefined') return;
  it('fails with malformed state', () => {
    const state = {};
    expect(() => see(state, 3)).toThrow();

    state.pokemon = [];
    expect(() => see(state, 3)).toThrow();
  });
});
```

Cool! We have our very basic action covered with the test. That was the easy part!

Let's try to test the async action, which is a bit trickier. First we have to know what we are testing exactly: the different response types, NOT the connection stability.

Let's move on to the next level, testing our components.
