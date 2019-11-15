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
            <nuxt-link to="/" class="navbar-item">
              Home
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
    <div class="container has-white-background has-sm-padding is-rounded">
    <h1 class="title has-black-text">
      Blacklist
    </h1>

    <b-table
      v-if="this.statusType !== 'error'"
      :data="data"
      :columns="columns"
      :color="info"
      paginated
      striped
      aria-next-label="Next page"
      aria-previous-label="Previous page"
      aria-page-label="Page"
      aria-current-label="Current page"
      />
    <b-message
      v-else
      type="is-danger"
      >
      {{ this.status }}
    </b-message>
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
import axios from 'axios';

export default {
  data() {
    return {
      data: [],
      columns: [
        {
          field: 'url',
          label: 'URL',
          searchable: true,
        },
        {
          field: 'time',
          label: 'Time added',
          searchable: true,
        },
      ],
      status: '',
      statusType: '',
    };
  },
  asyncData() {
    return axios.get('/get_blacklist')
      .then((response) => ({ data: response.data }))
      .catch((error) => error.response.data);
  },
};
</script>

<style lang="scss">
.pagination-link.is-current {
    background-color: hsl(204, 86%, 53%); 
    border-color: hsl(204, 86%, 53%);
}
.has-white-background {
    background-color: white;
}
.has-black-text {
    color: black !important;
}
.has-sm-padding {
    padding: 10px;
} 
.is-rounded {
    border-radius: 15px;
}
</style>
