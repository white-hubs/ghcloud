import { computed, defineComponent, onMounted, ref } from "vue";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type {
  LiangcangRadarMonitoringAlarmVO,
  LiangcangRadarMonitoringDashboardVO,
  LiangcangRadarMonitoringWarehouseVO,
} from "@ghcloud/cube-granary-management-service";
import { Button } from "@ghcloud/cube-ui";

import { cubeGranaryManagementService } from "@/api/service";
import { formatDateTime } from "@/views/temperature-trend-alert/temperature-trend-alert-shared";

import "./radar-monitoring.less";

const EMPTY_DASHBOARD: LiangcangRadarMonitoringDashboardVO = {
  summary: {
    totalDeviceCount: 0,
    onlineDeviceCount: 0,
    offlineDeviceCount: 0,
    alarmWarehouseCount: 0,
    alarmCount: 0,
  },
  warehouses: [],
  recentAlarms: [],
};

const formatNumber = (value: number | null, digits = 0): string => {
  if (value == null || !Number.isFinite(value)) {
    return "--";
  }
  return value.toLocaleString("zh-CN", { maximumFractionDigits: digits });
};

const formatTime = (value: string): string => formatDateTime(value);

const getAlarmLevelClass = (level: string): string => {
  const normalized = level.trim().toLowerCase();
  if (normalized.includes("一级") || normalized.includes("critical") || normalized.includes("high")) {
    return "radar-monitoring-level radar-monitoring-level--one";
  }
  if (normalized.includes("三级") || normalized.includes("low")) {
    return "radar-monitoring-level radar-monitoring-level--three";
  }
  return "radar-monitoring-level radar-monitoring-level--two";
};

const getWarehouseStatusClass = (warehouse: LiangcangRadarMonitoringWarehouseVO): string => {
  if (warehouse.online === false) {
    return "radar-monitoring-warehouse-card radar-monitoring-warehouse-card--offline";
  }
  if (warehouse.alarm) {
    return "radar-monitoring-warehouse-card radar-monitoring-warehouse-card--alarm";
  }
  return "radar-monitoring-warehouse-card";
};

const getWarehouseStatusText = (warehouse: LiangcangRadarMonitoringWarehouseVO): string => {
  if (warehouse.online === false) {
    return "离线";
  }
  return warehouse.alarm ? "告警" : "正常";
};

const getAlarmContent = (alarm: LiangcangRadarMonitoringAlarmVO): string => {
  return alarm.content.trim() === "" ? "--" : alarm.content;
};

