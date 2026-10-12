import { computed, defineComponent, onMounted, onUnmounted, ref, shallowRef } from "vue";

import {
  getFumigationRealtimeSituationStats,
  getFumigationRealtimeSituationWorks,
  listFumigationRealtimeSituationAlarms,
  listFumigationRealtimeSituationDevices,
  listFumigationRealtimeSituationWarehouses,
} from "@ghcloud/cube-services-client/fumigation-operation.client";
import { message } from "@ghcloud/cube-ui";

import { formatDateTimeValue } from "./state";

import "./fumigation.less";

const APPLICATION_CODE = import.meta.env.VITE_APPLICATION_CODE ?? "FUMIGATION_OPERATION";
const WORKS_REFRESH_MS = 10_000;
const WAREHOUSE_REFRESH_MS = 30_000;
const RIGHT_PANEL_REFRESH_MS = 30_000;
const STATS_REFRESH_MS = 60_000;

interface RealtimeStats {
  inProgressCount: number;
  completedTodayCount: number;
  monthCreatedCount: number;
  precheckPassRate: number;
  lastMonthWorkCount: number;
  currentMonthWorkCount: number;
  lastMonthPrecheckPassRate: number;
  currentMonthPrecheckPassRate: number;
}

interface RealtimeWorkItem {
  id: string;
  code: string;
  warehouseId: string;
  warehouseName: string;
  grainVarietyName: string;
  pesticideSummary: string;
  workerCount: number;
  remainingLabel?: string;
  completedTime?: string;
}

interface RealtimeWarehouseItem {
  warehouseId: string;
  warehouseName: string;
  grainType?: string;
  statusLabel: string;
  status: "idle" | "working";
}

interface RealtimeDeviceItem {
  id: string;
  name: string;
  status: "online" | "offline";
}

interface RealtimeAlarmItem {
  id: string;
  alarmEventName: string;
  alarmTime: string | number;
  alarmStatusName: string;
}

const emptyStats = (): RealtimeStats => ({
  inProgressCount: 0,
  completedTodayCount: 0,
  monthCreatedCount: 0,
  precheckPassRate: 0,
  lastMonthWorkCount: 0,
  currentMonthWorkCount: 0,
  lastMonthPrecheckPassRate: 0,
  currentMonthPrecheckPassRate: 0,
});

const trendWidth = (value: number, max: number): string => {
  if (max <= 0 || value <= 0) {
    return "0%";
  }
  return `${Math.max(8, Math.round((value / max) * 100))}%`;
};

