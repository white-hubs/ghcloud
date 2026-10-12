<template>
  <SubPanelTemplate title="应急人员统计">
    <div class="equipmentAlarm">
      <RoundPie :data="roundPieData1" :eventNum="devicesNum"> </RoundPie>
      <pieList :roundPieData="roundPieData1"></pieList>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import { emergencyUserStats } from "@/api/emergency";
import RoundPie from "@/components/businessPanel/public/charts/roundPie/roundPie.vue";
import pieList from "@/components/businessPanel/public/pieList.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const roundPieData1 = ref([]);
const devicesNum = ref(0);
const colorList = ["#2F8DFF", "#D0DEEE", "#FFAB10", "#F14545"];

const getAlarmLevel = async () => {
  const res = await emergencyUserStats();
  roundPieData1.value = res.map((item, index) => {
    return {
      value: item.value,
      label: item.name,
      color: colorList[index],
    };
  });
};

onMounted(() => {
  getAlarmLevel();
});
</script>

<style lang="less" scoped>
.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;

  .content {
    font-size: 16px;
    text-align: center;
    color: #fff;
  }
  .policeList {
    height: auto;
  }
}
</style>
