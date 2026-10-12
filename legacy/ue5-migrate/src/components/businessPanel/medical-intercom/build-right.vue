<template>
  <div >
    <!--设备总览-->
    <DeviceStatisticsPanel />
    <!--故障类型统计-->
    <DeviceFailureTypePanel :chart-height="220"/>
    <!--故障设备-->
    <DeviceFailurePanel :chart-height="220"/>
  </div>
</template>
<script lang="ts" setup>
import DeviceStatisticsPanel from './components/device-statistics-panel.vue';
import DeviceFailureTypePanel from './components/device-failure-type-panel.vue';
import DeviceFailurePanel from './components/device-failure-panel.vue';

</script>
<style lang="less" scoped>
.panel {
  padding: 8px;
  display: flex;
  flex-direction: column;
}
</style>