export const FumigationRealtimeSituation = defineComponent({
  name: "FumigationRealtimeSituation",
  setup: () => {
    const clock = ref("--:--:--");
    const loading = ref(false);
    const stats = shallowRef<RealtimeStats>(emptyStats());
    const inProgressWorks = shallowRef<RealtimeWorkItem[]>([]);
    const completedTodayWorks = shallowRef<RealtimeWorkItem[]>([]);
    const warehouses = shallowRef<RealtimeWarehouseItem[]>([]);
    const devices = shallowRef<RealtimeDeviceItem[]>([]);
    const todayAlarms = shallowRef<RealtimeAlarmItem[]>([]);

    const inProgressWarehouseIds = computed(() => new Set(inProgressWorks.value.map((item) => item.warehouseId).filter(Boolean)));
    const effectiveWarehouses = computed(() =>
      warehouses.value.map((warehouse) => {
        if (warehouse.status === "working" || !inProgressWarehouseIds.value.has(warehouse.warehouseId)) {
          return warehouse;
        }
        return {
          ...warehouse,
          status: "working" as const,
          statusLabel: `${warehouse.grainType || "作业"}·作业中`,
        };
      }),
    );
    const workingWarehouseCount = computed(() => effectiveWarehouses.value.filter((item) => item.status === "working").length);
    const monthWorkMax = computed(() => Math.max(stats.value.lastMonthWorkCount, stats.value.currentMonthWorkCount, 1));

    let clockTimer: ReturnType<typeof setInterval> | undefined;
    let worksTimer: ReturnType<typeof setInterval> | undefined;
    let warehouseTimer: ReturnType<typeof setInterval> | undefined;
    let rightPanelTimer: ReturnType<typeof setInterval> | undefined;
    let statsTimer: ReturnType<typeof setInterval> | undefined;

    const updateClock = (): void => {
      clock.value = new Date().toLocaleTimeString("zh-CN", { hour12: false });
    };

    const loadStats = async (): Promise<void> => {
      const data = await getFumigationRealtimeSituationStats();
      stats.value = data;
    };

    const loadWorks = async (): Promise<void> => {
      const data = await getFumigationRealtimeSituationWorks();
      inProgressWorks.value = data.inProgressWorks ?? [];
      completedTodayWorks.value = data.completedTodayWorks ?? [];
    };

    const loadWarehouses = async (): Promise<void> => {
      warehouses.value = await listFumigationRealtimeSituationWarehouses();
    };

    const loadRightPanel = async (): Promise<void> => {
      const [deviceData, alarmData] = await Promise.all([
        listFumigationRealtimeSituationDevices(),
        listFumigationRealtimeSituationAlarms(APPLICATION_CODE),
      ]);
      devices.value = deviceData;
      todayAlarms.value = alarmData;
    };

    const loadInitialData = async (): Promise<void> => {
      loading.value = true;
      try {
        await Promise.all([loadStats(), loadWorks(), loadWarehouses(), loadRightPanel()]);
      } catch (error: unknown) {
        message.error((error as Error).message || "获取实时态势数据失败");
      } finally {
        loading.value = false;
      }
    };

    const refreshBlock = (loader: () => Promise<void>, fallback: string): void => {
      void loader().catch((error: unknown) => {
        message.error((error as Error).message || fallback);
      });
    };

    onMounted(() => {
      updateClock();
      clockTimer = setInterval(updateClock, 1000);
      void loadInitialData();
      worksTimer = setInterval(() => refreshBlock(loadWorks, "刷新作业态势失败"), WORKS_REFRESH_MS);
      warehouseTimer = setInterval(() => refreshBlock(loadWarehouses, "刷新仓房态势失败"), WAREHOUSE_REFRESH_MS);
      rightPanelTimer = setInterval(() => refreshBlock(loadRightPanel, "刷新设备告警失败"), RIGHT_PANEL_REFRESH_MS);
      statsTimer = setInterval(() => refreshBlock(loadStats, "刷新统计数据失败"), STATS_REFRESH_MS);
    });

    onUnmounted(() => {
      if (clockTimer != null) {
        clearInterval(clockTimer);
      }
      if (worksTimer != null) {
        clearInterval(worksTimer);
      }
      if (warehouseTimer != null) {
        clearInterval(warehouseTimer);
      }
      if (rightPanelTimer != null) {
        clearInterval(rightPanelTimer);
      }
      if (statsTimer != null) {
        clearInterval(statsTimer);
      }
    });

    return (): JSX.Element => (
      <div class="fumigation-realtime-dashboard">
        <div class="fumigation-realtime-header">
          <h1>熏蒸作业实时态势</h1>
          <div class="fumigation-realtime-header-info">
            <span>{new Date().toLocaleDateString("zh-CN")}</span>
            <span>{clock.value}</span>
            <span class="is-live">● 实时</span>
            <span class="is-muted">分块刷新</span>
          </div>
        </div>

        <div class="fumigation-realtime-stats">
          <div class="fumigation-stat-box c1">
            <div class="num">{stats.value.inProgressCount}</div>
            <div class="sub">进行中作业</div>
          </div>
          <div class="fumigation-stat-box c2">
            <div class="num">{stats.value.completedTodayCount}</div>
            <div class="sub">今日完工</div>
          </div>
          <div class="fumigation-stat-box c3">
            <div class="num">{stats.value.monthCreatedCount}</div>
            <div class="sub">本月作业</div>
          </div>
          <div class="fumigation-stat-box c4">
            <div class="num">{stats.value.precheckPassRate.toFixed(1)}%</div>
            <div class="sub">三步校验通过率</div>
          </div>
        </div>

        <div class={`fumigation-realtime-main${loading.value ? " is-loading" : ""}`}>
          <div class="fumigation-realtime-panel">
            <div class="fumigation-realtime-panel-hd">
              <span class="dot dot-green" />
              进行中作业
            </div>
            <div class="fumigation-realtime-scroll">
              {inProgressWorks.value.length === 0 ? (
                <div class="fumigation-realtime-empty">暂无进行中作业</div>
              ) : (
                inProgressWorks.value.map((work) => (
                  <div class="fumigation-job-row" key={work.id}>
                    <div>
                      <div class="title">
                        {work.warehouseName}·{work.grainVarietyName}
                      </div>
                      <div class="desc">{work.pesticideSummary}</div>
                    </div>
                    <div class="tags">
                      <span>{work.workerCount} 人</span>
                      {work.remainingLabel != null ? <span>{work.remainingLabel}</span> : null}
                    </div>
                  </div>
                ))
              )}

              <div class="fumigation-realtime-subsection">
                <div class="fumigation-realtime-panel-hd compact">
                  <span class="dot dot-blue" />
                  今日已完工
                </div>
                {completedTodayWorks.value.length === 0 ? (
                  <div class="fumigation-realtime-empty">今日暂无完工作业</div>
                ) : (
                  completedTodayWorks.value.map((work) => (
                    <div class="fumigation-trend-row" key={work.id}>
                      <span>
                        {work.warehouseName}·{work.grainVarietyName}
                      </span>
                      <span class="is-success">{work.completedTime ?? "--"}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div class="fumigation-realtime-center">
            <div class="fumigation-realtime-panel flex-15">
              <div class="fumigation-realtime-panel-hd">
                <span class="dot dot-green" />
                粮库熏蒸态势图·仓房状态
              </div>
              <div class="fumigation-wh-grid">
                {effectiveWarehouses.value.length === 0 ? (
                  <div class="fumigation-realtime-empty">暂无仓房数据</div>
                ) : (
                  effectiveWarehouses.value.map((warehouse) => (
                    <div
                      class={`fumigation-wh-block${warehouse.status === "working" ? " is-working" : " is-idle"}`}
                      key={warehouse.warehouseId}
                    >
                      <div class="wh-name">{warehouse.warehouseName}</div>
                      <div class="wh-status">{warehouse.statusLabel}</div>
                    </div>
                  ))
                )}
              </div>
              <div class="fumigation-wh-legend">
                <span>🟢 作业中</span>
                <span>⬛ 空闲</span>
                <span>
                  {effectiveWarehouses.value.length} 仓房·{workingWarehouseCount.value} 作业中
                </span>
              </div>
            </div>

            <div class="fumigation-realtime-panel flex-1">
              <div class="fumigation-realtime-panel-hd">📈 本月趋势</div>
              <div class="fumigation-trend-grid">
                <div>
                  <div class="trend-label">月度作业量</div>
                  <div class="fumigation-trend-row">
                    <span>上月</span>
                    <div class="trend-bar">
                      <div class="trend-fill is-blue" style={{ width: trendWidth(stats.value.lastMonthWorkCount, monthWorkMax.value) }} />
                    </div>
                    <span class="is-blue">{stats.value.lastMonthWorkCount}</span>
                  </div>
                  <div class="fumigation-trend-row">
                    <span>本月</span>
                    <div class="trend-bar">
                      <div
                        class="trend-fill is-blue"
                        style={{ width: trendWidth(stats.value.currentMonthWorkCount, monthWorkMax.value) }}
                      />
                    </div>
                    <span class="is-blue">{stats.value.currentMonthWorkCount}</span>
                  </div>
                </div>
                <div>
                  <div class="trend-label">校验通过率</div>
                  <div class="fumigation-trend-row">
                    <span>上月</span>
                    <div class="trend-bar">
                      <div class="trend-fill is-green" style={{ width: `${Math.min(100, stats.value.lastMonthPrecheckPassRate)}%` }} />
                    </div>
                    <span class="is-green">{stats.value.lastMonthPrecheckPassRate.toFixed(1)}%</span>
                  </div>
                  <div class="fumigation-trend-row">
                    <span>本月</span>
                    <div class="trend-bar">
                      <div class="trend-fill is-green" style={{ width: `${Math.min(100, stats.value.currentMonthPrecheckPassRate)}%` }} />
                    </div>
                    <span class="is-green">{stats.value.currentMonthPrecheckPassRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="fumigation-realtime-right">
            <div class="fumigation-realtime-panel">
              <div class="fumigation-realtime-panel-hd">
                <span class="dot dot-blue" />
                设备运行状态
              </div>
              <div class="fumigation-device-list">
                {devices.value.length === 0 ? (
                  <div class="fumigation-realtime-empty">暂无设备</div>
                ) : (
                  devices.value.map((device) => (
                    <div class="fumigation-device-row" key={device.id}>
                      <span class="device-name">{device.name}</span>
                      <span class={device.status === "online" ? "is-online" : "is-offline"}>
                        ● {device.status === "online" ? "在线" : "离线"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div class="fumigation-realtime-panel flex-1">
              <div class="fumigation-realtime-panel-hd">
                <span class="dot dot-red" />
                今日告警详情
              </div>
              <div class="fumigation-alarm-list">
                {todayAlarms.value.length === 0 ? (
                  <div class="fumigation-realtime-empty">今日暂无告警</div>
                ) : (
                  todayAlarms.value.map((alarm) => (
                    <div class="fumigation-alarm-item" key={alarm.id}>
                      <div class="alarm-title">{alarm.alarmEventName}</div>
                      <div class="alarm-meta">
                        <span>{formatDateTimeValue(alarm.alarmTime, "--", "HH:mm")}</span>
                        <span>{alarm.alarmStatusName}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
});
