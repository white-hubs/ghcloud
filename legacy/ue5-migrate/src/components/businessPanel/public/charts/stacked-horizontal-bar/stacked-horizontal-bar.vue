<template>
  <div class="char-dom" ref="charDom"></div>
</template>
<script lang="ts" setup>
import { ref, onMounted, watch } from "vue"
import { render } from './chart'
const charDom = ref();
const props = defineProps<{
  yData:string[]
  xData: {name:string,value:number[]}[],
}>()
watch(
  () => [...props.xData],
  newVal => {
      if (charDom.value) {
          render(charDom.value,props.yData, newVal)
      }
  },
);

onMounted(() => {
  if (charDom.value) {
      render(charDom.value,props.yData, props.xData)
  }
})
</script>
<style lang="less" scoped>
.char-dom {
  width: 100%;
  height: 100%;
  min-height: 180px;
}
</style>