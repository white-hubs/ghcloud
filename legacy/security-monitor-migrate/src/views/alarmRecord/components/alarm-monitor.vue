<template>
  <div class="video-link-box">
    <div class="item-title">实时监控</div>
    <a-row type="flex" :gutter="[32, 16]" v-if="realMonitor.length">
      <a-col :span="8" v-for="item in realMonitor" :key="item.deviceId">
        <CubePlayer v-if="item.deviceId" :h5sToken="item.token" :h5sControl="true" :type="videoType" :dom-id="item.deviceId"
          :device-id="item.deviceId" />
      </a-col>
    </a-row>
    <div v-else>暂无监控</div>
  </div>
</template>

<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  onMounted,
  watch,
  ref,
  computed
} from "vue";
import { useRoute } from "vue-router";
import { cubeDeviceCenterService } from "@/api/service";
import { CubePlayer } from '@ghcloud/cube-player'
export default defineComponent({
  props: {
    alarmStatus: {
      type: String,
    },
    id: {
      type: String,
    },
  },
  components: { CubePlayer },
  setup(props) {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const videoType = computed(()=>{
      return window.config.feature?.videoAccessMode ?? 'H5S'
    })
    const state = reactive({
      realMonitor: [],
      businessKey: props.id
    });
    if (route.query.businessKey !== null && route.query.businessKey === undefined && route.query.businessKey) {
      state.businessKey = route.query.businessKey
    }
    /*
      * 获取报警视频监控
      * @param {String} eventId 事件id
      * @return {Array}
      */
    const getEventVideo = async () => {
      const data = await proxy.$api.getVideoActionByEvent({
        eventId: state.businessKey,
      });
      if (data) {
        state.realMonitor = data;
      }
    };
    onMounted(() => {
      getEventVideo();
    });
    return {
      ...toRefs(state),
      videoType
    };
  },
});
</script>

<style lang="less" scoped>
@import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");

.detail-form .video-link-box {
  width: 100%;
  .item-title {
    font-family: "PingFang SC-Medium";
    padding-top: 15px !important;
  }
  .cube-player{
    width: 520px;
    height: 300px;
  }
}
</style>
