<template>
  <div>
    <VanField
      :is-link="!props.disabled" :required="props.required" :disabled="props.disabled" :model-value="selected?.name"
      readonly name="picker" label="部门" @click="pick"
    />
    <VanPopup v-model:show="showPicker" position="bottom">
      <VanPicker
        :columns="[{ id: '选择模式当前未实现', name: '选择模式当前未实现' }]" :columns-field-names="{value: 'id', text: 'name'}" @cancel="hidePicker"
        @confirm="confirmPicker($event.selectedOptions)"
      />
    </VanPopup>
  </div>
</template>
<script setup lang="ts">
import { FormItemExpose, FormItemObjectValue, FormItemProps } from '../../../business/dynamic-table/form-item'
import { staffService } from '../../../service/staff/staff.service'
import { onMounted, ref, watch } from 'vue'

const props = defineProps<FormItemProps & {
  required?: boolean;
  disabled?: boolean;
  modelValue?: FormItemObjectValue;
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: FormItemObjectValue): void;
}>()

const showPicker = ref(false)
const selected = ref(props.modelValue)

watch(selected, () => {
  if (selected.value) {
    emit('update:modelValue', selected.value)
  }
})

onMounted(async () => {
  if (props.echoMode) {
    return
  }
  const currentUser = await staffService.getCurrentUser()
  selected.value = { id: currentUser.organizationId, name: currentUser.organizationName }
})

defineExpose<FormItemExpose>({
  validate: () => !!selected.value
})

function pick () {
  if (!props.disabled) {
    showPicker.value = true
  }
}

function hidePicker () {
  showPicker.value = false
}

function confirmPicker (selectedOptions: FormItemObjectValue[]) {
  selected.value = selectedOptions[0]
  hidePicker()
}
</script>
