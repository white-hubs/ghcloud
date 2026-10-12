<template>
  <div></div>
  <SubPanelTemplate title="车流驶出趋势">
    <template #extra>
      <DateInlineForm v-model:modelValue="timeType" @search="trafficFlowTrendData"></DateInlineForm>
    </template>
    <div class="chart">
      <stackedLine :title="lineData.title" :yData="lineData.yData" :xData="lineData.xData"
        :color="['#FF6E23']">
      </stackedLine>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import stackedLine from "@/components/businessPanel/public/charts/stackedLine/stackedLine.vue";
import { trafficFlowTrend } from "@/utils/requestData/parkingSpaceManage";

let timeType = ref();
const lineData = reactive({
  title: "辆",
  xData: [],
  yData: [
    {
      data: [],
      name: "驶出",
      colors: [
        {
          offset: 0,
          color: "rgba(255, 110, 35, 1)",
        },
        {
          offset: 1,
          color: "rgba(255, 110, 35, 0.02)",
        },
      ],
    },
  ],
});
// 获取车流趋势信息
const trafficFlowTrendData = async () => {
  let res = await trafficFlowTrend({ dimension: timeType.value.timeType });
  lineData.xData = res.xdata;
  // trafficList[0].value = res.series[0].total;
  // trafficList[1].value = res.series[1].total;
  lineData.yData[0].data = res.series[1].value;
};
</script>
<style lang="less" scoped>
.chart {
  height: 300px;
}
</style>