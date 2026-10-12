<template lang="pug">
div.home
	NavTopLink
	div.content
		router-view 
</template>
<script lang='jsx'>
import { defineComponent } from "vue";
export default defineComponent({
  setup() {},
});
</script>
<style lang="less" scoped>
.home {
  width: inherit;
  height: inherit;
  .content {
    width: inherit;
    height: calc(100% - 50px);
  }
}
</style>
