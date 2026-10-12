<template>
  <Space>
    <Button
      v-for="(val, key, i) in btns"
      :key="i"
      :type="state.checkedBtn === key + '' ? 'primary' : 'default'"
      size="middle"
      @click="getDateSubsce(key + '')"
    >
      {{ val }}
    </Button>
    <RangePicker
      v-if="showRangePicker"
      v-model:value="state.dates"
      :disabled-date="disabledPriceRangeDate"
      class="w-315px"
      format="YYYY-MM-DD HH:mm:ss"
      value-format="YYYY-MM-DD HH:mm:ss"
      :allow-clear="false"
      @calendar-change="changeca"
      @change="changePicker"
    />
  </Space>
</template>
<script lang="ts" setup>
import dayjs from 'dayjs'
import { onMounted, reactive, ref } from 'vue'
interface Props {
  btns?: any;
  showRangePicker?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  showRangePicker: false,
  btns: {
    TODAY: '今日',
    // THIS_WEEK: '本周',
    THIS_MONTH: '本月',
    THIS_YEAR: '今年'
  }
})
const state = reactive<{
  dates: [string, string];
  checkedBtn: string;
  period: string;
}>({
  dates: ['', ''],
  checkedBtn: 'TODAY',
  period: ''
})

const emit = defineEmits(['update:value', 'change'])
onMounted(() => {
  state.checkedBtn = props.btns.TODAY === '今日' ? 'TODAY' : 'THIS_MONTH'
  // state.period = dayjs().startOf('days').format('YYYY-MM-DD HH:mm:ss') + ',' + dayjs().format('YYYY-MM-DD HH:mm:ss')
  // state.dates = [dayjs().startOf('days').format('YYYY-MM-DD HH:mm:ss'), dayjs().format('YYYY-MM-DD HH:mm:ss')]
  emit('update:value', state.period)
  emit('change', state.checkedBtn)
})
const day = ref<any>([])
const changeca = (value: [string, string] | [dayjs.Dayjs, dayjs.Dayjs]) => {
  day.value = value
}
const getDateSubsce = (key: string) => {
  state.checkedBtn = key
  // const nowTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
  // let startTime = ''
  // if (key === 'TODAY') {
  //   startTime = dayjs().startOf('days').format('YYYY-MM-DD HH:mm:ss')
  // } else if (key === 'THIS_WEEK') {
  //   startTime = dayjs().startOf('weeks').format('YYYY-MM-DD HH:mm:ss')
  // } else if (key === 'THIS_MONTH') {
  //   startTime = dayjs().startOf('months').format('YYYY-MM-DD HH:mm:ss')
  // } else if (key === 'RECENT_THREE_MONTH') {
  //   startTime = dayjs().subtract(3, 'month').format('YYYY-MM-DD HH:mm:ss')
  // } else if (key === 'RECENT_HALF_YEAR') {
  //   startTime = dayjs().subtract(6, 'month').format('YYYY-MM-DD HH:mm:ss')
  // } else if (key === 'THIS_YEAR') {
  //   startTime = dayjs().startOf('years').format('YYYY-MM-DD HH:mm:ss')
  // } else if (key === 'NEARLY_7_DAYS') {
  //   startTime = dayjs().startOf('days').add(-6, 'days').format('YYYY-MM-DD HH:mm:ss')
  // } else if (key === 'NEARLY_30_DAYS') {
  //   startTime = dayjs().startOf('days').add(-29, 'days').format('YYYY-MM-DD HH:mm:ss')
  // }
  // state.dates = [startTime, nowTime]
  // state.period = startTime + ',' + nowTime
  state.dates = ['', '']
  emit('update:value', '')
  // emit('update:value', state.period)
  emit('change', state.checkedBtn)
}
const changePicker = () => {
  state.checkedBtn = ''
  // if (state.dates[0] === state.dates[1]) {Pr
  state.dates[0] = dayjs(state.dates[0]).format('YYYY-MM-DD 00:00:00')
  state.dates[1] = dayjs(state.dates[1]).format('YYYY-MM-DD 23:59:59')
  // }
  state.period = state.dates[0] + ',' + state.dates[1]
  emit('update:value', state.period)
  emit('change', state.checkedBtn)
}
const disabledPriceRangeDate = (current: any) => {
  if (day.value.length === 0) return false
  // 获取当前日期
  const today = dayjs(day.value[0]).add(1, 'year')

  // 获取一年前的日期
  const oneYearAgo = dayjs(state.dates[0]).subtract(1, 'years')
  // 禁用超过当前日期和一年前的日期
  return current && (current > today || current < oneYearAgo)
}
const setcheckedBtn = (value:string) => {
  state.checkedBtn = value
  state.dates = ['', '']
}
defineExpose({
  getDateSubsce,
  setcheckedBtn
})
</script>
script

<style lang="less" scoped>
:deep(.ant-btn) {
  margin-left: 0 !important;
}
</style>
