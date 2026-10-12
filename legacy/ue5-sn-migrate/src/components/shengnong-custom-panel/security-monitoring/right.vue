<template>
  <div class="panel">
    <!--安防事件报警统计-->
    <EventAlarmStatistics  style="margin-top:15px" :applicationCode='applicationCode'/>
    <!--报警响应情况-->
    <AlarmResponseStatistics  style="margin-top:15px" :applicationCode='applicationCode'/>
    <!--报警记录-->
    <AlarmRecord  style="margin-top:15px" :applicationCode='applicationCode'/>
  </div>
</template>
<script setup lang="ts"> 
import EventAlarmStatistics from "./components/event-alarm-statistics.vue";
import AlarmResponseStatistics from "./components/alarm-response-statistics.vue";
import AlarmRecord from "./components/alarm-record.vue";

const applicationCode = 'SECURITY_MONITORING'

</script>
  