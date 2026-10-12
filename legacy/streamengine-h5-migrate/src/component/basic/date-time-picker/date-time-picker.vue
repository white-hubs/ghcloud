<template>
  <VanField
    :required="props.required"
    :model-value="dateTimeView"
    :is-link="props.rangeChild ? false : !props.readonly"
    readonly
    :label="label"
    name="dateTimePicker"
    :placeholder="props.placeholder"
    :style="props.style"
    :class="{ 'range-child': rangeChild }"
    :disabled="props.readonly"
    :error-message="props.errorMessage"
    @click="pick"
  />
  <VanPopup v-if="!props.readonly" v-model:show="showPicker" position="bottom" :style="{ height: `calc(400px + 92px)` }">
    <VanPickerGroup
      :title="label"
      :tabs="selectTabs"
      v-model:active-tab="activeTab"
      @cancel="cancelPick"
      @confirm="confirmPick"
      next-step-text="下一步"
      v-if="showPicker"
    >
      <van-calendar
        first-day-of-week="1"
        :poppable="false"
        :row-height="40"
        :show-subtitle="false"
        :show-title="false"
        :show-confirm="false"
        :style="{ height: '400px' }"
        :min-date="minDate"
        :max-date="maxDate"
        :default-date="defaultDate"
        @confirm="calendarConfirm"
      />
      <VanTimePicker
        v-if="showTimePicker"
        v-model="selectedTime"
        :min-hour="minTime?.hour"
        :max-hour="maxTime?.hour"
        :min-minute="minTime?.minute"
        :max-minute="maxTime?.minute"
        :columns-type="timePickerType"
        :visible-option-num="9"
        @confirm="confirmPick"
      />
      <HalfDayPicker v-else-if="showHalfDayPicker" v-model="selectedHalfDayType" />
    </VanPickerGroup>
  </VanPopup>
  <!-- <VanDatePicker v-model="selectedDate" :min-date="minDate" :max-date="maxDate" /> -->
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { TimePickerColumnType } from "vant";
import { computed, onMounted, ref, watch } from "vue";

import { DynamicTableProcessType } from "../../../business/dynamic-table/dynamic-table";
import { now, parse, toArray } from "../../../infrastructure/date-util";
import { DateTimePickerMiniumUint, DateTimePickerProps, TimeMeridiemType, TimeMeridiemTypeLabel } from "./date-time-picker";
import HalfDayPicker from "./half-day-picker.vue";

const props = withDefaults(defineProps<DateTimePickerProps>(), {
  miniumUnit: DateTimePickerMiniumUint.MINUTE,
  rangeChild: false,
  placeholder: "请选择",
});
const emit = defineEmits<{
  (e: "update:modelValue", modelValue: string[]): void;
  (e: "confirm", modelValue: string[]): void;
}>();

const activeTab = ref(0);
const showPicker = ref(false);
const selectedDate = ref<[year: string, month: string, day: string]>();
// [hour: string, minute: string, second: string]
const selectedTime = ref<string[]>();
const selectedHalfDayType = ref<TimeMeridiemType>(TimeMeridiemType.MORNING);
const selectedDateTime = ref<string[]>();
const showTimePicker = computed(() => ["HOUR", "MINUTE"].includes(props.miniumUnit));
const showHalfDayPicker = computed(() => props.miniumUnit === "HALF_DAY");
const selectTabs = computed(() => (props.miniumUnit === "DAY" ? ["选择日期"] : ["选择日期", "选择时间"]));
const defaultDate = ref();
const calendarConfirm = (value: Date) => {
  const [year, month, day] = toArray(value);
  selectedDate.value = [year, month, day];
  activeTab.value = 1;
};
const maxDate = computed(() => {
  return props.maxDate ? parse(props.maxDate) : dayjs().add(6, "month").endOf("month").toDate();
});
const minDate = computed(() => {
  return props.minDate ? parse(props.minDate) : dayjs().subtract(6, "month").startOf("month").toDate();
});
/** 比较两个日期数组是否为同一天（只比较 year、month、day） */
function isSameDay(a: string[], b: string[]): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

