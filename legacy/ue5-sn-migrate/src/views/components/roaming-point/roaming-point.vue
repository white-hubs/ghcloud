<template>
  <div class="roaming-point">
    <div class="button_style" @click="suspend">
      <caret-right-outlined v-show="suspendFlag" />
      <pause-outlined v-show="!suspendFlag" />
      {{suspendFlag?"暂停":'开始'}}
    </div>
    <div class="button_style" @click="closeRoam">
      <poweroff-outlined />
      退出
    </div>
    <a-radio-group class="radioList" @change="goPoint" v-model:value="pointSelect" size="small">
      <a-radio-button :title="item.pointName" :style="radioStyle" :value="item.pointName" v-for="item in point">{{ item.pointName
        }}</a-radio-button>
    </a-radio-group>
  </div>
</template>

<script setup lang="ts">
import {UeClient} from "@ghcloud/cube-visual-sdk";
import { ref, reactive,onMounted, onUnmounted, watch} from 'vue'
import { roamingDevices } from "@/piniaStore/roamingDevices";
import { CaretRightOutlined , PauseOutlined , PoweroffOutlined} from '@ant-design/icons-vue';
const ueClient = UeClient.getInstance();
const piniaRoamingDevices = roamingDevices();
const emits = defineEmits(['closeRoam'])
const props = withDefaults(defineProps<{
  point: {perspective:string;pointName:string,speed:string}[];
}>(), {})
const pointSelect = ref(props.point[0].pointName)
const suspendFlag = ref(true)
const radioStyle = reactive({
      display: 'flex',
      height: '30px',
      lineHeight: '30px',
});

const goPoint = ()=>{
  props.point.forEach((item,index) => {
    if (JSON.stringify(pointSelect.value) === JSON.stringify(item.pointName)) {
      piniaRoamingDevices.cameraViewSuccess = index
    }
  });
  ueClient.send('stopCameraView');
  roamingEvents()
}
// 漫游事件
const roamingEvents = (speed = 0.3)=>{
  if(props.point[piniaRoamingDevices.cameraViewSuccess].perspective){
    pointSelect.value = props.point[piniaRoamingDevices.cameraViewSuccess].pointName
      ueClient.send('changeCameraView',{
        ...JSON.parse(props.point[piniaRoamingDevices.cameraViewSuccess].perspective),
        speed:piniaRoamingDevices.cameraViewSuccess === 0?50:props.point[piniaRoamingDevices.cameraViewSuccess].speed ?? 0.3,
      });
    ueClient.send('stopFlashAll');
    piniaRoamingDevices.roamingDevicesArr = []
  }
  }
watch(()=>piniaRoamingDevices.isRoaming,(newVal)=>{
  if (newVal && suspendFlag.value) {
    goPoint()
  }else{
    ueClient.send('stopCameraView');
  }
})
watch(()=>piniaRoamingDevices.cameraViewSuccess,(newVal,oldVal)=>{
  if (newVal !== oldVal && piniaRoamingDevices.isRoaming && suspendFlag.value) {
    roamingEvents()
  }
})
const suspend = ()=>{
  if(suspendFlag.value){
    ueClient.send('stopCameraView');
  }else{
    goPoint()
  }
  suspendFlag.value = !suspendFlag.value
}
const closeRoam = ()=>{
  ueClient.send('stopCameraView');
  piniaRoamingDevices.cameraViewSuccess = 0
  piniaRoamingDevices.roamingDevicesArr = []
  ueClient.send('stopFlashAll');
  emits('closeRoam')
}
onMounted(()=>{
  roamingEvents(20)
})
</script>
<style lang="less" scoped>
.roaming-point {
  display: flex;
  flex-direction: column;

  .roaming-point-close {
    margin-bottom: 10px;
  }
}

:deep(.ant-radio-button-wrapper) {
  border-radius: 13px;
  margin-bottom: 5px;
  border: 1px solid transparent;
  height: 30px !important;
  line-height: 30px !important;
  background: rgba(6, 6, 6, 0.7);
  color: #fff;
  text-align: center;

}

:deep(.ant-radio-button-wrapper span):nth-child(2) {
  display: inline-block !important;
  width: 55px !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.ant-radio-button-wrapper)::before {
  display: none;
}

:deep(.ant-radio-button-wrapper-checked) {
  color: #fff;
  border-color: transparent !important;
  background-color: #1890ff;
}

:deep(.ant-radio-button-input) {
  display: none;
}

.button_style {
  width: auto;
  background: rgba(6, 6, 6, 0.7);
  color: #FFFFFF;
  font-size: 12px;
  border-radius: 13px;
  text-align: center;
  height: 30px !important;
  line-height: 30px !important;
  cursor: pointer;
  margin-top: 5px;
}
.radioList{
  margin-top: 20px;
  height: 500px;
  overflow-y: auto;
}
</style>