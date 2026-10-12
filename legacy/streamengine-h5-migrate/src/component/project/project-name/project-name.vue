<template>
  <VanField
    v-if="props.readonly"
    :label="label"
    :required="props.required"
    :model-value="selected?.name"
    readonly />
  <template v-else>
    <VanField is-link :required="props.required" :model-value="selected?.name" readonly name="picker"
    :label="label" @click="showPicker = true" placeholder="请选择小散工程名称" :error-message="errorMessage"/>
  <VanPopup v-model:show="showPicker" position="bottom">
    <VanPicker :columns="columns" @cancel="hidePicker" @confirm="confirmPicker($event.selectedOptions)"/>
  </VanPopup>
  </template>
</template>
<script setup lang="ts">
import { FormItemExpose } from '../../../business/dynamic-table/form-item';
import { smallScattered } from '../../../service/smallScattered';
import { PickerOption } from 'vant'
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{
  required?: boolean;
  readonly?: boolean;
  label?: string;
  modelValue?: { id: string, name: string };
  errorMessage?: string;
}>()
const columns = ref()
const showPicker = ref(false)
const selected = ref()
const emits = defineEmits(['update:modelValue'])
function hidePicker() {
  showPicker.value = false
}

function confirmPicker(selectedOptions: PickerOption[]) {
  selected.value = selectedOptions[0].value
  selected.value.name = selected.value.projectName
  selected.value.id = selected.value.ApplyId
  emits('update:modelValue', selected.value)
  hidePicker()
}

onMounted(async () => {
  const res = await smallScattered.projectNameList();
  columns.value= res.map(item=>{
    return { text: item.projectName, value: item }
    })
  if (props.modelValue) {
    selected.value = props.modelValue
  }
})

const validInput = ref(true)
const errorMessage = computed(() => {
  return (!validInput.value && props.required) ? `请选择${props.label}` : ''
})
const validate = () => {
  const valid = !!selected.value
  validInput.value = valid
  return valid
}
defineExpose<FormItemExpose>({
  validate
})
</script>
