<template>
  <VanField v-bind="props" :model-value="requester?.name" label="发起人" type="text" :disabled="true"/>
</template>

<script setup lang="ts">
import { FormItemExpose, FormItemObjectValue, FormItemProps } from '../../../business/dynamic-table/form-item'
import { staffService } from '../../../service/staff/staff.service'
import { onMounted, ref } from 'vue'

const props = defineProps<FormItemProps<[]> & {
  modelValue?: FormItemObjectValue;
  readonly?: boolean
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: FormItemObjectValue): void;
}>()
const requester = ref(props.modelValue)

onMounted(async () => {
  if (props.modelValue) {
    return
  }
  const currentUser = await staffService.getCurrentUser()
  requester.value = currentUser
  emit('update:modelValue', { id: currentUser.id, name: currentUser.name })
})

defineExpose<FormItemExpose>({
  validate: () => !!requester.value
})
</script>

<style scoped></style>
