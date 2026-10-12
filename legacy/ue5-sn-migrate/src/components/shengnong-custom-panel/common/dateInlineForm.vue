<template>
  <div class="date-inline-container">
    <div v-if="modelValue.timeType === TimeType.自定义" class="custom-date-inline-container">
      <a-range-picker
        class="custom-range-picker"
        v-model:value="customDateRange"
        format="YYYY.MM.DD"
        :allowClear="false"
        @change="handleDateRangeChange"
        :disabledDate="disabledDate"
        :placeholder="['开始日期', '结束日期']"
      />
    </div>
    <a-form layout="inline" :model="modelValue" class="form">
      <a-form-item>
        <a-select
          ref="select"
          v-model:value="modelValue.timeType"
          :class="['time-type']"
          @change="handleChange"
          :getPopupContainer="(triggerNode) => triggerNode.parentNode"
        >
          <template #suffixIcon>
            <CaretDownOutlined />
          </template>
          <a-select-option :value="item.value" v-for="item in timeList" :key="item.value">{{ item.label }}</a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </div>
</template>
<script setup lang="ts">
import { CaretDownOutlined } from "@ant-design/icons-vue";
import dayjs, { Dayjs } from "dayjs";
import { ref, computed, watch, onMounted } from "vue";

import type { ModelValueItf } from "@/components/businessPanel/public/types";
import { storeTimeSync } from "@/piniaStore/timeSync";

const emit = defineEmits(["update:modelValue", "change", "search"]);
const piniaStoreTimeSync = storeTimeSync();

// 时间类型枚举
enum TimeType {
  "今日" = "TODAY",
  "本周" = "THIS_WEEK",
  "本月" = "THIS_MONTH",
  "今年" = "THIS_YEAR",
  "过去一年" = "PAST_YEAR",
  "自定义" = "CUSTOM",
}

const dateFormat = "YYYY-MM-DD HH:mm:ss";
const startDateFormat = "YYYY-MM-DD 00:00:00";
const endDateFormat = "YYYY-MM-DD 23:59:59";

interface Props {
  modelValue?: ModelValueItf;
  timeList?: { label: string; value: string }[];
  custom?: boolean;
  menuPage?: string;
}

// 默认属性设置
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => {
    return {
      timeType: "THIS_YEAR",
      dateRange: ["", ""],
    };
  },
  custom: false,
  timeList: () => {
    return [
      { label: "今日", value: "TODAY" },
      { label: "本周", value: "THIS_WEEK" },
      { label: "本月", value: "THIS_MONTH" },
      { label: "今年", value: "THIS_YEAR" },
      { label: "过去一年", value: "PAST_YEAR" },
      { label: "自定义", value: "CUSTOM" },
    ];
  },
  menuPage: "",
});

// 响应式数据
const customDateRange = ref<Dayjs[]>([]);
const startDateRef = ref<Dayjs | null>(null);
// 独立保存自定义时间范围，与预设时间类型完全分离
const savedCustomDateRange = ref<string[]>([]);

// 组件挂载时初始化
onMounted(() => {
  if (props.menuPage) {
    piniaStoreTimeSync.setCurrentMenuPage(props.menuPage);
    const savedTime = piniaStoreTimeSync.getCurrentMenuTime;

    if (savedTime) {
      // 如果有保存的时间且是自定义类型，初始化自定义时间范围
      if (savedTime.timeType === "CUSTOM" && savedTime.dateRange && savedTime.dateRange.length === 2) {
        savedCustomDateRange.value = [...savedTime.dateRange];
      }
      updateTimeRange(savedTime);
    }
  }
});

// 监听菜单页面变化
watch(
  () => props.menuPage,
  (newMenuPage) => {
    if (newMenuPage) {
      piniaStoreTimeSync.setCurrentMenuPage(newMenuPage);
    }
  },
  { immediate: true },
);

// 监听时间状态变化，实现卡片间同步
watch(
  () => piniaStoreTimeSync.getCurrentMenuTime,
  (newValue) => {
    if (props.menuPage && newValue) {
      // 如果新值是自定义类型，同步自定义时间范围
      if (newValue.timeType === "CUSTOM" && newValue.dateRange && newValue.dateRange.length === 2) {
        savedCustomDateRange.value = [...newValue.dateRange];
      }
      updateTimeRange(newValue);
    }
  },
  { deep: true },
);

// 禁用日期函数 - 实现最多选择1年的限制
const disabledDate = (current: Dayjs) => {
  // 禁用今天之后的日期
  if (current && current > dayjs().endOf("day")) {
    return true;
  }
  // 如果已经选择了开始日期，禁用开始日期之前的日期和开始日期之后超过1年的日期
  if (startDateRef.value) {
    const start = startDateRef.value.startOf("day");
    const end = startDateRef.value.add(1, "year").endOf("day");
    return current < start || current > end;
  }
  return false;
};

