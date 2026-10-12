<template>
  <SubPanelTemplate title="区域使用量概况" class="visiting-data">
    <template #extra>
      <DateInlineForm v-model:modelValue="dosageTime" @search="getDosageData"></DateInlineForm>
    </template>
    <div class="chart" v-if="pieData.length">
      <RoundPie :pieData="pieData" />
    </div>
    <noData v-else></noData>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { usageStatByArea } from "@/api/securitymanagement";
import RoundPie from "@/components/businessPanel/medical-gas/components/round-pie.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";

const dosageTime = ref<ModelValueItf>({ timeType: "TODAY", dateRange: [] });
const pieData = ref<{ name: string; value: number }[]>([]);

const getDosageData = async () => {
  const params = {
    period: dosageTime.value.dateRange.join(","),
    type: dosageTime.value.timeType,
  };
  const res = await usageStatByArea(params);
  pieData.value = res.map((item: any) => {
    return {
      name: item.areaName,
      value: item.totalUsage,
    };
  });
};
</script>

<style lang="less" scoped>
.chart {
  height: 250px;
}
</style>
