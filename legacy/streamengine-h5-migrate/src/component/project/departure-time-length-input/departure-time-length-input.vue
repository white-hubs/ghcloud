<template>
  <VanField v-model="value" :label="props.label" type="text" :required="props.required" :readonly="true" :disabled="true"
    placeholder="自动计算" />
</template>
<script setup lang="ts">
import { DynamicTableRoute } from '../../../business/dynamic-table/dynamic-table'
import { FormItemExpose } from '../../../business/dynamic-table/form-item';
import { attendanceService } from '../../../service/attendance/attendance.service'
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router'

const { query: { businessType } } = useRoute() as DynamicTableRoute
const props = defineProps<{
  required?: boolean;
  readonly?: boolean;
  label?: string;
  modelValue?: { id: string; name: string };
  dependFormValues: any;
  sponsorId:string;
}>();
const emits = defineEmits(["update:modelValue"]);

const value = ref(props.modelValue ? props.modelValue + '小时' : '')

watch(() => props.dependFormValues, () => {
  calculateTime()
}, { deep: true })

const calculateTime =async () => {
  if(props.readonly){
    return
  }
  if (props.dependFormValues[0] && props.dependFormValues[1]) {
    let val = ''
    const params = {
      businessType:businessType!,
      staffId:props.sponsorId,
      postStartTime:props.dependFormValues[0],
      postEndTime:props.dependFormValues[1]
    }
    val = await attendanceService.leavePostDuration(params)
    if (!val) {
      value.value = ''
    } else {
      value.value = val + '小时';
    }
    emits('update:modelValue', val);
  }
}

defineExpose<FormItemExpose>({
  validate: () => !!value.value
})
</script>