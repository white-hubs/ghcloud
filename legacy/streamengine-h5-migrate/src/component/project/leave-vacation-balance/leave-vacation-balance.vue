<template>
  <VanField v-model="vacationBalance" disabled :label="props.label" :required="props.required"
    :placeholder="placeholder" />
</template>

<script setup lang="ts">

import { FormItemExpose } from '../../../business/dynamic-table/form-item'
import { attendanceService } from '../../../service/attendance/attendance.service'
import { staffService } from '../../../service/staff/staff.service'
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{
  modelValue?: string;
  dependFormValues: [{ id: string; name: string; }];
  readonly?: boolean;
  placeholder?: string;
  label?: string;
  required?: boolean;
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>()

const vacationBalance = ref(props.modelValue)
const originValue = ref('')
watch(()=>vacationBalance.value, () => {
  if (props.readonly) {
    return
  }
  if (vacationBalance.value) {
    emit('update:modelValue', originValue.value)
  }
})

watch([() => props.dependFormValues], async () => {
  if (props.readonly) {
    return
  }
  getData()
})
const getData=async ()=>{
  const user = await staffService.getCurrentUser()
  const params = {
    staffId: user.id,
    holidayRuleId: props.dependFormValues[0].id
  }
  const res = await attendanceService.getVacationBalance(params)
  if (res.notLimit) {
    originValue.value = '-1'
    vacationBalance.value = '不限制'
  }else{
    originValue.value = res.total
    vacationBalance.value = res.total+'小时'
  }
}
onMounted(() => {
  if (props.modelValue) {
    if(/[\u4e00-\u9fa5]/g.test(props.modelValue)){
      vacationBalance.value = props.modelValue
      return
    }
    if (props.modelValue === 'NO_LIMITED') {
      originValue.value = '-1'
      vacationBalance.value = '不限制'
    } else if (props.modelValue === 'NOT_CONFIGURED') {
      vacationBalance.value = '-'
    } else if (props.modelValue === '-1') {
      originValue.value = '-1'
      vacationBalance.value = '不限制'
    } else {
      originValue.value = props.modelValue
      vacationBalance.value = props.modelValue+'小时'
    }
  }else{
    getData()
  }
})

defineExpose<FormItemExpose>({
  validate: () => !!vacationBalance.value
})
</script>

<style scoped></style>
