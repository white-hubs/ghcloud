<template>
  <SubPanelTemplate title="客流分析图">
    <template #extra>
      <DateInlineForm v-model:modelValue="enterTime" @search="getPassengerFlowMuseum"></DateInlineForm>
    </template>
    <div class="chart">
      <LineChart
        :x-data="receptionTrendsChartData.xData"
        :series="receptionTrendsChartData.yData"
        :showLegend="false"
        gridTop="20"
        :unit="{ x: '', y: '人次' }"
      />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

import DateInlineForm from "../../public/dateInlineForm.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import { ModelValueItf } from "../../public/types";
import { passengerFlowMuseum } from "@/api/passenger-flow";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore();
const enterTime = ref<ModelValueItf>();

const receptionTrendsChartData = reactive({
  xData: [],
  yData: [{ data: [], linearGradientColor: ["rgba(120, 252, 252, 1)", "rgba(120, 252, 252, 0.1)"], lineColor: "rgba(120, 252, 252, 1)" }],
});

//在馆客流分析======================================================
const getPassengerFlowMuseum = async () => {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: enterTime.value.dateRange.join(","),
    type: enterTime.value.timeType,
  };
  receptionTrendsChartData.xData = [];
  const res = await passengerFlowMuseum(params);
  receptionTrendsChartData.xData = res.xtitle;
  receptionTrendsChartData.yData[0].data = [];
  res.analysis.forEach((item, index) => {
    receptionTrendsChartData.yData[0].data.push(item.num);
  });
};

onMounted(() => {
  getPassengerFlowMuseum();
});
</script>

<style lang="less" scoped>
.chart {
  height: 220px;
}
</style>
