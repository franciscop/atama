# Atama.js

> Note: this is early work in progress! This documentation describes an API that is not yet available .

[![[Status]](https://circleci.com/gh/franciscop/atama.svg?style=shield)](https://circleci.com/gh/franciscop/atama)

> 頭|あたま|atama: head, the part where the brain is.

A smart state manager for React or plain Javascript:

```js
import { connect } from 'atama';

const initial = { counter: 0 };

export default connect(initial)(({ state }) => (
  <button onClick={e => state.counter++}>
    Add one! {state.counter}
  </button>
));
```

Atama.js is focused on:

- **productivity** because state just works: smooth learning curve while allowing for more advanced patterns.
- **testing** to avoid things going wrong: easy to write tests for all kind of events, see [Testing](#testing).
- **debugging** for when things go wrong: detailed CRUD history is stored to a great detail on development, see [History](#history).



## Guides

Here are of the most common patterns with React and how to solve them with Atama.js.

A big note if you come from Redux, [one of the principles]() of Atama.js is exactly the opposite of Redux regarding the state: Always Be Mutating.



### Getting started

To install Atama.js in your project use npm or yarn:

```bash
npm install atama
```

Then include it in any project where you want to use it. Since `atama` is really a group of functions, you can do that either way:

```js
import atama from 'atama';
import { connect, ...atama } from 'atama';
```

The main function and most useful for React is `connect()`, so make sure to [read the documentation of `connect()`](#connect-). For plain-text javascript, the equivalent is `listen()`.



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
// Items.js
import { connect } from 'atama';
import axios from 'axios';

// Load the items asynchronously when starting the component
const init = async ({ state }) => {
  state.items = [];
  state.items = (await axios.get('/items')).data;
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
  state.items = (await axios.get('/items').catch(err)).data;
};
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



## Testing

Testing components with [Enzyme](https://github.com/airbnb/enzyme) and [Jest](https://facebook.github.io/jest/) is the best. Let's test our previous component:

```js
// Counter.js
import { connect } from 'atama';

// Initial (default) data structure
const init = { counter: 0 };

// Pass the global state defaulting to the init state when undefined
export default connect(init)(({ state }) => (
  <div>
    <p>Counter: {state.counter}</p>
    <button onClick={e => state.counter++}>
      Click me!
    </button>
  </div>
));
```

For all tests, first import the component straight into the test, which will include the exported `connect()`. Then import the Enzyme testing framework as well:

```js
// Counter.test.js
import './Counter';
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

To test for events we can use Enzyme's `.simulate()`. Let's simulate the click on the button:

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

We can see how the default value is still 0 as expected. But after each click it has increased by 1 as expected.



### Async loading

Finally let's see how to test our state asynchronously. This time we will be using `axios` to make a request, but also axios-mock-adapter to simulate the request and not make it. The component will be the same as before, and our test:

```js
// Items.test.js
import Items from './Items';

// TODO: correct syntax
import axios from 'axios';
mock(axios, { delay: 500 });
mock.onGet('/items').send(200, ['a', 'b']);

describe('Items.js', () => {
  it('loads an empty list first', () => {
    const state = {};
    const wrapper = shallow(<List state={state} />);
    expect(state.items).toEqual([]);
    expect(wrapper.html()).toMatch('<ul></ul>');
  });

  it('has the items after axios has loaded', async () => {
    const state = {};
    const wrapper = shallow(<List state={state} />);
    expect(state.items).toEqual([]);
    expect(wrapper.html()).toMatch('<ul></ul>');

    // Wait for 1000ms, the network delay is set to 500ms
    await new Promise(resolve => setTimeout(resolve, 1000));

    expect(state.items).toEqual(['a', 'b']);
    expect(wrapper.html()).toMatch('<ul><li>a</li><li>b</li></ul>');
  });
});
```
