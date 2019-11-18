import axios from 'axios';
import { mapMutations } from 'vuex';

const authenticationMixin = {
  methods: {
    ...mapMutations('authentication', [
      'clearUsername',
      'clearIsLoggedIn',
    ]),
    async logout() {
      const resp = await fetch('/', (response) => response);
      axios.post('/logout', {}, {
        headers: { 'X-CSRF-TOKEN': resp.headers.get('X-CSRF-TOKEN') },
      }).then(() => {
        this.clearUsername();
        this.clearIsLoggedIn();
        window.location.assign('/');
      });
    },
    parseQueryString(queryString) {
      const params = {};

      const queries = queryString.split('&');
      queries.forEach((query) => {
        const [key, value] = query.split('=');
        params[key] = decodeURIComponent(value);
      });

      return params;
    },
  },
};

export default authenticationMixin;
