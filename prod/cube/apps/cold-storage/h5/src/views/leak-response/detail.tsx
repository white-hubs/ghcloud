import { Empty, Loading, showNotify, Tag } from "vant";
import { computed, defineComponent, onMounted, ref, type VNode } from "vue";
import { useRoute } from "vue-router";

import type { AlarmDetailsExtraContext } from "@ghcloud/cube-alarm-center-h5/src/views/alarm-records/details/details";
import { Details as AlarmDetails } from "@ghcloud/cube-alarm-center-h5/src/views/alarm-records/details/details";
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import type { ColdStoreLeakEvidence, ColdStoreLeakResponseDetail } from "@ghcloud/cube-service-interface/cold-storage";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { getColdStoreLeakResponseDetail } from "@ghcloud/cube-services-client/cold-storage.client";

import { displayText, formatDateTime, withUnit } from "@/utils/format";

const levelType = (code?: string, name?: string): "danger" | "warning" | "success" | "primary" => {
  const text = `${code ?? ""}${name ?? ""}`;
  if (/高|严重|一级|DANGER|HIGH|RED/i.test(text)) {
    return "danger";
  }
  if (/中|二级|WARN|ORANGE|WATCH/i.test(text)) {
    return "warning";
  }
  if (/低|正常|NORMAL|LOW/i.test(text)) {
    return "success";
  }
  return "primary";
};

const evidenceClass = (item: ColdStoreLeakEvidence): string => {
  if (item.status === "CONFIRMED") {
    return "leak-detail-evidence-dot leak-detail-evidence-dot--success";
  }
  if (item.status === "PENDING") {
    return "leak-detail-evidence-dot leak-detail-evidence-dot--warning";
  }
  return "leak-detail-evidence-dot";
};

const evidenceValueText = (item: ColdStoreLeakEvidence): string => {
  if (item.type === "VISION") {
    if (item.value === 1) {
      return "检测到";
    }
    if (item.value === 0) {
      return "未检测到";
    }
  }
  return withUnit(item.value, item.unit);
};

const captureFileTitle = (file: NonNullable<ColdStoreLeakResponseDetail["aiCaptureFiles"]>[number]): string =>
  displayText(file.name || file.fileId);

const trendPolyline = (detail?: ColdStoreLeakResponseDetail | null): string => {
  const values = (detail?.concentrationTrends ?? []).map((point) => Number(point.value)).filter((value) => Number.isFinite(value));
  if (!values.length) {
    return "";
  }
  const min = Math.min(0, ...values);
  const max = Math.max(...values, 1);
  const span = max - min || 1;
  return values
    .map((value, index) => {
      const x = values.length === 1 ? 160 : 16 + (index / (values.length - 1)) * 288;
      const y = 112 - ((value - min) / span) * 86;
      return `${Math.round(x)},${Math.round(y)}`;
    })
    .join(" ");
};

export const LeakResponseDetailPage = defineComponent({
  name: "LeakResponseDetailPage",
  setup: () => {
    const route = useRoute();
    const detail = ref<ColdStoreLeakResponseDetail | null>(null);
    const loading = ref(false);

    const alarmId = computed(() => String(route.query.alarmId ?? route.query.id ?? ""));
    const alarmRecordId = computed(() => detail.value?.alarmRecord?.id ?? alarmId.value);
    const concentrationLine = computed(() => trendPolyline(detail.value));

    const loadDetail = async (): Promise<void> => {
      if (!alarmId.value) {
        detail.value = null;
        return;
      }
      loading.value = true;
      try {
        detail.value = await useAuthRequest(() => getColdStoreLeakResponseDetail(alarmId.value));
      } catch (error) {
        showNotify({ type: "danger", message: error instanceof Error ? error.message : "泄漏报警详情加载失败" });
      } finally {
        loading.value = false;
      }
    };

    const businessContent = (_context: AlarmDetailsExtraContext): VNode | null => {
      const current = detail.value;
      if (!current) {
        return null;
      }
      const level = current.alarmRecord?.alarmLevelName;
      const location =
        current.storeName || current.mainDeviceName
          ? `${displayText(current.storeName)} ${displayText(current.mainDeviceName)}`
          : displayText(current.alarmRecord?.alarmTargetName);

      return (
        <section class="leak-detail-extra">
          <div class="leak-detail-summary">
            <div class="leak-detail-summary-item leak-detail-summary-item--danger">
              <span>当前 NH3 浓度</span>
              <b>{withUnit(current.currentConcentration, current.concentrationUnit)}</b>
            </div>
            <div class="leak-detail-summary-item">
              <span>告警等级</span>
              <Tag type={levelType(current.alarmRecord?.alarmLevelCode, level)}>{displayText(level)}</Tag>
            </div>
            <div class="leak-detail-summary-item">
              <span>泄漏位置</span>
              <b>{location}</b>
            </div>
          </div>

          <div class="leak-detail-section">
            <h3>AI交叉验证 · 综合置信度 {current.aiConfidence == null ? "--" : `${current.aiConfidence}%`}</h3>
            {(current.evidences ?? []).length ? (
              <div class="leak-detail-evidence-list">
                {current.evidences.map((item) => (
                  <div class="leak-detail-evidence-item" key={`${item.type ?? ""}-${item.observedTime ?? ""}`}>
                    <i class={evidenceClass(item)} />
                    <div>
                      <b>{displayText(item.typeName || item.type)}</b>
                      <span>
                        {evidenceValueText(item)} · {displayText(item.statusName || item.status)} · {formatDateTime(item.observedTime)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="暂无 AI 交叉验证证据" />
            )}
          </div>

          <div class="leak-detail-section">
            <h3>AI证据链</h3>
            <div class="leak-detail-chart">
              {concentrationLine.value ? (
                <svg viewBox="0 0 320 130" aria-label="NH3浓度实时曲线">
                  <line x1="16" x2="304" y1="30" y2="30" class="leak-detail-threshold leak-detail-threshold--high" />
                  <line x1="16" x2="304" y1="88" y2="88" class="leak-detail-threshold leak-detail-threshold--low" />
                  <polyline class="leak-detail-trend-line" points={concentrationLine.value} />
                  <text x="18" y="25">
                    高报阈值 {displayText(current.highThreshold)}
                  </text>
                  <text x="18" y="83">
                    低报阈值 {displayText(current.lowThreshold)}
                  </text>
                </svg>
              ) : (
                <Empty description="暂无浓度趋势" />
              )}
            </div>
            <div class="leak-detail-camera-list">
              {(current.aiCaptureFiles ?? []).map((file) => (
                <div class="leak-detail-camera-item" key={file.fileId || file.path || file.name}>
                  {file.path ? <img src={file.path} alt={captureFileTitle(file)} /> : null}
                </div>
              ))}
              {(current.aiCaptureFiles ?? []).length ? null : <Empty description="暂无AI视觉抓拍" />}
            </div>
          </div>
        </section>
      );
    };

    onMounted(() => {
      void loadDetail();
    });

    return (): VNode => {
      if (loading.value && !detail.value) {
        return (
          <>
            <CubeNavBar showBack title="报警详情" />
            <main class="cs-h5-page">
              <div class="page-loading">
                <Loading type="spinner" />
              </div>
            </main>
          </>
        );
      }
      if (!alarmRecordId.value) {
        return (
          <>
            <CubeNavBar showBack title="报警详情" />
            <main class="cs-h5-page">
              <Empty description="暂无泄漏报警详情" />
            </main>
          </>
        );
      }
      return <AlarmDetails alarmId={alarmRecordId.value} extraContent={businessContent} />;
    };
  },
});
