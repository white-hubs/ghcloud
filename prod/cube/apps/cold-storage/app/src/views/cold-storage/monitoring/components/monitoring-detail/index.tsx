import { computed, defineComponent, shallowRef, watch, type PropType } from "vue";

import { CubePlayer } from "@ghcloud/cube-player";
import type { AlarmRecord as PlatformAlarmRecord } from "@ghcloud/cube-service-interface/alarm-center";
import type {
  ColdStoreMonitorCardDetail,
  ColdStoreMonitorCamera,
  ColdStoreMonitorDeviceGroup,
  ColdStoreMonitorTrend,
} from "@ghcloud/cube-service-interface/cold-storage";
import { Button, Empty, Space, Tag } from "@ghcloud/cube-ui";

import { AlarmRecordList } from "../../../alarm-center/components/alarm-record-list";
import { formatTimestamp } from "../../../shared/time";
import { metricValueText, monitorStatusText, monitorStatusTone } from "../../monitoring-data";
import { APPLICATION_CODE } from "@/constants/env";

import "./index.less";

const trendButtonText = (trend: ColdStoreMonitorTrend): string => {
  const source = `${trend.name ?? ""}${trend.code ?? ""}${trend.propertyCode ?? ""}`.toLowerCase();
  if (source.includes("nh") || source.includes("ammonia") || source.includes("氨")) {
    return "NH₃浓度";
  }
  if (source.includes("pressure") || source.includes("press") || source.includes("压力")) {
    return "排气压力";
  }
  if (source.includes("temp") || source.includes("温")) {
    return "库温";
  }
  return trend.name || trend.code || "--";
};

const trendKey = (trend: ColdStoreMonitorTrend, index = 0): string => trend.code || trend.propertyCode || trend.name || `trend-${index}`;

