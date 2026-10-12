<template>
  <SubPanelTemplate title="楼栋空间利用率" class="alarm-event">
    <div class="charts">
      <stackedColumn :xData="buildUtilization.xData" :yData="buildUtilization.yData"></stackedColumn>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { reactive, onMounted } from "vue";

import { buildingUtilizationRate } from "@/api/park";
import stackedColumn from "@/components/businessPanel/public/charts/stacked-column/stackedColumn.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const buildUtilization = reactive({
  xData: ["1", "2", "3", "4", "5", "6", "7"],
  yData: [
    {
      name: "使用面积",
      data: [1, 2, 3, 4, 5, 6, 7],
    },
    {
      name: "停用面积",
      data: [10, 12, 3, 4, 15, 16, 7],
    },
  ],
});

const getBuildingUtilizationRate = async () => {
  const res = await buildingUtilizationRate();
  buildUtilization.xData = res.map((item) => {
    return item.areaName;
  });
  buildUtilization.yData[0].data = res.map((item) => {
    return item.useArea;
  });
  buildUtilization.yData[1].data = res.map((item) => {
    return item.disabledArea;
  });
};

onMounted(() => {
  getBuildingUtilizationRate();
});
</script>

<style lang="less" scoped>
.charts {
  width: 100%;
  height: 250px;
}
</style>
