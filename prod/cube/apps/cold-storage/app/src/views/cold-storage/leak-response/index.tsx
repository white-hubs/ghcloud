import { computed, defineComponent, onMounted, ref, shallowRef, watch } from "vue";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type {
  ColdStoreLeakResponseAlarmRecord,
  ColdStoreLeakResponseDetail,
  ColdStoreLeakResponseListItem,
} from "@ghcloud/cube-service-interface/cold-storage";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { getColdStoreLeakResponseDetail, getColdStoreLeakResponses } from "@ghcloud/cube-services-client/cold-storage.client";
import { Button, Empty, Spin, Tag } from "@ghcloud/cube-ui";

import type { AlarmRecord } from "../alarm-center/alarm-record-types";
import { AlarmRecordDetail } from "../alarm-center/components/alarm-record-detail";
import { formatDateTime } from "../shared/time";

import "./index.less";

const displayText = (value?: string | number | null): string => {
  if (value == null || value === "") {
    return "--";
  }
  return String(value);
};

const levelTone = (code?: string, name?: string): "red" | "orange" | "green" => {
  const text = `${code ?? ""}${name ?? ""}`;
  if (/一级|严重|高|HIGH|RED|WARNING|DANGER/.test(text)) {
    return "red";
  }
  if (/二级|中|橙|ORANGE|WATCH|WARN/.test(text)) {
    return "orange";
  }
  return "green";
};

const arrayValue = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const toTrendLine = (points: ColdStoreLeakResponseDetail["concentrationTrends"]): string => {
  const values = points.map((point) => Number(point.value)).filter((value) => Number.isFinite(value));
  if (!values.length) {
    return "";
  }
  const min = Math.min(0, ...values);
  const max = Math.max(...values, 1);
  const span = max - min || 1;
  return values
    .map((value, index) => {
      const x = values.length === 1 ? 200 : 20 + (index / (values.length - 1)) * 360;
      const y = 112 - ((value - min) / span) * 92;
      return `${Math.round(x)},${Math.round(y)}`;
    })
    .join(" ");
};

const evidenceTone = (status?: string): "green" | "orange" | "gray" => {
  if (status === "CONFIRMED") {
    return "green";
  }
  if (status === "PENDING") {
    return "orange";
  }
  return "gray";
};

const evidenceValueText = (item: ColdStoreLeakResponseDetail["evidences"][number]): string => {
  if (item.type === "VISION") {
    if (item.value === 1) {
      return "检测到";
    }
    if (item.value === 0) {
      return "未检测到";
    }
  }
  return `${displayText(item.value)}${item.unit ?? ""}`;
};

const captureFileTitle = (file: NonNullable<ColdStoreLeakResponseDetail["aiCaptureFiles"]>[number]): string =>
  displayText(file.name || file.fileId);

const toAlarmInitialRecord = (
  alarmRecord: ColdStoreLeakResponseAlarmRecord | undefined,
  fallback: ColdStoreLeakResponseListItem | undefined,
): Partial<AlarmRecord> | null => {
  if (!alarmRecord && !fallback) {
    return null;
  }
  const source = alarmRecord as Record<string, unknown> | undefined;
  return {
    id: displayText(alarmRecord?.id ?? fallback?.alarmId),
    alarmEventName: displayText(alarmRecord?.alarmEventName ?? fallback?.title),
    alarmLevelId: alarmRecord?.alarmLevelId ? (String(alarmRecord.alarmLevelId) as AlarmRecord["alarmLevelId"]) : undefined,
    alarmLevelName: displayText(alarmRecord?.alarmLevelName ?? fallback?.alarmLevelName) as AlarmRecord["alarmLevelName"],
    areaName: displayText(alarmRecord?.areaName ?? fallback?.location),
    alarmTargetAddress: displayText(alarmRecord?.alarmTargetAddress ?? fallback?.location),
    alarmTime: formatDateTime(alarmRecord?.alarmTime ?? fallback?.alarmTime),
    alarmTargetId: displayText(alarmRecord?.alarmTargetKey ?? fallback?.storeId),
    alarmTargetName: displayText(alarmRecord?.alarmTargetName ?? fallback?.storeName),
    alarmTargetType: displayText(alarmRecord?.alarmTargetTypeName ?? "冷库"),
    timeoutProcessTimesName: displayText(alarmRecord?.timeoutProcessTimesName),
    alarmHandlerTimeoutStatus: (alarmRecord?.alarmHandlerTimeoutStatus as AlarmRecord["alarmHandlerTimeoutStatus"]) ?? "NORMAL",
    alarmStatus: (alarmRecord?.alarmStatus as AlarmRecord["alarmStatus"]) ?? "ALARM_UN_CONFIRMED",
    alarmHandlerResult: alarmRecord?.alarmHandlerResult as AlarmRecord["alarmHandlerResult"],
    alarmHandlerName: displayText(alarmRecord?.alarmHandlerName),
    alarmHandlerBy: displayText(alarmRecord?.alarmHandlerBy),
    businessKey: displayText(alarmRecord?.businessKey ?? fallback?.storeId),
    alarmNotifyUsers: arrayValue(source?.alarmNotifyUsers),
    handler: source?.handler as AlarmRecord["handler"],
    suspend: source?.suspend as AlarmRecord["suspend"],
    followUps: arrayValue(source?.followUps),
  };
};

