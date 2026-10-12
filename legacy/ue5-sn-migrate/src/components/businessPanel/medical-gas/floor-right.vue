<template>
  <div class="panel">
    <!--设备故障率-->
    <EquipmentFailedPanel :from-page="fromPage" />
    <!--科室使用量top5-->
    <OfficeUsageStatisticsPanel :from-page="fromPage" />
    <!--科室使用量概况-->
    <OfficeUseDataPanel :from-page="fromPage" />
  </div>
</template>
<script lang="ts" setup>
import EquipmentFailedPanel from './components/equipment-failed-panel.vue';
import OfficeUsageStatisticsPanel from './components/office-usage-statistics-panel.vue';
import OfficeUseDataPanel from './components/office-use-data-panel.vue';

const fromPage: FromPageType = 'BUILD'
</script>
<style lang="less" scoped>
.panel {
  padding: 8px;
  display: flex;
  flex-direction: column;
}
</style>
