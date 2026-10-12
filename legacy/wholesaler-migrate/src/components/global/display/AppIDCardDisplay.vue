<template lang="pug">
  app-privacy-number(v-if="number" :number="number" :start="2" :end="13")
</template>
<script>
export default {
  props: {
    number: String,
  },
  computed: {
    endIndex() {
      if (this.number) {
        return this.number.length === 18 ? 13 : 11;
      }
      return 0;
    },
  },
};
</script>
