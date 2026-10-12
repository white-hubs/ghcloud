<template lang="pug">
  a-select(v-bind="$attrs" v-on="$listeners" :value="parseValue")
    a-select-option(v-for="item in data" :key="item.id" :value="item.id" ) {{item.name}}
</template>

<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: ['value'],
  data() {
    return {
      data: [],
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    parseValue() {
      return this.value || null;
    },
  },
  created() {
    this.loadData();
  },
  methods: {
    async loadData() {
      this.data = await this.$axios.restful(
        `/sys/posts/all/${this.project.id}`,
      );
    },
  },
};
</script>
