<template lang="pug">
  div.bpmn-designer-container
    BpmnComponent
</template>

<script>
import BpmnComponent from './BPMN2.0/VueComponent/index';
export default {
  components: {
    BpmnComponent,
  },
  data() {
    return {};
  },
};
</script>

<style lang="less" scoped>
.bpmn-designer-container {
  width: 100%;
  height: 100%;
}
</style>
