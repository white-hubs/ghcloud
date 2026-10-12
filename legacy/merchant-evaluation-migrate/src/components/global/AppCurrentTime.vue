<template lang="pug">
app-date-display(:date="date" :format="format")
</template>
<script>
export default {
  props: {
    format: {
      type: String,
      default: 'YYYY-MM-DD HH:mm:ss',
    },
  },
  data() {
    return {
      date: Date.now(),
    };
  },
  created() {
    this.timer = setInterval(this.updateDate, 200);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    updateDate() {
      this.date = Date.now();
    },
  },
};
</script>
