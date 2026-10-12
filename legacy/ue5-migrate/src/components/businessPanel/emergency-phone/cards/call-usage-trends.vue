<template>
  <SubPanelTemplate title="电话使用趋势" class="alarm-event">
    <template #extra>
      <DateInlineForm v-model:modelValue="through" @search="getTelephoneTrends"></DateInlineForm>
    </template>
    <div class="chart">
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
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

import { telephoneTrends } from "@/api/securitymanagement";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const through = ref();
const charsData = reactive({
  xData: [],
  yData: [],
});

const getTelephoneTrends = async () => {
  const params = {
    type: through.value.timeType,
    period: through.value.dateRange.join(","),
  };
  const res = await telephoneTrends(params);
  charsData.xData = res.xtitle.map((item) => {
    if (through.value.timeType === "TODAY") {
      return (item += "时");
    } else if (through.value.timeType === "THIS_YEAR") {
      return (item += "月");
    } else {
      return item;
    }
  });
  charsData.yData = res.xtitle.map((xItem) => {
    return res.telephoneUsageTrends.find((item) => item.timeFlag === xItem)
      ? res.telephoneUsageTrends.find((item) => item.timeFlag === xItem).num
      : 0;
  });
};

onMounted(() => {
  getTelephoneTrends();
});
</script>

<style lang="less" scoped>
.chart {
  height: 200px;
  display: flex;
}
</style>
