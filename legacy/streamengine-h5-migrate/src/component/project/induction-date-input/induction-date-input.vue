<template>
  <VanField :model-value="induction?.name" label="入职日期" type="text" />
</template>

<script setup lang="ts">
import { FormItemExpose, FormItemObjectValue } from '../../../business/dynamic-table/form-item'
import { DateFormat, format } from '../../../infrastructure/date-util'
import { staffService } from '../../../service/staff/staff.service'
import { onMounted, ref } from 'vue'

const props = defineProps<{
  modelValue?: FormItemObjectValue;
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: FormItemObjectValue): void;
}>()

const induction = ref(props.modelValue)

onMounted(async () => {
  const { inductionDate: inductionTimestamp } = await staffService.getCurrentUser()
  const dateStr = format(inductionTimestamp, DateFormat.DAY)
  induction.value = { id: dateStr, name: dateStr }
  emit('update:modelValue', induction.value)
})

defineExpose<FormItemExpose>({
  validate: () => !!induction.value
})
</script>

<style scoped>

</style>
