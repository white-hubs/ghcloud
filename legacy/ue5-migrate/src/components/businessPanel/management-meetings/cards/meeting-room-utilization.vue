<template>
  <SubPanelTemplate title="会议室利用率分析">
    <template #extra>
      <DateInlineForm v-model:modelValue="takeNotes" @search="getPlayRecordTop"></DateInlineForm>
    </template>
    <div class="charts1">
      <stackedColumn :unit="'%'" :xData="buildUtilization.xData" :yData="buildUtilization.yData"></stackedColumn>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

import { ModelValueItf } from "../../public/types";
import { playRecordTop } from "@/api/conference";
import stackedColumn from "@/components/businessPanel/public/charts/stacked-column/stackedColumn.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const takeNotes = ref<ModelValueItf>();
const buildUtilization = reactive({
  xData: [],
  yData: [
    {
      name: "使用率",
      data: [],
    },
    {
      name: "未使用率",
      data: [],
    },
  ],
});

const getPlayRecordTop = async () => {
  const res = await playRecordTop({ period: takeNotes.value.dateRange.join(",") });
  buildUtilization.xData = [];
  buildUtilization.yData[0].data = [];
  buildUtilization.yData[1].data = [];
  res.forEach((item) => {
    buildUtilization.xData.push(item.name);
    buildUtilization.yData[0].data.push(item.usageRate);
    buildUtilization.yData[1].data.push(item.unusedRate);
  });
};
</script>

<style lang="less" scoped>
.charts1 {
  height: 200px;
}
</style>
