<template>
<section class="section">
  <div class="container">
    <h1 class="title">
      Blacklist
    </h1>

    <b-table
      v-if="this.statusType !== 'error'"
      :data="data"
      :columns="columns"
      paginated
      isPaginationSimple="false"
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
