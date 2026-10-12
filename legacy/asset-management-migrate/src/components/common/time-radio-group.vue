<!-- eslint-disable vue/valid-v-model -->
<template>
  <div>
    <Space>
      <Button
        v-for="(val, key) in state.btns" :key="key" :type="state.checkedBtn === key + '' ? 'primary' : 'default'"
        size="middle" @click="getDateSubsce(key + '')"
      >
        {{ val }}
      </Button>
      <RangePicker
        v-model:value="state.dates as [string,string]"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss"
        :allow-clear="false"
        @change="changePicker"
      />
    </Space>
  </div>
</template>
<script lang="ts" setup>
import dayjs from 'dayjs'
import { onMounted, reactive } from 'vue'
const state = reactive<{
  btns: unknown;
  dates: string[];
  checkedBtn: string;
  period: string;
}>({
  btns: {
    TODAY: '今日',
    THIS_WEEK: '本周',
    THIS_MONTH: '本月',
    THIS_YEAR: '今年'
  },
  dates: [],
  checkedBtn: 'TODAY',
  period: ''
})

const emit = defineEmits(['update:value', 'change'])
onMounted(() => {
  state.period = dayjs().startOf('days').format('YYYY-MM-DD HH:mm:ss') + ',' + dayjs().endOf('days').format('YYYY-MM-DD HH:mm:ss');
  state.dates = [dayjs().startOf('days').format('YYYY-MM-DD HH:mm:ss'), dayjs().endOf('days').format('YYYY-MM-DD HH:mm:ss')]
  emit('update:value', state.period);
  emit('change', state.checkedBtn)
})
const getDateSubsce = (key: string) => {
  state.checkedBtn = key;
  // const nowTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
  let startTime = '';
  let endTime = '';
  if (key === 'TODAY') {
    startTime = dayjs().startOf('days').format('YYYY-MM-DD HH:mm:ss');
    endTime = dayjs().endOf('days').format('YYYY-MM-DD HH:mm:ss');
  } else if (key === 'THIS_WEEK') {
    startTime = dayjs().startOf('weeks').format('YYYY-MM-DD HH:mm:ss');
    endTime = dayjs().endOf('weeks').format('YYYY-MM-DD HH:mm:ss');
  } else if (key === 'THIS_MONTH') {
    startTime = dayjs().startOf('months').format('YYYY-MM-DD HH:mm:ss');
    endTime = dayjs().endOf('months').format('YYYY-MM-DD HH:mm:ss');
  } else if (key === 'THIS_YEAR') {
    startTime = dayjs().startOf('years').format('YYYY-MM-DD HH:mm:ss');
    endTime = dayjs().endOf('years').format('YYYY-MM-DD HH:mm:ss');
  }
  state.dates = [startTime, endTime];
  state.period = startTime + ',' + endTime;
  emit('update:value', state.period);
  emit('change', state.checkedBtn)
}
const changePicker = () => {
  state.checkedBtn = '';
  if (state.dates[0] === state.dates[1]) {
    state.dates[0] = dayjs(state.dates[0]).format('YYYY-MM-DD 00:00:00');
    state.dates[1] = dayjs(state.dates[1]).format('YYYY-MM-DD 23:59:59');
  }
  state.period = state.dates[0] + ',' + state.dates[1];
  emit('update:value', state.period);
  emit('change', state.checkedBtn);
}
// const disabledPriceRangeDate = (current: any) => {
//   return current > dayjs().endOf('day')// 禁用今天之后的日期
// }

defineExpose({
  getDateSubsce
})
</script>

<style lang="less" scoped>
:deep(.ant-btn) {
  margin-left: 0 !important;
}
</style>
