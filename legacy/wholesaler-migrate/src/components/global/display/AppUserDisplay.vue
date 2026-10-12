<template lang="pug">
  app-display(:url="url" :parameter="parames")
    template(#default="{model}")
      span(v-if="model")
        span(v-if="model.deptName") {{model.nickname}} ({{model.deptName}})
        span(v-else) {{model.nickname || model.username}}
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
    parames() {
      return {
        projectId: this.project?.id,
        ...this.parameter,
      };
    },
    url() {
      if (this.id) {
        return `/sys/users/${this.id}`;
      }
      return null;
    },
  },
};
</script>
