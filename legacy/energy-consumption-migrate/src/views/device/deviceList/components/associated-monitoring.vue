<template>
  <div>
    <div class="tab-pane-content gvideo-box" v-if="deviceDataVideos&&deviceDataVideos.length > 0">
      <div v-for="(item, index) in deviceDataVideos" :key="index">
        <div>
          <span class="gvideo-title">{{ item.name }}</span>
          <CubePlayer 
            class="gvideo" 
            :h5sToken="item.token||item.thirdPartyId" 
            :h5sControl="true" 
            :h5sControlBtn="controlBtn"
            :device-id="item.id"
            :dom-id="index"
            :type="videoAccessMode"
            >
          </CubePlayer>
        </div>
      </div>
    </div>
    <div v-else>
      <Empty />
    </div>
  </div>
</template>
<script setup lang="ts">
import { cubeDeviceCenterService } from '@/api/service'
import { onBeforeMount, onMounted, ref } from 'vue'
import { useRoute } from "vue-router";
import { CubePlayer } from '@ghcloud/cube-player'

const deviceDataVideos=ref() 
const controlBtn = ref(['left', 'down', 'up', 'right', 'zoomin', 'zoomout', 'fullscreen'])
const deviceData=ref()
const route = useRoute();
const deviceId = ref();
const videoAccessMode = (window as any).config.feature?.videoAccessMode ?? 'H5S'
// 监控
const getBasicVideosData = async () => {
  deviceId.value=route.query.deviceId
  deviceDataVideos.value = await cubeDeviceCenterService.getDeviceAssociatedVideos(deviceId.value);
};
onBeforeMount(() => {
    })
onMounted(async () => {
  getBasicVideosData();
  deviceData.value = await cubeDeviceCenterService.getDeviceInstanceDetail({deviceId:deviceId.value});
});

</script>
<style lang="less" scoped>
.tab-pane-content {
  height: 100%;
  overflow: auto;

}
.gvideo-box {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;

  .gvideo {
    margin-bottom: 10px;
    margin-right: 10px;
    width: 504px;
    height: 304px;
  }

  .gvideo-title {
    font-size: 16px;
    color: #3d3d3d;
  }
}
</style>