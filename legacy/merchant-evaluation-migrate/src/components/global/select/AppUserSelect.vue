<template lang="pug">
a-select(
  v-bind='$attrs',
  v-on='$listeners',
  :value='parseValue',
  showSearch,
  optionFilterProp='title',
  :maxTagCount='maxTagCount'
)
  a-select-option(
    v-for='item in data',
    :key='item.id',
    :value='item.id',
    :title='item.nickname + item.username'
  ) 
    div(v-if='item.nickname') {{ item.nickname }}({{ item.username }})
    div(v-else) {{ item.username }}
</template>

<script>
export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: ['value', 'parameter', 'maxTagCount'],
  data() {
    return {
      data: [],
    };
  },
  computed: {
    parseValue() {
      return this.value || [];
    },
  },
  watch: {
    parameter: {
      handler(newV, oldV) {
        this.loadData();
      },
      deep: true,
    },
  },
  created() {
    this.loadData();
  },
  methods: {
    async loadData() {
      this.data = await this.$axios.restful(`/sys/users/list`, this.parameter);
    },
  },
};
</script>
