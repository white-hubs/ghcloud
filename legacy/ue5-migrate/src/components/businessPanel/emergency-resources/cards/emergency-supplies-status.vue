<template>
  <SubPanelTemplate title="当前应急物资情况统计">
    <div class="charts">
      <stackedColumn :unit="'件'" :xData="buildUtilization.xData" :yData="buildUtilization.yData"></stackedColumn>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { reactive, onMounted } from "vue";

import { emergencySuppliesStock } from "@/api/emergency";
import stackedColumn from "@/components/businessPanel/public/charts/stacked-column/stackedColumn.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const buildUtilization = reactive({
  xData: [],
  yData: [
    {
      name: "入库数量",
      data: [],
    },
    {
      name: "出库数量",
      data: [],
    },
  ],
});

const getMaterialStatistics = async () => {
  const res = await emergencySuppliesStock();
  buildUtilization.xData = res.map((e) => e.name);
  buildUtilization.yData[0].data = res.map((e) => e.inValue);
  buildUtilization.yData[1].data = res.map((e) => e.outValue);
};

onMounted(() => {
  getMaterialStatistics();
});
</script>

<style lang="less" scoped>
.charts {
  height: 240px;
}
</style>
