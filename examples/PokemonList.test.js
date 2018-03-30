// PokemonList.test.js
// import PokemonList from './PokemonList';
// import axios from 'axios';

// // TODO: correct syntax
// mock(axios, { delay: 500 });
// const mockData = [{ name: 'a', url: '#1' }, { name: 'b', url: '#2' }];
// mock.onGet().send(200, mockData);

describe('PokemonList.js', () => {
  it('loads an empty list first', () => {
    // const state = {};
    // const wrapper = shallow(<PokemonList state={state} />);
    // expect(state.items).toEqual([]);
    // expect(wrapper.html()).toMatch('<ul></ul>');
  });

  it('has the items after axios has loaded', async () => {
    // const state = {};
    // const wrapper = shallow(<PokemonList state={state} />);
    // expect(state.items).toEqual([]);
    // expect(wrapper.html()).toMatch('<ul></ul>');
    //
    // // Wait for 1000ms, the network delay is set to 500ms
    // await new Promise(resolve => setTimeout(resolve, 1000));
    //
    // expect(state.items).toEqual(mockData);
    // expect(wrapper.html()).toMatch('<ul><li><a href="#1">a</a></li><li><a href="#2">b</a></li></ul>');
  });
});
