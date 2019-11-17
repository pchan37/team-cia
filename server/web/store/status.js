export const state = () => ({
  status: undefined,
  type: undefined,

  mainStatus: undefined,
  mainType: undefined,
});

/* eslint-disable no-shadow, no-param-reassign */
export const mutations = {
  setError(state, error) {
    state.status = error;
    state.type = 'error';
  },
  setSuccess(state, success) {
    state.status = success;
    state.type = 'success';
  },
  setStatus(state, payload) {
    state.status = payload.status;
    state.type = payload.statusType;
  },
  clearStatus(state) {
    state.status = undefined;
    state.type = undefined;
  },

  setMainError(state, error) {
    state.mainStatus = error;
    state.mainType = 'error';
  },
  setMainSuccess(state, success) {
    state.mainStatus = success;
    state.mainType = 'success';
  },
  setMainStatus(state, payload) {
    state.mainStatus = payload.status;
    state.mainType = payload.statusType;
  },
  clearMainStatus(state) {
    state.mainStatus = undefined;
    state.mainType = undefined;
  },
};
/* eslint-enable no-shadow, no-param-reassign */

/* eslint-disable no-shadow */
export const getters = {
  status(state) {
    return state.status;
  },
  statusType(state) {
    return state.type;
  },
  mainStatus(state) {
    return state.mainStatus;
  },
  mainStatusType(state) {
    return state.mainStatusType;
  },
};
/* eslint-enable no-shadow */
