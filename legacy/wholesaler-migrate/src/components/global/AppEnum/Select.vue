<template lang="pug">
a-select(
  :value='parseValue',
  v-bind='$attrs',
  v-on='listeners',
  :multiple='multiple',
  @change='changeHandler'
)
  a-select-option(v-for='item in items', :value='item.code', :key='item.code') {{ item.name }}
</template>
<script>
import * as enums from './enums';
import _ from 'lodash';
export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    code: {
      type: String,
      required: true,
    },
    value: [String, Array, Number],
    filter: Function,
    multiple: Boolean,
  },
  computed: {
    items() {
      if (this.code) {
        const enumItems = enums[this.code];
        if (this.filter) {
          return this.filter(enumItems);
        }
        return enumItems;
      }
      return [];
    },
    parseValue() {
      if (this.multiple) {
        if (this.value && _.isString(this.value)) {
          return this.value.split(',');
        }
        return [];
      }
      return this.value || undefined;
    },
    listeners() {
      return _.omit(this.$listeners, 'change');
    },
  },
  methods: {
    changeHandler(e) {
      let value = e;
      if (this.multiple && _.isArray(value)) {
        value = e.join(',');
      }
      this.$emit('change', value);
    },
  },
};
</script>

<style lang="less" scoped></style>
