<template>
  <div class="panel">
    <!--各市场电动自行车辆数-->
    <CarCountPanel :applicationCode='applicationCode'/>
    <!--各市场车辆占比-->
    <CarRatioPanel :applicationCode='applicationCode'/>
    <!--各市场车辆违规/违停数-->
    <CarAlarmPanel :applicationCode='applicationCode'/>
  </div>
</template>
<script setup lang="ts"> 
import CarCountPanel from './components/car-count-panel.vue';
import CarRatioPanel from './components/car-ratio-panel.vue';
import CarAlarmPanel from './components/car-alarm-panel.vue';

const applicationCode = ''

</script>
  