<template>
  <VanField
    v-if="props.readonly"
    label="加班类型"
    :required="props.required"
    :model-value="selected?.text"
    readonly />
  <template v-else>
    <VanField
      is-link :required="props.required" :model-value="selected?.text" readonly
      name="picker" label="加班类型" :error-message="props.errorMessage" :placeholder="props.placeholder || '请选择加班类型'"
      @click="pick"
    />
    <VanPopup v-model:show="showPicker" position="bottom">
      <VanPicker
        :columns="overtimeTypeOptions" @cancel="hidePicker"
        @confirm="confirmPicker($event.selectedOptions)"
      />
    </VanPopup>
  </template>
</template>
<script setup lang="ts">
import { FormItemExpose, FormItemProps } from '../../../business/dynamic-table/form-item'
import { PickerOption } from 'vant'
import { onMounted, ref } from 'vue'
import { overtimeTypeOptions } from './overtime-type'
import bus from '../../../infrastructure/bus'

const props = defineProps<FormItemProps & {
  required?: boolean;
  modelValue?: string;
  errorMessage?: string;
  config:{id:string}
  placeholder?: string;
  readonly?: boolean
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>()

const showPicker = ref(false)
const selected = ref<PickerOption>(overtimeTypeOptions.find(d => d.value === props.modelValue)!)
// onMounted(()=>{
//   // if(props.modelValue){bus.emit('overTimeChange',{id:props.config.id,name:'overTimeType',readonly:props.readonly})}
// })
defineExpose<FormItemExpose>({
  validate: (): boolean => {
    return !!selected.value
  }
})
function pick () {
  if (props.readonly) {
    return
  }
  showPicker.value = true
}
function hidePicker () {
  showPicker.value = false
}
function confirmPicker (selectedOptions: PickerOption[]) {
  selected.value = selectedOptions[0]
  bus.emit('overTimeChange',{id:props.config.id,name:'overTimeType',readonly:props.readonly})
  emit('update:modelValue', selected.value.value as string)
  hidePicker()
}
</script>
