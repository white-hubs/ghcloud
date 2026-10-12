<template>
  <SubPanelTemplate title="运行分析">
    <template #extra>
      <DateInlineForm v-model:modelValue="operationsAnalysis.operationsAnalysisTime" @search="changeHandleOperationsAnalysis">
      </DateInlineForm>
    </template>
    <div class="chart">
      <overviewChartBar :title="'次'" :xData="barData.xData" :yData="barData.yData" :x-font-size="10.5"> </overviewChartBar>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { reactive } from "vue";

import { operationsAnalysisData } from "@/api/securitymanagement";
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";

const operationsAnalysis = reactive<{ operationsAnalysisTime: ModelValueItf }>({
  operationsAnalysisTime: {
    timeType: "TODAY",
    dateRange: [""],
  },
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

const changeHandleOperationsAnalysis = async () => {
  const params = {
    type: operationsAnalysis.operationsAnalysisTime.timeType,
    period: operationsAnalysis.operationsAnalysisTime.dateRange.join(","),
  };
  const res = await operationsAnalysisData(params);
  barData.xData = res.xtitle;
  barData.yData[0].data = res.xtitle.map((xItem: any) => {
    return res.operationsAnalysis.find((item: any) => item.timeFlag === xItem)
      ? res.operationsAnalysis.find((item: any) => item.timeFlag === xItem).dataValue
      : 0;
  });
};
</script>

<style lang="less" scoped>
.chart {
  height: 260px;
}
</style>
