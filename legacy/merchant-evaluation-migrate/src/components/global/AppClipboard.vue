<template lang="pug">
  span(v-clipboard:success="successHandler" v-clipboard:copy="text")
    slot
</template>
<script>
export default {
  props: ['text'],
  methods: {
    successHandler() {
      this.$emit('on-success');
    }
  }
};
</script>