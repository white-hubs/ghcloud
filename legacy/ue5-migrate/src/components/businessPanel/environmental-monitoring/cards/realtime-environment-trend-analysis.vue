<template>
  <SubPanelTemplate title="实时隧道环境指标趋势分析">
    <template #extra>
      <a-select
        ref="select"
        v-model:value="trendAnalysis"
        style="width: 70px; height: 28px"
        class="time-type"
        @change="handleChange"
        :getPopupContainer="(triggerNode) => triggerNode.parentNode"
      >
        <a-select-option :value="item.value" v-for="(item, i) in trendList">{{ item.label }}</a-select-option>
      </a-select>
    </template>
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
import { ref, onMounted } from "vue";

import { analysisRealTime } from "@/api/securitymanagement";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const titles = ref<string[]>(["CO浓度", "能见度", "亮度", "风速"]);
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
    name: "CO浓度",
    data: [],
    linearGradientColor: ["#328BF7", "#328BF7"],
  },
  {
    name: "能见度",
    data: [],
    linearGradientColor: ["#19F8F7", "#19F8F7"],
  },
  {
    name: "亮度",
    data: [],
    linearGradientColor: ["#FFC700", "#FFC700"],
  },
  {
    name: "风速",
    data: [],
    linearGradientColor: ["#EF424A", "#EF424A"],
  },
]);

const trendAnalysis = ref("INLET_SECTION");
const trendList = ref<{ label: string; value: string }[]>([
  {
    label: "入口段",
    value: "INLET_SECTION",
  },
  {
    label: "基本段",
    value: "BASIC_SEGMENT",
  },
  {
    label: "出口段",
    value: "EXIT_SECTION",
  },
]);
const handleChange = async () => {
  const res = await analysisRealTime(trendAnalysis.value);
  xData.value = res.xtitle.map((item) => {
    return item + "时";
  });
  yData.value[0].data = res.xtitle.map((xItem) => {
    return res.co.find((item) => item.timeFlag === xItem) ? res.co.find((item) => item.timeFlag === xItem).fieldData : 0;
  });
  yData.value[1].data = res.xtitle.map((xItem) => {
    return res.visibility.find((item) => item.timeFlag === xItem) ? res.visibility.find((item) => item.timeFlag === xItem).fieldData : 0;
  });
  yData.value[2].data = res.xtitle.map((xItem) => {
    return res.brightness.find((item) => item.timeFlag === xItem) ? res.brightness.find((item) => item.timeFlag === xItem).fieldData : 0;
  });
  yData.value[3].data = res.xtitle.map((xItem) => {
    return res.windSpeed.find((item) => item.timeFlag === xItem) ? res.windSpeed.find((item) => item.timeFlag === xItem).fieldData : 0;
  });
};

onMounted(() => {
  handleChange();
});
</script>

<style lang="less" scoped>
.chart {
  height: 200px;
}
</style>
