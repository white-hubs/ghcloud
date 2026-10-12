<template>
  <div class="panel">
    <!-- 左侧 -->
    <CarFileStat />
  </div>
</template>

<script setup lang='ts'>
import CarFileStat from './components/car-file-stat.vue';
</script>
<style scoped lang='less'>
.panel {
  height: 100%;
}

.electric-car-left {
  color: #fff;
}
</style>