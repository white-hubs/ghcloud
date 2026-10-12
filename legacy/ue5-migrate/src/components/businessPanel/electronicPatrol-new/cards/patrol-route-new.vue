<template>
  <SubPanelTemplate title="巡更路线">
    <template #extra>
      <DateInlineForm v-model:modelValue="operationsAnalysis.operationsAnalysisTime" @search="taskRouteData"> </DateInlineForm>
    </template>
    <div class="chart">
      <overviewChartBar :title="'次'" :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { reactive } from "vue";

import { TaskRoute } from "@/api/maintain";
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const operationsAnalysis = reactive({
  operationsAnalysisTime: {
    timeType: "THIS_YEAR",
    dateRange: [],
  },
  operationsAnalysisXdata: ["4:00", "8:00", "12:00", "16:00", "20:00", "24:00"],
  operationsAnalysisYdata: {
    data: [50, 10, 30, 50, 70, 60],
    name: "平均运行次数",
    color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
  },
});

const barData = reactive({
  xData: [],
  yData: [
    {
      data: [10, 20, 30, 40],
      name: "",
      color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
    },
  ],
});

const taskRouteData = async () => {
  const data = await TaskRoute({
    type: operationsAnalysis.operationsAnalysisTime.timeType,
    period: operationsAnalysis.operationsAnalysisTime.dateRange.join(","),
  });
  barData.xData = data.map((item) => {
    return item.routeName;
  });
  barData.yData[0].data = data.map((item) => {
    return item.keepNum;
  });
};
</script>

<style lang="less" scoped>
.chart {
  height: 200px;
}
</style>
