<template lang="pug">
  div.process-designer-container
    div.process-designer-content
      BpmnDesigner
</template>

<script>
import BpmnDesigner from './designer';
export default {
  components: {
    BpmnDesigner,
  },
  data() {
    return {};
  },
};
</script>

<style lang="less" scoped>
.process-designer-container {
  flex: auto;
  height: 100%;
  padding: 2rem;
  position: relative;
  .process-designer-content {
    // margin: 2rem;
    height: 100%;
    background-color: #fff;
  }
}
</style>
