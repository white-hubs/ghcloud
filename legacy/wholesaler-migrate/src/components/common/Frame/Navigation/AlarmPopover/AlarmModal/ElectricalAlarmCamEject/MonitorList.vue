<template lang="pug">
  div.monitor-tabs()
    a-tabs(v-if="IPLoaded")
      a-tab-pane(v-for="cam in devices" :key="cam.id" :tab="cam.name")
        div.tab-video-container
          H5sVideo( :ip="ip" :token="cam.token")
</template>

<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';

import H5sVideo from '@/pages/JKPT/components/video.vue';
export default {
  components: {
    H5sVideo,
  },
  props: {
    devices: [Array, Object],
  },
  data() {
    return {
      ip: null,
      IPLoaded: false,
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
  },
  created() {
    this.getStreamconfig();
  },
  methods: {
    // 获取流媒体视频地址
    async getStreamconfig() {
      const data = await this.$restful('GET:/project-merchant/streamconfig', {
        projectId: this.project.id,
      });
      this.ip = data.host + ':' + data.port;
      this.IPLoaded = true;
    },
  },
};
</script>

<style lang="less" scoped>
.monitor-tabs {
}
</style>
