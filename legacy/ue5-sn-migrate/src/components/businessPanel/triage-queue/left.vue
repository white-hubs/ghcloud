<template>
  <div class="panel">
    <!--看诊数据-->
    <VisitingDataPanel />
    <!--接诊趋势-->
    <ReceptionTrendsPanel />
    <!--候诊情况-->
    <WaitingSituationPanel />
    <!--预约就诊分布-->
    <AppointmentVisitDistributionPanel />
  </div>
</template>
<script lang="ts" setup>
import VisitingDataPanel from "./components/visiting-data-panel-exhibition.vue";
import ReceptionTrendsPanel from "./components/reception-trends-panel-exhibition.vue";
import WaitingSituationPanel from "./components/waiting-situation-panel-exhibition.vue";
import AppointmentVisitDistributionPanel from "./components/appointment-visit-distribution-panel-exhibition.vue";

</script>
<style lang="less" scoped>
.panel {
  padding: 8px;
  display: flex;
  flex-direction: column;
}
</style>
