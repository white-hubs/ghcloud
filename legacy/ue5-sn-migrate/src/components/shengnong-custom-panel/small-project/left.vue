<template>
  <div class="panel">
    <ProjectCountPanel :applicationCode='applicationCode'/>
    <ProjectRatioPanel :applicationCode='applicationCode'/>
  </div>
</template>
<script setup lang="ts">
import ProjectCountPanel from './components/project-count-panel.vue';
import ProjectRatioPanel from './components/project-ratio-panel.vue';

  const applicationCode = 'SMALLENFINEERING'

</script>
  