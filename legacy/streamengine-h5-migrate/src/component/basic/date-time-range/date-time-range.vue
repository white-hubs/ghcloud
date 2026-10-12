<template>
  <VanField label-align="top" :required="props.required" :error-message="props.errorMessage">
    <template #label>
      <span :class="[props.readonly ? 'readonly' : 'editable']">{{ props.label }}</span>
    </template>
    <template #input>
      <VanCell class="picker-group" :style="{ padding: 0 }">
        <DateTimePicker
          v-model="start"
          :default-value="defaultDate"
          :max-date="end"
          placeholder="请选择开始时间"
          :style="{ padding: 0 }"
          :minium-unit="miniumUnit"
          :readonly="props.readonly"
          :range-child="true"
          @confirm="changeTime"
        />
        ~
        <DateTimePicker
          v-model="end"
          :default-value="defaultDate"
          placeholder="请选择结束时间"
          :style="{ padding: 0 }"
          :minium-unit="miniumUnit"
          :min-date="start"
          :readonly="props.readonly"
          :range-child="true"
          @confirm="changeTime"
        />
      </VanCell>
    </template>
  </VanField>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";

import { FormItemExpose } from "../../../business/dynamic-table/form-item";
import { DateTimePicker } from "../../../component";
import bus from "../../../infrastructure/bus";
import { now } from "../../../infrastructure/date-util";
import { DateTimePickerMiniumUint } from "../date-time-picker/date-time-picker";

const props = defineProps<{
  label?: string;
  modelValue?: [start: string[], end: string[]];
  miniumUnit?: DateTimePickerMiniumUint;
  echoMode?: boolean;
  required?: boolean;
  errorMessage?: string;
  readonly?: boolean;
  format?: string;
  config: { id: string };
}>();
const emit = defineEmits<{
  (e: "update:modelValue", modelValue: [string[], string[]]): void;
}>();

const start = ref<string[]>();
const end = ref<string[]>();
const defaultDate = now();
watch(
  () => props.modelValue,
  () => {
    if (!props.modelValue) {
      start.value = undefined;
      end.value = undefined;
      return;
    }
    const [startValue, endValue] = props.modelValue;
    start.value = startValue;
    end.value = endValue;
  },
  { immediate: true },
);
// onMounted(()=>{
//   // bus.emit('overTimeChange',{id:props.config.id,name:'dateTime',readonly:props.readonly})
// })
const changeTime = (val: string[]) => {
  if (start.value && end.value) {
    bus.emit("overTimeChange", { id: props.config.id, name: "dateTime", readonly: props.readonly });
    emit("update:modelValue", [start.value, end.value]);
  }
};

defineExpose<FormItemExpose>({
  validate: () => !!start.value && !!end.value,
});

const miniumUnit = computed<DateTimePickerMiniumUint>((): DateTimePickerMiniumUint => {
  let uint = DateTimePickerMiniumUint.DAY;
  if (props.format) {
    const format = props.format.toLocaleLowerCase();
    if (format.includes("hh")) {
      uint = DateTimePickerMiniumUint.HOUR;
    }
    if (format.includes(":mm")) {
      uint = DateTimePickerMiniumUint.MINUTE;
    }
  }
  if (props.miniumUnit) {
    uint = props.miniumUnit;
  }
  return uint;
});
onMounted(() => {});
</script>

<style scoped lang="less">
.picker-group {
  :deep(.van-cell__value) {
    display: flex;
  }

  :deep(.van-field__control) {
    text-align: center;
  }
}
.editable {
  color: black;
}
.readonly {
  color: var(--van-field-disabled-text-color);
}
</style>
