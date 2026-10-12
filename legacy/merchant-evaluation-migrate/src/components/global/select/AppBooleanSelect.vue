<template lang="pug">
  a-select( @change="changeHandler" :value="value" v-bind="$attrs" v-on="listeners")
    a-select-option(:value="true") {{trueText}}
    a-select-option(:value="false") {{falseText}}
</template>
<script>
import _ from 'lodash';
export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: {},
    trueText: {
      type: String,
      default: '是',
    },
    falseText: {
      type: String,
      default: '否',
    },
  },
  computed: {
    listeners() {
      return _.omit(this.$listeners, 'change');
    },
  },
  methods: {
    changeHandler(e) {
      this.$emit('change', e);
    },
  },
};
</script>
