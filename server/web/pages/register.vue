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
            <nuxt-link to="/" class="navbar-item">
              Home
            </nuxt-link>
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
    <div class="container">
    <div class="columns">
      <div
        class="column is-mobile is-two-thirds-mobile is-offset-2-mobile \
               is-half-desktop is-offset-one-quarter-desktop"
        >
        <register-form />
      </div>
    </div>
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
import RegisterForm from '../components/RegisterForm.vue';

export default {
  name: 'Register',
  components: { RegisterForm },
  data() {
    return {
      isOpen: false,
    };
  },
};
</script>
