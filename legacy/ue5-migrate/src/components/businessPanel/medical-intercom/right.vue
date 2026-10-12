<template>
  <div >
    <!--设备总览-->
    <DeviceStatisticsPanel />
    <!--设备故障趋势-->
    <DeviceFailureTrendPanel :chart-height="220"/>
    <!--设备统计-->
    <PublicSecurityDeviceCount />
  </div>
</template>
<script lang="ts" setup>
import DeviceStatisticsPanel from './components/device-statistics-panel.vue';
import DeviceFailureTrendPanel from './components/device-failure-trend-panel.vue';
import DeviceAnalysisPanel from './components/device-analysis-panel.vue';
import PublicSecurityDeviceCount from "@/components/businessPanel/security-overview/cards/public-security-device-count.vue";

</script>
<style lang="less" scoped>
.panel {
  padding: 8px;
  display: flex;
  flex-direction: column;
}
</style>
