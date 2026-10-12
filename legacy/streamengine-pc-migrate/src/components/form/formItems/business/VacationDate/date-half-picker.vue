<template>
  <div class="date-half-picker">
    <a-date-picker :disabled="props.disabled" v-model:value="dateValue" :format="DATE_FORMAT" placeholder="请选择日期" />
    <a-select :disabled="props.disabled" v-model:value="timeValue" class="select" placeholder="请选择时间">
      <a-select-option value="AM">上午</a-select-option>
      <a-select-option value="PM">下午</a-select-option>
    </a-select>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { computed, ref, watch } from 'vue';

const props = defineProps({
  value: {
    // yyyy-mm-dd,AM
    type: String,
  },
  disabled: Boolean
})
const emit = defineEmits(['update:value'])
const DATE_FORMAT = 'YYYY-MM-DD'

const [date, time] = analysisPropsValue() ?? []
const dateValue = ref(date ? dayjs(date, DATE_FORMAT) : undefined)
const timeValue = ref(time)
const dateTimeValue = computed(() => {
  if (!dateValue.value || !timeValue.value) {
    return ''
  }
  return `${dateValue.value.format(DATE_FORMAT)},${timeValue.value}`
})

watch([dateValue, timeValue], () => {
  if (!dateValue.value || !timeValue.value) {
    return
  }
  emit('update:value', dateTimeValue.value)
})

watch(()=>props.value,()=>{
  if(!props.value){
    dateValue.value=undefined
    timeValue.value=''
  }
})
function analysisPropsValue() {
  if (!props.value) {
    return
  }
  return props.value.split(',')
}
</script>

<style scoped>
.date-half-picker {
  display: flex;
}
.template-picker{
  width: 200px !important;
  flex-shrink: 0;
}
.select {
  width: 120px !important;
  margin-left: 10px;
}
</style>