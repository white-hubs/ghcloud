<template>
  <SubPanelTemplate title="滞留车辆分析">
    <div class="chart">
      <lineAndPillar :title="lineAndPillarData.title" :xData="lineAndPillarData.xdata" :yData="lineAndPillarData.yData"> </lineAndPillar>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { reactive, onMounted } from "vue";

import lineAndPillar from "@/components/businessPanel/public/charts/lineAndPillar/lineAndPillar.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { vehicleAnalysisData } from "@/utils/requestData/parkingSpaceManage";

const lineAndPillarData = reactive({
  title: "辆",
  xdata: [],
  yData: [
    {
      name: "滞留车辆数",
      data: [],
      color: "#FFC700",
    },
    {
      name: "滞留车辆占比",
      data: [],
      color: "#2981EA",
    },
  ],
});

// 滞留车辆分析
const vehicleAnalysisInfo = async () => {
  let res = await vehicleAnalysisData();
  lineAndPillarData.xdata = res.xdata;
  lineAndPillarData.yData[0].data = res.series[0].value;
  lineAndPillarData.yData[1].data = res.series[1].value;
};

onMounted(() => {
  vehicleAnalysisInfo();
});
</script>

<style lang="less" scoped>
.chart {
  height: 220px;
}
</style>
