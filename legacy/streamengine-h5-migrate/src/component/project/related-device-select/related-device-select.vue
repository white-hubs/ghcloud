<template>
  <VanField
    v-if="props.readonly"
    :label="props.label"
    :required="props.required"
    :model-value="readonlyText"
    readonly
    autosize
    type="textarea"
  />
  <template v-else>
    <VanField
      is-link
      readonly
      :label="props.label"
      :required="props.required"
      :model-value="readonlyText"
      placeholder="请选择关联设备"
      :error-message="errorMessage"
      @click="openPicker"
    />
    <VanPopup v-model:show="showPicker" position="right" duration="0.2">
      <div class="related-device-pop">
        <VanNavBar title="关联设备" left-text="返回" @click-left="hidePicker" />
        <VanSearch v-model="searchValue" show-action placeholder="根据设备名称搜索" left-icon="">
          <template #action>
            <div @click.stop="reload">搜索</div>
          </template>
        </VanSearch>
        <div class="list">
          <VanList :loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
            <VanCell v-for="item in datalist" :key="item.id" :title="item.name" @click="toggleDevice(item)">
              <template #label>
                <span>编码：{{ item.code || "--" }}</span
                ><br />
                <span>所属区域：{{ item.areaName || item.areaNames || "--" }}</span>
              </template>
              <template #right-icon>
                <VanCheckbox :model-value="isSelected(item)" shape="round" />
              </template>
            </VanCell>
          </VanList>
        </div>
        <div class="btn-area">
          <span>{{ selectedDevices.length ? `已选择 ${selectedDevices.length} 台` : "" }}</span>
          <VanButton type="primary" size="small" @click="confirm">确定</VanButton>
        </div>
      </div>
    </VanPopup>
  </template>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";

import { FormItemExpose } from "../../../business/dynamic-table/form-item";
import { cubeDeviceCenterService } from "../../../service/service";

type DeviceValue = { id: string; name: string; code?: string; areaName?: string; areaNames?: string };

const emits = defineEmits(["update:modelValue"]);
const props = withDefaults(
  defineProps<{
    modelValue?: DeviceValue[] | null;
    required?: boolean;
    readonly?: boolean;
    label?: string;
    multiple?: boolean;
  }>(),
  {
    modelValue: null,
    multiple: true,
  },
);

const showPicker = ref(false);
const searchValue = ref("");
const loading = ref(false);
const finished = ref(false);
const datalist = ref<DeviceValue[]>([]);
const selectedDevices = ref<DeviceValue[]>([]);
const validInput = ref(true);
const page = reactive({ pageNumber: 0, pageSize: 20 });

const readonlyText = computed(() =>
  selectedDevices.value
    .map((item) => item.name)
    .filter(Boolean)
    .join("、"),
);
const errorMessage = computed(() => (!validInput.value && props.required ? `请选择${props.label}` : ""));

function normalizeDevice(item: any): DeviceValue | null {
  const id = item.id || item.deviceId;
  if (!id) return null;
  return {
    id,
    name: item.name || item.deviceName || "",
    code: item.code || item.deviceCode || "",
    areaName: item.areaName,
    areaNames: item.areaNames,
  };
}
function isSelected(item: DeviceValue) {
  return selectedDevices.value.some((selected) => selected.id === item.id);
}
function toggleDevice(item: DeviceValue) {
  if (isSelected(item)) {
    selectedDevices.value = selectedDevices.value.filter((selected) => selected.id !== item.id);
    return;
  }
  selectedDevices.value = props.multiple ? [...selectedDevices.value, item] : [item];
}
async function onLoad() {
  if (loading.value || finished.value) return;
  page.pageNumber += 1;
  loading.value = true;
  try {
    const res = await cubeDeviceCenterService.getDeviceInstancePageAll({
      pageNumber: page.pageNumber,
      pageSize: page.pageSize,
      enabled: true,
      keyword: searchValue.value || undefined,
    });
    const records = ((res.records || []) as any[]).map(normalizeDevice).filter(Boolean) as DeviceValue[];
    datalist.value = datalist.value.concat(records);
    finished.value = records.length < page.pageSize;
  } finally {
    loading.value = false;
  }
}
function reload() {
  page.pageNumber = 0;
  datalist.value = [];
  finished.value = false;
  loading.value = false;
  onLoad();
}
function openPicker() {
  selectedDevices.value = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
  showPicker.value = true;
  reload();
}
function hidePicker() {
  showPicker.value = false;
}
function confirm() {
  emits("update:modelValue", selectedDevices.value);
  validInput.value = !props.required || selectedDevices.value.length > 0;
  hidePicker();
}

watch(
  () => props.modelValue,
  (value) => {
    selectedDevices.value = Array.isArray(value) ? [...value] : [];
  },
  { immediate: true, deep: true },
);

defineExpose<FormItemExpose>({
  validate: () => {
    const valid = !props.required || selectedDevices.value.length > 0;
    validInput.value = valid;
    return valid;
  },
});
</script>

<style scoped lang="less">
.related-device-pop {
  width: 100vw;
  height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
}
.list {
  flex: 1;
  overflow-y: auto;
}
.btn-area {
  min-height: 52px;
  padding: 8px 12px;
  border-top: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.btn-area span {
  color: #666;
  font-size: 12px;
}
</style>
