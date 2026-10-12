import { Button, Empty, Loading, PullRefresh, showNotify, Tag } from "vant";
import { computed, defineComponent, nextTick, onMounted, ref, watch, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { CubePlayer } from "@ghcloud/cube-player";
import type {
  ColdStoreMonitorCamera,
  ColdStoreMonitorCardDetail,
  ColdStoreMonitorDeviceGroup,
  ColdStoreMonitorTrend,
} from "@ghcloud/cube-service-interface/cold-storage";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { getColdStoreMonitorCardDetail } from "@ghcloud/cube-services-client/cold-storage.client";

import { displayText, formatTime, withUnit } from "@/utils/format";

const trendKey = (trend: ColdStoreMonitorTrend, index = 0): string => trend.code || trend.propertyCode || trend.name || `trend-${index}`;

const trendName = (trend: ColdStoreMonitorTrend): string => {
  const source = `${trend.name ?? ""}${trend.code ?? ""}${trend.propertyCode ?? ""}`.toLowerCase();
  if (source.includes("nh") || source.includes("ammonia") || source.includes("氨")) {
    return "NH3浓度";
  }
  if (source.includes("pressure") || source.includes("press") || source.includes("压力")) {
    return "排气压力";
  }
  if (source.includes("temp") || source.includes("温")) {
    return "库温";
  }
  return trend.name || trend.code || "--";
};

const trendPolyline = (trend?: ColdStoreMonitorTrend): string => {
  const values = (trend?.points ?? []).map((point) => Number(point.value)).filter((value) => Number.isFinite(value));
  if (!values.length) {
    return "";
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((value, index) => {
      const x = values.length === 1 ? 160 : 16 + (index / (values.length - 1)) * 288;
      const y = 112 - ((value - min) / span) * 86;
      return `${Math.round(x)},${Math.round(y)}`;
    })
    .join(" ");
};

const groupTitle = (group: ColdStoreMonitorDeviceGroup): string =>
  `${group.productName || group.productCode || "设备"} · ${group.count ?? group.devices.length}台`;

const cameraDeviceId = (camera: ColdStoreMonitorCamera): string => camera.code || camera.deviceId || camera.id || "";

const cameraKey = (camera: ColdStoreMonitorCamera, index = 0): string =>
  cameraDeviceId(camera) || camera.deviceCode || camera.name || `camera-${index}`;

const cameraName = (camera?: ColdStoreMonitorCamera): string =>
  displayText(camera?.name || camera?.deviceName || camera?.deviceCode || camera?.code);

const cameraLocation = (camera?: ColdStoreMonitorCamera): string =>
  displayText(camera?.location || camera?.locationDes || camera?.areaName);

export const MonitoringDetailPage = defineComponent({
  name: "MonitoringDetailPage",
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const detail = ref<ColdStoreMonitorCardDetail | null>(null);
    const loading = ref(false);
    const refreshing = ref(false);
    const selectedTrendKey = ref("");
    const activeCameraKey = ref("");
    const cameraPlayerRef = ref<HTMLDivElement | null>(null);

    const storeId = computed(() => {
      const value = route.query.id;
      return Array.isArray(value) ? (value[0] ?? "") : String(value ?? "");
    });

    const selectedTrend = computed(() => {
      const trends = detail.value?.trends ?? [];
      return trends.find((item, index) => trendKey(item, index) === selectedTrendKey.value) ?? trends[0];
    });

    const selectedTrendLine = computed(() => trendPolyline(selectedTrend.value));
    const activeCamera = computed(() => {
      const cameras = detail.value?.cameras ?? [];
      return cameras.find((camera, index) => cameraKey(camera, index) === activeCameraKey.value) ?? cameras[0];
    });
    const activeCameraDeviceId = computed(() => (activeCamera.value ? cameraDeviceId(activeCamera.value) : ""));
    const trendTimes = computed(() => {
      const points = selectedTrend.value?.points ?? [];
      if (!points.length) {
        return [];
      }
      return [0, 0.5, 1].map((percent) => formatTime(points[Math.round((points.length - 1) * percent)]?.ts, ""));
    });

    const loadDetail = async (): Promise<void> => {
      if (!storeId.value) {
        detail.value = null;
        return;
      }
      loading.value = true;
      try {
        detail.value = await useAuthRequest(() => getColdStoreMonitorCardDetail(storeId.value));
      } catch (error) {
        showNotify({ type: "danger", message: error instanceof Error ? error.message : "监测感知详情加载失败" });
      } finally {
        loading.value = false;
        refreshing.value = false;
      }
    };

    const refresh = async (): Promise<void> => {
      refreshing.value = true;
      await loadDetail();
    };

    const openAlarmRecords = (): void => {
      void router.push({
        name: "alarm-list",
        query: {
          entityId: storeId.value,
          targetName: detail.value?.name ?? "",
          sourceApp: __ENV__.applicationCode,
        },
      });
    };

    const scrollCameraPlayerIntoView = async (): Promise<void> => {
      await nextTick();
      const player = cameraPlayerRef.value;
      if (!player || typeof window === "undefined") {
        return;
      }

      const navOffset = 54;
      const rect = player.getBoundingClientRect();
      const isOutsideViewport = rect.top < navOffset || rect.bottom > window.innerHeight;

      if (!isOutsideViewport) {
        return;
      }

      window.scrollTo({
        top: window.scrollY + rect.top - navOffset,
        behavior: "smooth",
      });
    };

    watch(
      () => detail.value?.trends,
      (trends) => {
        const list = trends ?? [];
        if (!list.length) {
          selectedTrendKey.value = "";
          return;
        }
        if (!list.some((item, index) => trendKey(item, index) === selectedTrendKey.value)) {
          selectedTrendKey.value = trendKey(list[0], 0);
        }
      },
      { immediate: true },
    );

    watch(
      () => detail.value?.cameras,
      (cameras) => {
        const list = cameras ?? [];
        if (!list.length) {
          activeCameraKey.value = "";
          return;
        }
        if (!list.some((camera, index) => cameraKey(camera, index) === activeCameraKey.value)) {
          activeCameraKey.value = cameraKey(list[0], 0);
        }
      },
      { immediate: true },
    );

    watch(storeId, () => {
      void loadDetail();
    });

    onMounted(() => {
      void loadDetail();
    });

    return (): VNode => (
      <>
        <CubeNavBar showBack title="监测感知详情" />
        <main class="cs-h5-page monitoring-detail-page">
          <PullRefresh v-model={refreshing.value} onRefresh={refresh} class="content-refresh">
            {loading.value && !detail.value ? (
              <div class="page-loading">
                <Loading type="spinner" />
              </div>
            ) : detail.value ? (
              <>
                <section class="detail-card">
                  <header class="section-title">
                    <h3>基础信息</h3>
                    <Tag type="primary">{detail.value.statusName || "监测中"}</Tag>
                  </header>
                  <div class="info-grid">
                    {[
                      ["冷库名称", displayText(detail.value.name)],
                      ["冷库编号", displayText(detail.value.code)],
                      ["所属区域", displayText(detail.value.areaName)],
                      ["在线设备", `${detail.value.onlineDeviceCount ?? 0}台`],
                      ["异常提示", displayText(detail.value.warningText)],
                    ].map(([label, value]) => (
                      <div class="info-item" key={label}>
                        <span>{label}</span>
                        <b>{value}</b>
                      </div>
                    ))}
                  </div>
                </section>

                <section class="detail-card">
                  <header class="section-title">
                    <h3>监测指标</h3>
                  </header>
                  <div class="metric-grid detail-metrics">
                    {(detail.value.metrics ?? []).map((metric) => (
                      <div class={metric.abnormal ? "metric-item metric-item--warn" : "metric-item"} key={metric.code ?? metric.name}>
                        <span>{metric.name || metric.code || "--"}</span>
                        <b>{withUnit(metric.value, metric.unit)}</b>
                      </div>
                    ))}
                  </div>
                </section>

                <section class="detail-card">
                  <header class="section-title">
                    <h3>24小时参数趋势</h3>
                  </header>
                  <div class="trend-tabs">
                    {(detail.value.trends ?? []).map((trend, index) => {
                      const key = trendKey(trend, index);
                      return (
                        <button
                          class={key === selectedTrendKey.value ? "active" : ""}
                          key={key}
                          onClick={() => (selectedTrendKey.value = key)}
                        >
                          {trendName(trend)}
                        </button>
                      );
                    })}
                  </div>
                  {selectedTrendLine.value ? (
                    <div class="trend-chart">
                      <svg viewBox="0 0 320 130" aria-label="24小时参数趋势">
                        {[28, 58, 88, 118].map((y) => (
                          <line key={y} x1="16" x2="304" y1={y} y2={y} class="chart-grid-line" />
                        ))}
                        <polyline class="chart-line" points={selectedTrendLine.value} />
                      </svg>
                      <div class="trend-time-axis">
                        {trendTimes.value.map((time, index) => (
                          <span key={`${time}-${index}`}>{time}</span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Empty description="暂无趋势数据" />
                  )}
                </section>

                <section class="detail-card">
                  <header class="section-title">
                    <h3>关联设备</h3>
                  </header>
                  {(detail.value.deviceGroups ?? []).length ? (
                    <div class="device-group-list">
                      {detail.value.deviceGroups.map((group) => (
                        <div class="device-group" key={group.productCode ?? group.productName}>
                          <h4>{groupTitle(group)}</h4>
                          {(group.devices ?? []).map((device) => (
                            <div class="device-row" key={device.deviceId ?? device.deviceCode}>
                              <div>
                                <b>{device.deviceCode || "--"}</b>
                                <span>{device.deviceName || group.productName || "--"}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Empty description="暂无关联设备" />
                  )}
                </section>

                <section class="detail-card">
                  <header class="section-title">
                    <h3>监控画面</h3>
                  </header>
                  {(detail.value.cameras ?? []).length ? (
                    <div class="camera-monitor">
                      <div class="camera-player-card" ref={cameraPlayerRef}>
                        <div class="camera-player-head">
                          <div>
                            <b>{cameraName(activeCamera.value)}</b>
                            <span>{cameraLocation(activeCamera.value)}</span>
                          </div>
                          <Tag type={activeCamera.value?.online ? "success" : "default"}>
                            {activeCamera.value?.online ? "在线" : "离线"}
                          </Tag>
                        </div>
                        <div class="camera-player-body">
                          {activeCameraDeviceId.value ? (
                            <CubePlayer key={activeCameraDeviceId.value} deviceId={activeCameraDeviceId.value} control={true} />
                          ) : (
                            <Empty description="缺少监控设备ID" />
                          )}
                        </div>
                      </div>
                      <div class="camera-select-list">
                        {detail.value.cameras.map((camera, index) => {
                          const key = cameraKey(camera, index);
                          const deviceId = cameraDeviceId(camera);
                          const selected = key === activeCameraKey.value;
                          return (
                            <button
                              class={selected ? "camera-select-item active" : "camera-select-item"}
                              key={key}
                              type="button"
                              onClick={() => {
                                activeCameraKey.value = key;
                                void scrollCameraPlayerIntoView();
                              }}
                            >
                              <div>
                                <b>{cameraName(camera)}</b>
                                <span>{cameraLocation(camera)}</span>
                                {!deviceId ? <small>缺少设备ID</small> : null}
                              </div>
                              <Tag type={camera.online ? "success" : "default"}>{camera.online ? "在线" : "离线"}</Tag>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <Empty description="暂无监控画面" />
                  )}
                </section>
                <section class="detail-card">
                  <header class="section-title">
                    <h3>报警记录</h3>
                  </header>
                  <div class="alarm-entry-card">
                    <span>查看当前冷库相关报警记录、详情和处理流程</span>
                    <Button type="primary" size="small" onClick={openAlarmRecords}>
                      查看报警
                    </Button>
                  </div>
                </section>
              </>
            ) : (
              <Empty description="未找到监测详情" />
            )}
          </PullRefresh>
        </main>
      </>
    );
  },
});
