<template>
  <div class="panel">
    <SubPanelTemplate :title="props.title" class="monitor">
      <!-- <template #extra>
        <div class="right-bar" @click="changeVideo" :class="[cameraListTotal.length - 1 === 0 ? 'forbidden' : '']">
          <div>切换</div>
          <img :src="getAssetsImage('changingOver.png')" alt="" />
        </div>
      </template> -->
      <div class="video-body">
        <!-- <div class="title">监控组</div> -->
         <div class="camera-item" v-if="cameraList.length === 1">
          <div class="camera">
            <H5Video @error="onError" :cameraItem="cameraList[0]" :idStr="cameraList[0].token" :key="cameraList[0].thirdPartyId"></H5Video>
          </div>
         </div>
        <div class="group" v-else-if="cameraList.length > 0">
          <div class="camera" v-for="(item, index) in cameraList" :key="item.thirdPartyId + index" @click="clickCamera(item)">
            <H5Video @error="onError" :cameraItem="item" :idStr="item.token + index"></H5Video>
          </div>
        </div>
        <div class="group" v-else="cameraList.length <= 0">
          <noData></noData>
        </div>
      </div>
    </SubPanelTemplate>
  </div>
</template>
<script lang="ts" setup>
import {  onMounted, ref } from "vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import H5Video from "@/components/businessPanel/public/H5Video.vue";
import bus from "@/utils/bus";
import usrCommon from "@/components/hooks/useCommon";
import { VideoType } from "@/api/models/vmonitor";
import { getDataDictionaryByItem } from "@/api/dictionary";
import { storeArea } from "@/piniaStore/area"
import { videoListDevices } from '@/api/vmonitor'
import { splitArray } from '@/utils/common'

const props = withDefaults(defineProps<{
  title?: string;
}>(), {
  title: '视频监控'
})
const num = ref(0);
let cameraList = ref<VideoType[]>([]);
const videoList = ref([])
const piniaStoreArea = storeArea();
const monitor_layout = ref('2X2')
const cameraListTotal = ref([]);
const videoNum = ref(4)
const moveMatchedToEnd = (arr, id) => {
  // 过滤出匹配的元素
  const matched = arr.filter(item => item.id === id);
  // 过滤出不匹配的元素
  const notMatched = arr.filter(item => item.id !== id);
  // 将不匹配的元素和匹配的元素合并
  return notMatched.concat(matched);
}

// 获取视频列表
const getVideo = async () =>{
  await getDictionary()
  if (monitor_layout.value === '2X2') {
    videoNum.value = 4
  }else if (monitor_layout.value === '1X1') {
    videoNum.value = 1
  }
  let params = {
      areaId: piniaStoreArea.currentAreaId,
  }
  videoList.value = await videoListDevices(params)
  cameraListTotal.value = splitArray(videoList.value, videoNum.value)
  if (cameraListTotal.value.length !== 0) {
    cameraList.value = JSON.parse(JSON.stringify(cameraListTotal.value[num.value]))
  }
}
// 切换视频
const changeVideo = () => {
  cameraList.value.length = 0
  if (num.value === cameraListTotal.value.length - 1) {
    num.value = 0;
  } else {
    num.value++;
  }
  if (cameraListTotal.value.length !== 0) {
    cameraList.value = JSON.parse(JSON.stringify(cameraListTotal.value[num.value]))
  }
};
const onError = (id) => {
  cameraList.value.length = 0
  videoList.value = moveMatchedToEnd(JSON.parse(JSON.stringify(videoList.value)),id)
  cameraListTotal.value = splitArray(videoList.value, videoNum.value)
  if (cameraListTotal.value.length !== 0) {
    cameraList.value = JSON.parse(JSON.stringify(cameraListTotal.value[num.value]))
  }
}
const clickCamera = (item) => {
  bus.emit("switchCamera", item);
};
const getDictionary = async () => {
 const res = await getDataDictionaryByItem('SERVICE_CONFIGURATION')
 if (res.length && res[0].variable && JSON.parse(res[0].variable).monitor_layout) {
  monitor_layout.value = JSON.parse(res[0].variable).monitor_layout
 }
}
onMounted(() => {
  getVideo();
});
</script>
<style lang="less" scoped>
.panel {
  padding: 8px;
  padding-bottom: 0;
  display: flex;
  flex-direction: column;
}

.chart {
  height: 160px;
  display: flex;
  align-items: center;
}



.monitor {
  .video-body {
    margin-top: 0;
    .camera-item{
      .camera{
        min-height: 170px;
      }
    }
  }

  .title {
    color: #fff;
    font-size: 16px;
  }

  .group {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .camera {
      margin: 0 6px;
      width: 160px;
      height: 90px;
      margin-top: 10px;
    }
  }
}

.alarm-event {
  .footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
}

.extra {
  font-family: Roboto-Regular, Roboto;
  font-weight: 400;
  margin-left: 8px;

  span {
    color: #e7f0ff;
    font-size: 12px;
  }

  .downtriangle {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #d2fff3;
    margin-right: 3px;
    transform: rotate(180deg);
  }

  .uptriangle {
    border-bottom: 8px solid #ffcece;
    transform: rotate(0deg);
  }

  .radio {
    font-size: 12px;
  }

  .up {
    color: #f14545;
  }

  .down {
    color: #2ae8bd;
  }
}

.right-bar {
  width: 56px;
  height: 24px;
  background: rgba(41, 137, 255, 0.102);
  border-radius: 2px;
  border: 1px solid #2989ff;
  color: #fff;
  text-align: center;
  line-height: 24px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: space-around;

  img {
    width: 14px;
    height: 14px;
  }
}

.forbidden {
  background-color: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}
</style>
