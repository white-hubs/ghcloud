<script setup lang="ts">
import { LinkOutlined } from "@ant-design/icons-vue";
import { computed, ref } from "vue";

type TaskDevice = {
  id: number;
  code: string;
  name: string;
};

type SecurityDevice = {
  deviceId: number;
  code: string;
  deviceName: string;
};

const props = withDefaults(defineProps<{ value?: TaskDevice[] }>(), {
  value: () => [],
});
const emit = defineEmits<{ "update:value": [devices: TaskDevice[]] }>();

const visible = ref(false);
const selectedKeys = computed(() => props.value.map((device) => device.id));
const selectedRows = computed(() => props.value.map((device) => ({ deviceId: device.id, code: device.code, deviceName: device.name })));
const selectedDeviceNames = computed(() => props.value.map((device) => device.name).join("、"));
const columns = [
  { dataIndex: "code", title: "设备编码" },
  { dataIndex: "deviceName", title: "设备名称" },
  { dataIndex: "deviceProdCategoryName", title: "设备类型" },
  { dataIndex: "deviceProdName", title: "设备型号" },
  { dataIndex: "areaName", title: "所属区域" },
];
const search = [{ label: "", value: "keyword", placeholder: "设备名称或编码" }];

const open = () => {
  visible.value = true;
};

const save = (deviceIds: number[], devices: SecurityDevice[]) => {
  emit(
    "update:value",
    devices
      .filter((device) => deviceIds.includes(device.deviceId))
      .map((device) => ({ id: device.deviceId, code: device.code, name: device.deviceName })),
  );
  visible.value = false;
};
</script>

<template>
  <a-input
    :value="selectedDeviceNames"
    readonly
    placeholder="选择联动设备"
    class="device-selector-input"
    @click="open"
    @keydown.enter.prevent="open"
  >
    <template #suffix><LinkOutlined /></template>
  </a-input>
  <modal-table
    v-model:value="visible"
    title="选择联动设备"
    url="getSecurityDevicePage"
    row-key="deviceId"
    select-type="checkbox"
    :params="{ applicationCode: 'EMERGENCY_CENTER' }"
    :columns="columns"
    :search="search"
    :search-length="1"
    :selected-keys="selectedKeys"
    :selected-rows="selectedRows"
    :width="1060"
    @modal-save="save"
  />
</template>

<style scoped>
.device-selector-input {
  cursor: pointer;
}
</style>
