<template lang="pug">
  a-date-picker(:value="parsedValue" @change="changeHandler" v-bind="$attrs"  )
</template>
<script>
import moment from 'moment';
export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: {},
  },
  computed: {
    parsedValue() {
      if (this.value && !moment.isMoment(this.value)) {
        return moment(this.value);
      }
      return this.value;
    },
  },
  methods: {
    changeHandler(value) {
      this.$emit('change', value);
    },
  },
};
</script>
