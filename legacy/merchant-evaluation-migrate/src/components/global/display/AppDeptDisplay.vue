<template lang="pug">
  app-display(:url="url")
    template(#default="{model}") {{model && model.name}}
</template>
<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  props: {
    id: String,
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    url() {
      if (this.id) {
        return `/sys/depts/${this.id}`;
      }
      return null;
    },
  },
};
</script>
