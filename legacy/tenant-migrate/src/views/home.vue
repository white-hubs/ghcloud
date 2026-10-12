<template lang="pug">
a-layout
    a-layout-header
        NavTopLink
    a-layout-content
        router-view 
</template>

<script lang="jsx">
import { defineComponent } from "vue";
export default defineComponent({
  setup() {},
});
</script>

<style lang="less" scoped>
.ant-layout {
  height: 100%;
  width: 100%;
}
</style>
