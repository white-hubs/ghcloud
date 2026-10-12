<template>
  <SubPanelTemplate title="空间利用率" class="alarm-event">
    <div class="equipmentInfo">
      <div class="deviceList">
        <div class="device-box" v-for="item in dataList">
          <span>{{ item.title }}</span>
          <span style="margin-left: 4px">
            <count-to :startVal="0" :endVal="item.value" :duration="4000"></count-to>
            <span class="unit">{{ item.unit }}</span>
          </span>
        </div>
      </div>
      <waterPolo title="" :value="alarmRateData.proportion" unit="%" bgColor="#2989FF" color="#2989FF"> </waterPolo>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { reactive, onMounted } from "vue";

import { AlarmRate } from "@/api/models/alarm";
import { utilizationRate } from "@/api/park";
import waterPolo from "@/components/businessPanel/public/charts/waterPolo/waterPolo.vue";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

let alarmRateData = reactive<AlarmRate>({
  proportion: 0,
  deviceTotal: "",
  alarmNum: "",
  chainRatio: "",
});
const dataList = reactive([
  {
    title: "总面积",
    value: 0,
    unit: "㎡",
  },
  {
    title: "可用面积",
    value: 0,
    unit: "㎡",
  },
]);

const getUtilizationRate = async () => {
  const res = await utilizationRate();
  dataList[0].value = res.total;
  dataList[1].value = res.useArea;
  alarmRateData.proportion = res.utilizationRate;
};

onMounted(() => {
  getUtilizationRate();
});
</script>

<style lang="less" scoped>
.equipmentInfo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;

  .deviceList {
    display: flex;
    align-items: center;
    justify-content: space-around;
    width: 100%;
    margin-bottom: 10px;

    .device-box {
      margin-top: 10px;
      min-width: 140px;
      height: 60px;
      padding: 0 10px;
      background: rgba(108, 128, 151, 0.1);
      color: #fff;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .unit {
        font-size: 12px;
      }
    }
  }
}
</style>
