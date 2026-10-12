<template>
  <div >
    <!--设备总览-->
    <EquipmentOverviewPanel :from-page="fromPage" />
    <!--流量使用趋势-->
    <FlowAnalysisPanel :from-page="fromPage" />
    <!--气体使用明细-->
    <GasDetailPanel :from-page="fromPage" />
  </div>
</template>
<script lang="ts" setup>
import EquipmentOverviewPanel from "./components/equipment-overview-panel.vue";
import FlowAnalysisPanel from './components/flow-analysis-panel.vue';
import GasDetailPanel from './components/gas-detail-panel.vue';

const fromPage: FromPageType = 'BUILD'
</script>
<style lang="less" scoped>
.panel {
  padding: 8px;
  display: flex;
  flex-direction: column;
}
</style>