const minTime = computed(() => {
  if (!props.minDate || !selectedDate.value) {
    return;
  }
  const [year, month, day, hour, minute] = props.minDate;
  if (!isSameDay(selectedDate.value, [year, month, day])) {
    return;
  }
  const selectHour = selectedTime.value?.length ? selectedTime.value[0] : null;
  if (selectHour && Number(selectHour) > Number(hour)) {
    return {
      hour,
    };
  }
  return {
    hour,
    minute,
  };
});
const maxTime = computed(() => {
  if (!props.maxDate || !selectedDate.value) {
    return;
  }
  const [year, month, day, hour, minute] = props.maxDate;
  if (!isSameDay(selectedDate.value, [year, month, day])) {
    return;
  }
  const selectHour = selectedTime.value?.length ? selectedTime.value[0] : null;
  if (selectHour && Number(selectHour) < Number(hour)) {
    return {
      hour,
    };
  }

  return {
    hour,
    minute,
  };
});
const timePickerType = computed(() => {
  const result: TimePickerColumnType[] = ["hour"];
  if (props.miniumUnit === "MINUTE") {
    result.push("minute");
  }
  return result;
});
const dateTimeView = ref("");
watch(selectedDateTime, () => {
  if (!selectedDate.value) {
    dateTimeView.value = "";
    return "";
  }
  const [year, month, day] = selectedDate.value;
  let sb = `${year}-${month}-${day}`;
  if (selectedTime.value) {
    const [hour, minute] = selectedTime.value;
    if (props.miniumUnit === "HOUR") {
      sb += ` ${hour}`;
    }
    if (props.miniumUnit === "MINUTE") {
      sb += ` ${hour}:${minute}`;
    }
  }
  if (props.miniumUnit === "HALF_DAY") {
    sb += ` ${TimeMeridiemTypeLabel[selectedHalfDayType.value].zhName}`;
  }

  dateTimeView.value = sb;
});
onMounted(() => {
  initDefaultValue();
  if (props.processType === DynamicTableProcessType.ADD && props.autoCurrentTime) {
    confirmPick();
  }
});
watch(
  () => props.modelValue,
  () => {
    initDefaultValue();
    selectedDateTime.value = props.modelValue;
    if (!props.modelValue) {
      setTimeout(() => {
        dateTimeView.value = "";
      }, 0);
    }
  },
  { immediate: true },
);
watch(
  () => props.miniumUnit,
  () => {
    initDefaultValue();
    dateTimeView.value = "";
    // TODO(danke): 需要清空状态
  },
);
watch(
  () => [minDate.value, maxDate.value],
  () => {
    if (defaultDate.value < minDate.value || defaultDate.value > maxDate.value) {
      const [year, month, day] = toArray(defaultDate.value < minDate.value ? minDate.value : maxDate.value);
      selectedDate.value = [year, month, day];
    }
  },
);
function initDefaultValue() {
  const [year, month, day, hour, minute] = props.modelValue ?? toArray((props.defaultValue as Date) ?? now());
  selectedDate.value = [year, month, day];
  defaultDate.value = dayjs(selectedDate.value.join("-")).toDate();
  if (props.miniumUnit === "HOUR") {
    selectedTime.value = [hour];
  }
  if (props.miniumUnit === "MINUTE") {
    selectedTime.value = [hour, minute];
  }
}
function pick() {
  if (props.echoMode) {
    return;
  }
  showPicker.value = true;
}
function cancelPick() {
  showPicker.value = false;
}
// TODO(danke): 重构
function confirmPick() {
  const dateTimeArray: string[] = [];
  if (selectedDate.value) {
    dateTimeArray.push(...selectedDate.value);
  }
  if (props.miniumUnit === DateTimePickerMiniumUint.HALF_DAY) {
    dateTimeArray.push(TimeMeridiemTypeLabel[selectedHalfDayType.value].enName);
  }
  if (selectedTime.value && props.miniumUnit !== DateTimePickerMiniumUint.HALF_DAY) {
    dateTimeArray.push(...selectedTime.value);
  }
  emit("update:modelValue", dateTimeArray);
  emit("confirm", dateTimeArray);
  selectedDateTime.value = dateTimeArray;
  showPicker.value = false;
}
</script>

<style scoped lang="less">
.range-child:after {
  display: none;
}
</style>