// 检查并限制时间范围不超过1年
const checkAndLimitTimeRange = (startDate: Dayjs, endDate: Dayjs): { valid: boolean; startDate: Dayjs; endDate: Dayjs } => {
  const diffInDays = endDate.diff(startDate, "day");
  if (diffInDays > 365) {
    const maxEndDate = startDate.add(365, "day");
    return {
      valid: false,
      startDate: startDate,
      endDate: maxEndDate,
    };
  }
  return {
    valid: true,
    startDate: startDate,
    endDate: endDate,
  };
};

const getPastYearDateRange = (): string[] => {
  const now = dayjs();
  return [now.subtract(1, "year").format(startDateFormat), now.format(endDateFormat)];
};

// 更新时间范围
const updateTimeRange = (newValue: ModelValueItf) => {
  // 始终更新Pinia store，确保所有卡片同步
  piniaStoreTimeSync.updateCurrentMenuTime(newValue);

  // 通知父组件更新
  emit("update:modelValue", newValue);
  emit("change", newValue);
  emit("search");

  // 处理自定义时间范围的显示
  if (newValue.timeType === "CUSTOM" && newValue.dateRange && newValue.dateRange.length === 2) {
    const storedStartDate = dayjs(newValue.dateRange[0]);
    const storedEndDate = dayjs(newValue.dateRange[1]);
    const { valid, startDate: limitedStartDate, endDate: limitedEndDate } = checkAndLimitTimeRange(storedStartDate, storedEndDate);
    customDateRange.value = [limitedStartDate, limitedEndDate];

    // 保存受限制的自定义时间范围
    savedCustomDateRange.value = [limitedStartDate.format("YYYY-MM-DD 00:00:00"), limitedEndDate.format("YYYY-MM-DD 23:59:59")];
  }
};

// 处理时间类型变化
const handleChange = (value: string) => {
  let model_value = { ...props.modelValue };
  model_value.timeType = value;

  // 根据选择的时间类型设置对应的日期范围
  if (value === TimeType.今日) {
    model_value.dateRange = [dayjs().format("YYYY-MM-DD 00:00:00"), dayjs().format(dateFormat)];
    startDateRef.value = null;
  } else if (value === TimeType.本周) {
    model_value.dateRange = [dayjs().startOf("week").format("YYYY-MM-DD 00:00:00"), dayjs().endOf("week").format("YYYY-MM-DD 23:59:59")];
    startDateRef.value = null;
  } else if (value === TimeType.本月) {
    model_value.dateRange = [dayjs().startOf("month").format("YYYY-MM-DD 00:00:00"), dayjs().endOf("month").format(dateFormat)];
    startDateRef.value = null;
  } else if (value === TimeType.今年) {
    model_value.dateRange = [dayjs().startOf("year").format("YYYY-MM-DD 00:00:00"), dayjs().endOf("year").format(dateFormat)];
    startDateRef.value = null;
  } else if (value === TimeType.过去一年) {
    model_value.dateRange = getPastYearDateRange();
    startDateRef.value = null;
  } else if (value === TimeType.自定义) {
    // 如果有保存的自定义时间范围，使用它
    if (savedCustomDateRange.value.length === 2 && savedCustomDateRange.value[0] !== "" && savedCustomDateRange.value[1] !== "") {
      const storedStartDate = dayjs(savedCustomDateRange.value[0]);
      const storedEndDate = dayjs(savedCustomDateRange.value[1]);
      customDateRange.value = [storedStartDate, storedEndDate];
      model_value.dateRange = [savedCustomDateRange.value[0], savedCustomDateRange.value[1]];
      startDateRef.value = storedStartDate;
    } else {
      // 第一次点击自定义时，默认从当前日期往前推1年
      const endDate = dayjs();
      const startDate = endDate.subtract(1, "year");
      customDateRange.value = [startDate, endDate];
      model_value.dateRange = [startDate.format("YYYY-MM-DD 00:00:00"), endDate.format("YYYY-MM-DD 23:59:59")];
      // 保存自定义时间范围
      savedCustomDateRange.value = [...model_value.dateRange];
      startDateRef.value = startDate;
    }
  }

  // 更新时间范围
  updateTimeRange(model_value);
};

// 处理自定义日期范围变化
const handleDateRangeChange = (dates: Dayjs[], dateStrings: string[]) => {
  if (dates && dates.length > 0) {
    startDateRef.value = dates[0];
  } else {
    startDateRef.value = null;
  }

  if (dates && dates.length === 2) {
    const startDate = dates[0];
    const endDate = dates[1];

    // 检查并限制时间范围不超过1年
    const { valid, startDate: limitedStartDate, endDate: limitedEndDate } = checkAndLimitTimeRange(startDate, endDate);

    if (!valid) {
      customDateRange.value = [limitedStartDate, limitedEndDate];
    }

    const newValue = {
      timeType: "CUSTOM",
      dateRange: [limitedStartDate.format("YYYY-MM-DD 00:00:00"), limitedEndDate.format("YYYY-MM-DD 23:59:59")],
    };

    // 保存自定义时间范围
    savedCustomDateRange.value = [...newValue.dateRange];
    startDateRef.value = null;

    // 更新时间范围
    updateTimeRange(newValue);
  }
};

