<template>
  <a-space>
    <DateHalfPicker :disabled="props.disabled" v-model:value="start" />
    ~
    <DateHalfPicker :disabled="props.disabled" v-model:value="end" />
  </a-space>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import { ref, watch } from 'vue';
import DateHalfPicker from './date-half-picker.vue';
type DateStringArray = [year: string, month: string, day: string, hour: string, minute: string, second: string]
const props = defineProps<{
  value: string[],
  disabled: boolean
}>()
const emit = defineEmits(['update:value'])
const [propsStart, propsEnd] = props.value ?? []
const start = ref(propsStart ?? '')
const end = ref(propsEnd ?? '')

watch([start, end], () => {
  if (!start.value || !end.value) {
    return
  }
  const _start = convert2Arr(start.value)
  const _end = convert2Arr(end.value)
  if (parse(_start) > parse(_end)) {
    message.error('开始时间不能大于结束时间')
    setTimeout(() => {
      start.value = ''
      end.value = ''
      emit('update:value', ['',''])
    }, 0);
    return
  }

  emit('update:value', [start.value, end.value])

  function convert2Arr(orginValue: string): string[] {
    const _value = orginValue.split(',')[0].split('-')
    _value.push(orginValue.split(',')[1])
    return _value
  }

  function parse([year, month, day, hour, minute, second]: Partial<DateStringArray> | string[]): Date {
    // TODO(danke): 临时处理 AM,PM 格式问题
    switch (hour) {
      case "AM":
        hour = '00'
        break
      case "PM":
        hour = '12'
        break
    }
    return dayjs(`${year}-${month}-${day} ${hour}`).toDate()
  }
})
</script>

<style scoped></style>