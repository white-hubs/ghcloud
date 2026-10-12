<template lang="pug">
  div.voice-box(v-if="visible")
    audio(
      ref="audio"
      :src="audioSource"    
      hidden="true"
    )
</template>

<script>
// 探测是否可以直接播放音频/视频
export default {
  props: {
    canAutoPlay: Boolean,
  },
  data() {
    return {
      visible: true,
      audioSource: '/resource/v1/audio/woop.mp3',
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.play();
    });
  },
  methods: {
    async play() {
      try {
        // this.$refs.audio.pause();
        await this.$refs.audio.play();
        this.$emit('update:canAutoPlay', true);
      } catch (e) {
        // 报错, 没有点击交互
        this.$emit('update:canAutoPlay', false);
      }
      this.visible = false;
    },
    reTest() {
      this.visible = true;
      this.$nextTick(() => {
        this.play();
      });
    },
  },
};
</script>

<style lang="less" scoped>
.voice-box {
  // visibility: hidden;
}
</style>
