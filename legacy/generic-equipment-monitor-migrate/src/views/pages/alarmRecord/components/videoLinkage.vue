<template>
  <div class="video-link-box">
    <div v-if="imageList.length || (showRealMonitorAction && realMoitor.length)" class="item-title-row">
      <div class="item-title">
        <span> 现场抓拍 </span>
        <a-button v-if="showRealMonitorAction && realMoitor.length" type="link" @click="$emit('play-real-monitor')">
          播放实时监控
        </a-button>
      </div>
    </div>
    <template v-if="imageList.length">
      <a-row type="flex" :gutter="[32, 16]">
        <a-image-preview-group>
          <a-col :span="8" v-for="item in imageList" :key="item.id">
            <a-image
              width="100%"
              height="100%"
              :src="serveIp === 'http' ? item.intranetFilePath + url : item.extranetFilePath + url"
            ></a-image>
          </a-col>
        </a-image-preview-group>
      </a-row>
    </template>
    <template v-if="validVideoList.length > 0">
      <div class="item-title">现场录像</div>
      <a-row type="flex" :gutter="[32, 16]" v-if="validVideoList.length">
        <a-col :span="8" v-for="item in validVideoList" :key="item.id">
          <video controls style="width: 100%; object-fit: fill">
            <source :src="serveIp === 'http:' ? item.intranetFilePath + url : item.extranetFilePath + url" type="video/mp4" />
          </video>
        </a-col>
      </a-row>
    </template>
  </div>
</template>

<script lang="jsx">
import { defineComponent, reactive, toRefs, getCurrentInstance, onMounted, watch, ref } from "vue";
import { useRoute } from "vue-router";
export default defineComponent({
  props: {
    alarmStatus: {
      type: String,
    },
    id: {
      type: String,
    },
    showRealMonitorAction: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["play-real-monitor"],
  setup(props) {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    // const { businessKey } = route.query;
    const businessKeyID = ref("");
    if (route.query.businessKey !== undefined) {
      businessKeyID.value = route.query.businessKey ? route.query.businessKey : route.query.id;
    } else {
      businessKeyID.value = props.id;
    }
    // ;
    const serveIp = window.location.protocol;
    const state = reactive({
      session: window.videoSession,
      realMoitor: [],
      mediaConfig: {},
      imageList: [],
      videoList: [],
      validVideoList: [], // 存储可播放的视频列表
      url: "",
    });
    onMounted(() => {
      getStreamMediaConfig();
      getEventBindVideo();
      getVideoEventAction();
    });
    // 获取流媒体配置
    const getStreamMediaConfig = async () => {
      const data = await proxy.$api.getStreamMediaConfig();
      if (data && data.records.length) {
        state.mediaConfig = data.records[0];
        state.url = data.records[0].name === "H5S" ? `?session=${state.session}` : "";
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
    // 检测视频地址是否可播放
    const checkVideoUrl = (url) => {
      return new Promise((resolve) => {
        const video = document.createElement("video");
        video.preload = "metadata";

        const onLoadedMetadata = () => {
          cleanup();
          resolve(true);
        };

        const onError = () => {
          cleanup();
          resolve(false);
        };

        const cleanup = () => {
          video.removeEventListener("loadedmetadata", onLoadedMetadata);
          video.removeEventListener("error", onError);
          video.src = "";
        };

        video.addEventListener("loadedmetadata", onLoadedMetadata);
        video.addEventListener("error", onError);

        // 设置超时，避免长时间等待
        setTimeout(() => {
          cleanup();
          resolve(false);
        }, 5000);

        video.src = url;
      });
    };

    // 批量检测视频地址
    const validateVideoList = async (videos) => {
      const validVideos = [];

      for (const video of videos) {
        const videoUrl = serveIp === "http:" ? video.intranetFilePath + state.url : video.extranetFilePath + state.url;

        const isValid = await checkVideoUrl(videoUrl);
        if (isValid) {
          validVideos.push(video);
        }
      }

      return validVideos;
    };

    // 获取摄像机联动动作
    const getVideoEventAction = async () => {
      try {
        const res = await proxy.$api.getVideoEventAction({ eventId: businessKeyID.value });
        state.imageList = res.filter((item) => item.type === "PHOTOGRAPH");
        const videoList = res.filter((item) => item.type === "VIDEOTAPE");
        state.videoList = videoList;

        // 检测视频地址有效性
        state.validVideoList = await validateVideoList(videoList);
      } catch (error) {
        state.imageList = [];
        state.videoList = [];
        state.validVideoList = [];
      }
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
  font-size: 16px;
  font-weight: 600;
  margin: 10px 0;
}

.item-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.video-link-box {
  width: 100%;
}
</style>
