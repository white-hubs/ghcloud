<template>
  <div>
    <a-space>
      <a-button
        v-for="(val, key) in btns"
        :key="key"
        :type="checkedBtn == key ? 'primary' : 'default'"
        size="middle"
        @click="getDateSubsce(key)"
      >
        {{ val }}
      </a-button>
      <a-range-picker
        v-if="!trendMode || checkedBtn === 'CUSTOM'"
        v-model:value="dates"
        :disabled-date="disabledPriceRangeDate"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss"
        :allowClear="false"
        @calendarChange="changeCalendar"
        @change="changePicker"
      />
    </a-space>
  </div>
</template>

<script lang="jsx">
import Moment from "moment";
import { defineComponent, onMounted, reactive, toRefs } from "vue";

const defaultBtns = {
  TODAY: "今日",
  THIS_WEEK: "本周",
  THIS_MONTH: "本月",
  THIS_YEAR: "今年",
};

const trendBtns = {
  TODAY: "今日",
  THIS_WEEK: "本周",
  THIS_MONTH: "本月",
  THIS_YEAR: "本年",
  CUSTOM: "自定义",
};

const toMoment = (value) => Moment(value?.valueOf?.() ?? value);

export default defineComponent({
  props: {
    trendMode: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const state = reactive({
      btns: props.trendMode ? trendBtns : defaultBtns,
      dates: [],
      selectingDates: [],
      checkedBtn: "TODAY",
      period: "",
    });

    const getDateRange = (key) => {
      const format = "YYYY-MM-DD HH:mm:ss";

      if (key === "THIS_WEEK") {
        return [
          Moment()
            .startOf(props.trendMode ? "isoWeek" : "week")
            .format(format),
          Moment().format(format),
        ];
      }
      if (key === "THIS_MONTH") {
        return [Moment().startOf("month").format(format), Moment().format(format)];
      }
      if (key === "THIS_YEAR") {
        return [Moment().startOf("year").format(format), Moment().format(format)];
      }

      return [Moment().startOf("day").format(format), Moment().format(format)];
    };

    const getDateSubsce = (key) => {
      state.checkedBtn = key;
      if (key === "CUSTOM") {
        const now = Moment();
        state.dates = [now.clone().subtract(29, "day").startOf("day").format("YYYY-MM-DD HH:mm:ss"), now.format("YYYY-MM-DD HH:mm:ss")];
        state.selectingDates = [];
        state.period = state.dates.join(",");
        emit("update:value", state.period);
        emit("change", "DAY");
        return;
      }

      state.dates = getDateRange(key);
      state.period = state.dates.join(",");
      emit("update:value", state.period);
      emit("change", state.checkedBtn);
    };

    onMounted(() => {
      getDateSubsce(state.checkedBtn);
    });

    const changePicker = () => {
      const now = Moment();
      let startDate = Moment(state.dates[0]);
      let endDate = Moment(state.dates[1]);

      if (endDate.isAfter(now)) {
        endDate = now.clone();
      }

      if (props.trendMode && state.checkedBtn === "CUSTOM") {
        if (endDate.clone().startOf("day").diff(startDate.clone().startOf("day"), "day") > 29) {
          startDate = endDate.clone().subtract(29, "day").startOf("day");
        }
        state.dates[0] = startDate.startOf("day").format("YYYY-MM-DD HH:mm:ss");
        state.dates[1] = endDate.isSame(now, "day")
          ? now.format("YYYY-MM-DD HH:mm:ss")
          : endDate.endOf("day").format("YYYY-MM-DD HH:mm:ss");
      } else {
        state.checkedBtn = "";
      }

      if (startDate.isSame(endDate, "day")) {
        state.dates[0] = startDate.startOf("day").format("YYYY-MM-DD HH:mm:ss");
        state.dates[1] = endDate.isSame(now, "day")
          ? now.format("YYYY-MM-DD HH:mm:ss")
          : endDate.endOf("day").format("YYYY-MM-DD HH:mm:ss");
      } else if (endDate.isSame(now, "day")) {
        state.dates[1] = now.format("YYYY-MM-DD HH:mm:ss");
      }
      state.period = state.dates.join(",");
      state.selectingDates = [];
      emit("update:value", state.period);
      emit("change", props.trendMode && state.checkedBtn === "CUSTOM" ? "DAY" : state.checkedBtn);
    };

    const changeCalendar = (pickerDates, _dateStrings, info) => {
      const selectedDate = info?.range === "end" ? pickerDates?.[1] : pickerDates?.[0];
      state.selectingDates = selectedDate ? [toMoment(selectedDate)] : [];
    };

    const disabledPriceRangeDate = (current) => {
      const currentDate = toMoment(current);
      if (currentDate.isAfter(Moment().endOf("day"))) {
        return true;
      }

      if (props.trendMode && state.checkedBtn === "CUSTOM") {
        const [selectedDate] = state.selectingDates;
        if (state.selectingDates.length === 1 && selectedDate) {
          return (
            currentDate.isBefore(selectedDate.clone().subtract(29, "day").startOf("day")) ||
            currentDate.isAfter(selectedDate.clone().add(29, "day").endOf("day"))
          );
        }
      }

      return false;
    };

    return {
      ...toRefs(state),
      getDateSubsce,
      changePicker,
      changeCalendar,
      disabledPriceRangeDate,
    };
  },
});
</script>

<style lang="less" scoped>
:deep(.ant-btn) {
  margin-left: 0 !important;
}
</style>
