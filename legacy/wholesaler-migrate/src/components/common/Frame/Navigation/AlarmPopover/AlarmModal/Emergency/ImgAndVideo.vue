<template lang="pug">
.monitor-tabs
  a-tabs
    a-tab-pane(
      v-for='(photo, index) in photos',
      :key='photo.id',
      :tab='"图片 " + (index + 1)'
    )
      .tab-img-box
        img(:src='filehost + photo.path')
    a-tab-pane(
      v-for='(video, index) in videos',
      :key='video.id',
      :tab='"视频 " + (index + 1)'
    )
      .tab-img-box
        video(:src='filehost + video.path', autoplay, loop, muted)
</template>

<script>
export default {
  props: {
    eventData: Object,
  },
  data() {
    return {
      pohots: [],
      videos: [],
    };
  },
  computed: {
    filehost() {
      return this.$filehost;
    },
  },
  created() {
    const photos = [];
    const videos = [];
    this.eventData.fileDTOS.forEach((file) => {
      if (/^(png|jpg|gif|bmp|jpeg|svg)$/i.test(file.type)) {
        photos.push(file);
      } else {
        videos.push(file);
      }
    });
    this.photos = photos;
    this.videos = videos;
  },
  methods: {},
};
</script>

<style lang="less" scoped>
.monitor-tabs {
  .tab-img-box {
    height: 400px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      max-height: 100%;
      max-width: 100%;
    }
    video {
      max-height: 100%;
      max-width: 100%;
    }
  }
}
</style>
