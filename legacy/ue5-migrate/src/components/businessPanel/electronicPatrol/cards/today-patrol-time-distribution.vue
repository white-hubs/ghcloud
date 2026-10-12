<template>
  <SubPanelTemplate title="今日巡更时段分布">
    <div class="chart">
      <LineChart
        :unit="{ x: '', y: '' }"
        :gridTop="'5'"
        :x-data="xData"
        :series="[
          {
            data: yDataTrend,
            linearGradientColor: ['rgb(86, 142, 255)', 'rgb(86, 142, 255,0)'],
          },
        ]"
      />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import { patrolTodayTimeFrame } from "@/api/door";
import LineChart from "@/components/businessPanel/public/lineChart.vue";

const xData = ref<string[]>([]);
const yDataTrend = ref<number[]>([]);

const getPatrolTodayTimeFrame = async () => {
  const res = await patrolTodayTimeFrame({ type: "TODAY" });
  xData.value = [];
  yDataTrend.value = [];
  res.forEach((e) => {
    xData.value.push(e.key);
    yDataTrend.value.push(e.value);
  });
};

onMounted(() => {
  getPatrolTodayTimeFrame();
});
</script>

<style lang="less" scoped>
.chart {
  height: 250px;
}
</style>
