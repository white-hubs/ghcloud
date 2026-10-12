<template lang="pug">
  span.app-label
    span.word(v-for="word in labelArr") {{word}}
</template>
<script>
export default {
  props: {
    label: String
  },
  computed: {
    labelArr() {
      if (this.label) {
        return this.label.split('');
      }
      return [];
    }
  }
};
</script>
<style lang="less">
.app-label {
  display: inline-flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>