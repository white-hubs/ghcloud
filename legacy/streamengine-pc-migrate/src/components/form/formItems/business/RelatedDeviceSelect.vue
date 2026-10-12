<script lang="tsx" setup>
import { computed, reactive, ref, watch } from "vue";

import { DeviceModalTable } from "@ghcloud/generic-component";

type DeviceOption = {
  id?: string;
  name?: string;
  code?: string;
  deviceId?: string;
  deviceName?: string;
  deviceCode?: string;
};

type DeviceValue = {
  id: string;
  name: string;
  code: string;
};

const emits = defineEmits(["update:modelValue", "clearValidate"]);
const props = withDefaults(
  defineProps<{
    modelValue?: DeviceValue[] | null;
    readonly?: boolean;
    multiple?: boolean;
  }>(),
  {
    modelValue: null,
    readonly: false,
    multiple: false,
  },
);

const deviceModalTableRef = ref();
const state = reactive<{
  selected: DeviceValue[];
}>({
  selected: [],
});

const normalizeDevice = (device: DeviceOption): DeviceValue | null => {
  const id = device.id ?? device.deviceId;
  if (!id) {
    return null;
  }
  return {
    id,
    name: device.name ?? device.deviceName ?? "",
    code: device.code ?? device.deviceCode ?? "",
  };
};

const selectedIds = computed(() => state.selected.map((item) => item.id));
const selectValue = computed(() => (props.multiple ? selectedIds.value : selectedIds.value[0]));
const readonlyText = computed(() => {
  const names = state.selected.map((item) => item.name).filter(Boolean);
  return names.length ? names.join("、") : "--";
});

const emitValue = () => {
  emits("update:modelValue", state.selected);
  emits("clearValidate");
};

const open = () => {
  deviceModalTableRef.value?.openModal();
};

const handleChange = (value: string | string[] | undefined) => {
  const ids = Array.isArray(value) ? value : value ? [value] : [];
  state.selected = state.selected.filter((item) => ids.includes(item.id));
  emitValue();
};

const deviceModalOnOk = (values: DeviceOption[]) => {
  const selected = values.map(normalizeDevice).filter(Boolean) as DeviceValue[];
  state.selected = props.multiple ? selected : selected.slice(0, 1);
  emitValue();
};

watch(
  () => props.modelValue,
  (value) => {
    state.selected = Array.isArray(value) ? (value.map(normalizeDevice).filter(Boolean) as DeviceValue[]) : [];
  },
  { immediate: true, deep: true },
);
</script>

<template>
  <div class="related-device-select">
    <a-select
      v-if="!props.readonly"
      :value="selectValue"
      :mode="props.multiple ? 'multiple' : undefined"
      :open="false"
      allowClear
      @change="handleChange"
    >
      <a-select-option v-for="item in state.selected" :key="item.id" :value="item.id">
        {{ item.name }}
      </a-select-option>
    </a-select>
    <span v-else>{{ readonlyText }}</span>
    <a-button v-if="!props.readonly" type="primary" @click="open">关联设备</a-button>
    <DeviceModalTable ref="deviceModalTableRef" :value="state.selected" :multiple="props.multiple" @ok="deviceModalOnOk" />
  </div>
</template>

<style lang="less" scoped>
.related-device-select {
  display: flex;

  :deep(.ant-select) {
    flex: 1;
  }
}
</style>
