<template lang="pug">
span
  span.value-item(v-for="(model, index) in models" :key="model[field.label]")
    span.value-split(v-if="!!index")
    span {{model && model[field.label]}}
</template>
<script>
export default {
  props: {
    value: [String, Number],
    config: [Array, String],
    data: [Array, String],
    options: [Array, String],
    field: {
      type: Object,
      default: () => {
        return { name: 'value', label: 'name' };
      },
    },
  },
  computed: {
    models() {
      let options =
        this.parseOptions(this.config) ||
        this.parseOptions(this.data) ||
        this.parseOptions(this.options) ||
        [];
      let value = this.parseValue(this.value);
      const models = options.filter((item) =>
        value?.includes(item[this.field.name]),
      );
      return models;
    },
  },
  methods: {
    parseOptions(opt) {
      if (opt && typeof opt === 'string') {
        return JSON.parse(opt);
      }
      return opt;
    },
    parseValue(val) {
      if (val && typeof val === 'string') {
        return val.split(',');
      } else if (val) {
        return [val];
      }
    },
  },
};
</script>

<style lang="less" scoped>
.value-item {
  // & + .value-item {
  //   margin-left: 5px;
  //   padding-left: 5px;
  //   border-left: 1px solid #dddddd;
  // }
  .value-split {
    border: 1px solid #ddd;
    margin: 0 5px;
  }
}
</style>
