<template>
  <VanField
    v-if="props.readonly"
    :label="label"
    :required="props.required"
    :model-value="selected?.name"
    readonly />
  <template v-else>
    <VanField is-link :required="props.required" :model-value="selected?.name" readonly name="picker"
    :label="label" @click="showPicker = true" placeholder="请选择隐患类型" :error-message="errorMessage" />
  <VanPopup v-model:show="showPicker" position="bottom">
    <VanPicker :columns="columns" @cancel="hidePicker" @confirm="confirmPicker($event.selectedOptions)" />
  </VanPopup>
  </template>
</template>
<script setup lang="ts">
import { useRoute } from 'vue-router'
import { FormItemExpose } from '../../../business/dynamic-table/form-item';
import { problemService } from '../../../service/problem/problem'
import { PickerOption } from 'vant'
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{
  required?: boolean;
  readonly?: boolean;
  label?: string;
  modelValue?: { id: string, name: string }
}>()
const columns = ref<{text:string,value:string}[]>([])
const route=useRoute()
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
  const res = await problemService.getProblemTypeList()
  columns.value = res.map(e=>{
    return {text:e.name,value:e.id}
  })
  if (props.modelValue) {
    selected.value = props.modelValue
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
