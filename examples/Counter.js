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
