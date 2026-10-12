<template>
  <device-panel-templat :title="deviceInfo.name">
    <div class="camera-box">
      <h5-video :control="true" :cameraItem="deviceInfo" :idStr="'modal_' + deviceInfo.token"></h5-video>
    </div>
  </device-panel-templat>
</template>
<script lang="ts" setup>
import { withDefaults } from "vue";
import DevicePanelTemplat from "./devicePanelTemplat.vue";
import H5Video from "@/components/businessPanel/public/H5Video.vue";
interface Props {
  deviceInfo: any;
}
const props = withDefaults(defineProps<Props>(), {
  deviceInfo: {
    name: "设备名称",
    token: "",
  },
});
</script>
<style lang="less" scoped>
.camera-box {
  width: 100%;
  height: 530px;
}
:deep(svg){
  display: inline-block;
  width: 15px !important;
  height: 15px !important;
}
</style>
