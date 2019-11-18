<template>
<section class="hero is-info is-fullheight">
  <div class="hero-head">
    <nav class="navbar">
      <div class="container">
        <div class="navbar-brand">
          <span
            @click.stop="isOpen = !isOpen"
            v-bind:class="{ 'is-active': isOpen }"
            class="navbar-burger burger"
            >
            <span />
            <span />
            <span />
          </span>
        </div>
        <div v-bind:class="{ 'is-active': isOpen }" :is-active="isOpen" class="navbar-menu">
          <div class="navbar-end">
            <nuxt-link to="/blacklist" class="navbar-item">
              Blacklist
            </nuxt-link>
            <nuxt-link to="/docs" class="navbar-item">
              Documentation
            </nuxt-link>
            <a v-if="username !== undefined" @click="logout" class="navbar-item">
              Logout
            </a>
          </div>
        </div>
      </div>
    </nav>
  </div>

  <div class="hero-body">
    <div class="container has-text-centered">
      <p class="title">
        Stopping Tabnabbers Online
      </p>
    </div>
  </div>

  <div class="hero-foot">
    <nav class="tabs is-fullwidth">
      <div class="container has-text-centered">
        <span>&copy; {{ new Date().getFullYear() }} - Team CIA</span>
      </div>
    </nav>
  </div>
</section>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import authenticationMixin from '../mixins/authentication';

export default {
  mixins: [authenticationMixin],
  data() {
    return {
      isOpen: false,
    };
  },
  computed: {
    ...mapGetters('authentication', ['username']),
  },
  created() {
    this.checkAuth();
  },
  methods: {
    ...mapActions('authentication', ['checkAuth']),
  },
};
</script>
