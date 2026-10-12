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
          <a-image width="520px" height="300px" :src="
              serveIp === 'http'
                ? item.intranetFilePath + '?session=' + session
                : item.extranetFilePath + '?session=' + session
            "></a-image>
        </a-col>
      </a-image-preview-group>
    </a-row>
    <div v-else>暂无抓拍</div>
    <div class="item-title">现场录像</div>
    <a-row type="flex" :gutter="[32, 16]" v-if="validVideoList.length">
      <a-col :span="8" v-for="item in validVideoList" :key="item.id">
        <video controls style="width: 520px; height: 300px; object-fit: fill">
          <source :src="
              serveIp === 'http:'
                ? item.intranetFilePath + '?session=' + session
                : item.extranetFilePath + '?session=' + session
            " type="video/mp4" />
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
    const businessKey = ref("");

    if (route.query.businessKey !== undefined) {
      businessKey.value = route.query.businessKey
        ? route.query.businessKey
        : route.query.id;
    } else {
      businessKey.value = props.id;
    }

    const serveIp = window.location.protocol;
    const state = reactive({
      session: window.videoSession,
      realMoitor: [],
      mediaConfig: {},
      imageList: [],
      videoList: [],
      validVideoList: [], // 存储可播放的视频列表
    });
    onMounted(() => {
      getStreamMediaConfig();
      getEventBindVideo();
      getVideoEventAction();
    });
    // 获取流媒体配置
    const getStreamMediaConfig = async () => {
      const data = await proxy.$api.getStreamMediaConfig();
      // if (data && data.records.length) {
      //   state.mediaConfig = data.records[0];
      // }
    };
    // 获取摄像机
    const getEventBindVideo = async () => {
      const data = await proxy.$api.getVideoActionByEvent({
        eventId: businessKey.value,
      });
      if (data) {
        state.realMoitor = data;
      }
    };
    // 检测视频地址是否可播放
    const checkVideoUrl = (url) => {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        
        const onLoadedMetadata = () => {
          cleanup();
          resolve(true);
        };
        
        const onError = () => {
          cleanup();
          resolve(false);
        };
        
        const cleanup = () => {
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          video.removeEventListener('error', onError);
          video.src = '';
        };
        
        video.addEventListener('loadedmetadata', onLoadedMetadata);
        video.addEventListener('error', onError);
        
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
        const videoUrl = serveIp === 'http:'
          ? video.intranetFilePath + '?session=' + state.session
          : video.extranetFilePath + '?session=' + state.session;
        
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
        const res = await proxy.$api.getVideoEventAction({ eventId: businessKey.value });
        state.imageList = res.filter(item => item.type === "PHOTOGRAPH");
        const videoList = res.filter(item => item.type === "VIDEOTAPE");
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
      businessKey,
      serveIp,
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
