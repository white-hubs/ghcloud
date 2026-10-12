<template>
  <div class="panel">
    <!--报警事件占比-->
    <AlarmEventRatioPanel :applicationCode='applicationCode'/>
    <!--报警处理情况-->
    <AlarmEventHandlePanel :applicationCode='applicationCode'/>
    <!--报警记录-->
    <AlarmRecordPanel  style="margin-top:15px" :applicationCode='applicationCode'/>
  </div>
</template>
<script setup lang="ts"> 
import AlarmEventRatioPanel from './components/alarm-event-ratio-panel.vue';
import AlarmEventHandlePanel from './components/alarm-event-handle-panel.vue';
import AlarmRecordPanel from './components/alarm-record-panel.vue';

const applicationCode = 'SECURITY_MONITORING'

</script>
  