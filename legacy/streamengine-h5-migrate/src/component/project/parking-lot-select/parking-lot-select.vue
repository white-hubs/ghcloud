<template>
  <VanField
    v-if="props.readonly"
    :label="label"
    :required="props.required"
    :model-value="selected?.name"
    readonly
  />
  <template v-else>
    <VanField
      is-link
      :required="props.required"
      :model-value="selected?.name"
      readonly
      name="picker"
      :label="label"
      :placeholder="props.placeholder || '请选择停车场'"
      :error-message="errorMessage"
      @click="showPicker = true"
    />
    <VanPopup v-model:show="showPicker" position="bottom">
      <VanPicker :columns="columns" @cancel="hidePicker" @confirm="confirmPicker($event.selectedOptions)" />
    </VanPopup>
  </template>
</template>

<script setup lang="ts">
import { FormItemExpose } from '../../../business/dynamic-table/form-item'
import type { PickerOption } from 'vant'
import { computed, onMounted, ref } from 'vue'
import { cubeParkingLotService } from '../../../service/service'

const props = defineProps<{
  required?: boolean
  readonly?: boolean
  label?: string
  placeholder?: string
  // 与 PC 端保持一致：{ id: 车场编码, name: 车场名称 }
  modelValue?: { id: string; name: string } | null
}>()

const columns = ref<{ text: string; value: string }[]>([])
const showPicker = ref(false)
const selected = ref<{ id: string; name: string } | null>(null)
const emits = defineEmits(['update:modelValue'])

function hidePicker() {
  showPicker.value = false
}

function confirmPicker(selectedOptions: PickerOption[]) {
  const opt = selectedOptions[0]
  selected.value = { id: opt.value as string, name: opt.text as string }
  emits('update:modelValue', selected.value)
  hidePicker()
}

onMounted(async () => {
  try {
    const res = await cubeParkingLotService.getParkingLotList({})
    columns.value = (res ?? []).map((item: any) => ({
      text: item.name ?? '',
      value: item.code ?? '',
    }))
    if (props.modelValue) {
      const find = columns.value.find(e => e.value === props.modelValue?.id)
      if (find) {
        selected.value = { id: find.value, name: find.text }
      }
    }
  } catch (error) {
  }
})

const errorMessage = computed(() => {
  return !validInput.value && props.required ? `请选择${props.label || '停车场'}` : ''
})

const validInput = ref(true)

defineExpose<FormItemExpose>({
  validate: () => {
    const valid = !!selected.value?.id
    validInput.value = valid
    return !!selected.value
  },
})
</script>

