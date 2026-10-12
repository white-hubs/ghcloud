<template>
  <div class="panel">
    <!--呼叫趋势-->
    <CallStatisticsTrendPanel :chart-height="220"/>
    <!--呼叫时段分布-->
    <CallStatisticsPeriodPanel :chart-height="220"/>
    <!--呼叫统计-->
    <CallStatisticsPanel />
  </div>
</template>
<script setup lang="ts">
import CallStatisticsPanel from './components/call-statistics-panel.vue';
import CallStatisticsTrendPanel from './components/call-statistics-trends-panel.vue';
import CallStatisticsPeriodPanel from './components/call-statistics-period-panel.vue';
</script>
