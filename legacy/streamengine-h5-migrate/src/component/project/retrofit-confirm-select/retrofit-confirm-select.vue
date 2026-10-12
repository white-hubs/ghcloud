<template>
  <VanField
    v-if="props.readonly"
    :label="label"
    :required="props.required"
    :model-value="selected?.name"
    readonly />
  <template v-else>
    <VanField is-link :required="props.required" :model-value="selected?.name" readonly name="picker"
    :label="label" @click="showPicker = true" placeholder="请选择确认结果" :error-message="errorMessage" />
  <VanPopup v-model:show="showPicker" position="bottom">
    <VanPicker :columns="columns" @cancel="hidePicker" @confirm="confirmPicker($event.selectedOptions)" />
  </VanPopup>
  </template>
</template>
<script setup lang="ts">
import { FormItemExpose } from '../../../business/dynamic-table/form-item';
import { PickerOption } from 'vant'
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{
  required?: boolean;
  readonly?: boolean;
  label?: string;
  modelValue?: {id:string,name:string}
}>()
const columns = ref<{text:string,value:string}[]>([
  {text:'确认维修',value:'CONFIRMED'},
  {text:'暂不处理',value:'NO_PROCESS'},
])
const showPicker = ref(false)
const selected = ref()
const emits = defineEmits(['update:modelValue'])
function hidePicker() {
  showPicker.value = false
}

function confirmPicker(selectedOptions: PickerOption[]) {
  selected.value = {id:selectedOptions[0].value,name:selectedOptions[0].text}
  emits('update:modelValue', selected.value)
  hidePicker()
}

onMounted(async () => {
  if (props.modelValue) {
    const find = columns.value.find(e=>e.value===props.modelValue?.id)
    selected.value = {id:find?.value,name:find?.text}
  }
})

const errorMessage = computed(() => {
  return (!validInput.value && props.required) ? `请选择${props.label}` : ''
})

const validInput = ref(true)
defineExpose<FormItemExpose>({
  validate: () => {
    const valid = !!selected.value?.id
    validInput.value = valid
    return !!selected.value
  }
})
</script>
