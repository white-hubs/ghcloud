<template>
  <div class="panel">
    <!--设备统计-->
    <DeviceStatisticsPanel />
    <!--设备故障趋势-->
    <DeviceFailureTrendPanel />
    <!--告警统计-->
    <AlarmStatisticsPanel />
  </div>
</template>
<script lang="ts" setup>
import DeviceStatisticsPanel from './components/device-statistics-panel-exhibition.vue';
import DeviceFailureTrendPanel from './components/device-failure-trend-panel-exhibition.vue';
import AlarmStatisticsPanel from './components/alarm-statistics-panel.vue';

</script>
<style lang="less" scoped>
.panel {
  padding: 8px;
  display: flex;
  flex-direction: column;
}
</style>
