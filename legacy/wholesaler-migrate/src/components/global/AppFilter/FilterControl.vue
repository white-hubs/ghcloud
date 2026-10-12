<template lang="pug">
  component(:is="component" :value="value"  @input="inputHandler" @change="inputHandler" v-bind="bindProps")
</template>
<script>
import _ from 'lodash';
const controls = {
  Dictionary: 'app-dictionary-select',
  Enum: 'app-enum-select',
  Number: 'a-input-number',
  Date: 'a-date-picker',
  User: 'app-user-select',
  Boolean: 'app-boolean-select'
};
export default {
  props: {
    control: Object,
    value: {
      required: false
    }
  },
  computed: {
    component() {
      if (this.control) {
        if (this.control.custom) {
          return this.control.type;
        }
        return controls[this.control.type] || 'a-input';
      }
      return 'a-input';
    },
    bindProps() {
      return { ...this.$attrs, ..._.get(this.control, 'props') };
    }
  },
  methods: {
    inputHandler(e) {
      if (e instanceof Event) {
        this.$emit('input', e.target.value);
      } else {
        this.$emit('input', e);
      }
    }
  }
};
</script>
