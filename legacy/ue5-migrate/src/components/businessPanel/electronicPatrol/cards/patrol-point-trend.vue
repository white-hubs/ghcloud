<template>
  <SubPanelTemplate title="巡更点位趋势图">
    <template #extra>
      <DateInlineForm v-model:modelValue="trendTime" @search="getTrendEvent"></DateInlineForm>
    </template>
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
import { ref } from "vue";

import { patrolLocationTrend } from "@/api/door";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";

const trendTime = ref<ModelValueItf>();
const xData = ref<string[]>(["1", "2", "3", "4"]);
const yDataTrend = ref<number[]>([1, 2, 3, 4, 5, 6]);

const getTrendEvent = async () => {
  const res = await patrolLocationTrend({ period: trendTime.value.dateRange.join(","), type: trendTime.value.timeType });
  xData.value = [];
  yDataTrend.value = [];
  res.forEach((item) => {
    xData.value.push(item.key);
    yDataTrend.value.push(item.value);
  });
};
</script>

<style lang="less" scoped>
.chart {
  height: 250px;
}
</style>
