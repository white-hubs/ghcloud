<template>
  <VanField
    v-if="props.readonly"
    :label="label"
    :required="props.required"
    :model-value="selected?.name"
    readonly />
  <template v-else>
    <VanField is-link 
      :required="props.required" 
      :model-value="selected?.name" 
      readonly
      placeholder="请选择"
      name="picker" :label="label"
      @click="showPicker = true" />
    <VanPopup v-model:show="showPicker" position="bottom">
      <VanPicker :columns="columns" @cancel="hidePicker" @confirm="confirmPicker($event.selectedOptions)" />
    </VanPopup>
  </template>
</template>
<script setup lang="ts">
import { enumService } from '../../../service/enum/enum';
import { PickerColumn, PickerOption } from 'vant'
import { onMounted, ref } from 'vue'

const props = defineProps<{
  required?: boolean;
  label?: string;
  modelValue?: { id: string, name: string };
  readonly?: boolean;
  placeholder?:string;
}>()
const columns = ref<(PickerOption | PickerColumn)[]>()
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
  const res = await enumService.getFormControlEnum('assessResult');
  columns.value = res.map(e => {
    return { text: e.name, value: e }
  })
  if (props.modelValue) {
    selected.value = props.modelValue
  }
})


</script>
