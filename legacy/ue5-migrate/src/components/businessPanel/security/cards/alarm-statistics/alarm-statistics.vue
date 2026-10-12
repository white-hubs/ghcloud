<template>
  <SubPanelTemplate title="报警统计">
    <template #extra>
      <DateInlineForm v-model:modelValue="timeFrame" @search="changeTimeFrame" />
    </template>
    <div class="rate-pie-chart">
      <RatePie :value="alarmProportion.handle" title="报警处理占比" color="#5AD0EA" class="rate-pie" />
      <RatePie :value="alarmProportion.really" title="报警真实占比" class="rate-pie" />
    </div>
  </SubPanelTemplate>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import { alarmStatistics } from "@/api/alarm";
import RatePie from "@/components/businessPanel/public/charts/ratePie/ratePie.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore();
let timeFrame = ref<ModelValueItf>();
let alarmProportion = ref({
  handle: 0,
  really: 0,
});

// 报警统计
function changeTimeFrame() {
  getAlarmStatistics();
}

// 获取处理占比和真实占比
async function getAlarmStatistics() {
  if (!timeFrame.value || !timeFrame.value.dateRange) return;

  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: timeFrame.value.dateRange.join(","),
  };
  let res: any = await alarmStatistics(params);
  if (res.alarmNum && res.alarmNum !== 0) {
    alarmProportion.value.really = Math.round((res.alarmActualNum / res.alarmNum) * 10000) / 100.0;
    alarmProportion.value.handle = Math.round((res.alarmHandlerNum / res.alarmNum) * 10000) / 100.0;
  } else {
    alarmProportion.value.really = 0;
    alarmProportion.value.handle = 0;
  }
}
</script>

<style lang="less" scoped>
.rate-pie-chart {
  width: 100%;
  padding-top: 8px;
  padding-left: 32px;
  padding-right: 32px;
  display: flex;
  justify-content: space-between;
}
</style>
