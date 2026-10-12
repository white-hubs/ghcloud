<template lang="pug">
  div.play-h5s
    app-form(:model="model" :rules="rules" ref="form" oneline :labelWidth="60")
      a-row(:gutter="16")
        a-col(:sm="4")
          a-radio-group(v-model="model.playType" button-style="solid")
            a-radio-button(value="LIVE") 直播
            a-radio-button(value="RECORD") 回放
        a-col(:sm="20")
          a-form-model-item(label="时间范围" prop="timeRange" v-if="model.playType === 'RECORD'")
            a-range-picker.ml1(v-model="model.timeRange" format='YYYY-MM-DD HH:mm:ss' valueFormat="YYYY-MM-DDTHH:mm:ssZ" show-time @change="handleDateRangeChange")
    div.video-box.mt2(v-if="!isReady")
      a-spin(:spining="!isReady" style="width: 100%; height: 100%; line-height: 400px;")
    div.video-box.mt2(v-else-if="model.playType === 'LIVE'")
      PlayMonitor(:token="parseCamera.token" :host="host" :specification="parseCamera.specification")
    div.video-box.mt2(v-else)
      playBack(ref="playback" :token="parseCamera.token" :host="host" :specification="parseCamera.specification" :begintime="model.timeRange[0]" :endtime="model.timeRange[1]")
</template>

<script>
import playBack from './playBack';
import PlayMonitor from './PlayMonitor';

import { mapGetters } from 'vuex';
import { GETTER_PROJECT } from '@store/account';
import moment from 'moment';
export default {
  components: {
    PlayMonitor,
    playBack,
  },
  props: {
    id: String,
    camera: Object,
  },
  data() {
    return {
      model: {
        playType: 'LIVE', // RECORD
        timeRange: [moment().add(-60, 'minutes').format(), moment().format()],
      },
      rules: {},
      host: null,
      parseCamera: null,
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    isReady() {
      return this.host && this.parseCamera;
    },
  },
  watch: {
    // id: 'getCamera',
    camera: 'getCamera',
  },
  created() {
    this.getStreamconfig();
    this.getCamera();
  },
  methods: {
    // 获取流媒体视频地址
    async getStreamconfig() {
      const data = await this.$restful('GET:/project-merchant/streamconfig', {
        projectId: this.project.id,
      });
      this.host = data.host + ':' + data.port;
    },
    async getCamera() {
      this.parseCamera = this.camera;
    },
    handleDateRangeChange(val) {
      //
      this.$refs.playback?.refresh();
    },
  },
};
</script>

<style lang="less" scoped>
.play-h5s {
  width: 100%;
  height: 100%;
  .video-box {
    height: 400px;
  }
}
</style>
