<template>
  <div >
    <!--设备分类统计-->
    <DeviceClassStatisticsPanel :from-page="fromPage" />
    <!--照明回路实况-->
    <LightingLoopPanel :from-page="fromPage" />
    <!--照明能耗分析-->
    <LightingAnalysisPanel :from-page="fromPage" />
  </div>
</template>
<script lang="ts" setup>
import DeviceClassStatisticsPanel from './components/device-class-statistics-panel.vue';
import LightingLoopPanel from './components/lighting-loop-panel.vue';
import LightingAnalysisPanel from './components/lighting-analysis-panel.vue';

const fromPage: FromPageType = 'FLOOR'
</script>
<style lang="less" scoped>
.panel {
  padding: 8px;
  display: flex;
  flex-direction: column;
}
</style>
