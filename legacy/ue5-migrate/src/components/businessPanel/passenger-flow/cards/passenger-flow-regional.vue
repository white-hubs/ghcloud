<template>
  <SubPanelTemplate title="各个区域客流量">
    <div class="chart">
      <barChart
        :title="'人次'"
        :unit="'人'"
        :x-data="areaChart.xData"
        :data="[{ color: '#1890FF', name: '', data: areaChart.yData }]"
        class="columnBox"
      />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import moment from "moment";
import { reactive, onMounted } from "vue";

import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import { passengerFlowRegions } from "@/api/passenger-flow";
import barChart from "@/components/businessPanel/public/charts/bar/barChart.vue";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore();

//各个区域客流量==================================================================================
const areaChart = reactive({
  xData: [],
  yData: [],
});

const getPassengerFlowRegions = async () => {
  const date = [moment().format("YYYY-MM-DD 00:00:00"), moment().format("YYYY-MM-DD HH:mm:ss")].join(",");
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: date,
  };
  const res = await passengerFlowRegions(params);
  areaChart.xData = [];
  areaChart.yData = [];
  res.forEach((item) => {
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
