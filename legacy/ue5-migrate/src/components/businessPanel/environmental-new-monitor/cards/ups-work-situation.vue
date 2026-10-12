<template>
  <SubPanelTemplate title="UPS工作情况" class="alarm-event">
    <work-situation
      @handlecurrent="handlecurrentUps"
      :contentList="twoUpsData[carousel]"
      v-show="twoUpsData[carousel]?.length"
    ></work-situation>
    <noData v-show="!twoUpsData[carousel]?.length"></noData>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import WorkSituation from "../components/work-situation.vue";
import { byTagProperties } from "@/api/device";
import { cubeDeviceCenterService } from "@/api/service";
import noData from "@/components/businessPanel/public/noData.vue";
import { setSpecialCamera } from "@/views";

const upsData = ref([]);
const twoUpsData = ref([]);
const carousel = ref(0);
let timer: any = ref(null);

const getUpsData = async () => {
  const res = await byTagProperties({ tagCode: "builtin.usage::ups", iotPropertyCodes: ["bat_time"] });
  upsData.value = [];
  res.forEach((item) => {
    item.iotProperties.forEach((iot) => {
      upsData.value.push({
        name: item.deviceName,
        value: iot.name + ":" + (iot.originalValue ? (iot.originalValue / 3600).toFixed(2) : 0) + "时",
        id: item.id,
      });
    });
  });
  twoUpsData.value = [];
  //  数据切割为4个的二维数组
  const chunkSize = 4;
  for (let i = 0; i < upsData.value.length; i += chunkSize) {
    const chunk = upsData.value.slice(i, i + chunkSize);
    while (chunk.length < chunkSize) {
      const remaining = chunkSize - chunk.length;
      const additionalElements = upsData.value.slice(0, remaining);
      chunk.push(...additionalElements);
    }
    twoUpsData.value.push(chunk);
  }
  timer.value = setInterval(() => {
    if (carousel.value == twoUpsData.value.length - 1) {
      carousel.value = 0;
    } else {
      carousel.value++;
    }
  }, 1000 * 60);
};

const handlecurrentUps = async (value) => {
  const res = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: value.id });
  setSpecialCamera(res.productInfo.productCategory.name, res.baseArchivesInfo.code);
};

function init() {
  getUpsData();
}

onMounted(() => {
  init();
});

onBeforeUnmount(() => {
  clearInterval(timer.value);
});
</script>

<style lang="less" scoped>
.ups-title {
  font-size: 14px;
  color: #cad9ee;
}
</style>
