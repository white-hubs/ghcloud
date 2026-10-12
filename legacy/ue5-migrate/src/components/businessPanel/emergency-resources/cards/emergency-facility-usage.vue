<template>
  <SubPanelTemplate title="应急设施使用率" class="alarm-event">
    <div class="equipmentInfo">
      <waterPolo title="" :value="alarmRateData.proportion" unit="%" bgColor="#2989FF" color="#2989FF"> </waterPolo>
      <deviceModule :data-list="dataList"></deviceModule>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { reactive, onMounted } from "vue";

import { emergencyFacilityStat } from "@/api/emergency";
import waterPolo from "@/components/businessPanel/public/charts/waterPolo/waterPolo.vue";
import deviceModule from "@/components/businessPanel/public/deviceModule.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { AlarmRateList } from "@/components/businessPanel/public/types";

const alarmRateData = reactive({
  proportion: 0,
  deviceTotal: "",
  alarmNum: "",
  chainRatio: "",
});
const dataList = reactive<AlarmRateList[]>([
  {
    title: "总数",
    value: 0,
    ringRatio: false,
  },
  {
    title: "已使用",
    value: 0,
    ringRatio: false,
    label: 0,
  },
]);

const emergencyFacilities = async () => {
  const res = await emergencyFacilityStat();
  dataList[0].value = res.total;
  dataList[1].value = res.usedValue;
  alarmRateData.proportion = res.total ? (res.usedValue / res.total) * 100 : 0;
};

onMounted(() => {
  emergencyFacilities();
});
</script>

<style lang="less" scoped>
.equipmentInfo {
  display: flex;
  justify-content: space-between;
  padding: 10px 16px 0 20px;
}
</style>
