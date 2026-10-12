<template>
  <div>
    <a-range-picker 
      v-model:value="value" 
      :disabled="readonly || !type" 
      :show-time="{ format: 'HH:mm' }"
      format="YYYY-MM-DD HH:mm" 
      size="medium" 
      style="width:100%" 
      valueFormat="YYYY-MM-DD HH:mm"
      :disabled-date="disabledDate"
      :disabled-time="disabledRangeTime"
      v-if="!props.readonly"
    >
    </a-range-picker>
    <span v-else>{{ value.join(' ~ ').replaceAll('AM','上午').replaceAll('PM','下午') }}</span>
  </div>
</template>
<script setup lang="ts">
import dayjs, { Dayjs } from 'dayjs'
import { computed, inject, onMounted, ref, watch } from 'vue'

const businessType=inject('businessType')
const props = withDefaults(defineProps<{
  modelValue: any[] | null;
  placeholder: string;
  formData: any;
  params: string;
  readonly: boolean
}>(), {
  placeholder: '请选择'
})
const emits = defineEmits(['update:modelValue'])

const value = ref(props.modelValue ? props.modelValue : ['', ''])


const type = computed(() => {
  return props.params ? props.formData[props.params] : ""
})

const disabledDate = (current: Dayjs) => {
  if(businessType!=='CANCEL_LEAVE'){
    return false
  }
  if(!type.value){
    return false
  }
  if(current.startOf('day')<dayjs(type.value.leaveStartTime).startOf('day')){
    return true
  }
  if(current.startOf('day')>dayjs(type.value.leaveEndTime).startOf('day')){
    return true
  }
  return false
};
const range = (start: number, end: number) => {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
};
const disabledRangeTime = (current: Dayjs, actionType: 'start' | 'end') => {
  if(businessType!=='CANCEL_LEAVE'||!type.value){
    return []
  }
  if(!current){
    return []
  }
  let disabledHours: number[]=[]
  let disabledMinutes: number[]=[]

  const startTime=dayjs(type.value.leaveStartTime)
  const endTime=dayjs(type.value.leaveEndTime)
  const currentDay=dayjs(current)
  const currentHour=currentDay.hour()

  if(currentDay.startOf('day').isSame(startTime.startOf('day'))){
    const startHour=startTime.hour()
    const endHour=currentDay.startOf('day').isSame(endTime.startOf('day'))?endTime.hour():24
    const startMinute=startTime.minute()
    const endMinute=endTime.minute()

    disabledHours = range(0,startHour).concat(range(endHour+1,24))
    if(currentHour===startHour){
      disabledMinutes=range(0,startMinute)
    }
    if(currentHour===endHour){
      disabledMinutes=range(endMinute+1,60)
    }
  }else if(currentDay.startOf('day').isSame(endTime.startOf('day'))){
    const endHour=endTime.hour()
    const endMinute=endTime.minute()
    disabledHours = range(endHour+1,24)
    if(currentHour===endHour){
      disabledMinutes=range(endMinute+1,60)
    }
  }
  return {
    disabledHours: () => disabledHours,
    disabledMinutes: () => disabledMinutes,
  };
  // if (actionType === 'start') {
  //   if(current.startOf('day')===dayjs(type.value.leaveStartTime).startOf('day')){
  //     return {
  //     disabledHours: () => [0,1,2,3],
  //     disabledMinutes: () => [0,1],
  //   };
  //   }
  //   return {
  //     disabledHours: () => [],
  //     disabledMinutes: () => [],
  //   };
  // }
  // return {
  //   disabledHours: () => [0,1],
  //   disabledMinutes: () => [0,1],
  // };
};

onMounted(() => {

})


watch(() => type.value, () => {
  value.value = []
})

watch(() => value.value, () => {
  emits('update:modelValue', value.value[0]?value.value:null)
})
</script>