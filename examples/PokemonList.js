// PokemonList.js
import { connect } from 'atama';
import axios from 'axios';

const api = 'https://pokeapi.co/api/v2/pokemon/';

// Load the pokemon asynchronously on init
const init = async ({ state }) => {
  state.pokes = [];
  state.pokes = (await axios.get(api)).data.results;
};

// Initialize the global state with a function:
export default connect(init)(({ state }) => {
  <ul>
    {state.pokes.map(poke => (
      <li>
        <a href={poke.url}>
          {poke.name}
        </a>
      </li>
    ))}
  </ul>
});
