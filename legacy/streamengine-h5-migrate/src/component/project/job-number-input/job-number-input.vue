<template>
  <VanField :model-value="job?.name" label="员工编号" type="text" />
</template>

<script setup lang="ts">
import { FormItemExpose, FormItemObjectValue } from '../../../business/dynamic-table/form-item'
import { staffService } from '../../../service/staff/staff.service'
import { onMounted, ref } from 'vue'

const props = defineProps<{
  modelValue?: FormItemObjectValue;
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: FormItemObjectValue): void;
}>()

const job = ref(props.modelValue)

onMounted(async () => {
  const { jobNumber } = await staffService.getCurrentUser()
  job.value = { id: jobNumber, name: jobNumber }
  emit('update:modelValue', job.value)
})

defineExpose<FormItemExpose>({
  validate: () => !!job.value
})
</script>

<style scoped>

</style>
