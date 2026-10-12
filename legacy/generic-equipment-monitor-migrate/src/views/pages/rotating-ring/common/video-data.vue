<template>
  <div>
    <div
      class="gvideo-box"
      v-if="deviceDataVideos.length > 0"
    >
    <a-row justify="left" align="top" :gutter="[16,8]">
      <a-col :span="8" v-for="(item, index) in deviceDataVideos" :key="index">
        <span class="gvideo-title">{{ item.name }}</span>
        <g-video
          :ref="el => setRef(el, index)"
          class="gvideo"
          :token="item.token"
          :control="true"
          :coutrolBtns="coutrolBtns"
          @fullScreen="fullScreen(item, index)"
        ></g-video>
      </a-col>
    </a-row>
    </div>
    <div v-else>
      <a-empty />
    </div>
  </div>
</template>
<script lang="jsx">
import { applicationCodeGroud } from "@/utils/enumerate.js";
import {
  computed,
  defineComponent, getCurrentInstance, onBeforeMount,nextTick,
  onMounted, reactive, ref, toRefs, watch
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
export default defineComponent({
  name: "",
  components: {  },
  setup() {
    const currentDevice = ref('ups')

    const refList = ref([]);
    const applicationCode = ref(null);
    const coutrolBtns = ref(['left', 'down', 'up', 'right', 'zoomin', 'zoomout', 'fullscreen'])

    const setRef = (el, index) => {
      refList.value[index] = el;
    };

    const fullScreen = (status, index) => {
      const element = refList.value[index].$el;
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullScreen();
      }
    };
    // 设备上的控制按钮
    const store = useStore();
    const state = reactive({
      deviceDataVideos: [],
    });
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const deviceId = route.query.deviceId;

    // 监控
    const getBasicVideosData = async () => {
      const data = await proxy.$api.getDeviceVideosInfo({
        deviceInstanceId: deviceId,
      });
      if (data) {
        state.deviceDataVideos = data;
      }
    };
    onBeforeMount(() =>{
      const application = computed(() => {
        return JSON.parse(sessionStorage.getItem("GH-currentApplication"))
      });
      applicationCode.value = application.value.code;
      if(applicationCodeGroud[applicationCode.value]){
        const isMeet = applicationCodeGroud[applicationCode.value].includes('会议')
      if (isMeet) coutrolBtns.value = ['fullscreen']
      }
    })
    onMounted(() => {
      getBasicVideosData()
    })
    return {
      ...toRefs(state),
      fullScreen,
      getBasicVideosData,
      refList,
      setRef,
      deviceId,
      coutrolBtns,
      currentDevice
    };
  },
});
</script>
<style scoped lang="less">
.fireControlLookPageDeil {
  position: relative;
  height: 100%;
  .buttom-btn {
    position: absolute;
    bottom: 20px;
    right: 20px;
  }
}

.gvideo {
  margin-bottom: 15px;
  margin-right: 10px;
  // width: 504px;
  height: 304px;
  background: rgba(0, 0, 0, 0.85);
}
.gvideo-title {
  font-size: 16px;
  font-family: Source Han Sans, Source Han Sans;
  font-weight: 400;
  color: #3D3D3D;
  display: block;
  margin-bottom: 5px;
}
</style>
