<template>
  <div class="panel">
    <LeftTopPanel :applicationCode='applicationCode' />
    <!-- <LeftMiddlePanel :applicationCode='applicationCode' /> -->
    <LeftBottomPanel :applicationCode='applicationCode' />
  </div>
</template>

<script setup lang="ts">
import LeftTopPanel from "./components/left-top-panel.vue";
// import LeftMiddlePanel from "./components/left-middle-panel.vue";
import LeftBottomPanel from "./components/left-bottom-panel.vue";

const applicationCode = "";

</script>
<style scoped lang="less">

</style>
