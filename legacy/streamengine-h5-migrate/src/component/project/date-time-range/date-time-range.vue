<template>
  <VanField v-if="props.readonly" :label="props.label" :required="props.required" :model-value="readonlyText" readonly />
  <DateTimeRange v-else v-bind="props" v-model="range" />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

import { FormItemExpose, FormItemProps } from "../../../business/dynamic-table/form-item";
import { DateTimeRange } from "../../../component/basic";
import { DateFormat, format, parse, parseWithString, toArray } from "../../../infrastructure/date-util";

const formatRES = {
  second: /^yyyy-mm-dd hh:mm:ss$/i,
  min: /^yyyy-mm-dd hh:mm$/i,
  hour: /^yyyy-mm-dd hh$/i,
  day: /^yyyy-mm-dd$/i,
};

const getStandardFmt = (fmt?: string): string => {
  if (!fmt) {
    return DateFormat.DEFAULT;
  }
  if (formatRES.day.test(fmt)) {
    return DateFormat.DAY;
  }
  if (formatRES.hour.test(fmt)) {
    return DateFormat.HOUR;
  }
  if (formatRES.second.test(fmt)) {
    return DateFormat.SECOND;
  }
  return DateFormat.MINUTE;
};

const props = defineProps<
  FormItemProps & {
    modelValue?: [start: string, end: string];
    format?: string;
  }
>();
const emit = defineEmits<{
  (e: "update:modelValue", _val: [string, string]): void;
}>();
const range = ref<[start: string[], end: string[]]>();
let syncingFromModel = false;

const readonlyText = computed(() => {
  if (!props.modelValue?.[0] || !props.modelValue?.[1]) {
    return "--";
  }
  return `${props.modelValue[0]} ~ ${props.modelValue[1]}`;
});

const syncRangeFromModelValue = (value?: [string, string]) => {
  if (!value?.[0] || !value?.[1]) {
    range.value = undefined;
    return;
  }
  const standardFmt = getStandardFmt(props.format);
  const [start, end] = value;
  range.value = [toArray(parseWithString(start, standardFmt)), toArray(parseWithString(end, standardFmt))];
};

watch(
  () => props.modelValue,
  (value) => {
    syncingFromModel = true;
    try {
      syncRangeFromModelValue(value);
    } finally {
      syncingFromModel = false;
    }
  },
  { immediate: true },
);

watch(range, () => {
  if (syncingFromModel || !range.value) {
    return;
  }
  const standardFmt = getStandardFmt(props.format);
  const [start, end] = range.value;
  emit("update:modelValue", [format(parse(start), standardFmt), format(parse(end), standardFmt)]);
});
defineExpose<FormItemExpose>({
  validate: () => !!range.value,
});
</script>

<style scoped></style>
