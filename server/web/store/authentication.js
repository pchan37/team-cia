import axios from 'axios';

export const state = () => ({
  isLoggedIn: false,
  username: undefined,
});

/* eslint-disable no-shadow, no-param-reassign */
export const mutations = {
  setUsername(state, username) {
    state.username = username;
  },
  clearUsername(state) {
    state.username = undefined;
  },
  setIsLoggedIn(state, isLoggedIn) {
    state.isLoggedIn = isLoggedIn;
  },
  clearIsLoggedIn(state) {
    state.isLoggedIn = false;
  },
};
/* eslint-enable no-shadow, no-param-reassign */

export const actions = {
  checkAuth: async ({ commit }) => {
    await axios.get('/is_logged_in').then((response) => {
      commit('setIsLoggedIn', response.data.isLoggedIn === 'true');
      if (response.data.username !== '') {
        commit('setUsername', response.data.username);
      } else {
        commit('setUsername', undefined);
      }
    });
  },
};

/* eslint-disable no-shadow */
export const getters = {
  isLoggedIn(state) {
    return state.isLoggedIn;
  },
  username(state) {
    return state.username;
  },
};
/* eslint-enable no-shadow */
