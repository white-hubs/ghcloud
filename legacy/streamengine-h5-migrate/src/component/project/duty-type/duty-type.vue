<template>
  <SelectInput v-bind="props" v-model="selected" :options="workClasses" option-text-key="name" option-value-key="id" />
</template>
<script setup lang="ts">
import { FormItemExpose, FormItemObjectValue } from '../../../business/dynamic-table/form-item'
import SelectInput from '../../../component/basic/input/select-input/select-input.vue'
import { attendanceService } from '../../../service/attendance/attendance.service'
import { ref, watch, watchEffect,onMounted } from 'vue'
import { ChangeDutyTypeProps } from './duty-type'

const props = defineProps<ChangeDutyTypeProps>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: FormItemObjectValue): void;
}>()
const workClasses = ref<FormItemObjectValue[]>([])
const selected = ref<FormItemObjectValue>(props.modelValue!)
onMounted(async () => {
  workClasses.value =[
    {id:'ARRANGE',name:"排班制"},
    {id:'DUTY',name:"值班制"},
  ]
})
watch(selected, () => {
  if (selected.value) {
    emit('update:modelValue', selected.value)
  }
})
defineExpose<FormItemExpose>({
  validate: () => !!selected.value
})
</script>
