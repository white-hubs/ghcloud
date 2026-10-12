<template>
  <VanField :model-value="appointment?.name" label="岗位" type="text" />
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

const appointment = ref(props.modelValue)

onMounted(async () => {
  const { appointmentId: id, appointmentName: name } = await staffService.getCurrentUser()
  appointment.value = { id, name }
  emit('update:modelValue', appointment.value)
})

defineExpose<FormItemExpose>({
  validate: () => !!appointment.value
})
</script>

<style scoped>

</style>
