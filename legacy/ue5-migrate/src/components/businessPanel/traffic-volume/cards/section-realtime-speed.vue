<template>
  <SubPanelTemplate title="断面实时平均车速分析">
    <div class="charts">
      <LineChart
        :x-data="xData"
        :series="yData"
        :showLegend="true"
        :showBackground="true"
        :titles="titles"
        gridTop="15"
        :unit="{ x: '', y: '人次' }"
        :axisPointer="true"
      />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import moment from "moment";
import { ref, onMounted } from "vue";

import { speedAnalysis } from "@/api/securitymanagement";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const xData = ref<string[]>([]);
const yData = ref<
  {
    name: string;
    data: number[];
    linearGradientColor?: string[];
    lineColor?: string;
    showSymbol?: boolean;
    smooth?: boolean;
    symbolSize?: number;
  }[]
>([
  {
    data: [0],
    linearGradientColor: ["rgb(255, 162, 0.1)", "rgb(255, 222, 165,1)"],
    name: "进入",
  },
  {
    data: [0],
    linearGradientColor: ["rgba(120, 252, 252, 1)", "rgba(120, 252, 252, 0.1)"],
    lineColor: "rgba(120, 252, 252, 1)",
    name: "离开",
  },
]);
const titles = ref<string[]>([]);

const getSpeedAnalysis = async () => {
  const res = await speedAnalysis({ period: [moment().format("YYYY-MM-DD 00:00:00"), moment().format("YYYY-MM-DD HH:mm:ss")].join(",") });
  xData.value = res.xtitle.map((item) => {
    return item + "时";
  });
  yData.value[0].data = res.xtitle.map((xItem) => {
    return res.realAverageSpeedAnalysisIn.find((item) => item.timeFlag === xItem)
      ? res.realAverageSpeedAnalysisIn.find((item) => item.timeFlag === xItem).speed
      : 0;
  });
  yData.value[1].data = res.xtitle.map((xItem) => {
    return res.realAverageSpeedAnalysisOut.find((item) => item.timeFlag === xItem)
      ? res.realAverageSpeedAnalysisOut.find((item) => item.timeFlag === xItem).speed
      : 0;
  });
};

onMounted(() => {
  getSpeedAnalysis();
});
</script>

<style lang="less" scoped>
.charts {
  height: 240px;
}
</style>
