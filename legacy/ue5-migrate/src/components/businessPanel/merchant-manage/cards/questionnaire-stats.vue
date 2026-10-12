<template>
  <SubPanelTemplate title="问卷调查统计">
    <template #extra>
      <DateInlineForm v-model:modelValue="statisticsTime" @search="changeStatisticsTime"></DateInlineForm>
    </template>
    <div class="chart">
      <overviewChartBar :title="'次'" :xData="barData.xData" :yData="barData.yData" :x-font-size="10.5"> </overviewChartBar>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from "vue";

import { visualizationQuestionnaire } from "@/api/merchant";
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { splitArray } from "@/utils/common";

const statisticsTime = ref<ModelValueItf>({
  timeType: "TODAY",
  dateRange: [],
});
const totalData = reactive({
  statisticsTotal: [] as any[][],
});
const numTotal = reactive({
  statistics: 0,
});
const time = reactive({
  statistics: null as any,
});
const barData = reactive({
  xData: [] as string[],
  yData: [
    {
      data: [] as number[],
      name: "",
      color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
    },
  ],
});

const changeStatisticsTime = async () => {
  let res = await visualizationQuestionnaire({ period: statisticsTime.value.dateRange.join(",") });
  totalData.statisticsTotal = splitArray(res, 5);
  if (totalData.statisticsTotal.length > 0) {
    updateBarData();
  }

  if (time.statistics) {
    clearInterval(time.statistics);
  }
  time.statistics = setInterval(() => {
    if (totalData.statisticsTotal.length > 0) {
      numTotal.statistics = (numTotal.statistics + 1) % totalData.statisticsTotal.length;
      updateBarData();
    }
  }, 5000);
};

const updateBarData = () => {
  const currentData = totalData.statisticsTotal[numTotal.statistics];
  barData.xData = currentData.map((item) => item.name);
  barData.yData[0].data = currentData.map((item) => item.value);
};

onMounted(() => {
  changeStatisticsTime();
});

onUnmounted(() => {
  clearInterval(time.statistics);
});
</script>

<style lang="less" scoped>
.chart {
  height: 200px;
}
</style>
