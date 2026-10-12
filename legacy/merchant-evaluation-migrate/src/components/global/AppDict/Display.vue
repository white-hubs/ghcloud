<template lang="pug">
span
  slot(v-bind:model="model")
    span {{model && model.name}}
</template>
<script>
import { GETTER_DICT_MAP } from '@store/dict';
import { mapGetters } from 'vuex';
export default {
  props: {
    value: [String, Number],
  },
  computed: {
    ...mapGetters({
      dicts: GETTER_DICT_MAP,
    }),
    model() {
      return this.dicts[this.value];
    },
  },
};
</script>

<style lang="less" scoped></style>
