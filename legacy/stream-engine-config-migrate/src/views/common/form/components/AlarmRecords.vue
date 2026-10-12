<template>
  <div class="alarm-records">
    <el-table :data="records" size="mini" border v-loading="loading" empty-text="暂无预警记录">
      <el-table-column prop="alarmEventName" label="预警事件名称" min-width="160">
        <template slot-scope="{ row }">{{ getAlarmName(row) }}</template>
      </el-table-column>
      <el-table-column prop="alarmTime" label="时间" min-width="150">
        <template slot-scope="{ row }">{{ formatTime(row.alarmTime || row.createTime) }}</template>
      </el-table-column>
      <el-table-column prop="alarmTargetName" label="设备名称" min-width="170">
        <template slot-scope="{ row }">{{ row.alarmTargetName || row.deviceName || "--" }}</template>
      </el-table-column>
      <el-table-column prop="alarmStatusName" label="处理状态" min-width="100">
        <template slot-scope="{ row }">
          <el-tag size="mini" :type="isHandled(row) ? 'success' : 'warning'">
            {{ row.alarmStatusName || (isHandled(row) ? "已处理" : "处理中") }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="90">
        <template slot-scope="{ row }">
          <el-button type="text" size="mini" @click="goDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="mode !== 'DESIGN'"
      class="alarm-records-pagination"
      small
      background
      layout="prev, pager, next"
      :current-page.sync="page.pageNumber"
      :page-size="page.pageSize"
      :total="page.total"
      @current-change="getData"
    />
  </div>
</template>

<script>
import componentMinxins from "../ComponentMinxins";
import request from "@/utils/request";

const ALARM_CENTER_DETAIL_PATH = "/apps/alarm-center/h5/#/alarm-details";

function buildAlarmPeriod(timeRange) {
  if (!Array.isArray(timeRange) || timeRange.length < 2) {
    return "";
  }
  const [start, end] = timeRange;
  if (!start || !end) {
    return "";
  }
  if (`${start}`.includes("-")) {
    return `${start},${end}`;
  }
  const date = new Date();
  const pad = (value) => `${value}`.padStart(2, "0");
  const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return `${dateStr} ${start},${dateStr} ${end}`;
}

export default {
  name: "AlarmRecords",
  mixins: [componentMinxins],
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    formData: {
      type: Object,
      default: () => ({}),
    },
    params: {
      type: String,
      default: "",
    },
    params2: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      loading: false,
      records: [],
      page: {
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
    };
  },
  computed: {
    deviceIds() {
      const devices = this.params ? this.formData[this.params] : [];
      return Array.isArray(devices) ? devices.map((item) => item && (item.id || item.deviceId)).filter(Boolean) : [];
    },
    alarmPeriod() {
      const timeRange = this.params2 ? this.formData[this.params2] : null;
      return buildAlarmPeriod(timeRange);
    },
  },
  watch: {
    deviceIds() {
      this.page.pageNumber = 1;
      this.getData();
    },
    alarmPeriod() {
      this.page.pageNumber = 1;
      this.getData();
    },
  },
  created() {
    this.getData();
  },
  methods: {
    validate(call) {
      this.clearStoredValue();
      call(true);
    },
    clearStoredValue() {
      if (Array.isArray(this.value) && this.value.length) {
        this.$emit("input", []);
      }
    },
    getAlarmName(row) {
      return row.alarmEventName || row.alarmEvent || row.alarmTypeName || "--";
    },
    formatTime(time) {
      if (!time) return "--";
      if (typeof time === "number") {
        const date = new Date(time);
        const pad = (value) => `${value}`.padStart(2, "0");
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
      }
      return `${time}`.slice(0, 16);
    },
    isHandled(row) {
      return row.alarmStatus === "ALARM_HANDLER" || row.alarmStatusName === "已处理";
    },
    async getData() {
      if (this.mode === "DESIGN") return;
      if (!this.deviceIds.length) {
        this.records = [];
        this.page.total = 0;
        return;
      }
      this.loading = true;
      try {
        const res = await request({
          url: "/api/alarm/alarm-records/common-page",
          method: "get",
          params: {
            pageNumber: this.page.pageNumber,
            pageSize: this.page.pageSize,
            deviceIds: this.deviceIds.join(","),
            period: this.alarmPeriod || undefined,
          },
        });
        this.records = res.records || [];
        this.page.total = Number(res.total || this.records.length);
      } finally {
        this.loading = false;
      }
    },
    goDetail(row) {
      const id = row.id || row.businessKey;
      if (!id) return;
      const query = new URLSearchParams({
        id,
        businessKey: row.businessKey || id,
        alarmStatus: row.alarmStatus || "",
      });
      window.location.assign(`${window.location.origin}${ALARM_CENTER_DETAIL_PATH}?${query.toString()}`);
    },
  },
};
</script>

<style scoped lang="less">
.alarm-records {
  width: 100%;
}

.alarm-records-pagination {
  margin-top: 12px;
  text-align: right;
}
</style>
