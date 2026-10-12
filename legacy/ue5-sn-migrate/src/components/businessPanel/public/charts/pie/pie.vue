<template>
  <div class="pie" ref="pieRef">pie</div>
</template>
<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { render } from './chart'
import { getOption } from './option'

const props = defineProps<{
  data: Record<string, unknown>[];
  valueKey: string;
  labelKey: string;
  falg?:boolean;
}>()
watch(
  () => [...props.data],
  newVal => {
    render(pieRef.value, getOption(newVal, props.valueKey, props.labelKey,props?.falg))
  },
);
const pieRef = ref()
onMounted(() => {
  if (!pieRef.value) {
    throw new Error('容器初始化失败')
  }
  render(pieRef.value, getOption(props.data, props.valueKey, props.labelKey,props?.falg))
})
</script>
<style scoped>
.pie {
  height: 100%;
  width: 100%;
}
</style>