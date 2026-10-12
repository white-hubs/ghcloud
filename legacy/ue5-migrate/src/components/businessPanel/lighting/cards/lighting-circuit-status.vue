<template>
  <SubPanelTemplate title="照明回路实况" class="device-statistics">
    <div class="chart">
      <stackedBarChart :x-data="xData" :y-data="yData"></stackedBarChart>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import { groupControlStat } from "@/api/device";
import stackedBarChart from "@/components/businessPanel/Information-release/stacked-bar-chart.vue";

const xData = ref<string[]>([]);
const yData = ref<{ name: string; data: number[]; color: string }[]>([
  {
    name: "正常",
    data: [],
    color: "#2AE8BD",
  },
  {
    name: "关闭",
    data: [],
    color: "#2989FF",
  },
]);

const getLightingCircuit = async () => {
  const res = await groupControlStat();
  yData.value[0].data.length = 0;
  yData.value[1].data.length = 0;
  xData.value = res.map((item) => {
    return item.groupName;
  });
  res.forEach((item) => {
    item.detailStat.forEach((data) => {
      if (data.label === "开") {
        yData.value[0].data.push(data.num);
      } else {
        yData.value[1].data.push(data.num);
      }
    });
  });
};

onMounted(() => {
  getLightingCircuit();
});
</script>

<style lang="less" scoped>
.chart {
  height: 300px;
}
</style>
