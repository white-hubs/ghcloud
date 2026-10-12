<template>
  <div class="panel">
    <!--本月各市场工程开工情况-->
    <StartWorkPanel :applicationCode='applicationCode'/>
    <!--正在施工记录-->
    <RecordPanel style="margin-top:15px" :applicationCode='applicationCode'/>
  </div>
</template>
<script setup lang="ts"> 
import StartWorkPanel from './components/start-work-panel.vue';
import RecordPanel from './components/record-panel.vue';

const applicationCode = 'SMALLENFINEERING'

</script>
  