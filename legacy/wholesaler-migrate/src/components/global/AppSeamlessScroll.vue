<template lang="pug">
  div(ref="content")
    vue-seamless-scroll(v-if="contentHeight < childHeight" :data="[0]" class="seamless-warp" :classOption="{ step: 0.4, limitMoveNum:1 }")
      slot
    slot(v-else)
</template>

<script>
export default {
  data() {
    return {
      contentHeight: 0,
      childHeight: 0,
    };
  },
  updated() {
    this.getContentHeight();
  },
  mounted() {
    this.getContentHeight();
  },
  methods: {
    getContentHeight() {
      this.contentHeight = this.$refs.content?.clientHeight || 0;
      const child = this.$refs.content.children[0];
      if (child) {
        this.childHeight = child?.clientHeight || 0;
      }
    },
  },
};
</script>

<style></style>
