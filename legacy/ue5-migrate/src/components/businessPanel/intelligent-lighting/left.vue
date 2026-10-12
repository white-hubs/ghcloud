<template>
  <div >
    <!--设备实时数据-->
    <DevicePeriodPanel :from-page="fromPage" />
    <!--群控组实时数据-->
    <GroupControlPanel :from-page="fromPage" />
    <!--时控实时数据-->
    <TimeControlPanel :from-page="fromPage" />
  </div>
</template>
<script setup lang="ts">
import DevicePeriodPanel from './components/device-period-panel.vue';
import GroupControlPanel from './components/group-control-panel.vue';
import TimeControlPanel from './components/time-control-panel.vue';

const fromPage: FromPageType = 'PARK'

</script>
<style scoped lang="less">
:deep(.sub-panel-header),
:deep(.sub-panel-content) {
  margin-top: 20px;
}

:deep(.visiting-data .sub-panel-content .item) {
  margin-bottom: 10px;
}
</style>