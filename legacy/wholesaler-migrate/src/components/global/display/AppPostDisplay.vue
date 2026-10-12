<template lang="pug">
  app-display(:url="url" :parameter="parameter")
    template(#default="{model}")
      span(v-if="model")
        span(v-if="model.name") {{model.name}}
        span(v-else) {{model.name}}
</template>
<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  props: {
    id: String,
    parameter: Object,
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    url() {
      if (this.id) {
        return `/sys/posts/${this.id}`;
      }
      return null;
    },
  },
};
</script>
