<template>
  <VanField
    v-if="props.readonly"
    :label="label"
    :required="props.required"
    :model-value="selected?.name"
    readonly />
  <template v-else>
    <VanField is-link :required="props.required" :model-value="selected?.name" readonly name="picker"
    :label="label" @click="showPicker = true" placeholder="请选择印章类别" :error-message="errorMessage"/>
  <VanPopup v-model:show="showPicker" position="bottom">
    <VanPicker :columns="columns" @cancel="hidePicker" @confirm="confirmPicker($event.selectedOptions)" />
  </VanPopup>
  </template>
</template>
<script setup lang="ts">
import { FormItemExpose } from '../../../business/dynamic-table/form-item';
import { officialService } from '../../../service/official/official';
import { PickerOption } from 'vant'
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{
  required?: boolean;
  readonly?: boolean;
  label?: string;
  modelValue?: { id: string, name: string }
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
  emits('update:modelValue', selected.value)
  hidePicker()
}

onMounted(async () => {
  const res = await officialService.getOfficialSealList();
  columns.value = res.map(e => {
    return { text: e.name, value: e }
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
    const valid = !!selected.value
    validInput.value = valid
    return !!selected.value
  }
})
</script>
