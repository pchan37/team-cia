<template>
<section class="hero is-info is-fullheight">
  <div class="hero-head">
    <nav class="navbar">
      <div class="container">
        <div class="navbar-brand">
          <span
            class="navbar-burger burger"
            @click.stop="isOpen = !isOpen"
            v-bind:class="{ 'is-active': isOpen }"
            >
            <span></span>
            <span></span>
            <span></span>
          </span>
        </div>
        <div class="navbar-menu" v-bind:class="{ 'is-active': isOpen }" :is-active="isOpen">
          <div class="navbar-end">
            <nuxt-link to="/blacklist" class="navbar-item">
              Blacklist
            </nuxt-link>
            <nuxt-link to="/docs" class="navbar-item">
              Documentation
            </nuxt-link>
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
export default {
  data() {
    return {
      isOpen: false,
    };
  },
};
</script>
