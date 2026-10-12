<template lang="pug">
a-checkbox-group(:value="parseValue" :options="optionsData" v-on="$listeners" v-bind="$attrs")
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
      roles: [],
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    parseValue() {
      return this.value || [];
    },
    optionsData() {
      return this.roles.map((item) => {
        return {
          label: item.name,
          value: item.id,
        };
      });
    },
  },
  created() {
    this.loadRoles();
  },
  methods: {
    async loadRoles() {
      this.roles = await this.$axios.restful(
        `/sys/roles/all/${this.project.id}`,
      );
    },
  },
};
</script>
