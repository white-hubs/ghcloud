<template>
  <SubPanelTemplate title="水表日用能趋势图">
    <template #extra>
      <DateInlineForm v-model:modelValue="through" @search="abnormalPassageInfo"></DateInlineForm>
    </template>
    <div class="chart" v-if="charsData.xData.length">
      <LineChart
        :x-data="charsData.xData"
        :series="[
          {
            data: charsData.yData,
            linearGradientColor: ['rgb(255, 162, 0.1)', 'rgb(255, 222, 165,1)'],
          },
        ]"
      />
    </div>
    <div class="chart" v-else>
      <noData></noData>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import moment from "moment";
import { ref, reactive } from "vue";

import { waterUserDayStat } from "@/api/prepaid";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const through = ref();
const charsData = reactive({
  xData: [],
  yData: [],
});

const abnormalPassageInfo = async () => {
  const time = {
    TODAY: "day",
    THIS_WEEK: "week",
    THIS_MONTH: "month",
    THIS_YEAR: "year",
  };
  const res = await waterUserDayStat({ period: through.value.dateRange.join(","), type: time[through.value.timeType] });
  charsData.xData = [];
  charsData.yData = [];
  res.forEach((item) => {
    charsData.xData.push(moment(item.useDate).format(through.value.timeType !== "THIS_YEAR" ? "YYYY-MM-DD" : "YYYY-MM"));
    charsData.yData.push(item.pv);
  });
};
</script>

<style lang="less" scoped>
.chart {
  height: 200px;
  display: flex;
}
</style>