export const LeakResponsePage = defineComponent({
  name: "LeakResponsePage",
  setup: () => {
    const loading = shallowRef(false);
    const detailLoading = shallowRef(false);
    const alarms = ref<ColdStoreLeakResponseListItem[]>([]);
    const selectedId = shallowRef("");
    const detail = ref<ColdStoreLeakResponseDetail | null>(null);

    const selectedAlarm = computed(() => alarms.value.find((item) => item.alarmId === selectedId.value) ?? alarms.value[0]);
    const selectedAlarmRecordId = computed(() => displayText(detail.value?.alarmRecord?.id ?? selectedAlarm.value?.alarmId));
    const initialAlarmRecord = computed(() => toAlarmInitialRecord(detail.value?.alarmRecord, selectedAlarm.value));
    const trendLine = computed(() => (detail.value ? toTrendLine(detail.value.concentrationTrends ?? []) : ""));

    const loadList = async (): Promise<void> => {
      loading.value = true;
      try {
        const data = await useAuthRequest(() => getColdStoreLeakResponses());
        alarms.value = data;
        if (!selectedId.value || !data.some((item) => item.alarmId === selectedId.value)) {
          selectedId.value = data[0]?.alarmId ?? "";
        }
      } finally {
        loading.value = false;
      }
    };

    const loadDetail = async (): Promise<void> => {
      if (!selectedId.value) {
        detail.value = null;
        return;
      }
      detailLoading.value = true;
      try {
        detail.value = await useAuthRequest(() => getColdStoreLeakResponseDetail(selectedId.value));
      } finally {
        detailLoading.value = false;
      }
    };

    onMounted(() => {
      void loadList();
    });

    watch(selectedId, () => {
      void loadDetail();
    });

    const businessDetail = (): JSX.Element | null => {
      const current = detail.value;
      const alarm = selectedAlarm.value;
      if (!current && !alarm) {
        return null;
      }
      const concentration = current?.currentConcentration ?? alarm?.currentConcentration;
      const unit = current?.concentrationUnit ?? alarm?.concentrationUnit ?? "";
      const level = current?.alarmRecord?.alarmLevelName ?? alarm?.alarmLevelName;
      const location =
        current?.storeName || current?.mainDeviceName
          ? `${displayText(current.storeName)} ${displayText(current.mainDeviceName)}`
          : alarm?.location;
      return (
        <div class="leak-business-detail">
          <div class="leak-summary-grid">
            <div class="leak-summary-card leak-summary-card--danger">
              <span>当前 NH3 浓度</span>
              <b>{concentration == null ? "--" : `${concentration} ${unit}`}</b>
            </div>
            <div class="leak-summary-card">
              <span>告警等级</span>
              <b class={`tone-${levelTone(current?.alarmRecord?.alarmLevelCode, level)}`}>{displayText(level)}</b>
            </div>
            <div class="leak-summary-card">
              <span>泄漏位置</span>
              <b>{displayText(location)}</b>
            </div>
          </div>

          <section class="leak-ai-check">
            <h3>AI交叉验证 · 综合置信度 {current?.aiConfidence == null ? "--" : `${current.aiConfidence}%`}</h3>
            <div class="leak-evidence-grid">
              {(current?.evidences ?? []).map((item) => {
                const tone = evidenceTone(item.status);
                return (
                  <div class="leak-evidence-item" key={`${item.type}-${item.observedTime}`}>
                    <i class={`leak-evidence-dot leak-evidence-dot--${tone}`} />
                    <b>{displayText(item.typeName || item.type)}</b>
                    <span>
                      {evidenceValueText(item)} · {displayText(item.statusName || item.status)} · {formatDateTime(item.observedTime)}
                    </span>
                  </div>
                );
              })}
              {current?.evidences.length ? null : <Empty description="暂无 AI 交叉验证证据" />}
            </div>
          </section>

          <section class="leak-evidence-chain">
            <div class="leak-section-title">
              <h3>AI证据链</h3>
              <Tag color="red">自动生成</Tag>
            </div>
            <div class="leak-chain-grid">
              <div>
                <h4>NH3浓度实时曲线</h4>
                <div class="leak-trend-chart">
                  {trendLine.value ? (
                    <svg viewBox="0 0 400 130" aria-label="NH3浓度实时曲线">
                      <line x1="20" x2="380" y1="28" y2="28" class="leak-threshold leak-threshold--high" />
                      <line x1="20" x2="380" y1="86" y2="86" class="leak-threshold leak-threshold--low" />
                      <polyline class="leak-trend-line" points={trendLine.value} />
                      <text x="22" y="24">
                        高报阈值 {current?.highThreshold ?? "--"}
                      </text>
                      <text x="22" y="82">
                        低报阈值 {current?.lowThreshold ?? "--"}
                      </text>
                    </svg>
                  ) : (
                    <Empty description="暂无浓度趋势" />
                  )}
                </div>
              </div>
              <div>
                <h4>AI视觉抓拍（白雾检测）共{(current?.aiCaptureFiles ?? []).length}张</h4>
                <div class="leak-camera-grid">
                  {(current?.aiCaptureFiles ?? []).map((file) => (
                    <div class="leak-camera-card" key={file.fileId || file.path || file.name}>
                      {file.path ? <img src={file.path} alt={captureFileTitle(file)} /> : null}
                    </div>
                  ))}
                  {(current?.aiCaptureFiles ?? []).length ? null : <Empty description="暂无AI视觉抓拍" />}
                </div>
              </div>
            </div>
            <div class="leak-location-path">
              泄漏定位 — {displayText(current?.storeName)} / {displayText(current?.mainDeviceName)} / {displayText(alarm?.location)}
            </div>
          </section>
        </div>
      );
    };

    const content = (): JSX.Element => (
      <div class="cs-page leak-layout leak-response-page">
        <aside class="alarm-list">
          <Spin spinning={loading.value}>
            {alarms.value.length ? (
              alarms.value.map((alarm, index) => {
                const tone = levelTone(alarm.alarmLevelCode, alarm.alarmLevelName);
                const concentration =
                  alarm.currentConcentration == null ? "--" : `${alarm.currentConcentration}${alarm.concentrationUnit ?? ""}`;
                return (
                  <Button
                    type="text"
                    class={selectedId.value === alarm.alarmId ? "alarm-item active" : "alarm-item"}
                    onClick={() => (selectedId.value = alarm.alarmId)}
                  >
                    <span class={`alarm-index tone-${tone}`}>{index + 1}</span>
                    <div>
                      <b>{displayText(alarm.title || alarm.storeName)}</b>
                      <small>
                        {displayText(alarm.alarmStatusName)} · {formatDateTime(alarm.alarmTime)}
                      </small>
                      <small>{displayText(alarm.location || alarm.mainDeviceName)}</small>
                    </div>
                    <strong class={`tone-${tone}`}>{concentration}</strong>
                  </Button>
                );
              })
            ) : (
              <Empty description="暂无泄漏告警" />
            )}
          </Spin>
        </aside>
        <section class="cs-card fill">
          <Spin spinning={detailLoading.value}>
            {selectedAlarmRecordId.value !== "--" && initialAlarmRecord.value ? (
              <AlarmRecordDetail
                alarmId={selectedAlarmRecordId.value}
                initialRecord={initialAlarmRecord.value}
                detailExtra={businessDetail}
                actionPlacement="bottom"
              />
            ) : (
              <Empty description="暂无泄漏告警详情" />
            )}
          </Spin>
        </section>
      </div>
    );

    return () => <CubeLayout title="泄漏响应" showFooter={false} v-slots={{ "layout-content": content }} />;
  },
});
