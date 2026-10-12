<template>
  <div  v-if="!props.readonly">
    <VanField v-model="overtimeDuration.name" :required="props.required"  :disabled="props.readonly" label="加班时长" type="number" placeholder="系统自动计算">
      <template #extra>小时</template>
    </VanField>
  </div>
  <div v-else>
    <VanField :model-value="overtimeDuration.name+'小时'"  :disabled="props.readonly" label="加班时长" type="text" placeholder="系统自动计算"/>
  </div>
</template>

<script setup lang="ts">
import bus from '../../../infrastructure/bus'
import { FormItemExpose } from '../../../business/dynamic-table/form-item'
import { attendanceService } from '../../../service/attendance/attendance.service'
import {   onMounted, onUnmounted, ref, watch } from 'vue'
import dayjs from 'dayjs'

const props = defineProps<{
  modelValue?: { name: string }|null;
  formData:any;
  dependFormValues: [type: string, range: [start: string, end: string]];
  params: string;
  params2: string;
  echoMode?: boolean;
  placeholder?: string;
  readonly?:boolean
  required?: boolean;
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: { name: string }|null): void;
}>()
const overtimeDuration = ref<{ name: string }>(props.modelValue ? props.modelValue : { name: '' })
const params=ref(props.params)
const params2=ref(props.params2)
const initValue=ref()
const timeReadOnly=ref(true)
const typeReadOnly=ref(true)
onMounted(()=>{
  initValue.value=overtimeDuration.value
  emit('update:modelValue', overtimeDuration.value)
})
bus.on('overTimeChange',(value:any)=>{
  if(value.name==='overTimeType'){
    params.value=value.id
    typeReadOnly.value=value.readonly
  }
  if(value.name==='dateTime'){
    params2.value=value.id
    timeReadOnly.value=value.readonly
  }
})
watch(
  [() => props.formData[params2.value],
  () => props.formData[params.value]],
  () => {
    if((!timeReadOnly.value||!typeReadOnly.value)){
      getData();
    }
  }
);
watch(()=>overtimeDuration,()=>{
  emit('update:modelValue', overtimeDuration.value)
},{deep:true})
const getData=async()=>{
const typeId=params.value.split(',')
const timeId=params2.value.split(',')
  if (props.readonly) {
    return
  }
  if(timeId.length>0&&props.formData[timeId[timeId.length-1]]?.length===2&&typeId.length>0&&props.formData[typeId[typeId.length-1]]){
    try {
     const period = [
      dayjs(props.formData[timeId[timeId.length-1]][0]).format("YYYY-MM-DD HH:mm:ss"),
      dayjs(props.formData[timeId[timeId.length-1]][1]).format("YYYY-MM-DD HH:mm:ss"),
    ].join(",");
    const duration = await attendanceService.calcWorkOvertimeDuration(props.formData[typeId[typeId.length-1]],period);
    emit('update:modelValue', duration)
    overtimeDuration.value = duration
  } catch (error) {
    emit('update:modelValue', null)
    overtimeDuration.value ={name:''}
  }
  }else{
    overtimeDuration.value ={name:''}
    emit('update:modelValue', null)
    return
  }
}
onUnmounted(()=>{
  bus.off('overTimeChange')
})
defineExpose<FormItemExpose>({
  validate: () => !!overtimeDuration.value.name
})
</script>

<style scoped></style>
