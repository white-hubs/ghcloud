<template>
  <SubPanelTemplate title="数据概览">
    <template #extra>
      <DateInlineForm v-model:modelValue="overviewTime" @search="changeOverviewTimeTime"></DateInlineForm>
    </template>
    <AlarmStatistics :statisticsData="state.alarmData" />
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

import { getDataOverView } from "@/api/securitymanagement";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import AlarmStatistics from "@/components/businessPanel/triage-queue/components/alarm-statistics.vue";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore();
const overviewTime = ref<ModelValueItf>({
  timeType: "TODAY",
  dateRange: [],
});
const state = reactive({
  alarmData: [
    { eventName: "用水量", value: 0, rate: 0, color: "#F14545" },
    { eventName: "用电量", value: 0, rate: 0, color: "#FFC700" },
  ],
});

const changeOverviewTimeTime = async () => {
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: overviewTime.value.dateRange.join(","),
    type: overviewTime.value.timeType,
  };
  const result = await getDataOverView(param);
  state.alarmData[0].value = result.waterValue as number;
  state.alarmData[0].rate = result.waterRate as number;
  state.alarmData[1].value = result.electricityValue as number;
  state.alarmData[1].rate = result.electricityRate as number;
};
</script>

<style lang="less" scoped></style>
