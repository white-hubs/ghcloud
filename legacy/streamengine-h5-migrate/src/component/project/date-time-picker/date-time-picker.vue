<template>
  <DateTimePicker v-bind="props" v-model="dateTime" :minium-unit="miniumUnit" />
</template>

<script setup lang="ts">
import { FormItemExpose } from '../../../business/dynamic-table/form-item'
import { DateTimePickerMiniumUint } from '../../../component/basic/date-time-picker/date-time-picker'
import DateTimePicker from '../../../component/basic/date-time-picker/date-time-picker.vue'
import { DateFormat, format, parse, parseWithString, toArray } from '../../../infrastructure/date-util'
import { computed, onMounted, ref, watch } from 'vue'
import { DateTimePickerProps } from './date-time-picker'

const props = defineProps<DateTimePickerProps>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>()
const dateTime = ref<string[]>()
const formatRES = {
  second: /^yyyy-mm-dd hh:mm:ss$/i,
  min: /^yyyy-mm-dd hh:mm$/i,
  hour: /^yyyy-mm-dd hh$/i,
  day: /^yyyy-mm-dd$/i
}
const standardFmt = getStandardFmt()
const miniumUnit = computed(() => {
  if (!props.format || formatRES.min.test(props.format)) {
    return DateTimePickerMiniumUint.MINUTE
  }
  if (formatRES.hour.test(props.format)) {
    return DateTimePickerMiniumUint.HOUR
  }
  if (formatRES.second.test(props.format)) {
    // TODO(danke): 暂时借用 分钟
    return DateTimePickerMiniumUint.MINUTE
  }
  return DateTimePickerMiniumUint.DAY
})

onMounted(() => {
  if (!props.modelValue&&props.defaultValue) {
  dateTime.value = toArray(parseWithString(props.defaultValue as string, standardFmt))
    return
  }
  if(!props.modelValue) return
  dateTime.value = toArray(parseWithString(props.modelValue, standardFmt))
})
watch(dateTime, () => {
  if (dateTime.value) {
    emit('update:modelValue', format(parse(dateTime.value), standardFmt))
  }
})

defineExpose<FormItemExpose>({
  validate: () => !!dateTime.value && dateTime.value.length > 0
})

/**
 * 由于获取到的 format 格式与本项目使用的格式不兼容，该函数处理此异常情况
 */
function getStandardFmt () {
  if (!props.format) {
    return DateFormat.DEFAULT
  }
  if (formatRES.day.test(props.format)) {
    return DateFormat.DAY
  }
  if (formatRES.hour.test(props.format)) {
    return DateFormat.HOUR
  }
  if (formatRES.second.test(props.format)) {
    return DateFormat.SECOND
  }
  return DateFormat.MINUTE
}
</script>

<style scoped>

</style>
