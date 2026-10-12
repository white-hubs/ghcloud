<template>
  <div class="panel">
    <!--报警事件分析-->
    <AlarmEventAnalysis :applicationCode='applicationCode'></AlarmEventAnalysis>
    <!--安防报警高发时段-->
    <AlarmPeriod :applicationCode='applicationCode'></AlarmPeriod>
    <!--安防报警统计-->
    <AlarmStatistics :applicationCode='applicationCode'></AlarmStatistics>
  </div>
</template>
<script setup lang="ts">
import AlarmEventAnalysis from "./components/alarm-event-analysis.vue";
import AlarmPeriod from "./components/alarm-period.vue";
import AlarmStatistics from "./components/alarm-statistics.vue";

const applicationCode = 'SECURITY_MONITORING'

</script>
  