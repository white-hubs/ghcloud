import { computed, defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type {
  LiangcangTemperatureHumidityMonitoringDashboardVO,
  LiangcangTemperatureHumidityMonitoringWarningVO,
  LiangcangTemperatureHumidityMonitoringWarehouseVO,
} from "@ghcloud/cube-granary-management-service";
import { Button } from "@ghcloud/cube-ui";

import { cubeGranaryManagementService } from "@/api/service";
import { formatDateTime } from "@/views/temperature-trend-alert/temperature-trend-alert-shared";

import "../radar-monitoring/radar-monitoring.less";
import "./temperature-humidity-monitoring.less";

const EMPTY_DASHBOARD: LiangcangTemperatureHumidityMonitoringDashboardVO = {
  summary: {
    totalDeviceCount: 0,
    onlineDeviceCount: 0,
    offlineDeviceCount: 0,
    warningWarehouseCount: 0,
    alarmWarehouseCount: 0,
    alarmCount: 0,
    warningCount: 0,
  },
  warehouses: [],
  recentAlarms: [],
  recentTemperatureWarnings: [],
};

const formatNumber = (value: number | null, digits = 1): string =>
  value == null || !Number.isFinite(value) ? "--" : value.toLocaleString("zh-CN", { maximumFractionDigits: digits });

const formatSignedNumber = (value: number | null): string => {
  if (value == null || !Number.isFinite(value)) return "--";
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value)}`;
};

const isAllOffline = (warehouse: LiangcangTemperatureHumidityMonitoringWarehouseVO): boolean =>
  warehouse.online === false || (warehouse.onlineDeviceCount === 0 && warehouse.offlineDeviceCount > 0);

const getWarehouseStatus = (warehouse: LiangcangTemperatureHumidityMonitoringWarehouseVO): string => {
  if (warehouse.alarm) return "告警";
  if (warehouse.warning) return "预警";
  if (isAllOffline(warehouse)) return "离线";
  return "正常";
};

const getWarehouseClass = (warehouse: LiangcangTemperatureHumidityMonitoringWarehouseVO): string => {
  if (warehouse.alarm) return "radar-monitoring-warehouse-card radar-monitoring-warehouse-card--alarm";
  if (warehouse.warning) return "radar-monitoring-warehouse-card temperature-humidity-warehouse-card--warning";
  if (isAllOffline(warehouse)) return "radar-monitoring-warehouse-card radar-monitoring-warehouse-card--offline";
  return "radar-monitoring-warehouse-card";
};

export const TemperatureHumidityMonitoring = defineComponent({
  name: "TemperatureHumidityMonitoring",
  setup: () => {
    const router = useRouter();
    const dashboard = ref<LiangcangTemperatureHumidityMonitoringDashboardVO>(EMPTY_DASHBOARD);
    const loading = ref(false);
    const warehouseLoading = ref(false);
    const alertLoading = ref(false);
    const error = ref<string | null>(null);
    const recentAlarms = computed(() => dashboard.value.recentAlarms.slice(0, 5));
    const recentWarnings = computed(() => dashboard.value.recentTemperatureWarnings.slice(0, 5));

    const loadDashboard = async (): Promise<void> => {
      loading.value = true;
      warehouseLoading.value = true;
      alertLoading.value = true;
      error.value = null;
      try {
        const showPartialError = (): void => {
          error.value = "部分数据加载失败，其他数据已继续展示";
        };
        await Promise.all([
          cubeGranaryManagementService
            .getTemperatureHumidityMonitoringSummary()
            .then((summary) => {
              dashboard.value = { ...dashboard.value, summary };
            })
            .catch(showPartialError),
          cubeGranaryManagementService
            .getTemperatureHumidityMonitoringWarehouses()
            .then((warehouses) => {
              dashboard.value = { ...dashboard.value, warehouses };
            })
            .catch(showPartialError)
            .finally(() => {
              warehouseLoading.value = false;
            }),
          cubeGranaryManagementService
            .getTemperatureHumidityMonitoringAlerts()
            .then((alerts) => {
              dashboard.value = {
                ...dashboard.value,
                recentAlarms: alerts.recentAlarms,
                recentTemperatureWarnings: alerts.recentTemperatureWarnings,
              };
            })
            .catch(showPartialError)
            .finally(() => {
              alertLoading.value = false;
            }),
        ]);
      } finally {
        warehouseLoading.value = false;
        alertLoading.value = false;
        loading.value = false;
      }
    };

    const openAlarmRecords = (): void => {
      window.location.href = "/portal/genericEquipmentMonitor/alarmRecord?applicationCode=TEMP_HUM_MANAGEME";
    };

    const openWarningRecords = (): void => {
      void router.push("/temperature-trend-alert/records");
    };

    onMounted(() => void loadDashboard());

    return () => (
      <div class="temperature-humidity-monitoring-root">
        <CubeLayout
          title="温湿度看板"
          v-slots={{
            "layout-header": () => (
              <Button loading={loading.value} disabled={loading.value} onClick={() => void loadDashboard()}>
                {loading.value ? "刷新中" : "刷新"}
              </Button>
            ),
            "layout-content": () => (
              <main class="radar-monitoring-content radar-monitoring-dashboard-content">
                {error.value != null ? <div class="radar-monitoring-error">{error.value}</div> : null}
                <section class="radar-monitoring-summary-grid temperature-humidity-summary-grid" aria-label="设备与仓房统计">
                  {[
                    ["▤", "blue", dashboard.value.summary.totalDeviceCount, "设备总数（台）"],
                    ["⌁", "green", dashboard.value.summary.onlineDeviceCount, "在线设备（台）"],
                    ["⌁", "gray", dashboard.value.summary.offlineDeviceCount, "离线设备（台）"],
                    ["△", "orange", dashboard.value.summary.warningWarehouseCount, "预警仓房数（个）"],
                    ["△", "red", dashboard.value.summary.alarmWarehouseCount, "告警仓房数（个）"],
                  ].map(([icon, color, count, label]) => (
                    <div key={label} class="radar-monitoring-summary-card">
                      <span class={`radar-monitoring-summary-icon radar-monitoring-summary-icon--${color}`}>{icon}</span>
                      <div>
                        <strong>{count}</strong>
                        <span>{label}</span>
                      </div>
                    </div>
                  ))}
                </section>

                <section class="radar-monitoring-warehouse-grid temperature-humidity-warehouse-grid" aria-label="仓房温湿度状态">
                  {dashboard.value.warehouses.map((warehouse) => (
                    <article key={warehouse.warehouseId} class={getWarehouseClass(warehouse)}>
                      <div class="radar-monitoring-warehouse-header">
                        <h2>{warehouse.warehouseName}</h2>
                        <span class="radar-monitoring-status">{getWarehouseStatus(warehouse)}</span>
                      </div>
                      <div class="temperature-humidity-measure-grid">
                        <div>
                          <span>最高温</span>
                          <strong>
                            {formatNumber(warehouse.maxTemperature)}
                            <small> ℃</small>
                          </strong>
                        </div>
                        <div>
                          <span>最低温</span>
                          <strong>
                            {formatNumber(warehouse.minTemperature)}
                            <small> ℃</small>
                          </strong>
                        </div>
                        <div>
                          <span>平均温</span>
                          <strong>
                            {formatNumber(warehouse.avgTemperature)}
                            <small> ℃</small>
                          </strong>
                        </div>
                        <div>
                          <span>湿度</span>
                          <strong>
                            {formatNumber(warehouse.humidity)}
                            <small> %RH</small>
                          </strong>
                        </div>
                      </div>
                      <div class="radar-monitoring-warehouse-footer">
                        <span
                          class={
                            isAllOffline(warehouse)
                              ? "radar-monitoring-device-status radar-monitoring-device-status--offline"
                              : "radar-monitoring-device-status"
                          }
                        >
                          <i></i>
                          {isAllOffline(warehouse) ? "离线" : "在线"} {warehouse.onlineDeviceCount}/
                          {warehouse.onlineDeviceCount + warehouse.offlineDeviceCount}
                        </span>
                      </div>
                    </article>
                  ))}
                  {!warehouseLoading.value && dashboard.value.warehouses.length === 0 ? (
                    <div class="radar-monitoring-empty">暂无仓房数据</div>
                  ) : null}
                </section>

                <section class="radar-monitoring-alarm-panel temperature-humidity-alarm-panel">
                  <div class="radar-monitoring-panel-header">
                    <h2>告警记录</h2>
                    <div class="radar-monitoring-panel-actions">
                      <span>共 {dashboard.value.summary.alarmCount} 条</span>
                      <button type="button" onClick={openAlarmRecords}>
                        查看更多
                      </button>
                    </div>
                  </div>
                  <div class="radar-monitoring-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>告警事件</th>
                          <th>告警级别</th>
                          <th>告警区域</th>
                          <th>告警时间</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentAlarms.value.map((alarm) => (
                          <tr key={alarm.id}>
                            <td>{alarm.content || "--"}</td>
                            <td>
                              <span class="radar-monitoring-level radar-monitoring-level--one">
                                <i></i>
                                {alarm.level || "--"}
                              </span>
                            </td>
                            <td>{alarm.alarmArea || alarm.warehouseName || "--"}</td>
                            <td>{formatDateTime(alarm.alarmTime)}</td>
                          </tr>
                        ))}
                        {!alertLoading.value && recentAlarms.value.length === 0 ? (
                          <tr>
                            <td colspan={4} class="radar-monitoring-table-empty">
                              暂无告警事件
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section class="radar-monitoring-alarm-panel temperature-humidity-warning-panel">
                  <div class="radar-monitoring-panel-header">
                    <h2>温度预警记录</h2>
                    <div class="radar-monitoring-panel-actions">
                      <span>共 {dashboard.value.summary.warningCount} 条</span>
                      <button type="button" onClick={openWarningRecords}>
                        查看更多
                      </button>
                    </div>
                  </div>
                  <div class="radar-monitoring-table-wrap temperature-humidity-warning-table">
                    <table>
                      <thead>
                        <tr>
                          <th>仓名称</th>
                          <th>触发时间</th>
                          <th>温度值（℃）</th>
                          <th>预警阈值（℃）</th>
                          <th>距离值（℃）</th>
                          <th>日均增幅（℃/天）</th>
                          <th>连续上升天数</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentWarnings.value.map((warning) => {
                          const distance = warning.distanceToThreshold;
                          return (
                            <tr key={warning.id}>
                              <td>{warning.warehouseName || "--"}</td>
                              <td>{formatDateTime(warning.triggeredAt)}</td>
                              <td>{formatNumber(warning.currentAvgTemperature)}</td>
                              <td>{formatNumber(warning.warningThreshold)}</td>
                              <td>
                                <span
                                  class={
                                    distance == null || distance === 0
                                      ? ""
                                      : distance < 0
                                        ? "temperature-humidity-distance is-over-threshold"
                                        : "temperature-humidity-distance is-within-threshold"
                                  }
                                >
                                  {formatSignedNumber(distance)}
                                </span>
                              </td>
                              <td>{formatNumber(warning.dailyIncrease)}</td>
                              <td>{formatNumber(warning.consecutiveDays, 0)}</td>
                            </tr>
                          );
                        })}
                        {!alertLoading.value && recentWarnings.value.length === 0 ? (
                          <tr>
                            <td colspan={7} class="radar-monitoring-table-empty">
                              暂无温度预警
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
