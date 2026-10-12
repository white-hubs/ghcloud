<template>
  <SubPanelTemplate title="净水用量情况">
    <template #extra>
      <DateInlineForm v-model:modelValue="alarmTypeTime" @search="areaAlarmStatistic"></DateInlineForm>
    </template>
    <div class="chart">
      <barChart :title="''" :x-data="xData" :data="[{ color: '#1890FF', name: '', data: yData }]" class="columnBox" />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { usageStatByType } from "@/api/securitymanagement";
import barChart from "@/components/businessPanel/public/charts/bar/barChart.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";

const alarmTypeTime = ref<ModelValueItf>({
  timeType: "TODAY",
  dateRange: [],
});
const xData = ref<string[]>([]);
const yData = ref<number[]>([]);

const areaAlarmStatistic = async () => {
  const params = {
    period: alarmTypeTime.value.dateRange.join(","),
    type: alarmTypeTime.value.timeType,
  };
  const res = await usageStatByType(params);
  xData.value.length = 0;
  yData.value.length = 0;
  res.forEach((item: any) => {
    xData.value.push(item.waterTypeName);
    yData.value.push(item.totalUsage);
  });
};
</script>

<style lang="less" scoped>
.chart {
  height: 250px;
}
</style>
