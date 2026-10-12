<template>
  <VanPicker :model-value="[props.modelValue]" :columns="columns" @change="change($event.selectedValues[0])" />
</template>

<script setup lang="ts">
import { PickerOption } from 'vant'
import { TimeMeridiemType, TimeMeridiemTypeLabel } from './date-time-picker'
const props = withDefaults(defineProps<{
  modelValue?: TimeMeridiemType;
}>(), {
  modelValue: 0
})
const emit = defineEmits<{
  (e: 'update:modelValue', value: TimeMeridiemType): void;
}>()

const columns: PickerOption[] = Object.entries(TimeMeridiemTypeLabel).map(([type, label]) => ({ text: label.zhName, value: type }))
function change (value: TimeMeridiemType) {
  emit('update:modelValue', value)
}
</script>

<style scoped>

</style>
