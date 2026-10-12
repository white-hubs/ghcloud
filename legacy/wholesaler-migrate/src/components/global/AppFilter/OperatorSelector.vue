<template lang="pug">
  a-select(:value="value" @change="changeHandler" v-bind="$attrs" v-on="listeners")
    a-select-option(v-for="item in supportOperators" :value="item.operator" :key="item.operator") {{item.label}}
</template>
<script>
import { OperatorsDictionary } from '@/models/common/Operators';
import _ from 'lodash';
export default {
  model: {
    prop: 'value',
    event: 'change'
  },
  props: ['operators', 'value'],
  computed: {
    supportOperators() {
      if (this.operators) {
        return OperatorsDictionary.filter(a =>
          this.operators.includes(a.operator)
        );
      }
      return [];
    },
    listeners() {
      return _.omit(this.$listeners, 'change');
    }
  },
  methods: {
    changeHandler(e) {
      this.$emit('change', e);
    }
  }
};
</script>
<style lang="less" scoped>
.filter-item {
  display: flex;
  & > input {
    border: 1px solid #eee;
    outline: none;
    vertical-align: top;
  }
  .label {
    flex: none;
    width: 12rem;
  }
  .operator {
    flex: none;
    width: 6rem;
  }
  .value {
    flex: auto;
  }
}
</style>