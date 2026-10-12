import { defineComponent, onMounted, ref } from "vue";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type { LiangcangGasMonitoringDashboardVO, LiangcangGasMonitoringWarehouseVO } from "@ghcloud/cube-granary-management-service";
import { Button } from "@ghcloud/cube-ui";

import { cubeGranaryManagementService } from "@/api/service";
import { formatDateTime } from "@/views/temperature-trend-alert/temperature-trend-alert-shared";

import "../radar-monitoring/radar-monitoring.less";
import "./gas-monitoring.less";

const EMPTY: LiangcangGasMonitoringDashboardVO = {
  summary: { totalDeviceCount: 0, onlineDeviceCount: 0, offlineDeviceCount: 0, alarmWarehouseCount: 0, alarmCount: 0 },
  warehouses: [],
  recentAlarms: [],
};
const numberText = (value: number | null, digits = 4): string =>
  value == null || !Number.isFinite(value) ? "--" : value.toLocaleString("zh-CN", { maximumFractionDigits: digits });
const timeText = (value: string): string => formatDateTime(value);
const statusText = (warehouse: LiangcangGasMonitoringWarehouseVO): string =>
  warehouse.online === false ? "离线" : warehouse.alarm ? "告警" : "正常";
const statusClass = (warehouse: LiangcangGasMonitoringWarehouseVO): string =>
  warehouse.online === false
    ? "radar-monitoring-warehouse-card radar-monitoring-warehouse-card--offline"
    : warehouse.alarm
      ? "radar-monitoring-warehouse-card radar-monitoring-warehouse-card--alarm"
      : "radar-monitoring-warehouse-card";

export const GasMonitoring = defineComponent({
  name: "GasMonitoring",
  setup: () => {
    const dashboard = ref<LiangcangGasMonitoringDashboardVO>(EMPTY);
    const loading = ref(false);
    const warehouseLoading = ref(false);
    const alarmLoading = ref(false);
    const error = ref<string | null>(null);
    const load = async (): Promise<void> => {
      loading.value = true;
      warehouseLoading.value = true;
      alarmLoading.value = true;
      error.value = null;
      try {
        const showPartialError = (): void => {
          error.value = "部分数据加载失败，其他数据已继续展示";
        };
        await Promise.all([
          cubeGranaryManagementService
            .getGasMonitoringSummary()
            .then((summary) => {
              dashboard.value = { ...dashboard.value, summary };
            })
            .catch(showPartialError),
          cubeGranaryManagementService
            .getGasMonitoringWarehouses()
            .then((warehouses) => {
              dashboard.value = { ...dashboard.value, warehouses };
            })
            .catch(showPartialError)
            .finally(() => {
              warehouseLoading.value = false;
            }),
          cubeGranaryManagementService
            .getGasMonitoringAlarms()
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
    const openAlarms = (): void => {
      window.location.href = "/portal/genericEquipmentMonitor/alarmRecord?applicationCode=GAS_MONITORING";
    };
    onMounted(() => void load());
    return (): JSX.Element => (
      <div class="gas-monitoring-root">
        <CubeLayout
          title="气体检测看板"
          v-slots={{
            "layout-header": () => (
              <Button loading={loading.value} disabled={loading.value} onClick={() => void load()}>
                {loading.value ? "刷新中" : "刷新"}
              </Button>
            ),
            "layout-content": () => (
              <main class="radar-monitoring-content radar-monitoring-dashboard-content">
                {error.value != null ? <div class="radar-monitoring-error">{error.value}</div> : null}
                <section class="radar-monitoring-summary-grid" aria-label="设备统计">
                  {[
                    ["▤", "blue", dashboard.value.summary.totalDeviceCount, "设备总数（台）"],
                    ["⌁", "green", dashboard.value.summary.onlineDeviceCount, "在线设备（台）"],
                    ["⌁", "gray", dashboard.value.summary.offlineDeviceCount, "离线设备（台）"],
                    ["△", "red", dashboard.value.summary.alarmWarehouseCount, "告警仓房数（个）"],
                  ].map(([icon, color, count, label]) => (
                    <div class="radar-monitoring-summary-card">
                      <span class={`radar-monitoring-summary-icon radar-monitoring-summary-icon--${color}`}>{icon}</span>
                      <div>
                        <strong>{count}</strong>
                        <span>{label}</span>
                      </div>
                    </div>
                  ))}
                </section>
                <section class="radar-monitoring-warehouse-grid" aria-label="仓房气体状态">
                  {dashboard.value.warehouses.map((warehouse) => (
                    <article key={warehouse.warehouseId} class={statusClass(warehouse)}>
                      <div class="radar-monitoring-warehouse-header">
                        <h2>{warehouse.warehouseName}</h2>
                        <span class="radar-monitoring-status">{statusText(warehouse)}</span>
                      </div>
                      <div class="gas-monitoring-measure-grid">
                        <div>
                          <span>CO₂</span>
                          <strong>
                            {numberText(warehouse.co2)}
                            <small> %VOL</small>
                          </strong>
                        </div>
                        <div>
                          <span>O₂</span>
                          <strong>
                            {numberText(warehouse.o2)}
                            <small> %VOL</small>
                          </strong>
                        </div>
                        <div>
                          <span>PH₃</span>
                          <strong>
                            {numberText(warehouse.ph3)}
                            <small> %VOL</small>
                          </strong>
                        </div>
                      </div>
                      {warehouse.online === false ? (
                        <div class="radar-monitoring-offline-message">设备离线，显示最后上报数据</div>
                      ) : warehouse.alarmMessage ? (
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
                          {warehouse.online === false ? "离线" : warehouse.alarm ? "告警" : "在线"}
                        </span>
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
                      <span>共 {dashboard.value.summary.alarmCount} 条</span>
                      <button type="button" onClick={openAlarms}>
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
                        {dashboard.value.recentAlarms.slice(0, 5).map((alarm) => (
                          <tr key={alarm.id}>
                            <td>{alarm.content || "--"}</td>
                            <td>
                              <span class="radar-monitoring-level radar-monitoring-level--one">
                                <i></i>
                                {alarm.level || "--"}
                              </span>
                            </td>
                            <td>{alarm.alarmArea || "--"}</td>
                            <td>{timeText(alarm.alarmTime)}</td>
                          </tr>
                        ))}
                        {!alarmLoading.value && dashboard.value.recentAlarms.length === 0 ? (
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
