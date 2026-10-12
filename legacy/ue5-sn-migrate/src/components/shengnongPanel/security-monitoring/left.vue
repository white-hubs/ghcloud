<template>
  <div class="panel">
    <!--报警排名-->
    <AlarmRankPanel :chart-height="350" :applicationCode='applicationCode'/>
    <!--报警事件正确率-->
    <AlarmEventPanel :applicationCode='applicationCode' />
    <!--报警响应情况-->
    <AlarmResponsePanel :applicationCode='applicationCode'/>
  </div>
</template>
<script setup lang="ts">
import AlarmRankPanel from './components/alarm-rank-panel.vue';
import AlarmEventPanel from './components/alarm-event-panel.vue';
import AlarmResponsePanel from './components/alarm-response-panel.vue';

  const applicationCode = 'SECURITY_MONITORING'

</script>
  