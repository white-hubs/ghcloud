<template>
  <SelectInput v-bind="props" v-model="selected" :options="workClasses" option-text-key="name" option-value-key="id" />
</template>
<script setup lang="ts">
import { FormItemExpose, FormItemObjectValue } from '../../../business/dynamic-table/form-item'
import SelectInput from '../../../component/basic/input/select-input/select-input.vue'
import { attendanceService } from '../../../service/attendance/attendance.service'
import { ref, watch, watchEffect } from 'vue'
import { ChangeClassSelectProps } from './change-class-select'
import { DynamicTableProcessType } from '../../../business/dynamic-table/dynamic-table'
const props = defineProps<ChangeClassSelectProps>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: FormItemObjectValue): void;
}>()
const workClasses = ref<FormItemObjectValue[]>([])
const selected = ref<FormItemObjectValue>(props.modelValue!)
watchEffect(async () => {
  if (props.readonly) {
    workClasses.value = [props.modelValue!]
    return
  }
  const [user,classType,day] = props.dependFormValues
  if (user&&classType&&day) {
    if(props.processType===DynamicTableProcessType.ADD){
      selected.value= {id:"",name:""};
    }
    workClasses.value = await attendanceService.queryExchaneClasses(user.id,classType.id,day)
  }
})
watch(selected, () => {
  if (selected.value) {
    emit('update:modelValue', selected.value)
  }
})
defineExpose<FormItemExpose>({
  validate: () =>{
    const valid=selected.value&&!!selected.value.name;
    return valid
  } 
})
</script>
