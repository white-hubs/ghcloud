<template>
    <div class="panel">
        <!--人员出入情况-->
        <PersonAnalysisPanel :from-page="fromPage" :chart-height="200" />
        <!-- 门禁通行情况 -->
        <entranceAnalysisPanel :from-page="fromPage" />
        <!-- 车辆通行情况 -->
        <CarAnalysisPanel :from-page="fromPage" />
    </div>
</template>
<script setup lang="ts">
import PersonAnalysisPanel from './components/person-analysis-panel.vue';
import entranceAnalysisPanel from './components/entrance-analysis-panel.vue';
import CarAnalysisPanel from './components/car-analysis-panel.vue';

const fromPage: FromPageType = 'PARK'
</script>
<style lang="less" scoped>
</style>
  