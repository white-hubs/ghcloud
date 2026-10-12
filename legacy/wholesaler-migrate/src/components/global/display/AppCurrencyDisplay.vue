<template lang="pug">
  span {{text}}
</template>
<script>
import _ from 'lodash';
export default {
  props: {
    ammount: Number
  },
  computed: {
    text() {
      if (_.isNil(this.ammount)) {
        return this.ammount;
      }
      return `¥${this.ammount
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    }
  }
};
</script>