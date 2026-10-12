<template>
  <div >
    <!--气体使用量概览-->
    <GasUseDataPanel :from-page="fromPage" />
    <!--设备总览-->
    <EquipmentOverviewPanel :from-page="fromPage" />
    <!--气体使用明细-->
    <GasDetailPanel :from-page="fromPage" />
  </div>
</template>
<script lang="ts" setup>
import GasUseDataPanel from "./components/gas-use-data-panel.vue";
import EquipmentOverviewPanel from "./components/equipment-overview-panel.vue";
import GasDetailPanel from './components/gas-detail-panel.vue';

const fromPage: FromPageType = 'PARK'
</script>
<style lang="less" scoped>
.panel {
  padding: 8px;
  display: flex;
  flex-direction: column;
}

</style>
