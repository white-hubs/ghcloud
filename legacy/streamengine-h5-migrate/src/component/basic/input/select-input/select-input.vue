<template>
  <VanField
    v-if="props.readonly"
    :label="props.label"
    :required="props.required"
    :model-value="selected?.text"
    readonly />
  <template v-else>
    <VanField
      is-link readonly :label="props.label" :required="props.required"
      :model-value="selected?.text" :error-message="props.errorMessage" :placeholder="props.placeholder??'请选择'"
      @click="pick"
    />
    <VanPopup v-model:show="showPicker" round position="bottom">
      <VanPicker :columns="columns" @cancel="closePicker" @confirm="confirmPick($event.selectedOptions[0])" />
    </VanPopup>
  </template>
</template>

<script setup lang="ts" generic="T extends any">
/**
 * TODO(danke): 该组件需要重构
 */
import { FormItemExpose } from '../../../../business/dynamic-table/form-item'
import { computed, onMounted, ref, watch } from 'vue'
import { SelectInputColumn, SelectInputProps } from './select-input'

const props = defineProps<SelectInputProps<T>>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: T): void;
}>()
const showPicker = ref(false)
const selected = ref<SelectInputColumn<T>>()
const columns = computed<SelectInputColumn<T>[]>(() => {
  return props.options.map(d => {
    if (optionIsString(d)) {
      return { text: d, value: d, originItem: d }
    }
    return { text: d[props.optionTextKey] as string, value: d[props.optionValueKey] as string, originItem: d }
  })
  function optionIsString (option: unknown): option is string {
    return typeof option === 'string'
  }
})
onMounted(() => {
  if (props.modelValue) {
    selected.value={
      text:(props.modelValue as T)[props.optionTextKey] as string,
      value:(props.modelValue as T)[props.optionValueKey] as string,
      originItem:(props.modelValue as T)
    }
  }
})
watch(() => props.options, () => {
  if (props.modelValue&&!props.readonly) {
    selected.value = columns.value.find(d => d.value === (props.modelValue as T)[props.optionValueKey])
  }
})
watch(() => props.modelValue, () => {
  if (props.modelValue&&!props.readonly) {
    selected.value = columns.value.find(d => d.originItem[props.optionValueKey] === (props.modelValue as T)[props.optionValueKey])
  }
})
watch(selected, () => {
  if (selected.value&&!props.readonly) {
    emit('update:modelValue', selected.value.originItem)
  }
})
defineExpose<FormItemExpose>({
  validate: () => !!selected.value
})
function pick () {
  if (props.echoMode) {
    return
  }
  showPicker.value = true
}
function closePicker () {
  showPicker.value = false
}
function confirmPick (item: SelectInputColumn<T>) {
  selected.value = item
  closePicker()
}
</script>

<style scoped>

</style>
