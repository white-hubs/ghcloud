<template>
  <div class="char-dom" ref="charDom"></div>
</template>
<script lang="ts" setup>
import { ref, onMounted, watch } from "vue"
import { render } from './chart'
const charDom = ref();
const props = defineProps<{
  yData: { name: string, value: number[] ,color:string}[]
  xData: string[],
}>()
watch(
  () => [...props.xData],
  () => {
    if (charDom.value) {
      render(charDom.value, props.xData, props.yData)
    }
  },
);

watch(
  () => [...props.yData],
  () => {
    if (charDom.value) {
      render(charDom.value, props.xData, props.yData)
    }
  },
  {deep:true}
);

onMounted(() => {
  if (charDom.value) {
    render(charDom.value, props.xData, props.yData)
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