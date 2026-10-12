<template>
  <VanField v-model="attendanceValue" :label="props.label" type="text" :required="props.required" readonly disabled
    placeholder="系统自动带入" v-if="!props.readonly"/>
  <VanField :model-value="props.modelValue?props.modelValue+unit:'--'" :label="props.label" type="text" :required="props.required" disabled v-else/>
</template>

<script setup lang="ts">
import { DynamicTableProcessType } from '../../../business/dynamic-table/dynamic-table';
import { FormItemExpose } from '../../../business/dynamic-table/form-item'
import { attendanceService } from '../../../service/attendance/attendance.service';
import { computed } from 'vue'
import { ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  label?: string;
  required?: boolean;
  modelValue?: string;
  readonly?: boolean;
  defaultValue?: string;
  sponsorId?: string;
  name?: string;
  processType: DynamicTableProcessType;
  dependFormValues: [string[]];
  placeholder?:string;
  config:{attr:string}
}>(), {

})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>()

const attendanceValue = ref(props.modelValue ?? '')

watch(()=>props.dependFormValues, () => {
  getData()
})

defineExpose<FormItemExpose>({
  validate: () => !!attendanceValue.value
})

const getData = async () => {
  if (props.processType === DynamicTableProcessType.ADD && props.sponsorId && props.dependFormValues.length) {
    const params = { userId: props.sponsorId, type: props.config.attr, period: props.dependFormValues[0].join(',') }
    const res = await attendanceService.getAttendanceStat(params)
    attendanceValue.value = res;
    emit('update:modelValue', attendanceValue.value);
  }
}
const unit = computed(()=>{
  if (props.config.attr === 'SICK_LEAVE'||props.config.attr==='COMPASSIONATE_LEAVE') {
    return '天'
  } else {
    return '次'
  }
})
</script>

<style scoped></style>
