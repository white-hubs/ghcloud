<template>
  <SubPanelTemplate :title="title" zoomable :zoom-title="title">
    <template #extra>
      <div class="liquid-level-display-board__tools">
        <input
          v-model="keywordInput"
          class="liquid-level-display-board__search"
          type="search"
          placeholder="搜索设备"
          @keyup.enter="search"
        />
        <button class="liquid-level-display-board__icon-button" type="button" title="搜索" @click="search">
          <SearchOutlined />
        </button>
        <button class="liquid-level-display-board__icon-button" type="button" title="刷新" :disabled="isLoading" @click="refresh">
          <ReloadOutlined :class="{ 'liquid-level-display-board__refreshing': isLoading }" />
        </button>
      </div>
    </template>

    <div class="liquid-level-display-board">
      <div v-if="devices.length > 0" class="liquid-level-display-board__grid">
        <div v-for="device in devices" :key="device.id" class="liquid-level-display-board__device" :title="device.name">
          <LiquidLevelGauge :value="device.liquidLevel" />
          <span class="liquid-level-display-board__device-name">{{ device.name }}</span>
        </div>
      </div>
      <div v-else class="liquid-level-display-board__empty">{{ isLoading ? "正在加载..." : "暂无液位设备" }}</div>

      <div class="liquid-level-display-board__pagination">
        <button
          class="liquid-level-display-board__icon-button"
          type="button"
          title="上一页"
          :disabled="isLoading || pageNumber <= 1"
          @click="changePage(pageNumber - 1)"
        >
          <LeftOutlined />
        </button>
        <span>{{ pageNumber }} / {{ totalPages }}</span>
        <button
          class="liquid-level-display-board__icon-button"
          type="button"
          title="下一页"
          :disabled="isLoading || pageNumber >= totalPages"
          @click="changePage(pageNumber + 1)"
        >
          <RightOutlined />
        </button>
      </div>
    </div>
  </SubPanelTemplate>
</template>

<script lang="ts" setup>
import { LeftOutlined, ReloadOutlined, RightOutlined, SearchOutlined } from "@ant-design/icons-vue";
import { computed, onMounted, ref } from "vue";

import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import LiquidLevelGauge from "./liquid-level-gauge.vue";
import { getDeviceListByBusiness } from "@/api/device";

interface DevicePropWithTsDTO {
  key?: string;
  value?: string | number | null;
  translatedValue?: string | number | null;
}

interface DeviceMonitoringRecord {
  deviceId?: string | number;
  deviceName?: string;
  devicePropWithTsDTOS?: DevicePropWithTsDTO[];
}

interface LiquidLevelDevice {
  id: string;
  name: string;
  liquidLevel: number | null;
}

interface DeviceMonitoringPage {
  records?: DeviceMonitoringRecord[];
  list?: DeviceMonitoringRecord[];
  total?: number;
  data?: DeviceMonitoringPage;
}

const APPLICATION_CODE = "WATERSUPPLYDRAINAGE";
const PAGE_SIZE = 4;

const props = withDefaults(
  defineProps<{
    title?: string;
  }>(),
  {
    title: "液位显示看板",
  },
);

const pageNumber = ref(1);
const total = ref(0);
const keyword = ref("");
const keywordInput = ref("");
const isLoading = ref(false);
const devices = ref<LiquidLevelDevice[]>([]);
let latestRequestId = 0;

const title = computed(() => props.title);
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)));

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const getLiquidLevel = (record: DeviceMonitoringRecord): number | null => {
  const liquidLevel = record.devicePropWithTsDTOS?.find((item) => item.key === "liquidLevel");
  return toNumber(liquidLevel?.value ?? liquidLevel?.translatedValue);
};

const parsePage = (response: DeviceMonitoringPage | DeviceMonitoringRecord[]): { records: DeviceMonitoringRecord[]; total: number } => {
  if (Array.isArray(response)) {
    return { records: response, total: response.length };
  }
  const page = response.data ?? response;
  const records = Array.isArray(page.records) ? page.records : Array.isArray(page.list) ? page.list : [];
  const pageTotal = toNumber(page.total);
  return { records, total: pageTotal ?? records.length };
};

const loadDevices = async (): Promise<void> => {
  const requestId = ++latestRequestId;
  isLoading.value = true;
  try {
    const response = await getDeviceListByBusiness({
      applicationCode: APPLICATION_CODE,
      keyword: keyword.value || undefined,
      pageNumber: pageNumber.value,
      pageSize: PAGE_SIZE,
    });
    if (requestId !== latestRequestId) {
      return;
    }
    const page = parsePage(response as DeviceMonitoringPage | DeviceMonitoringRecord[]);
    total.value = page.total;
    devices.value = page.records.map((record, index) => ({
      id: String(record.deviceId ?? `${pageNumber.value}-${index}`),
      name: record.deviceName?.trim() || "未命名设备",
      liquidLevel: getLiquidLevel(record),
    }));
  } catch {
    if (requestId === latestRequestId) {
      total.value = 0;
      devices.value = [];
    }
  } finally {
    if (requestId === latestRequestId) {
      isLoading.value = false;
    }
  }
};

const search = (): void => {
  keyword.value = keywordInput.value.trim();
  pageNumber.value = 1;
  void loadDevices();
};

const refresh = (): void => {
  keyword.value = "";
  keywordInput.value = "";
  pageNumber.value = 1;
  void loadDevices();
};

const changePage = (nextPage: number): void => {
  if (nextPage < 1 || nextPage > totalPages.value || nextPage === pageNumber.value) {
    return;
  }
  pageNumber.value = nextPage;
  void loadDevices();
};

onMounted(() => {
  void loadDevices();
});
</script>

<style lang="less" scoped>
.liquid-level-display-board__tools {
  display: flex;
  align-items: center;
  gap: 4px;
}

.liquid-level-display-board__search {
  width: 88px;
  height: 24px;
  padding: 0 7px;
  border: 1px solid rgba(120, 188, 255, 0.55);
  border-radius: 2px;
  outline: none;
  background: rgba(9, 41, 76, 0.72);
  color: #ffffff;
  font-size: 12px;

  &::placeholder {
    color: rgba(202, 217, 238, 0.76);
  }
}

.liquid-level-display-board__icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid rgba(120, 188, 255, 0.55);
  border-radius: 2px;
  background: rgba(9, 41, 76, 0.72);
  color: #cfe8ff;
  cursor: pointer;

  &:hover:not(:disabled) {
    border-color: #5caaff;
    color: #ffffff;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
}

.liquid-level-display-board {
  display: flex;
  min-height: 400px;
  padding: 0 10px 8px;
  flex-direction: column;
}

.liquid-level-display-board__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 12px;
}

.liquid-level-display-board__device {
  display: flex;
  min-width: 0;
  min-height: 172px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: rgba(20, 72, 127, 0.18);
}

.liquid-level-display-board__device-name {
  max-width: 100%;
  overflow: hidden;
  color: #d9edff;
  font-size: 13px;
  line-height: 18px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.liquid-level-display-board__empty {
  display: flex;
  min-height: 260px;
  align-items: center;
  justify-content: center;
  color: rgba(217, 237, 255, 0.72);
  font-size: 13px;
}

.liquid-level-display-board__pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 30px;
  margin-top: auto;
  color: #cfe8ff;
  font-size: 12px;
}

.liquid-level-display-board__refreshing {
  animation: liquid-level-display-board-spin 0.9s linear infinite;
}

@keyframes liquid-level-display-board-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
