<template>
  <SubPanelTemplate title="金额交易趋势图">
    <template #extra>
      <DateInlineForm v-model:modelValue="handleTime" @search="changeHandleTime"></DateInlineForm>
    </template>
    <div class="chart">
      <LineChart
        :unit="{ x: '', y: '元' }"
        :gridTop="'20'"
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

import { transactionTrendStat } from "@/api/onecard";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";

const handleTime = ref<ModelValueItf>();
const xData = ref<string[]>([]);
const yDataTrend = ref<number[]>([]);

const changeHandleTime = async () => {
  const res = await transactionTrendStat({ type: handleTime.value.timeType, period: handleTime.value.dateRange.join(",") });
  xData.value = res.map((item) => {
    return handleTime.value.timeType === "TODAY" ? item.code + "时" : item.code;
  });
  yDataTrend.value = res.map((item) => {
    return item.value;
  });
};
</script>

<style lang="less" scoped>
.chart {
  height: 200px;
}
</style>
