<template>
  <SubPanelTemplate title="净水使用趋势">
    <template #extra>
      <DateInlineForm v-model:modelValue="gasTime" @search="getGasData"></DateInlineForm>
    </template>
    <div class="chart">
      <LineChart
        :x-data="xDataGas"
        :series="yDataGas"
        :showLegend="true"
        :showBackground="true"
        :titles="titles"
        gridTop="15"
        :axisPointer="true"
      />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { usageStatByTypeAndTime } from "@/api/securitymanagement";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";

const gasTime = ref<ModelValueItf>({ timeType: "TODAY", dateRange: [] });
const xDataGas = ref<string[]>([]);
const titles = ref<string[]>([]);
const yDataGas = ref<
  {
    name: string;
    data: number[];
    linearGradientColor?: string[];
    lineColor?: string;
    showSymbol?: boolean;
    smooth?: boolean;
    symbolSize?: number;
  }[]
>([]);

const getGasData = async () => {
  const params = {
    period: gasTime.value.dateRange.join(","),
    type: gasTime.value.timeType,
  };
  const res = await usageStatByTypeAndTime(params);
  yDataGas.value.length = 0;
  xDataGas.value = res[0]?.list.map((item: any) => item.dateHour);
  titles.value = res.map((item: any) => item.waterTypeName);
  res.forEach((item: any) => {
    const data = item.list.map((data: any) => data.totalUsage);
    yDataGas.value.push({ name: item.waterTypeName, data });
  });
};
</script>

<style lang="less" scoped>
.chart {
  height: 250px;
}
</style>