export const RadarMonitoring = defineComponent({
  name: "RadarMonitoring",
  setup: () => {
    const dashboard = ref<LiangcangRadarMonitoringDashboardVO>(EMPTY_DASHBOARD);
    const loading = ref(false);
    const warehouseLoading = ref(false);
    const alarmLoading = ref(false);
    const loadError = ref<string | null>(null);
    const recentAlarms = computed(() => dashboard.value.recentAlarms.slice(0, 5));
    const warehouseCountText = computed(() => `共 ${dashboard.value.summary.alarmCount} 条`);

    const openAlarmRecords = (): void => {
      window.location.href = "/portal/genericEquipmentMonitor/alarmRecord";
    };

    const loadDashboard = async (): Promise<void> => {
      loading.value = true;
      warehouseLoading.value = true;
      alarmLoading.value = true;
      loadError.value = null;
      try {
        const showPartialError = (): void => {
          loadError.value = "部分数据加载失败，其他数据已继续展示";
        };
        await Promise.all([
          cubeGranaryManagementService
            .getRadarMonitoringSummary()
            .then((summary) => {
              dashboard.value = { ...dashboard.value, summary };
            })
            .catch(showPartialError),
          cubeGranaryManagementService
            .getRadarMonitoringWarehouses()
            .then((warehouses) => {
              dashboard.value = { ...dashboard.value, warehouses };
            })
            .catch(showPartialError)
            .finally(() => {
              warehouseLoading.value = false;
            }),
          cubeGranaryManagementService
            .getRadarMonitoringAlarms()
            .then((recentAlarms) => {
              dashboard.value = { ...dashboard.value, recentAlarms };
            })
            .catch(showPartialError)
            .finally(() => {
              alarmLoading.value = false;
            }),
        ]);
      } finally {
        warehouseLoading.value = false;
        alarmLoading.value = false;
        loading.value = false;
      }
    };

    onMounted(() => {
      void loadDashboard();
    });

    return (): JSX.Element => (
      <div class="radar-monitoring-root">
        <CubeLayout
          title="雷达监测看板"
          v-slots={{
            "layout-header": () => (
              <Button loading={loading.value} disabled={loading.value} onClick={() => void loadDashboard()}>
                {loading.value ? "刷新中" : "刷新"}
              </Button>
            ),
            "layout-content": () => (
              <main class="radar-monitoring-content radar-monitoring-dashboard-content">
                {loadError.value != null ? <div class="radar-monitoring-error">{loadError.value}</div> : null}

                <section class="radar-monitoring-summary-grid" aria-label="设备统计">
                  <div class="radar-monitoring-summary-card">
                    <span class="radar-monitoring-summary-icon radar-monitoring-summary-icon--blue">▤</span>
                    <div>
                      <strong>{dashboard.value.summary.totalDeviceCount}</strong>
                      <span>设备总数（台）</span>
                    </div>
                  </div>
                  <div class="radar-monitoring-summary-card">
                    <span class="radar-monitoring-summary-icon radar-monitoring-summary-icon--green">⌁</span>
                    <div>
                      <strong>{dashboard.value.summary.onlineDeviceCount}</strong>
                      <span>在线设备（台）</span>
                    </div>
                  </div>
                  <div class="radar-monitoring-summary-card">
                    <span class="radar-monitoring-summary-icon radar-monitoring-summary-icon--gray">⌁</span>
                    <div>
                      <strong>{dashboard.value.summary.offlineDeviceCount}</strong>
                      <span>离线设备（台）</span>
                    </div>
                  </div>
                  <div class="radar-monitoring-summary-card">
                    <span class="radar-monitoring-summary-icon radar-monitoring-summary-icon--red">△</span>
                    <div>
                      <strong>{dashboard.value.summary.alarmWarehouseCount}</strong>
                      <span>告警仓房数（个）</span>
                    </div>
                  </div>
                </section>

                <section class="radar-monitoring-warehouse-grid" aria-label="仓房状态">
                  {dashboard.value.warehouses.map((warehouse) => (
                    <article key={warehouse.warehouseId} class={getWarehouseStatusClass(warehouse)}>
                      <div class="radar-monitoring-warehouse-header">
                        <h2>{warehouse.warehouseName}</h2>
                        <span class="radar-monitoring-status">{getWarehouseStatusText(warehouse)}</span>
                      </div>
                      <div class="radar-monitoring-measure-grid">
                        <div>
                          <span>当前重量</span>
                          <strong>
                            {formatNumber(warehouse.currentWeight)}
                            <small> 吨</small>
                          </strong>
                        </div>
                        <div>
                          <span>当前体积</span>
                          <strong>
                            {formatNumber(warehouse.currentVolume)}
                            <small> m³</small>
                          </strong>
                        </div>
                      </div>
                      {warehouse.online === false ? <div class="radar-monitoring-offline-message">设备离线，显示最后上报数据</div> : null}
                      {warehouse.alarmMessage.trim() !== "" ? (
                        <div class="radar-monitoring-alarm-message">{warehouse.alarmMessage}</div>
                      ) : null}
                      <div class="radar-monitoring-warehouse-footer">
                        <span
                          class={
                            warehouse.online === false
                              ? "radar-monitoring-device-status radar-monitoring-device-status--offline"
                              : "radar-monitoring-device-status"
                          }
                        >
                          <i></i>
                          {warehouse.online === false ? "离线" : "在线"}
                        </span>
                        <span class="radar-monitoring-report-time">◷ 最后上报时间：{formatTime(warehouse.latestReportTime)}</span>
                      </div>
                    </article>
                  ))}
                  {!warehouseLoading.value && dashboard.value.warehouses.length === 0 ? (
                    <div class="radar-monitoring-empty">暂无仓房数据</div>
                  ) : null}
                </section>

                <section class="radar-monitoring-alarm-panel">
                  <div class="radar-monitoring-panel-header">
                    <h2>最近告警事件</h2>
                    <div class="radar-monitoring-panel-actions">
                      <span>{warehouseCountText.value}</span>
                      <button type="button" onClick={openAlarmRecords}>
                        查看更多
                      </button>
                    </div>
                  </div>
                  <div class="radar-monitoring-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>报警事件</th>
                          <th>报警级别</th>
                          <th>报警区域</th>
                          <th>报警时间</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentAlarms.value.map((alarm) => (
                          <tr key={alarm.id}>
                            <td>{getAlarmContent(alarm)}</td>
                            <td>
                              <span class={getAlarmLevelClass(alarm.level)}>
                                <i></i>
                                {alarm.level || "--"}
                              </span>
                            </td>
                            <td>{alarm.alarmArea || "--"}</td>
                            <td>{formatTime(alarm.alarmTime)}</td>
                          </tr>
                        ))}
                        {!alarmLoading.value && recentAlarms.value.length === 0 ? (
                          <tr>
                            <td colSpan={4} class="radar-monitoring-table-empty">
                              暂无告警事件
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </section>
              </main>
            ),
          }}
        />
      </div>
    );
  },
});
