<template>
  <SubPanelTemplate title="各区域客流量排名Top10">
    <template #extra>
      <DateInlineForm v-model:modelValue="handleTime" @search="getPassengerFlowRegions"></DateInlineForm>
    </template>
    <div class="chart">
      <barChart
        :title="''"
        :x-data="areaChart.xData"
        :max="9"
        inverse
        :data="[{ color: '#1890FF', name: '人次', data: areaChart.yData }]"
        class="columnBox"
      />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

import DateInlineForm from "../../public/dateInlineForm.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import { ModelValueItf } from "../../public/types";
import { passengerFlowRegions } from "@/api/passenger-flow";
import barChart from "@/components/businessPanel/public/charts/bar/barChart.vue";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore();
const handleTime = ref<ModelValueItf>();

//客流量排名====================================================================
const areaChart = reactive({
  xData: [],
  yData: [],
});

const getPassengerFlowRegions = async () => {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: handleTime.value.dateRange.join(","),
  };
  const res = await passengerFlowRegions(params);
  areaChart.xData = [];
  areaChart.yData = [];
  res.forEach((item, index) => {
    areaChart.xData.push(item.areaName);
    areaChart.yData.push(item.num);
  });
};

onMounted(() => {
  getPassengerFlowRegions();
});
</script>

<style lang="less" scoped>
.chart {
  height: 220px;
}
</style>
