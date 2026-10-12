<template lang="pug">
  div.page-loading(v-show="loading")
    a-spin(size="large")
</template>

<script>
import Vue from 'vue';
export default {
  data() {
    return {
      loading: false,
    };
  },
  beforeCreate() {
    this.$root.$showLoading = this.show;
    this.$root.$hideLoading = this.hide;
  },
  beforeDestroy() {},
  methods: {
    show() {
      this.loading = true;
    },
    hide() {
      this.loading = false;
    },
  },
};
</script>

<style scoped>
.page-loading {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  /* background: chartreuse; */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}
</style>
