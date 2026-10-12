<template lang="pug">
span
  a-checkable-tag(v-for='item in items'  @change="(checked) => changeHandler(item, checked)" :checked="value.indexOf(item.code) > -1" :key="item.code") {{item.name}}
</template>
<script>
import Select from './Select';
import _ from 'lodash';
export default {
  extends: Select,
  methods: {
    changeHandler(item) {
      const selection = this.value || [];
      this.$emit('change', _.xor([...selection], [item.code]));
    },
  },
};
</script>
