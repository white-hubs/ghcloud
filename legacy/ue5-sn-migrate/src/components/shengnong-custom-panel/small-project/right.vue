<template>
  <div class="panel">
    <StartWorkPanel :applicationCode='applicationCode'/>
    <RecordPanel style="margin-top:15px" :applicationCode='applicationCode'/>
  </div>
</template>
<script setup lang="ts"> 
import StartWorkPanel from './components/start-work-panel.vue';
import RecordPanel from './components/record-panel.vue';

const applicationCode = 'SMALLENFINEERING'

</script>
  