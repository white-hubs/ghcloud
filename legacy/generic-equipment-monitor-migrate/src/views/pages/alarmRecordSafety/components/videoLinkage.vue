<template>
  <div class="video-link-box">
    <!-- <div class="item-title" v-if="alarmStatus !== 'ALARM_HANDLER'">现场情况</div>
    <a-row type="flex" :gutter="[32,16]" v-if="alarmStatus !== 'ALARM_HANDLER'&&realMoitor.length">
        <a-col :span="8" v-for="(item,index) in realMoitor" :key="item.id">
            <H5Video :mediaConfig="mediaConfig" :cameraItem="item" :idStr="'camera_'+index"></H5Video>
        </a-col>
    </a-row> -->
    <div class="item-title">现场抓拍</div>
    <a-row type="flex" :gutter="[32, 16]" v-if="imageList.length">
      <a-image-preview-group>
        <a-col :span="8" v-for="item in imageList" :key="item.id">
          <a-image
            width="520px"
            height="300px"
            :src="
              serveIp === 'http'
                ? item.intranetFilePath + '?session=' + session
                : item.extranetFilePath + '?session=' + session
            "
          ></a-image>
        </a-col>
      </a-image-preview-group>
    </a-row>
    <div v-else>暂无抓拍</div>
    <div class="item-title">现场录像</div>
    <a-row type="flex" :gutter="[32, 16]" v-if="videoList.length">
      <a-col :span="8" v-for="item in videoList" :key="item.id">
        <video controls style="width: 520px; height: 300px; object-fit: fill">
          <source
            :src="
              serveIp === 'http:'
                ? item.intranetFilePath + '?session=' + session
                : item.extranetFilePath + '?session=' + session
            "
            type="video/mp4"
          />
        </video>
      </a-col>
    </a-row>
    <div v-else>暂无录像</div>
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
} from "vue";
import { useRoute } from "vue-router";
export default defineComponent({
  props: {
    alarmStatus: {
      type: String,
    },
    id: {
      type: String,
    },
  },
  setup(props) {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    // const { businessKey } = route.query;
    const businessKeyID = ref("");
    if (route.query.businessKey !== undefined) {
      businessKeyID.value = route.query.businessKey
        ? route.query.businessKey
        : route.query.id;
    } else {
      businessKeyID.value = props.id;
    }
    // ;
    const serveIp = window.location.protocol;
    const state = reactive({
      session: "",
      realMoitor: [],
      mediaConfig: {},
      imageList: [],
      videoList: [],
    });
    onMounted(async() => {
      const data =  await proxy.$api.getVideoPtzSession()
      state.session=data.session
      getStreamMediaConfig();
      getEventBindVideo();
      getVideoEventAction();
    });
    // 获取流媒体配置
    const getStreamMediaConfig = async () => {
      const data = await proxy.$api.getStreamMediaConfig();
      if (data && data.records.length) {
        state.mediaConfig = data.records[0];
      }
    };
    // 获取摄像机
    const getEventBindVideo = async () => {
      const data = await proxy.$api.getVideoActionByEvent({
        eventId: businessKeyID.value,
      });
      if (data) {
        state.realMoitor = data;
      }
    };
    // 获取摄像机联动动作
    const getVideoEventAction = () => {
      proxy.$api
        .getVideoEventAction({ eventId: businessKeyID.value })
        .then(res => {
          state.imageList = res.filter(item => item.type === "PHOTOGRAPH");
          state.videoList = res.filter(item => item.type === "VIDEOTAPE");
        });
    };
    return {
      ...toRefs(state),
      serveIp,
      businessKeyID,
    };
  },
});
</script>

<style lang="less" scoped>
@import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");
.item-title {
  font-family: "PingFang SC-Medium";
}
.video-link-box {
  width: 100%;
}
</style>
