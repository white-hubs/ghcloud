<template>
  <div class="panel">
    <RightTopPanel />
    <IndexRankPanel :applicationCode='applicationCode'/>
    <AlarmRecordPanel  style="margin-top:15px" :applicationCode='applicationCode'/>
  </div>
</template>
<script setup lang="ts">
import RightTopPanel from './components/right-top-panel.vue';
import IndexRankPanel from './components/index-rank-panel.vue';
import AlarmRecordPanel from "./components/alarm-record-panel.vue";

const applicationCode = ''

</script>
  