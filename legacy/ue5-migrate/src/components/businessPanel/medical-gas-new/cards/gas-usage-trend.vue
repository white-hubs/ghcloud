<template>
  <SubPanelTemplate title="气体使用趋势">
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

import { gasUsageTrend } from "@/api/device";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore();
const gasTime = ref<ModelValueItf>({ timeType: "TODAY", dateRange: [] });
const titles = ref<string[]>([]);
const xDataGas = ref<string[]>([]);
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
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: gasTime.value.dateRange.join(","),
    type: gasTime.value.timeType,
  };
  const res = await gasUsageTrend(params);
  xDataGas.value = res.xtitle;
  yDataGas.value.length = 0;
  titles.value.length = 0;

  for (const key in res.medicalGasDataVos) {
    const arr: number[] = [];
    for (let i = 0; i < res.xtitle.length; i++) {
      arr.push(0);
    }
    res.xtitle.forEach((x: string, index: number) => {
      res.medicalGasDataVos[key].forEach((item: any) => {
        if (x === item.timeFlag) {
          arr[index] = item.num;
        }
      });
    });
    titles.value.push(key);
    yDataGas.value.push({ name: key, data: arr });
  }
};
</script>

<style lang="less" scoped>
.chart {
  height: 250px;
}
</style>
