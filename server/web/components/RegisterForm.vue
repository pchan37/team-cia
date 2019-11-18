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
      type="password"
      password-reveal
      icon="lock"
      required
      validation-message="Password is required!"
      autocomplete="current-password"
      />
  </b-field>
  <b-field label="Confirmation Password">
    <b-input
      v-model="confirmationPassword"
      @keyup.native.enter="register"
      :validation-message="confirmPassword === '' ? confirmPasswordEmpty : confirmPasswordNotMatch"
      :pattern="password"
      type="password"
      password-reveal
      icon="lock"
      required
      autocomplete="current-password"
      />
  </b-field>

  <div class="columns">
    <div class="column">
      <b-button
        @click="redirectToLogin"
        type="is-text"
        size="is-small"
        class="has-text-info"
        >
        {{ loginText }}
      </b-button>
      <b-button
        @click="register"
        type="is-info"
        size="is-small"
        class="is-pulled-right"
        >
        {{ registerText }}
      </b-button>
    </div>
  </div>
</div>
</template>

<script>
import axios from 'axios';
import { mapGetters, mapMutations } from 'vuex';

export default {
  name: 'RegisterForm',
  props: {
    loginLink: {
      default: '/login',
      type: String,
    },
    registerLink: {
      default: '/register',
      type: String,
    },
    loginText: {
      default: 'Sign in instead',
      type: String,
    },
    registerText: {
      default: 'Register',
      type: String,
    },
    header: {
      default: 'Create an account to continue',
      type: String,
    },
  },
  data() {
    return {
      showPassword: false,

      username: undefined,
      password: undefined,
      confirmPassword: undefined,

      confirmPasswordNotMatch: 'Confirmation password does not match!',
      confirmPasswordEmpty: 'Confirmation password is required!',
    };
  },
  computed: {
    ...mapGetters('status', [
      'status',
      'statusType',
    ]),
  },
  methods: {
    ...mapMutations('status', [
      'clearStatus',
      'setStatus',
    ]),
    async register() {
      const { username, password, confirmPassword } = this;

      const resp = await fetch('/', (response) => response);

      axios.post(this.registerLink, {
        username,
        password,
        confirmPassword,
      }, {
        headers: { 'X-CSRF-TOKEN': resp.headers.get('X-CSRF-TOKEN') },
      }).then((response) => {
        this.setStatus({
          status: response.data.status,
          statusType: (response.data.statusType === 'success') ? 'is-success' : 'is-danger',
        });
        if (this.statusType === 'is-success') {
          this.$router.push(this.loginLink);
        } else {
          const usernameField = document.getElementById('username');
          this.username = '';
          this.password = '';
          this.confirmationPassword = '';
          usernameField.focus();
        }
      }).catch((error) => {
        this.setStatus({
          status: error,
          statusType: 'is-danger',
        });
      });
    },
    redirectToLogin() {
      this.clearStatus();
      this.$router.push(this.loginLink);
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
