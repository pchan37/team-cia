<template>
<section class="hero is-info is-fullheight">
  <div class="hero-head">
    <nav class="navbar">
      <div class="container">
        <div class="navbar-brand">
          <span
            v-bind:class="{ 'is-active': isOpen }"
            @click.stop="isOpen = !isOpen"
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
    <div class="container has-background-white has-sm-padding is-rounded">
    <h1 class="title has-text-black">
      Blacklist
    </h1>

    <b-field label="Filter by URL">
      <div class="columns">
        <div class="column is-half">
          <b-input v-model="filter" />
        </div>
      </div>
    </b-field>
    <b-table
      v-if="statusType !== 'error'"
      :data="filtered_data"
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
      {{ status }}
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

import { mapActions, mapGetters } from 'vuex';
import authenticationMixin from '../mixins/authentication';

export default {
  mixins: [authenticationMixin],
  data() {
    return {
      data: [],
      columns: [
        {
          field: 'url',
          label: 'URL',
        },
        {
          field: 'time',
          label: 'Time added',
        },
      ],

      filter: '',
      isOpen: false,
      status: '',
      statusType: '',
    };
  },
  computed: {
    ...mapGetters('authentication', ['username']),
    filtered_data() {
      const filterPattern = new RegExp(this.filter, 'i');
      const data = [];
      this.data.forEach((entry) => {
        if (entry.url.match(filterPattern)) {
          data.push(entry);
        }
      });
      return data;
    },
  },
  asyncData() {
    return axios.get('/get_blacklist')
      .then((response) => ({ data: response.data }))
      .catch((error) => error.response.data);
  },
  created() {
    this.checkAuth();
  },
  methods: {
    ...mapActions('authentication', ['checkAuth']),
  },
};
</script>

<style lang="scss">
$info: hsl(204, 86%, 53%);

.pagination-link.is-current {
    background-color: $info;
    border-color: $info;
}
.has-sm-padding {
    padding: 20px;
}
.is-rounded {
    border-radius: 15px;
}
</style>