const trendPolyline = (trend?: ColdStoreMonitorTrend): string => {
  const points = trend?.points ?? [];
  if (!points.length) {
    return "";
  }
  const values = points.map((point) => Number(point.value)).filter((value) => Number.isFinite(value));
  if (!values.length) {
    return "";
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return points
    .map((point, index) => {
      const value = Number(point.value);
      const x = (index * 1000) / Math.max(points.length - 1, 1);
      const y = 160 - ((Number.isFinite(value) ? value - min : 0) / span) * 130;
      return `${x.toFixed(0)},${y.toFixed(0)}`;
    })
    .join(" ");
};

const trendValues = (trend?: ColdStoreMonitorTrend): number[] =>
  (trend?.points ?? []).map((point) => Number(point.value)).filter((value) => Number.isFinite(value));

const trimNumber = (value: number): string => {
  const fixed = value.toFixed(2);
  return fixed.replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
};

const formatTrendValue = (value: number, unit?: string): string => {
  const text = trimNumber(value);
  return unit ? `${text} ${unit}` : text;
};

const trendAxisLabels = (trend?: ColdStoreMonitorTrend): string[] => {
  const values = trendValues(trend);
  if (!values.length) {
    return [];
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return [max, min + span * (2 / 3), min + span / 3, min].map((value) => formatTrendValue(value, trend?.unit));
};

const trendTimeLabels = (trend?: ColdStoreMonitorTrend): string[] => {
  const points = trend?.points ?? [];
  return [0, 0.25, 0.5, 0.75, 1]
    .map((percent) => points[Math.round((points.length - 1) * percent)])
    .map((point) => formatTimestamp(point?.ts, "HH:mm", ""));
};

const deviceGroupIcon = (group: ColdStoreMonitorDeviceGroup): string => {
  const text = `${group.productName ?? ""}${group.productCode ?? ""}`;
  if (/氨|NH/i.test(text)) {
    return "NH";
  }
  if (/压|PRESS/i.test(text)) {
    return "P";
  }
  if (/温|TEMP/i.test(text)) {
    return "T";
  }
  if (/门|DOOR/i.test(text)) {
    return "D";
  }
  if (/制冷|冷|COMP/i.test(text)) {
    return "R";
  }
  return "I";
};

const displayText = (value?: string | number | null): string => {
  if (value == null || value === "") {
    return "--";
  }
  return String(value);
};

const cameraDeviceId = (camera?: ColdStoreMonitorCamera): string => {
  const value = camera?.id ?? camera?.deviceId;
  if (value != null && value !== "") {
    return String(value);
  }
  const code = String(camera?.code ?? "").trim();
  return /^\d+$/.test(code) ? code : "";
};

const cameraKey = (camera: ColdStoreMonitorCamera, index = 0): string =>
  cameraDeviceId(camera) || camera.deviceCode || camera.code || camera.deviceName || camera.name || `camera-${index}`;

const cameraCode = (camera?: ColdStoreMonitorCamera): string => displayText(camera?.deviceCode || camera?.code);

const cameraName = (camera?: ColdStoreMonitorCamera): string =>
  displayText(camera?.deviceName || camera?.name || camera?.deviceCode || camera?.code);

const cameraLocation = (camera?: ColdStoreMonitorCamera): string =>
  displayText(camera?.locationDes || camera?.areaName || camera?.location);

const cameraOnline = (camera?: ColdStoreMonitorCamera): boolean => camera?.deviceState ?? camera?.online ?? true;

export const MonitoringDetail = defineComponent({
  name: "MonitoringDetail",
  props: {
    detail: {
      type: Object as PropType<ColdStoreMonitorCardDetail>,
      required: true,
    },
  },
  setup: (props) => {
    const selectedTrendKey = shallowRef("");
    const activeCameraKey = shallowRef("");

    const selectedTrend = computed(() => {
      const trends = props.detail.trends ?? [];
      return trends.find((item, index) => trendKey(item, index) === selectedTrendKey.value) ?? trends[0];
    });
    const selectedTrendLine = computed(() => trendPolyline(selectedTrend.value));
    const selectedTrendAxisLabels = computed(() => trendAxisLabels(selectedTrend.value));
    const selectedTrendTimeLabels = computed(() => trendTimeLabels(selectedTrend.value));
    const activeCamera = computed(() => props.detail.cameras.find((camera, index) => cameraKey(camera, index) === activeCameraKey.value));
    const activeCameraDeviceId = computed(() => cameraDeviceId(activeCamera.value));

    watch(
      () => props.detail.trends,
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
      () => props.detail.cameras,
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

    const basicItems = computed<Array<[string, string]>>(() => [
      ["冷库名称", displayText(props.detail.name)],
      ["冷库编号", displayText(props.detail.code)],
      ["所属区域", displayText(props.detail.areaName)],
      ["监测状态", monitorStatusText(props.detail)],
      ["在线设备", props.detail.onlineDeviceCount == null ? "--" : `${props.detail.onlineDeviceCount}台`],
      ["异常提示", displayText(props.detail.warningText)],
      ...props.detail.metrics.map((metric) => [metric.name || metric.code || "--", metricValueText(metric)] as [string, string]),
    ]);

    const openAlarmDetail = (record: PlatformAlarmRecord): void => {
      history.pushState({}, "", `/portal/genericEquipmentMonitor/alarmDetail?type=detail&id=${record.id}`);
    };

    return () => (
      <div class="cs-page monitoring-detail-page">
        <div class="cs-card monitoring-basic-card">
          <div class="cs-card-hd">
            <h3>基本信息</h3>
            <Tag color={monitorStatusTone(props.detail.status)}>{monitorStatusText(props.detail)}</Tag>
          </div>
          <div class="monitoring-basic-grid">
            {basicItems.value.map(([label, value]) => (
              <div class="monitoring-basic-item" key={label}>
                <span>{label}</span>
                <b>{value}</b>
              </div>
            ))}
          </div>
        </div>

        <div class="cs-card monitoring-trend-card">
          <div class="cs-card-hd">
            <h3>24小时参数趋势</h3>
            <Space size={6}>
              {(props.detail.trends ?? []).map((item, index) => {
                const key = trendKey(item, index);
                return (
                  <Button
                    size="small"
                    type={selectedTrendKey.value === key ? "primary" : "default"}
                    onClick={() => (selectedTrendKey.value = key)}
                  >
                    {trendButtonText(item)}
                  </Button>
                );
              })}
            </Space>
          </div>
          {selectedTrendLine.value ? (
            <div class="monitoring-trend-chart">
              <div class="monitoring-axis-labels">
                {selectedTrendAxisLabels.value.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
              <svg viewBox="0 0 1000 180" preserveAspectRatio="none" aria-label="24小时参数趋势">
                {[30, 75, 120, 165].map((y) => (
                  <line key={y} x1="0" x2="1000" y1={y} y2={y} class="monitoring-grid-line" />
                ))}
                <polyline class="monitoring-trend-line" points={selectedTrendLine.value} />
                {[0, 250, 500, 750, 1000].map((x, index) => (
                  <text key={x} x={x} y="178" text-anchor={x === 0 ? "start" : x === 1000 ? "end" : "middle"}>
                    {selectedTrendTimeLabels.value[index]}
                  </text>
                ))}
              </svg>
            </div>
          ) : (
            <div class="monitoring-empty">
              <Empty description="暂无参数趋势" />
            </div>
          )}
        </div>

        <section class="monitoring-section">
          <div class="monitoring-section-title">
            <h3>关联设备（按类型）</h3>
            <Tag color={monitorStatusTone(props.detail.status)}>{monitorStatusText(props.detail)}</Tag>
          </div>
          {props.detail.deviceGroups.length ? (
            <div class="monitoring-device-grid">
              {props.detail.deviceGroups.map((group) => (
                <div class="monitoring-device-group" key={group.productCode || group.productName}>
                  <div class="monitoring-device-group__head">
                    <span class="monitoring-device-group__icon">{deviceGroupIcon(group)}</span>
                    <b>
                      {group.productName || group.productCode || "设备"} · {group.count ?? group.devices.length}台
                    </b>
                  </div>
                  <div class="monitoring-device-list">
                    {group.devices.map((device) => (
                      <div class="monitoring-device-item" key={device.deviceId || device.deviceCode}>
                        <span class="monitoring-device-icon">{deviceGroupIcon(group)}</span>
                        <div>
                          <b>{device.deviceCode || "--"}</b>
                          <small>{device.deviceName || group.productName || "--"}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div class="monitoring-empty">
              <Empty description="暂无关联设备" />
            </div>
          )}
        </section>

        <section class="monitoring-section">
          <div class="monitoring-section-title">
            <h3>监控画面</h3>
          </div>
          {props.detail.cameras.length ? (
            <div class="monitoring-camera-monitor">
              <div class="monitoring-camera-grid">
                {props.detail.cameras.map((camera, index) => {
                  const key = cameraKey(camera, index);
                  const selected = key === activeCameraKey.value;
                  const online = cameraOnline(camera);
                  return (
                    <button
                      class={["monitoring-camera-card", selected ? "is-active" : "", online ? "" : "is-offline"].filter(Boolean).join(" ")}
                      key={key}
                      type="button"
                      onClick={() => {
                        activeCameraKey.value = key;
                      }}
                    >
                      <span class={online ? "monitoring-live" : "monitoring-live off"}>
                        <i />
                        {online ? "LIVE" : "OFFLINE"}
                      </span>
                      <div class="monitoring-camera-icon">CAM</div>
                      <b>{cameraName(camera)}</b>
                      <span>{cameraCode(camera)}</span>
                      <small>{cameraLocation(camera)}</small>
                    </button>
                  );
                })}
              </div>
              <div class="monitoring-player-panel">
                <div class="monitoring-player-panel__title">
                  <span>实时监控</span>
                  <b>{cameraName(activeCamera.value ?? props.detail.cameras[0])}</b>
                </div>
                <div class="monitoring-player-panel__body">
                  {activeCameraDeviceId.value ? (
                    <CubePlayer
                      key={activeCameraDeviceId.value}
                      deviceId={activeCameraDeviceId.value}
                      h5sControl={true}
                      isShowDeviceDetails={false}
                    />
                  ) : (
                    <Empty description="当前摄像头缺少设备ID" />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div class="monitoring-empty">
              <Empty description="暂无监控画面" />
            </div>
          )}
        </section>

        <div class="cs-card">
          <div class="cs-card-hd">
            <h3>报警记录</h3>
          </div>
          <AlarmRecordList
            applicationCode={APPLICATION_CODE}
            deviceIds={props.detail.mainDeviceId ? [props.detail.mainDeviceId] : []}
            tableCode="COLD_STORAGE_MONITORING_DETAIL_ALARM_RECORD_LIST"
            onOpenDetail={openAlarmDetail}
          />
        </div>
      </div>
    );
  },
});
