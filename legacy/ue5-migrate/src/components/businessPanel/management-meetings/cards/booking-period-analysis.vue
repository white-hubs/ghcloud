<template>
  <SubPanelTemplate title="预定时段分析">
    <div class="charts1">
      <LineChart
        :x-data="periodTime.xData"
        :series="[{ data: periodTime.yData }]"
        :showLegend="true"
        :showBackground="true"
        :titles="['']"
        gridTop="5"
        :unit="{ x: '', y: '' }"
        :axisPointer="true"
      />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { reactive, onMounted } from "vue";

import { scheduledPeriods } from "@/api/conference";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const periodTime = reactive<{ xData: string[]; yData: number[] }>({
  xData: [],
  yData: [],
});

const getScheduledPeriods = async () => {
  const res = await scheduledPeriods();
  periodTime.xData = [];
  periodTime.yData = [];
  for (const key in res) {
    periodTime.xData.push(key + "时");
    periodTime.yData.push(res[key]);
  }
};

onMounted(() => {
  getScheduledPeriods();
});
</script>

<style lang="less" scoped>
.charts1 {
  height: 200px;
}
</style>
