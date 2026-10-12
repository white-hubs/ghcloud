<template>
  <Space>
    <Button
      v-for="(val, key, i) in btnList"
      :key="i"
      :type="state.checkedBtn === key + '' ? 'primary' : 'default'"
      size="middle"
      @click="getDate(key + '')"
    >
      {{ val }}
    </Button>
  </Space>
</template>
<script lang="ts" setup>
import dayjs from "dayjs";
import { onMounted, reactive } from "vue";

const btnList={
  THIS_WEEK: '本周',
  THIS_MONTH: "本月",
  THIS_YEAR: "全年",
}
const state = reactive<{
  dates: [string, string];
  checkedBtn: string;
  period: string;
}>({
  dates: ["", ""],
  checkedBtn: "THIS_WEEK",
  period: "",
});

const emit = defineEmits(["update:value", "change"]);
onMounted(() => {
  const startOfWeek = dayjs().startOf('week').format('YYYY-MM-DD');
  const endOfWeek = dayjs().endOf('week').format('YYYY-MM-DD');
  state.dates = [startOfWeek, endOfWeek];
  state.period = startOfWeek + " 00:00:00" + "," + endOfWeek + " 23:59:59";
  emit("update:value", state.period);
  emit("change", state.period);
});
const getDate = (key: string) => {
  state.checkedBtn = key;
  switch(key){
    case 'THIS_WEEK':
      const startOfWeek = dayjs().startOf('week').format('YYYY-MM-DD');
      const endOfWeek = dayjs().endOf('week').format('YYYY-MM-DD');
      state.dates = [startOfWeek, endOfWeek];
      state.period = startOfWeek + " 00:00:00" + "," + endOfWeek + " 23:59:59";
    break;
    case 'THIS_MONTH':
      const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
      const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');
      state.dates = [startOfMonth, endOfMonth];
      state.period = startOfMonth + " 00:00:00" + "," + endOfMonth + " 23:59:59";
    break;
    case 'THIS_YEAR':
      const startOfYear = dayjs().startOf('year').format('YYYY-MM-DD');
      const endOfYear = dayjs().endOf('year').format('YYYY-MM-DD');
      state.dates = [startOfYear, endOfYear];
      state.period = startOfYear + " 00:00:00" + "," + endOfYear + " 23:59:59";
    break;
    default:
  }
  emit("update:value", state.period);
  emit("change", state.period,state.checkedBtn);
};
</script>

<style lang="less" scoped>
:deep(.ant-btn) {
  margin-left: 0 !important;
}
</style>
