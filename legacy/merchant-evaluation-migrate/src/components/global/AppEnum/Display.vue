<template lang="pug">
span
  slot(v-bind:model="model")
    span {{model && model.name}}
</template>
<script>
import * as enums from './enums';
export default {
  props: {
    code: {
      type: String,
      required: true,
    },
    value: [String, Number],
  },
  computed: {
    model() {
      const enumValues = enums[this.code];
      return enumValues.find((a) => a.code === this.value);
    },
  },
};
</script>

<style lang="less" scoped></style>
