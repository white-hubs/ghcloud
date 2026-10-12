<template>
  <SubPanelTemplate title="来访人员趋势图">
    <template #extra>
      <DateInlineForm v-model:modelValue="takeNotes" @search="getPlayRecordTop"></DateInlineForm>
    </template>
    <div class="chart">
      <LineChart
        :x-data="periodTime.xData"
        :series="[{ data: periodTime.yData }]"
        :showLegend="true"
        :showBackground="true"
        :titles="['']"
        gridTop="5"
        :unit="{ x: '', y: '' }"
        :axisPointer="true"
      />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

import { trendStat } from "@/api/door";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";

const takeNotes = ref<ModelValueItf>();
const periodTime = reactive<{ xData: string[]; yData: number[] }>({
  xData: [],
  yData: [],
});

const getPlayRecordTop = async () => {
  const res = await trendStat({ type: takeNotes.value.timeType, period: takeNotes.value.dateRange.join(",") });
  periodTime.xData = res.map((item) => {
    if (takeNotes.value.timeType === "TODAY") {
      return item.name + "时";
    } else {
      return item.name;
    }
  });
  periodTime.yData = res.map((item) => item.value);
};
</script>

<style lang="less" scoped>
.chart {
  height: 200px;
}
</style>
