<template>
  <a-form layout="inline" :model="modelValue" class="form">
    <a-form-item>
      <a-select
        ref="select"
        v-model:value="modelValue.timeType"
        style="width: 96px; height: 28px"
        class="time-type"
        @change="handleChange"
        :getPopupContainer="(triggerNode) => triggerNode.parentNode"
      >
        <template #suffixIcon>
          <CaretDownOutlined />
        </template>
        <a-select-option :value="item.value" v-for="(item, i) in mergedTimeList" :key="item.value">{{ item.label }}</a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item v-if="props.showCustom">
      <a-range-picker
        v-model:value="modelValue.dateRange"
        class="date-range"
        separator="-"
        :allowClear="false"
        :format="dateFormat"
        :valueFormat="dateFormat"
        @change="changeDate"
        :getPopupContainer="(triggerNode) => triggerNode.parentNode"
      >
        <template #suffixIcon>
          <CalendarOutlined />
        </template>
      </a-range-picker>
    </a-form-item>
    <a-form-item class="end-item" v-if="props.showCustom">
      <a-button type="primary" html-type="submit" size="small">查询</a-button>
    </a-form-item>
  </a-form>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { CaretDownOutlined, CalendarOutlined } from "@ant-design/icons-vue";
import moment from "moment";
const emit = defineEmits(["update:modelValue", "change", "search"]);

enum TimeType {
  "今日" = "TODAY",
  "本周" = "THIS_WEEK",
  "本月" = "THIS_MONTH",
  "今年" = "THIS_YEAR",
  "过去一年" = "PAST_YEAR",
}
const timeTypePickerOption = ref([
  { label: "今日", value: TimeType.今日 },
  { label: "本周", value: TimeType.本周 },
  { label: "本月", value: TimeType.本月 },
  { label: "今年", value: TimeType.今年 },
]);
const dateFormat = "YYYY-MM-DD HH:mm:ss";
interface ModelValueItf {
  timeType: string;
  dateRange: string[];
}

interface Props {
  modelValue?: ModelValueItf;
  showcustom?: boolean;
  timeList?: { label: string; value: string }[];
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => {
    return {
      timeType: "THIS_YEAR",
      dateRange: ["", ""],
    };
  },
  showCustom: false,
  timeList: () => {
    return [
      { label: "今日", value: "TODAY" },
      { label: "本周", value: "THIS_WEEK" },
      { label: "本月", value: "THIS_MONTH" },
      { label: "今年", value: "THIS_YEAR" },
      { label: "过去一年", value: "PAST_YEAR" },
    ];
  },
});

const getPastYearDateRange = (): string[] => {
  const now = moment();
  return [now.clone().subtract(1, "year").format("YYYY-MM-DD 00:00:00"), now.format(dateFormat)];
};

const mergedTimeList = computed(() => {
  if (props.timeList.some((item) => item.value === TimeType.过去一年)) {
    return props.timeList;
  }
  return [...props.timeList, { label: "过去一年", value: TimeType.过去一年 }];
});

//时间类型选择回调
const handleChange = (value: string) => {
  let model_value = props.modelValue;
  model_value.timeType = value;
  if (value === TimeType.今日) {
    model_value.dateRange = [moment().format("YYYY-MM-DD 00:00:00"), moment().format(dateFormat)];
  } else if (value === TimeType.本周) {
    // model_value.dateRange = [moment().startOf("week").format('YYYY-MM-DD 00:00:00'), moment().endOf("week").format(dateFormat)];
    model_value.dateRange = [
      moment().startOf("week").add(1, "days").format("YYYY-MM-DD 00:00:00"),
      moment().endOf("week").add(1, "days").format(dateFormat),
    ];
  } else if (value === TimeType.本月) {
    model_value.dateRange = [moment().startOf("month").format("YYYY-MM-DD 00:00:00"), moment().endOf("months").format(dateFormat)];
  } else if (value === TimeType.今年) {
    model_value.dateRange = [moment().startOf("year").format("YYYY-MM-DD 00:00:00"), moment().endOf("year").format(dateFormat)];
  } else if (value === TimeType.过去一年) {
    model_value.dateRange = getPastYearDateRange();
  } else if (!model_value.timeType) {
    model_value.timeType = mergedTimeList.value[0].value;
  }
  emit("update:modelValue", model_value);
  emit("search");
};
// 选择时间
const changeDate = (value: string[]) => {};
onMounted(() => {
  let time = {
    TODAY: "今日",
    THIS_WEEK: "本周",
    THIS_MONTH: "本月",
    THIS_YEAR: "今年",
    PAST_YEAR: "过去一年",
  };
  handleChange(TimeType[time[props.modelValue.timeType]]);

  // emit("search");
});
</script>
<style lang="less" scoped>
.form {
  position: relative;
  justify-content: flex-end;

  :deep(.ant-form-item) {
    margin-right: 9px !important;
  }

  .end-item {
    margin-right: 0 !important;
  }

  .time-type {
    :deep(.ant-select-selector) {
      padding: 0;
      background: rgba(41, 137, 255, 0.102);
      height: 28px !important;
      border-radius: 2px 2px 2px 2px;
      border: 1px solid #2989ff;

      .ant-select-selection-item {
        padding: 0;
        color: white;
        margin-top: -2px;
        margin-left: 5px;
      }
    }

    :deep(.ant-select-arrow) {
      right: 5px;
      transform: scale(0.9);
      color: white;
    }
  }

  .date-range {
    width: 182px;
    height: 28px;
    background: rgba(41, 137, 255, 0.102);

    :deep(.ant-calendar-picker-input) {
      width: 100%;
      height: 100%;
      background: transparent;
      border-radius: 2px 2px 2px 2px;
      opacity: 1;
      border: 1px solid #526276;
      display: flex;
      align-items: center;
      color: rgba(255, 255, 255, 0.5);
      padding: 0;

      input {
        width: 40%;
        font-size: 12px;
      }
    }

    :deep(.ant-calendar-range-picker-separator) {
      color: rgba(255, 255, 255, 0.5);
      display: inline-flex;
      align-items: center;
      min-width: 0;
    }

    :deep(.ant-calendar-picker-icon) {
      right: 6px;
      margin: 0;
      transform: translateY(-50%);
      color: rgba(255, 255, 255, 0.5);
    }
  }

  :deep(.ant-select-dropdown) {
    color: rgba(255, 255, 255, 0.65);
    background-color: rgba(0, 0, 0, 0.5);

    .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
      background-color: #2989ff;
      color: #ffffff;
    }

    .ant-select-item {
      color: rgba(255, 255, 255, 0.65);
    }

    .ant-select-item-option-active {
      background: #7ea0ca;
      color: rgba(255, 255, 255, 0.9);
    }
  }
}
</style>
