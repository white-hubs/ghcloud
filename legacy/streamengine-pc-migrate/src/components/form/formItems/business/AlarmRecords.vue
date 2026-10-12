<script lang="ts" setup>
import { computed, reactive, ref, watch } from "vue";

import { getAlarmRecordCommonPage, type AlarmRecord } from "@/api/alarm-record";

type DeviceValue = {
  id?: string;
  deviceId?: string;
};

function buildAlarmPeriod(timeRange: unknown): string | undefined {
  if (!Array.isArray(timeRange) || timeRange.length < 2) {
    return undefined;
  }
  const [start, end] = timeRange as [string, string];
  if (!start || !end) {
    return undefined;
  }
  if (`${start}`.includes("-")) {
    return `${start},${end}`;
  }
  const date = new Date();
  const pad = (value: number) => `${value}`.padStart(2, "0");
  const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return `${dateStr} ${start},${dateStr} ${end}`;
}

const emits = defineEmits(["update:modelValue"]);
const props = withDefaults(
  defineProps<{
    modelValue?: AlarmRecord[] | null;
    readonly?: boolean;
    formData?: Record<string, any>;
    params?: string | null;
    params2?: string | null;
  }>(),
  {
    modelValue: null,
    readonly: false,
    formData: () => ({}),
    params: null,
    params2: null,
  },
);

const loading = ref(false);
const records = ref<AlarmRecord[]>([]);
const page = reactive({
  pageNumber: 1,
  pageSize: 10,
  total: 0,
});

const deviceIds = computed(() => {
  const devices = props.params ? props.formData?.[props.params] : null;
  if (!Array.isArray(devices)) {
    return [];
  }
  return devices.map((item: DeviceValue) => item?.id || item?.deviceId).filter(Boolean) as string[];
});

const alarmPeriod = computed(() => {
  const timeRange = props.params2 ? props.formData?.[props.params2] : null;
  return buildAlarmPeriod(timeRange);
});

const pagination = computed(() => ({
  current: page.pageNumber,
  pageSize: page.pageSize,
  total: page.total,
  showSizeChanger: false,
}));

const rowKey = (item: AlarmRecord) => item.id || item.businessKey || getAlarmName(item);

const getAlarmName = (item: AlarmRecord) => {
  return item.alarmEventName || item.alarmEvent || item.alarmTypeName || "--";
};

const formatTime = (time?: string | number) => {
  if (!time) {
    return "--";
  }
  if (typeof time === "number") {
    const date = new Date(time);
    const pad = (value: number) => `${value}`.padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
  return `${time}`.slice(0, 16);
};

const isHandled = (item: AlarmRecord) => {
  return item.alarmStatus === "ALARM_HANDLER" || item.alarmStatusName === "已处理";
};

const clearStoredValue = () => {
  if (Array.isArray(props.modelValue) && props.modelValue.length) {
    emits("update:modelValue", []);
  }
};

const getData = async () => {
  if (!deviceIds.value.length) {
    records.value = [];
    page.total = 0;
    return;
  }
  loading.value = true;
  try {
    const res = await getAlarmRecordCommonPage({
      pageNumber: page.pageNumber,
      pageSize: page.pageSize,
      deviceIds: deviceIds.value.join(","),
      period: alarmPeriod.value,
    });
    records.value = res.records || [];
    page.total = Number(res.total || records.value.length);
  } finally {
    loading.value = false;
  }
};

const handleTableChange = (pager: { current?: number; pageSize?: number }) => {
  page.pageNumber = pager.current || 1;
  page.pageSize = pager.pageSize || page.pageSize;
  getData();
};

const goDetail = (item: AlarmRecord) => {
  const id = item.id || item.businessKey;
  if (!id) {
    return;
  }
  const query = new URLSearchParams({
    id,
    businessKey: item.businessKey || id,
    alarmStatus: item.alarmStatus || "",
    type: "detail",
  });
  window.location.href = `/portal/genericEquipmentMonitor/alarmDetail?${query.toString()}`;
};

watch(
  () => [deviceIds.value.join(","), alarmPeriod.value].join("|"),
  () => {
    page.pageNumber = 1;
    getData();
  },
  { immediate: true },
);

defineExpose({
  validator: () => {
    clearStoredValue();
    return Promise.resolve();
  },
});
</script>

<template>
  <div class="alarm-records">
    <a-table size="small" :row-key="rowKey" :loading="loading" :data-source="records" :pagination="pagination" @change="handleTableChange">
      <a-table-column title="预警事件名称" key="alarmEventName">
        <template #default="{ record }">
          {{ getAlarmName(record) }}
        </template>
      </a-table-column>
      <a-table-column title="时间" key="alarmTime">
        <template #default="{ record }">
          {{ formatTime(record.alarmTime || record.createTime) }}
        </template>
      </a-table-column>
      <a-table-column title="设备名称" key="alarmTargetName">
        <template #default="{ record }">
          {{ record.alarmTargetName || record.deviceName || "--" }}
        </template>
      </a-table-column>
      <a-table-column title="处理状态" key="alarmStatusName">
        <template #default="{ record }">
          <a-tag :color="isHandled(record) ? 'green' : 'orange'">
            {{ record.alarmStatusName || (isHandled(record) ? "已处理" : "处理中") }}
          </a-tag>
        </template>
      </a-table-column>
      <a-table-column title="操作" key="action" width="80">
        <template #default="{ record }">
          <a-button type="link" size="small" @click="goDetail(record)">详情</a-button>
        </template>
      </a-table-column>
    </a-table>
  </div>
</template>

<style lang="less" scoped>
.alarm-records {
  width: 100%;
}
</style>
