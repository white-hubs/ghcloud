<template lang="pug">
  a-select(v-bind="$attrs" v-on="$listeners" :value="parseValue")
    a-select-option(v-for="item in roles" :key="item.id" :value="item.id" ) {{item.name}}
</template>

<script>
export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: ['value'],
  data() {
    return {
      roles: [],
    };
  },
  computed: {
    parseValue() {
      return this.value || [];
    },
  },
  created() {
    this.loadRoles();
  },
  methods: {
    async loadRoles() {
      this.roles = await this.$axios.restful('/xtpt/roles/all');
    },
  },
};
</script>
