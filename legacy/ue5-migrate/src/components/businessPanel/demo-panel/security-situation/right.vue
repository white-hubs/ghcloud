<template>
    <div >
        <!-- 安全态势总览 -->
        <SecurityStatisticsPanel :from-page="fromPage" :chart-height="220" />
        <!--今日巡更情况-->
        <TodayAnalysisPanel :from-page="fromPage" :chart-height="240" />
        <!--电梯运行监测-->
        <ElevatorAnalysisPanel :from-page="fromPage" />
    </div>
</template>
<script setup lang="ts">
import SecurityStatisticsPanel from './components/security-statistics-panel.vue';
import TodayAnalysisPanel from './components/today-analysis-panel.vue';
import ElevatorAnalysisPanel from './components/elevator-analysis-panel.vue';

const fromPage: FromPageType = 'PARK'
</script>
<style lang="less" scoped>
</style>
  