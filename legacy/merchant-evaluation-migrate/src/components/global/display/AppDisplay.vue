<template lang="pug">
span
  slot(v-bind:model="model")
</template>
<script>
export default {
  props: {
    url: {
      type: String,
    },
    parameter: Object,
  },
  data() {
    return {
      model: null,
    };
  },
  watch: {
    url() {
      this.loadModel();
    },
  },
  created() {
    this.loadModel();
  },
  methods: {
    async loadModel() {
      if (this.url) {
        this.model = await this.$axios.concurrentRestful(
          this.url,
          this.parameter,
        );
        this.$emit('on-load', { ...this.model });
      } else {
        this.model = null;
      }
    },
  },
};
</script>
