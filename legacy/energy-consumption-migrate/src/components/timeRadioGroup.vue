<!-- eslint-disable @typescript-eslint/no-unused-vars -->
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
    <!-- :disabled-date="disabledPriceRangeDate" -->
    <div v-if="showRangePicker">
      <RangePicker
        v-if="state.checkedBtn == 'TODAY'"
        v-model:value="state.dates"
        :disabled-date="disabledPriceRangeDate"
        class="w-315px"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        :allow-clear="false"
        @calendar-change="changeca"
        @change="changePicker"
      />
      <RangePicker
        v-if="state.checkedBtn == 'THIS_MONTH'"
        picker="month"
        v-model:value="state.dates"
        class="w-315px"
        format="YYYY-MM"
        value-format="YYYY-MM"
        :allow-clear="false"
        @calendar-change="changeca"
        @change="changePicker"
      />
      <RangePicker
        v-if="state.checkedBtn == 'THIS_YEAR'"
        :disabledDate="disabledYear"
        picker="year"
        v-model:value="state.dates"
        class="w-315px"
        format="YYYY"
        value-format="YYYY"
        :allow-clear="false"
        @calendar-change="changeca"
        @change="changePicker"
      />
    </div>
  </Space>
</template>
<script lang="ts" setup>
import dayjs from "dayjs";
import { onMounted, reactive, ref } from "vue";

interface Props {
  btns?: any;
  showRangePicker?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showRangePicker: false,
  btns: {
    THIS_YEAR: "年",
    THIS_MONTH: "月",
    TODAY: "日",
    // THIS_WEEK: '本周',
  },
});
const state = reactive<{
  dates: [string, string];
  checkedBtn: string;
  period: string;
}>({
  dates: ["", ""],
  checkedBtn: "THIS_MONTH",
  period: "",
});

const emit = defineEmits(["update:value", "change"]);
onMounted(() => {
  state.checkedBtn = props.btns.TODAY === "今日" ? "TODAY" : "THIS_MONTH";
  const nowTime = dayjs().format("YYYY-MM");
    let startTime = "";
    const currentDate = dayjs();

    // 获取下一个月的日期
    const nextMonth = currentDate.add(1, "month");

    startTime = dayjs(nextMonth).startOf("months").format("YYYY-MM");
    state.dates = [nowTime, startTime];
    state.period = nowTime + "-01 00:00:00" + "," + startTime + "-01 23:59:59";
  

  // state.period = dayjs().startOf('days').format('YYYY-MM-DD HH:mm:ss') + ',' + dayjs().format('YYYY-MM-DD HH:mm:ss')
  // state.dates = [dayjs().startOf('days').format('YYYY-MM-DD HH:mm:ss'), dayjs().format('YYYY-MM-DD HH:mm:ss')]
  emit("update:value", state.period);
  emit("change", state.checkedBtn);
});
const day = ref<any>([]);
const changeca = (value: [string, string] | [dayjs.Dayjs, dayjs.Dayjs]) => {
  day.value = value;
};
const getDateSubsce = (key: string) => {
  state.checkedBtn = key;

    state.dates = ["", ""];
  
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

  // emit("update:value", "");

  // emit("change", state.checkedBtn);
};
const disabledYear = (current:any): boolean=> {
  if(current.$y>1970) return false
  return true
    };
const changePicker = () => {
  // state.checkedBtn = "";
  // if (state.dates[0] === state.dates[1]) {Pr
    
    if(state.checkedBtn == 'TODAY'){
      state.dates[0] = dayjs(state.dates[0]).format("YYYY-MM-DD 00:00:00");
      state.dates[1] = dayjs(state.dates[1]).format("YYYY-MM-DD 23:59:59");
    }else if(state.checkedBtn == 'THIS_MONTH'){
      state.dates[0] = dayjs(state.dates[0]).startOf('month').format("YYYY-MM-DD HH:mm:ss");
      state.dates[1] = dayjs(state.dates[1]).endOf('month').format("YYYY-MM-DD HH:mm:ss");
    }else{
      state.dates[0] = dayjs(state.dates[0]).startOf('year').format("YYYY-MM-DD HH:mm:ss");
      state.dates[1] = dayjs(state.dates[1]).endOf('year').format("YYYY-MM-DD HH:mm:ss");
    }
  // }
  state.period = state.dates[0] + "," + state.dates[1];
  emit("update:value", state.period);
  emit("change", state.checkedBtn);
};
const disabledPriceRangeDate = (current: any) => {
  if (day.value.length === 0) return false;
  // 获取当前日期
  const today = dayjs(day.value[0]).add(1, "year");
  // 获取一年前的日期
  const oneYearAgo = dayjs(state.dates[0]).subtract(1, "years");
  // 禁用超过当前日期和一年前的日期
  return current && (current > today || current < oneYearAgo);
};
const setcheckedBtn = (value: string) => {
  state.checkedBtn = value;
  state.dates = ["", ""];
};
defineExpose({
  getDateSubsce,
  setcheckedBtn,
});
</script>
script

<style lang="less" scoped>
:deep(.ant-btn) {
  margin-left: 0 !important;
}
</style>
