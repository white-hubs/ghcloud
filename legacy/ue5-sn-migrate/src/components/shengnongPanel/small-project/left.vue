<template>
  <div class="panel">
    <!-- 各市场小散工程数统计 -->
    <ProjectCountPanel :applicationCode='applicationCode'/>
    <!--正在施工工程数占比-->
    <ProjectRatioPanel :applicationCode='applicationCode'/>
  </div>
</template>
<script setup lang="ts">
import ProjectCountPanel from './components/project-count-panel.vue';
import ProjectRatioPanel from './components/project-ratio-panel.vue';

  const applicationCode = 'SMALLENFINEERING'

</script>
  