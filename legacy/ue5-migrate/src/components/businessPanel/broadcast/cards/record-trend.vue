<template>
  <SubPanelTemplate title="广播记录趋势">
    <template #extra>
      <DateInlineForm v-model:modelValue="alarmTypeTime" @search="areaAlarmStatistic"></DateInlineForm>
    </template>
    <div class="chart">
      <LineChart
        :x-data="deviceFailureTrendCharData.xData"
        :series="deviceFailureTrendCharData.yData"
        :showLegend="false"
        gridTop="15"
        :unit="{ x: '', y: '次' }"
      />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

import { recordTrend } from "@/api/broadcast";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore();
const alarmTypeTime = ref<ModelValueItf>({
  timeType: "TODAY",
  dateRange: [],
});
const deviceFailureTrendCharData = reactive({
  xData: [] as any[],
  yData: [
    { data: [] as number[], linearGradientColor: ["rgba(86, 142, 255, 1)", "rgba(86, 142, 255, 0.1)"], lineColor: "rgba(86, 142, 255, 1)" },
  ],
});

const areaAlarmStatistic = async () => {
  const params = {
    type: alarmTypeTime.value.timeType,
    period: alarmTypeTime.value.dateRange.join(","),
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
  };
  const res = await recordTrend(params);
  deviceFailureTrendCharData.xData.length = 0;
  deviceFailureTrendCharData.yData[0].data.length = 0;
  res.forEach((item: any) => {
    deviceFailureTrendCharData.xData.push(item.timeFlag);
    deviceFailureTrendCharData.yData[0].data.push(item.num);
  });
};
</script>

<style lang="less" scoped>
.chart {
  height: 220px;
}
</style>
