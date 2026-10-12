<template lang="pug">
  span {{prasedDate}}
</template>
<script>
import moment from 'moment';
export default {
  props: {
    date: [String, Number, Date, Object],
    format: {
      type: String,
      default: 'YYYY-MM-DD'
    }
  },
  computed: {
    prasedDate() {
      if (this.date) {
        return moment(this.date).format(this.format);
      }
      return '';
    }
  }
};
</script>