<template lang="pug">
  div.voice-box(v-if="!alarmMuted")
    audio(
      ref="audio"
      :src="audioSource"
      loop
      controls
      :muted="muted"
      hidden="true"
    )
    //- 
      hidden="true"
</template>

<script>
export default {
  props: {
    muted: Boolean,
    alarmMuted: Boolean,
  },
  data() {
    return {
      audioSource: '/resource/v1/audio/woop.mp3',
    };
  },
  watch: {
    alarmMuted() {
      if (!this.muted && !this.alarmMuted) {
        this.$nextTick(() => {
          this.play();
        });
      }
    },
  },
  mounted() {
    if (!this.muted && !this.alarmMuted) {
      this.$nextTick(() => {
        this.play();
      });
    }
  },
  methods: {
    async play() {
      try {
        // this.$refs.audio.pause();
        await this.$refs.audio.play();
      } catch (e) {
        // 报错, 没有点击交互
        this.$emit('update:muted', true);
      }
    },
    pause() {
      this.$refs.audio.pause();
    },
    handleMuted() {
      this.$refs.audio.muted = true;
    },
  },
};
</script>

<style lang="less" scoped>
.voice-box {
  // visibility: hidden;
}
</style>
