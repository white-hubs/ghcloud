<template>
  <div class="alarm-records">
    <VanField :label="props.label" :required="props.required" readonly />
    <div class="alarm-records-table">
      <div class="alarm-records-header alarm-records-row">
        <div>预警事件名称</div>
        <div>时间</div>
        <div>设备名称</div>
        <div>处理状态</div>
        <div>操作</div>
      </div>
      <VanLoading v-if="loading" class="alarm-records-loading" type="spinner" />
      <VanEmpty v-else-if="!records.length" image-size="72" description="暂无预警记录" />
      <template v-else>
        <div v-for="item in records" :key="item.id || item.businessKey" class="alarm-records-row">
          <div class="alarm-records-cell is-clickable" @click="openFullValue('预警事件名称', getAlarmName(item))">
            {{ getAlarmName(item) }}
          </div>
          <div class="alarm-records-cell is-clickable" @click="openFullValue('时间', formatTime(item.alarmTime || item.createTime))">
            {{ formatTime(item.alarmTime || item.createTime) }}
          </div>
          <div class="alarm-records-cell is-clickable" @click="openFullValue('设备名称', item.alarmTargetName || item.deviceName || '--')">
            {{ item.alarmTargetName || item.deviceName || "--" }}
          </div>
          <div>
            <span :class="['alarm-records-status', isHandled(item) ? 'is-handled' : 'is-processing']">
              {{ item.alarmStatusName || (isHandled(item) ? "已处理" : "处理中") }}
            </span>
          </div>
          <div>
            <VanButton type="primary" size="mini" plain @click="goDetail(item)">详情</VanButton>
          </div>
        </div>
      </template>
    </div>
    <VanDialog v-model:show="detailVisible" :title="detailTitle" confirm-button-text="知道了">
      <div class="alarm-records-detail">{{ detailValue }}</div>
    </VanDialog>
    <VanPagination
      v-if="total > page.pageSize"
      v-model="page.pageNumber"
      class="alarm-records-pagination"
      mode="simple"
      :total-items="total"
      :items-per-page="page.pageSize"
      @change="getData"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";

import type { FormItemExpose } from "../../../business/dynamic-table/form-item";
import { alarmRecordService } from "../../../service/alarm/alarm-record";
import type { AlarmRecord } from "../../../service/alarm/alarm-record";

type DeviceValue = { id?: string; deviceId?: string };
type TimeRangeValue = string[] | null | undefined;

const ALARM_CENTER_DETAIL_PATH = "/apps/alarm-center/h5/#/alarm-details";

function buildAlarmPeriod(timeRange: TimeRangeValue): string | undefined {
  if (!Array.isArray(timeRange) || timeRange.length < 2) return undefined;
  const [start, end] = timeRange;
  if (!start || !end) return undefined;
  if (`${start}`.includes("-")) {
    return `${start},${end}`;
  }
  const date = new Date();
  const pad = (value: number) => `${value}`.padStart(2, "0");
  const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return `${dateStr} ${start},${dateStr} ${end}`;
}

const props = withDefaults(
  defineProps<{
    label?: string;
    required?: boolean;
    readonly?: boolean;
    modelValue?: AlarmRecord[] | null;
    dependFormValues?: [DeviceValue[] | null, TimeRangeValue];
  }>(),
  {
    modelValue: null,
    dependFormValues: () => [null, null],
  },
);

const emits = defineEmits(["update:modelValue"]);

const loading = ref(false);
const records = ref<AlarmRecord[]>([]);
const total = ref(0);
const detailVisible = ref(false);
const detailTitle = ref("");
const detailValue = ref("");
const page = reactive({
  pageNumber: 1,
  pageSize: 10,
});

const deviceIds = computed(() => {
  const devices = props.dependFormValues?.[0];
  if (!Array.isArray(devices)) return [];
  return devices.map((item) => item?.id || item?.deviceId).filter(Boolean) as string[];
});

const alarmPeriod = computed(() => buildAlarmPeriod(props.dependFormValues?.[1]));

function getAlarmName(item: AlarmRecord) {
  return item.alarmEventName || item.alarmEvent || item.alarmTypeName || "--";
}

function formatTime(time?: string | number) {
  if (!time) return "--";
  if (typeof time === "number") {
    const date = new Date(time);
    const pad = (value: number) => `${value}`.padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
  return `${time}`.slice(0, 16);
}

function isHandled(item: AlarmRecord) {
  return item.alarmStatus === "ALARM_HANDLER" || item.alarmStatusName === "已处理";
}

function openFullValue(title: string, value: string) {
  detailTitle.value = title;
  detailValue.value = value || "--";
  detailVisible.value = true;
}

function clearStoredValue() {
  if (Array.isArray(props.modelValue) && props.modelValue.length) {
    emits("update:modelValue", []);
  }
}

async function getData() {
  if (!deviceIds.value.length) {
    records.value = [];
    total.value = 0;
    return;
  }
  loading.value = true;
  try {
    const res = await alarmRecordService.getCommonPage({
      pageNumber: page.pageNumber,
      pageSize: page.pageSize,
      deviceIds: deviceIds.value.join(","),
      period: alarmPeriod.value,
    });
    records.value = res.records || [];
    total.value = Number(res.total || records.value.length);
  } finally {
    loading.value = false;
  }
}

function goDetail(item: AlarmRecord) {
  const id = item.id || item.businessKey;
  if (!id) return;
  const query = new URLSearchParams({
    id,
    businessKey: item.businessKey || id,
    alarmStatus: item.alarmStatus || "",
  });
  window.location.assign(`${window.location.origin}${ALARM_CENTER_DETAIL_PATH}?${query.toString()}`);
}

watch(
  () => [deviceIds.value.join(","), alarmPeriod.value].join("|"),
  () => {
    page.pageNumber = 1;
    getData();
  },
  { immediate: true },
);

defineExpose<FormItemExpose>({
  validate: () => {
    clearStoredValue();
    return true;
  },
});
</script>

<style scoped lang="less">
.alarm-records {
  background: #fff;
}

.alarm-records-table {
  overflow-x: auto;
  padding: 0 8px 8px;
}

.alarm-records-row {
  min-width: 520px;
  display: grid;
  grid-template-columns: 124px 96px 124px 66px 42px;
  column-gap: 4px;
  align-items: center;
  min-height: 42px;
  border-bottom: 1px solid #eef0f3;
  color: #1f2933;
  font-size: 12px;
}

.alarm-records-row > div {
  min-width: 0;
  justify-self: stretch;
  text-align: center;
}

.alarm-records-row > div:last-child {
  display: flex;
  justify-content: center;
}

.alarm-records-header {
  min-height: 36px;
  color: #333;
  font-weight: 600;
  background: #fafafa;
}

.alarm-records-cell {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.is-clickable {
  cursor: pointer;
}

.alarm-records-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 66px;
  height: 22px;
  padding: 0 4px;
  border: 1px solid currentColor;
  border-radius: 2px;
  font-size: 12px;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.is-processing {
  color: #f59a23;
  background: #fff8e6;
}

.is-handled {
  color: #67c23a;
  background: #f0f9eb;
}

.alarm-records-loading {
  display: flex;
  justify-content: center;
  padding: 24px 0;
}

.alarm-records-pagination {
  padding: 0 8px 8px;
}

.alarm-records-detail {
  max-height: 50vh;
  padding: 16px;
  color: #323233;
  font-size: 14px;
  line-height: 22px;
  word-break: break-all;
  overflow-y: auto;
}
</style>
