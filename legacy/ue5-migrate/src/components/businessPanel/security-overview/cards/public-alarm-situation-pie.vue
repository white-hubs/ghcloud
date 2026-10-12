<template>
  <SubPanelTemplate title="报警统计" zoomable zoom-title="报警统计">
    <div class="header" data-no-zoom>
      <DateInlineForm v-model:modelValue="timeFrame" @search="getAlarmStatistics" />
    </div>
    <div class="rate-pie-chart" data-no-zoom>
      <RatePie :value="alarmProportion.handle" title="报警处理占比" color="#5AD0EA" class="rate-pie" />
      <RatePie :value="alarmProportion.really" title="报警真实占比" class="rate-pie" />
    </div>
    <template #zoom-content>
      <div class="zoom-rate-pie-chart">
        <RatePie :value="alarmProportion.handle" title="报警处理占比" color="#5AD0EA" class="zoom-rate-pie" />
        <RatePie :value="alarmProportion.really" title="报警真实占比" class="zoom-rate-pie" />
      </div>
    </template>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref } from "vue";

import RatePie from "../../public/charts/ratePie/ratePie.vue";
import DateInlineForm from "../../public/dateInlineForm.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import { ModelValueItf } from "../../public/types";
import { alarmStatistics } from "@/api/alarm";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore();
let alarmProportion = ref({
  handle: 0,
  really: 0,
});
let timeFrame = ref<ModelValueItf>();
// 报警统计
// 获取处理占比和真实占比
async function getAlarmStatistics() {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: timeFrame.value?.dateRange.join(","),
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
  padding-top: 16px;
  padding-left: 32px;
  padding-right: 32px;
  display: flex;
  justify-content: space-between;
}

// 放大弹窗内的样式
.zoom-rate-pie-chart {
  width: 100%;
  padding: 40px 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 400px;

  .zoom-rate-pie {
    flex: 1;
    max-width: 45%;
  }
}
</style>
