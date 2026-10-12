<template>
  <div class="panel">
    <!--科室使用量概况-->
    <OfficeUseDataPanel :from-page="fromPage" />
    <!--流量使用趋势-->
    <FlowAnalysisPanel :from-page="fromPage" />
    <!--科室使用量top5-->
    <OfficeUsageStatisticsPanel :from-page="fromPage" :chart-height="240" />
  </div>
</template>
<script lang="ts" setup>
import OfficeUseDataPanel from './components/office-use-data-panel.vue';
import FlowAnalysisPanel from './components/flow-analysis-panel.vue';
import OfficeUsageStatisticsPanel from './components/office-usage-statistics-panel.vue';

const fromPage: FromPageType = 'PARK'
</script>
<style lang="less" scoped>
.panel {
  padding: 8px;
  display: flex;
  flex-direction: column;
}

</style>
