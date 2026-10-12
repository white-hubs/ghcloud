<template>
  <SubPanelTemplate title="巡更点漏巡点位统计">
    <template #extra>
      <DateInlineForm v-model:modelValue="hiddenDangerTime" @search="changeHandleHiddenDangerTime"></DateInlineForm>
    </template>
    <div class="lineChart">
      <barChart :title="''" :unit="''" :x-data="xData" :data="[{ color: '#1890FF', name: '', data: yData }]" />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref } from "vue";

import barChart from "../../public/charts/bar/barChart.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import { ModelValueItf } from "../../public/types";
import { leakStat } from "@/api/maintain";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";

const hiddenDangerTime = ref<ModelValueItf>();
const xData = ref<string[]>([]);
const yData = ref<number[]>([]);

const changeHandleHiddenDangerTime = async () => {
  const res = await leakStat({ period: hiddenDangerTime.value.dateRange.join(",") });
  xData.value.length = 0;
  yData.value.length = 0;
  res.forEach((item) => {
    xData.value.push(item.locationName);
    yData.value.push(item.omitNum);
  });
};
</script>

<style lang="less" scoped>
.lineChart {
  height: 220px;
}
</style>
