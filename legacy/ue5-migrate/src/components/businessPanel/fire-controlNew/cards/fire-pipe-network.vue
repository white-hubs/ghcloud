<template>
  <SubPanelTemplate title="消防管网监测">
    <DeviceStatistics imgPath="93-icon.png" :statistic="equipmentStatistics"></DeviceStatistics>
    <div class="monitorCard">
      <div class="cardItem" @click="handlecurrentUps(item)" v-for="item in twoCardList[carousel]">
        <img :src="getAssetsImage('92-icon.png')" alt="" />
        <div>
          <div class="label">{{ item.label }}</div>
          <div class="value">
            <span>{{ item.value }}</span
            ><span class="unit">{{ item.unit }}</span>
          </div>
        </div>
      </div>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";

import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import DeviceStatistics from "../../security-monitoring-safty/device-statistics.vue";
import { byTagProperties } from "@/api/device";
import { cubeDeviceCenterService } from "@/api/service";
import { getAssetsImage } from "@/utils/getImage";
import { setSpecialCamera } from "@/views";

const cardList = ref([]);
const twoCardList = ref([]);
const carousel = ref(0);
const equipmentStatistics = reactive({
  title: "监测数",
  total: 0,
});
let timer: any = ref(null);

const changeDate = async () => {
  const res1 = await byTagProperties({
    tagCode: "builtin.usage::liquid.level.sensors",
    iotPropertyCodes: ["hydraulics"],
  });
  const res2 = await byTagProperties({
    tagCode: "builtin.usage::fire.water_pressure.device",
    iotPropertyCodes: ["pressure"],
  });
  const res = [...res1, ...res2];
  equipmentStatistics.total = res.length ? res.length : 0;
  cardList.value = [];
  res.forEach((item) => {
    item.iotProperties.forEach((iot) => {
      cardList.value.push({
        label: item.deviceName,
        value: iot.originalValue || 0,
        unit: "",
        id: item.id,
      });
    });
  });
  twoCardList.value = [];
  //  数据切割为4个的二维数组
  const chunkSize = 4;
  for (let i = 0; i < cardList.value.length; i += chunkSize) {
    const chunk = cardList.value.slice(i, i + chunkSize);
    while (chunk.length < chunkSize) {
      const remaining = chunkSize - chunk.length;
      const additionalElements = cardList.value.slice(0, remaining);
      chunk.push(...additionalElements);
    }
    twoCardList.value.push(chunk);
  }
  timer.value = setInterval(() => {
    if (carousel.value == twoCardList.value.length - 1) {
      carousel.value = 0;
    } else {
      carousel.value++;
    }
  }, 1000 * 60);
};
const handlecurrentUps = async (value) => {
  const res = await cubeDeviceCenterService.getDeviceInstanceDetail({
    deviceId: value.id,
  });
  setSpecialCamera(res.productInfo.productCategory.name, res.baseArchivesInfo.code);
};

onMounted(() => {
  changeDate();
});
onBeforeUnmount(() => {
  clearInterval(timer.value);
});
</script>

<style lang="less" scoped>
.monitorCard {
  display: flex;
  flex-wrap: wrap;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 4px;

  .cardItem {
    // margin-right: 4px;
    display: flex;
    padding: 6px;
    min-width: 158px;
    background: rgba(0, 0, 0, 0.05) linear-gradient(180deg, rgba(41, 137, 255, 0) 0%, rgba(41, 137, 255, 0.35) 100%);

    img {
      margin-right: 5px;
      width: 32px;
      height: 32px;
    }

    .label {
      width: calc(var(--font-size-scale) * 88px);
      height: 20px;
      font-size: calc(var(--font-size-scale) * 12px);
      font-weight: 500;
      color: #cad9ee;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .value {
      font-size: calc(var(--font-size-scale) * 14px);
      font-family:
        DIN Alternate,
        DIN Alternate;
      font-weight: 500;
      color: #ffffff;
    }

    .unit {
      font-size: 12px;
      font-family:
        DIN Alternate,
        DIN Alternate;
      font-weight: 500;
      color: #cad9ee;
    }
  }
}
</style>
