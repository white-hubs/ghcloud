<template>
  <div class="wrapper">
    <div class="basic" >
      <img :src="props.model.fileVOS[0].path" alt="" class="device-img" v-if="props.model.fileVOS && model.fileVOS[0]" width="200" height="200"/>
      <div class="device-info"   v-if="props.deviceData">
        <div class="item">
          <div class="label">设备编号:</div>
          <div class="value">{{ props.deviceData.deviceCode||'--' }}</div>
        </div>
        <div class="item">
          <div class="label">设备型号:</div>
          <div class="value">{{ props.deviceData.modelName||'--' }}</div>
        </div>
        <div class="item">
          <div class="label">所属品牌:</div>
          <div class="value">{{ props.deviceData.brandName||'--' }}</div>
        </div>
      </div>
      <div class="device-info" v-if="props.deviceData">
        <div class="item">
          <div class="label">所属区域:</div>
          <div class="value">{{ props.deviceData.deviceArea||'--' }}</div>
        </div>
        <div class="item">
          <div class="label">设备状态:</div>
          <div class="value">{{ props.deviceData.deviceStatus?'在线':'离线' }}</div>
        </div>
      </div>
      <div class="device-info" v-if="props.deviceData">
        <div class="item">
          <div class="label">初始读数:</div>
          <div class="value">{{ props.deviceData.initValue ?? "--"  }}</div>
        </div>
        <div class="item">
          <div class="label">实时读数:</div>
          <div class="value">{{ props.deviceData.readeValue ?? "--"  }}</div>
        </div>
      </div>
    </div>
    <DeviceControl show ref="deviceBasicData" :deviceId="props.deviceData.deviceId" :instrumentType="props.deviceData.instrumentType"></DeviceControl>
  </div>
</template>
<script setup lang="ts">
import DeviceControl from './device-control.vue'
interface Props {
  deviceData: any;
  model: any;
}
const props = withDefaults(defineProps<Props>(), {
  deviceData:{},
  model:{}
});
</script>
<style lang="less">
.wrapper{
  margin: 20px;
  height: calc(100vh - 350px);
  overflow: auto;
  .device-info {
    margin: 10px 30px;
    min-width: 240px;
    .item {
      display: flex;
      padding:4px 0px;
      .label {
        width: 30%;
      }
      .value {
        width: 70%;
      }
    }
  }
  .basic{
    display: flex;
  }
  .characteristics{
    p{
      margin-top: 20px;
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 10px;
      color: rgba(0, 0, 0, 0.85);
      font-family: "PingFang SC-Medium";
    }
    &>div{display: flex;}
  }
}
</style>