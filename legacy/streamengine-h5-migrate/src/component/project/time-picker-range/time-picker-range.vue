<template>
  <VanField v-if="props.readonly" :label="props.label" :required="props.required" :model-value="textValue" readonly />
  <div v-else>
    <VanField
      is-link
      :required="props.required"
      :model-value="textValue"
      readonly
      :label="props.label"
      :placeholder="props.placeholder || '选择时段'"
      @click="pick"
      :error-message="errorMessage"
    />
    <VanPopup v-model:show="showPicker" position="bottom" style="height: 50%">
      <VanPickerGroup title="选择时段" :tabs="['开始时间', '结束时间']" @cancel="() => (showPicker = false)" @confirm="confirmPicker">
        <VanTimePicker v-model="time.startTime" :columns-type="['hour', 'minute', 'second']" title="选择开始时间" />
        <VanTimePicker v-model="time.endTime" :columns-type="['hour', 'minute', 'second']" title="选择结束时间" />
      </VanPickerGroup>
    </VanPopup>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";

import { FormItemExpose } from "../../../business/dynamic-table/form-item";

const props = withDefaults(
  defineProps<{
    label?: string;
    placeholder?: string;
    required?: boolean;
    modelValue?: string[];
    readonly?: boolean;
    defaultValue?: string[];
    disabled?: boolean;
    maxlength?: number;
    onkeyup?: string;
    allFormData: any;
    params: string;
  }>(),
  {
    placeholder: "请输入车牌号码",
    maxlength: 500,
  },
);
const emit = defineEmits<{
  (e: "update:modelValue", value: string[]): void;
}>();
const showPicker = ref(false);
const normalizeModelValue = (value?: string[] | string | null): string[] => {
  if (Array.isArray(value) && value.length >= 2 && value[0] && value[1]) {
    return [String(value[0]), String(value[1])];
  }
  if (typeof value === "string" && value) {
    const parts = value.split(/\s*-\s*/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return [parts[0], parts[1]];
    }
  }
  return [];
};
const toColumns = (value?: string): string[] => {
  const parts = (value ?? "").split(":");
  return [parts[0] ?? "00", parts[1] ?? "00", parts[2] ?? "00"];
};
const pick = () => {
  if (props.readonly) {
    return;
  }
  const [startTime, endTime] = normalizeModelValue(props.modelValue);
  time.startTime = toColumns(startTime);
  time.endTime = toColumns(endTime);
  showPicker.value = true;
};
const textValue = computed(() => {
  const [startTime, endTime] = normalizeModelValue(props.modelValue);
  if (!startTime || !endTime) {
    return "";
  }
  return `${startTime} - ${endTime}`;
});
const time = reactive({
  startTime: ["00", "00", "00"],
  endTime: ["00", "00", "00"],
});
const toSeconds = (value: string): number => value.split(":").reduce((acc, curr, index) => acc + Number(curr) * Math.pow(60, 2 - index), 0);
const validateTime = (): boolean => {
  const [startTime, endTime] = normalizeModelValue(props.modelValue);
  if (!startTime || !endTime) return false;
  return toSeconds(startTime) < toSeconds(endTime);
};
const getErrorMessage = (): string => {
  if (!textValue.value && props.required) {
    return `请选择${props.label}`;
  }
  const flag = validateTime();
  if (!flag) {
    return "结束时间必须大于开始时间";
  } else {
    return "";
  }
};
const errorMessage = computed(() => {
  return getErrorMessage();
});
const confirmPicker = () => {
  const startTimeText = time.startTime.join(":");
  const endTimeText = time.endTime.join(":");
  showPicker.value = false;
  emit("update:modelValue", [startTimeText, endTimeText]);
};
defineExpose<FormItemExpose>({
  validate: () => {
    return !!textValue.value && validateTime();
  },
});
</script>

<style scoped></style>
