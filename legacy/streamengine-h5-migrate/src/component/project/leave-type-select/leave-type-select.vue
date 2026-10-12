<template>
  <SelectInput v-bind="props" :options="leaveTypeOptions" option-text-key="name" option-value-key="id" ref="selectInputRef" placeholder="请选择请假类型" :disabled="props.readonly"/>
</template>
<script setup lang="ts">
import { FormItemExpose, FormItemObjectValue, FormItemProps } from '../../../business/dynamic-table/form-item'
import SelectInput from '../../../component/basic/input/select-input/select-input.vue'
import { attendanceService } from '../../../service/attendance/attendance.service'
import { onMounted, ref, shallowRef } from 'vue'

const props = defineProps<FormItemProps & {
  // 上层组件会传入 options 属性，该属性会覆盖组件内声明的 options
  options?: string[];
  readonly?: boolean;
  placeholder?: string;
  disabled?: boolean;
}>()
const selectInputRef = shallowRef()

const leaveTypeOptions=ref<FormItemObjectValue[]>([])
onMounted(async () => {
  if(!props.readonly){
    leaveTypeOptions.value = await attendanceService.getLeaveTypes()
  }
})
defineExpose<FormItemExpose>({
  validate: () => {
    if(props.readonly){
      return true
    }
    return selectInputRef.value?.validate()
  }
})
</script>