// 计算时间列表
const timeList = computed(() => {
  const hasPastYear = props.timeList.some((item) => item.value === TimeType.过去一年);
  if (hasPastYear) {
    return props.timeList;
  }
  const customIndex = props.timeList.findIndex((item) => item.value === TimeType.自定义);
  const nextTimeList = [...props.timeList];
  const pastYearItem = { label: "过去一年", value: TimeType.过去一年 };
  if (customIndex >= 0) {
    nextTimeList.splice(customIndex, 0, pastYearItem);
    return nextTimeList;
  }
  return [...nextTimeList, pastYearItem];
});
</script>
<style lang="less" scoped>
.date-inline-container {
  position: relative;
  display: inline-block;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
}

.form {
  display: flex;
  position: relative;
  background-image: url("/resource/v1/ue5-sn-migrate/assets/images/sn/btn-1.png");
  height: 28px !important;
  background-repeat: no-repeat;
  background-size: 100% 80%;
  background-position: left bottom;
  font-size: 14px !important;
  margin-top: -10px !important;

  :deep(.ant-form-item) {
    margin-right: 0px !important;
    margin-bottom: 10px !important;
  }

  :deep(.ant-select-selector) {
    background: rgba(216, 216, 216, 0) !important;
  }

  .end-item {
    margin-right: 0 !important;
  }

  :deep(.ant-form-item-control-input-content) {
    display: flex;
    flex-wrap: nowrap;
  }

  .time-type {
    padding-right: 10px;
    width: 102px;

    :deep(.ant-select-selector) {
      border-radius: 2px;
      border: none !important;
      background: transparent !important;
      box-shadow: none !important;

      .ant-select-selection-item {
        padding: 0px;
        text-align: center;
        font-size: 14px !important;
        color: #cadcff !important;
      }
    }

    :deep(.ant-select.ant-select-focused .ant-select-selector),
    :deep(.ant-select:hover .ant-select-selector) {
      border: none !important;
      box-shadow: none !important;
    }

    :deep(.ant-select-arrow) {
      right: 10px;
      top: 16px;
      transform: scale(0.9);
      color: #cadcff !important;
    }
  }

  .ant-form-item {
    width: 100%;
  }

  .ant-form-item-control-input-content {
    display: flex;
  }

  .date-range {
    width: 202px;
    height: 28px;
    padding: 4px 2px;
    flex: 1;
  }

  :deep(.ant-select-dropdown) {
    color: rgba(255, 255, 255, 0.65);

    .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
      color: #ffffff;
    }

    .ant-select-item {
      color: rgba(255, 255, 255, 0.65);
    }

    .ant-select-item-option-active {
      color: rgba(255, 255, 255, 0.9);
    }
  }
}

/* 自定义时间内联显示样式 */
.custom-date-inline-container {
  flex: 1;
  position: relative;
  z-index: 1000;
  display: flex;
  align-items: center;
  background: linear-gradient(180deg, rgba(97, 148, 247, 0), rgba(76, 125, 200, 0.4));
  border-bottom: 1px solid;
  border-image: linear-gradient(180deg, rgba(97, 148, 247, 0), rgba(97, 148, 247, 0.5)) 1 1;
  border-radius: 2px;
  transform: skewX(-20deg);
  margin-bottom: 10px !important;
  max-width: 170px;
  min-width: 170px;
  height: 28px;
  line-height: 38px !important;

  .custom-range-picker {
    transform: skewX(20deg);
    :deep(.ant-picker-range) {
      background: none !important;
      border: none !important;
    }

    :deep(.ant-picker-input > input) {
      color: rgba(255, 255, 255, 0.9);
      text-align: center;
    }

    :deep(.ant-picker-range-separator) {
      color: rgba(255, 255, 255, 0.9);
      padding: 0;
    }
    :deep(.ant-picker-range) {
      background: none !important;
      border: none !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    :deep(.ant-picker-input > input::placeholder) {
      color: rgba(255, 255, 255, 0.9);
    }

    :deep(.ant-picker-suffix) {
      display: none;
    }
  }

  .date-format-text {
    font-size: 13px;
    color: #cadcff;
    white-space: nowrap;
  }
}

/* 全局时间选择器样式 */
:deep(.ant-picker-input > input) {
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
}

:deep(.ant-picker-range-separator) {
  color: rgba(255, 255, 255, 0.9);
  padding: 0;
}

:deep(.ant-picker-input > input::placeholder) {
  color: rgba(255, 255, 255, 0.9);
}

:deep(.ant-picker-suffix) {
  display: none;
}

:deep(.ant-picker-input) {
  width: inherit;
}

:deep(.ant-picker-range) {
  background: none !important;
  border: none !important;
  padding: 0 !important;
  padding-top: 2px !important;
}
:deep(.ant-picker-separator) {
  font-size: 10px !important;
  line-height: 20px !important;
}
:deep(.ant-picker-focused) {
  box-shadow: none !important;
}
:deep(.ant-select-focused) {
  box-shadow: none !important;
}
</style>
