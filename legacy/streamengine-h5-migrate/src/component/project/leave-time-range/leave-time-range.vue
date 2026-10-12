<template>
  <DateTimeRange v-if="!props.readonly" v-bind="props" v-model="range" :minium-unit="DateTimePickerMiniumUint.MINUTE" />
  <VanField v-else v-model="readonlyValue" disabled :label="props.label" :required="props.required" label-align="top">
    <template #input>
      <div style="color:var(--van-field-input-disabled-text-color);text-align: center;width: 100%;">{{ readonlyValue }}
      </div>
    </template>
  </VanField>
</template>

<script lang="ts" setup>
import { FormItemExpose, FormItemObjectValue, FormItemProps } from '../../../business/dynamic-table/form-item'
import { DateTimePickerMiniumUint } from '../../../component/basic/date-time-picker/date-time-picker'
import DateTimeRange from '../../../component/basic/date-time-range/date-time-range.vue'
import dayjs from 'dayjs'
import { onMounted } from 'vue'
import { ref, watch } from 'vue'

const props = defineProps<FormItemProps<[leaveType: FormItemObjectValue]> & {
  modelValue?: [start: string, end: string];
  readonly?:boolean;
  dependFormValues:unknown
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: [start: string, end: string]): void;
}>()

const range = ref<[start: string[], end: string[]]>()

const readonlyValue = ref(props.modelValue ? props.modelValue.join(' ~ ').replace(/AM/g,"上午").replace(/PM/g,"下午") : '')

onMounted(()=>{
  if(props.modelValue&&props.modelValue.length===2){
    range.value=[toDataArray(props.modelValue[0]),toDataArray(props.modelValue[1])]
  }

  function toDataArray(dateString:string){
    const year=dayjs(dateString).year()
    const month=dayjs(dateString).month()+1
    const day=dayjs(dateString).date()
    const hh=dayjs(dateString).hour()
    const mm =dayjs(dateString).minute()
    return [
      year+'',
      month<10?'0'+month:month+'',
      day<10?'0'+day:day+'',
      hh<10?'0'+hh:hh+'',
      mm<10?'0'+mm:mm+'',
    ]
  }
})

watch(range, () => {
  if (!range.value) {
    return
  }
  const [start, end] = range.value
  emit('update:modelValue', [toDateString(start), toDateString(end)])
  function toDateString (dateArray: string[]): string {
    const [year = '1900', month = '01', day = '01', hourOrTime = '01', minute = '01'] = dateArray
    return `${year}-${month}-${day} ${hourOrTime}:${minute}`
  }
})

defineExpose<FormItemExpose>({
  validate: () => {
    if(props.readonly){
      return !!props.modelValue
    }
    return !!range.value?.[0] && !!range.value?.[1]
  }
})
</script>