<template>
  <VanField
    v-if="props.readonly"
    :label="props.label"
    :required="props.required"
    :model-value="state.selected?.text"
    readonly />
  <template v-else>
    <VanField is-link readonly :label="props.label" :required="props.required"
      :model-value="state.selected?.text" :error-message="props.errorMessage" @click="pick" :placeholder="props.placeholder"
      clearable @clear="emit('update:modelValue', '')" />
    <VanPopup v-model:show="state.showPicker" round position="bottom">
      <VanPicker :columns="columns" @cancel="cancelPick" @confirm="confirmPick($event.selectedOptions[0])"
        cancel-button-text="清空" />
    </VanPopup>
  </template>
</template>

<script setup lang="ts">
/**
 * TODO(danke): 该组件需要重构
 */
import { FormItemExpose } from '../../../business/dynamic-table/form-item'
import { PickerOption } from 'vant'
import { computed, onMounted, reactive, watch } from 'vue'

const props = withDefaults(defineProps<{
  options: string[] | PickerOption[];
  label?: string;
  required?: boolean;
  modelValue?: string;
  errorMessage?: string;
  placeholder?: string;
  readonly?: boolean;
}>(), {
  placeholder: '请选择选项'
})
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>()
const state = reactive<{
  showPicker: boolean;
  selected?: PickerOption;
}>({
  showPicker: false
})
const columns = computed<PickerOption[]>(() => {
  if (optionsIsColumn(props.options)) {
    return props.options
  }
  return props.options.map(d => ({ text: d, value: d }))
  function optionsIsColumn(options: unknown[]): options is PickerOption[] {
    return typeof options[0] === 'object'
  }
})

watch(() => state.selected, () => {
  if(props.readonly){
    return
  }
  emit('update:modelValue', state.selected ? state.selected.value as string : '')
})
defineExpose<FormItemExpose>({
  validate: () => !!state.selected?.value
})
watch(() => props.modelValue, () =>{
  state.selected = { text: props.modelValue,value:props.modelValue }
  emit('update:modelValue', state.selected ? state.selected.value as string : '')
})
onMounted(() => {
  if (props.modelValue) {
    state.selected = { text: props.modelValue,value:props.modelValue }
  }
})
function pick() {
  state.showPicker = true
}
function cancelPick() {
  state.showPicker = false
  state.selected = { text: '',value:'' }
}
function confirmPick(selected: PickerOption) {
  state.selected = selected
  state.showPicker = false
}
</script>

<style scoped></style>
