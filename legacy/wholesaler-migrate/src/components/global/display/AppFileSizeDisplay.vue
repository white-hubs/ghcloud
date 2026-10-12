<template lang="pug">
  span {{text}}
</template>
<script>
import _ from 'lodash';
export default {
  props: {
    size: Number
  },
  computed: {
    text() {
      const units = ['B', 'KB', 'M', 'G', 'T'];
      const unitSize = 1024;
      if (_.isNil(this.size)) {
        return this.size;
      }
      const lg = Math.floor(Math.log(this.size) / Math.log(unitSize));
      const unit = units[lg];
      return _.round(this.size / unitSize ** lg) + unit;
    }
  }
};
</script>