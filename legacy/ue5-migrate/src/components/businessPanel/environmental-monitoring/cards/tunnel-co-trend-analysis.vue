<template>
  <SubPanelTemplate title="隧道CO浓度趋势分析">
    <div class="flex-between">
      <traffic v-for="item in faultList" :key="item.color" :trafficInfo="item"></traffic>
    </div>
    <div class="chart">
      <LineChart
        :x-data="xData"
        :series="yData"
        :showLegend="true"
        :showBackground="true"
        :titles="titles"
        gridTop="15"
        :unit="{ x: '', y: '' }"
        :axisPointer="true"
      />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

import { concentrationTunnels, environmentalIndicators } from "@/api/securitymanagement";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import traffic from "@/components/businessPanel/public/traffic.vue";

const faultList = reactive([
  {
    color: "#2989FF",
    label: "最高值",
    value: "ppm",
  },
  {
    color: "#FFAB10",
    label: "实时平均",
    value: "20ppm",
  },
]);
const titles = ref<string[]>(["入口段", "出口段", "基本段"]);
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
    name: "入口段",
    data: [],
    linearGradientColor: ["rgb(255, 162, 0.1)", "rgb(255, 222, 165,1)"],
  },
  {
    name: "基本段",
    data: [],
    linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
  },
  {
    name: "出口段",
    data: [],
    linearGradientColor: ["rgba(120, 252, 252, 1)", "rgba(120, 252, 252, 0.1)"],
  },
]);

const getTemplateData = async () => {
  const res = await concentrationTunnels();
  xData.value = res.xtitle.map((item) => {
    return item + "时";
  });
  yData.value[0].data = res.xtitle.map((xItem) => {
    return res.inletSection.find((item) => item.timeFlag === xItem)
      ? res.inletSection.find((item) => item.timeFlag === xItem).fieldData
      : 0;
  });
  yData.value[1].data = res.xtitle.map((xItem) => {
    return res.basicSegment.find((item) => item.timeFlag === xItem)
      ? res.basicSegment.find((item) => item.timeFlag === xItem).fieldData
      : 0;
  });
  yData.value[2].data = res.xtitle.map((xItem) => {
    return res.exitSection.find((item) => item.timeFlag === xItem) ? res.exitSection.find((item) => item.timeFlag === xItem).fieldData : 0;
  });
};
const getEnvironmentalIndicators = async () => {
  const res = await environmentalIndicators();
  faultList[0].value = (res.coMax || 0) + "ppm";
  faultList[1].value = (res.co || 0) + "ppm";
};

onMounted(() => {
  getEnvironmentalIndicators();
  getTemplateData();
});
</script>

<style lang="less" scoped>
.chart {
  height: 200px;
}
</style>
