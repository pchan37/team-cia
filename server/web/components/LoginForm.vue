<template>
<div class="container has-background-white has-sm-padding is-rounded">
  <h3 class="has-text-centered has-text-black">
    {{ header }}
  </h3>

  <b-notification
    v-if="status !== undefined"
    :type="statusType"
    class="has-my-4"
    >
    {{ status }}
  </b-notification>

  <b-field label="Username">
    <b-input
      id="username"
      v-model="username"
      icon="account-circle"
      autocomplete="username"
      required
      validation-message="Username is required!"
      autofocus
      />
  </b-field>
  <b-field label="Password">
    <b-input
      v-model="password"
      @keyup.native.enter="login"
      type="password"
      password-reveal
      icon="lock"
      required
      validation-message="Password is required!"
      autocomplete="current-password"
      />
  </b-field>

  <div class="columns">
    <div class="column">
      <b-button
        @click="redirectToRegister"
        type="is-text"
        size="is-small"
        class="has-text-info"
        >
        {{ registerText }}
      </b-button>
      <b-button
        @click="login"
        type="is-info"
        size="is-small"
        class="is-pulled-right"
        >
        {{ loginText }}
      </b-button>
    </div>
  </div>
</div>
</template>

<script>
import axios from 'axios';
import { mapGetters, mapMutations } from 'vuex';

import authentication from '../mixins/authentication';

export default {
  name: 'LoginForm',
  mixins: [authentication],
  props: {
    successfulLoginLink: {
      default: '/',
      type: String,
    },
    successfulLoginForceLoad: {
      default: false,
      type: Boolean,
    },
    loginLink: {
      default: '/login',
      type: String,
    },
    registerLink: {
      default: '/register',
      type: String,
    },
    loginText: {
      default: 'Login',
      type: String,
    },
    registerText: {
      default: 'Create Account',
      type: String,
    },
    header: {
      default: 'Please sign in to continue',
      type: String,
    },
  },
  data() {
    return {
      username: undefined,
      password: undefined,
    };
  },
  computed: {
    ...mapGetters('status', [
      'status',
      'statusType',
    ]),
  },
  methods: {
    ...mapMutations('authentication', [
      'setUsername',
    ]),
    ...mapMutations('status', [
      'clearStatus',
      'setStatus',
    ]),
    async login() {
      const resp = await fetch('/', (response) => response);

      const { username, password } = this;

      axios.post(this.loginLink, {
        username,
        password,
      }, {
        headers: { 'X-CSRF-TOKEN': resp.headers.get('X-CSRF-TOKEN') },
      }).then((response) => {
        this.setStatus({
          status: response.data.status,
          statusType: (response.data.statusType === 'success') ? 'is-success' : 'is-danger',
        });
        if (this.statusType === 'is-success') {
          this.setUsername(response.data.username);
          this.clearStatus();

          const queryString = window.location.search.substring(1);
          const params = this.parseQueryString(queryString);
          if (this.successfulLoginForceLoad) {
            window.location.assign(params.redirect || this.successfulLoginLink);
          } else {
            this.$router.push(params.redirect || this.successfulLoginLink);
          }
        } else {
          const usernameField = document.getElementById('username');
          usernameField.focus();
          this.username = '';
          this.password = '';
        }
      }).catch((error) => {
        this.setStatus({
          status: error,
          statusType: 'error',
        });
      });
    },
    redirectToRegister() {
      this.clearStatus();
      this.$router.push(this.registerLink);
    },
  },
};
</script>

<style lang="scss">
.has-sm-padding {
    padding: 20px;
}
.is-rounded {
    border-radius: 15px;
}
.has-my-4 {
    margin-top: 16px;
    margin-bottom: 16px;
}
</style>
