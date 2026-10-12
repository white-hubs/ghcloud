<template>
  <div >
    <!--候诊情况（楼层）-->
    <WaitingSituationPanleFloor />
    <!--接诊趋势（楼层）-->
    <ReceptionTrendsPanel :chart-height="230"/>
    <!--预约就诊分布（楼层）-->
    <AppointmentVisitDistributionPanel />
  </div>
</template>
<script lang="ts" setup>
import WaitingSituationPanleFloor from "./components/waiting-situation-panle-floor.vue";
import ReceptionTrendsPanel from "./components/reception-trends-panel.vue";
import AppointmentVisitDistributionPanel from "./components/appointment-visit-distribution-panel.vue";

</script>
<style lang="less" scoped>
.panel {
  padding: 8px;
  display: flex;
  flex-direction: column;
}

.waiting-situation {
  :deep(.sub-panel-content) {
    .char-dom {
      height: 300px;
    }
  }
}
</style>
