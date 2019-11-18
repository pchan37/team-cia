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
            <a @click="logout" class="navbar-item">
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
        Developer Console
      </h1>

      <b-tabs v-model="activeTab" @input="resetState">
        <b-tab-item label="Add URL" class="has-black-text">
          <section>
            <b-message
              v-if="addStatusMessage !== ''"
              :type="addStatusMessageType"
              has-icon
              >
              {{ addStatusMessage }}
            </b-message>

            <b-field label="URL">
              <b-input id="new-url" v-model="newEntry.url" @keyup.native.enter="addToBlacklist" />
            </b-field>

            <b-button
              @click="addToBlacklist"
              type="is-info"
              class="is-pulled-right"
              >
              Add
            </b-button>
          </section>
        </b-tab-item>

        <b-tab-item label="Delete URL">
          <div v-if="statusType !== 'error'">
            <b-message
              v-if="deleteStatusMessage !== ''"
              :type="deleteStatusMessageType"
              has-icon
              >
              {{ deleteStatusMessage }}
            </b-message>

            <b-field label="Filter by URL">
              <div class="columns">
                <div class="column is-half">
                  <b-input v-model="filter" />
                </div>
                <div class="column">
                  <b-button
                    @click="removeFromBlacklist"
                    type="is-danger"
                    icon-left="delete"
                    class="is-pulled-right"
                    >
                    Delete
                  </b-button>
                </div>
              </div>
            </b-field>
            <b-table
              v-if="statusType !== 'error'"
              :data="filtered_data"
              :columns="columns"
              :checked-rows.sync="checkedRows"
              checkable
              paginated
              striped
              aria-next-label="Next page"
              aria-previous-label="Previous page"
              aria-page-label="Page"
              aria-current-label="Current page"
              />
          </div>
          <b-message
            v-else
            type="is-danger"
            >
            {{ status }}
          </b-message>
        </b-tab-item>
      </b-tabs>
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

const ADD_ENDPOINT = '/add_url';
const DELETE_ENDPOINT = '/delete_url';

const ERROR_TYPE = 'is-danger';
const SUCCESS_TYPE = 'is-success';

const BLACKLIST_TAB_INDEX = 1;

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
          width: '240',
        },
      ],

      checkedRows: [],
      addStatusMessage: '',
      addStatusMessageType: '',
      deleteStatusMessage: '',
      deleteStatusMessageType: '',
      filter: '',
      isOpen: false,
      newEntry: {
        url: '',
      },
      status: '',
      statusType: '',
    };
  },
  computed: {
    ...mapGetters('authentication', ['username']),
    filtered_data() {
      if (this.data === null) {
        this.data = [];
      }
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
    async addToBlacklist() {
      const resp = await fetch('/', (response) => response);
      const params = new URLSearchParams();
      params.append('url', this.newEntry.url);
      axios.post(ADD_ENDPOINT, params, {
        headers: { 'X-CSRF-TOKEN': resp.headers.get('X-CSRF-TOKEN') },
      }).then(() => {
        this.addStatusMessage = `Successfully added ${this.newEntry.url} to the blacklist`;
        this.addStatusMessageType = SUCCESS_TYPE;
        document.getElementById('new-url').focus();
        this.newEntry.url = '';
      }).catch(() => {
        this.addStatusMessage = `Failed to add ${this.newEntry.url} to the blacklist`;
        this.addStatusMessageType = ERROR_TYPE;
      });
    },
    async removeFromBlacklist() {
      const resp = await fetch('/', (response) => response);
      let errorOccurred = false;
      this.checkedRows.forEach((entry) => {
        const params = new URLSearchParams();
        params.append('url', entry.url);
        params.append('time', entry.time);
        axios.post(DELETE_ENDPOINT, params, {
          headers: { 'X-CSRF-TOKEN': resp.headers.get('X-CSRF-TOKEN') },
        }).catch(() => {
          errorOccurred = true;
          this.deleteStatusMessage = 'Failed to delete all the urls from the blacklist';
          this.deleteStatusMessageType = ERROR_TYPE;
        });
      });
      if (!errorOccurred) {
        this.data = this.data.filter((elem) => !this.checkedRows.includes(elem));
        this.deleteStatusMessage = `Successfully deleted ${this.checkedRows.length} urls from the blacklist`;
        this.deleteStatusMessageType = SUCCESS_TYPE;
      }
      this.checkedRows = [];
    },
    refreshBlacklist() {
      axios.get('/get_blacklist').then((response) => { this.data = response.data; });
    },
    resetState(index) {
      this.addStatusMessage = '';
      this.deleteStatusMessage = '';
      if (index === BLACKLIST_TAB_INDEX) {
        this.refreshBlacklist();
      }
    },
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
.tabs li.is-active a {
    color: $info !important;
}
.tabs li a {
    color: black !important;
}
.hero .tabs ul {
    border-bottom: 1px solid #dbdbdb;
}
</style>
