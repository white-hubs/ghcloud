<template lang="pug">
div.wrapper
  a-textarea(:value="value" @change="handleChange" v-on="listeners" v-bind="$attrs" :maxLength="maxLength")
  div.tip(v-if="maxLength") {{value?value.length:0}}/{{maxLength}} 字
</template>
<script>
import _ from 'lodash';
export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: String,
    maxLength: Number,
  },
  computed: {
    listeners() {
      return _.omit(this.$listeners, 'change');
    },
  },
  methods: {
    handleChange(e) {
      this.$emit('change', e.target.value);
    },
  },
};
</script>
<style lang="less" scoped>
.wrapper {
  display: inline-block;
  position: relative;
  .tip {
    position: absolute;
    right: 0.5rem;
    bottom: 0.5rem;
    color: rgba(0, 0, 0, 0.45);
  }
}
</style>
