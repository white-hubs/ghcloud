import { computed, defineComponent, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import { GrainAlertStatus, type GrainAlertDetail, type GrainMetricValue } from "@ghcloud/cube-service-interface/intelligent-grain";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import {
  getIntelligentGrainAlert,
  judgeIntelligentGrainAlertReal,
  markIntelligentGrainAlertMistake,
} from "@ghcloud/cube-services-client/intelligent-grain.client";
import { Button, Card, Empty, Select, Space, Spin, message } from "@ghcloud/cube-ui";

import { ALERT_STATUS_LABEL, REAL_REASON_OPTIONS, formatMetric, formatTime, renderAlertStatus } from "@/views/shared/view-utils";

import "@/views/shared/intelligent-grain.less";

const FALSE_REASON_OPTIONS = [
  { label: "传感器故障", value: "SENSOR_FAULT" },
  { label: "正常操作波动", value: "NORMAL_OPERATION_FLUCTUATION" },
  { label: "环境干扰", value: "ENVIRONMENT_INTERFERENCE" },
  { label: "其他", value: "OTHER" },
];

export const IntelligentGrainAlertDetail = defineComponent({
  name: "IntelligentGrainAlertDetail",
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const loading = ref(false);
    const submitting = ref(false);
    const detail = ref<GrainAlertDetail>();
    const judgementResult = ref<"REAL" | "MISTAKE">("REAL");
    const realReason = ref(REAL_REASON_OPTIONS[0].value);
    const falseReason = ref("SENSOR_FAULT");
    const alertId = computed(() => String(route.params.id ?? ""));
    const canConfirm = computed(() => detail.value?.status === GrainAlertStatus.PENDING);

    const load = async (): Promise<void> => {
      if (!alertId.value) {
        detail.value = undefined;
        return;
      }
      loading.value = true;
      try {
        detail.value = await useAuthRequest(() => getIntelligentGrainAlert(alertId.value));
      } catch (error) {
        message.error((error as Error).message || "加载告警详情失败");
      } finally {
        loading.value = false;
      }
    };

    const submitJudgement = async (): Promise<void> => {
      submitting.value = true;
      try {
        if (judgementResult.value === "REAL") {
          await useAuthRequest(() =>
            judgeIntelligentGrainAlertReal(alertId.value, {
              realReason: realReason.value,
            }),
          );
          message.success("已确认，进入待处置");
        } else {
          await useAuthRequest(() =>
            markIntelligentGrainAlertMistake(alertId.value, {
              falseReason: falseReason.value,
            }),
          );
          message.success("已提交误报判定");
        }
        await load();
      } catch (error) {
        message.error((error as Error).message || "提交判定失败");
      } finally {
        submitting.value = false;
      }
    };

    onMounted(() => {
      void load();
    });

    const renderSnapshot = (snapshot?: Record<string, GrainMetricValue>): JSX.Element => (
      <div class="ig-alert-metric-row">
        {Object.entries(snapshot ?? {}).map(([key, metric]) => (
          <div key={key}>
            <span>{metric.metricName || key}</span>
            <strong class={metric.status === "ALARM" ? "is-danger" : ""}>{formatMetric(metric)}</strong>
            <em>{metric.status === "ALARM" ? "触发告警" : "正常"}</em>
          </div>
        ))}
      </div>
    );

    const readThresholdValue = (): { value?: number; text?: string } => {
      const threshold = detail.value?.trend?.thresholds?.[0];
      if (threshold?.value !== undefined && threshold.value !== null) {
        return {
          value: Number(threshold.value),
          text: `${threshold.value}${threshold.unit ?? detail.value?.trend?.unit ?? ""}`,
        };
      }
      const thresholdText = detail.value?.alertInfo.thresholdText;
      const value = Number(thresholdText?.match(/-?\d+(?:\.\d+)?/)?.[0]);
      return Number.isFinite(value) ? { value, text: thresholdText } : { text: thresholdText };
    };

    const renderTrendChart = (): JSX.Element => {
      const series = detail.value?.trend?.series?.[0];
      const rawPoints = series?.points ?? [];
      const points = rawPoints.map((point) => ({ ...point, value: Number(point.value) })).filter((point) => Number.isFinite(point.value));
      const threshold = readThresholdValue();

      if (points.length === 0) {
        return <div class="ig-alert-trend-empty">暂无趋势数据</div>;
      }

      const values = points.map((point) => point.value);
      if (threshold.value !== undefined && Number.isFinite(threshold.value)) {
        values.push(threshold.value);
      }
      const min = Math.min(...values);
      const max = Math.max(...values);
      const padding = Math.max((max - min) * 0.22, 1);
      const lower = min - padding;
      const upper = max + padding;
      const width = 1000;
      const height = 220;
      const left = 70;
      const right = 70;
      const top = 30;
      const bottom = 44;
      const chartWidth = width - left - right;
      const chartHeight = height - top - bottom;
      const toX = (index: number): number => left + (points.length === 1 ? chartWidth : (chartWidth * index) / (points.length - 1));
      const toY = (value: number): number => top + chartHeight - ((value - lower) / (upper - lower)) * chartHeight;
      const linePoints = points.map((point, index) => `${toX(index)},${toY(point.value)}`).join(" ");
      const markedTriggerIndex = points.findIndex((point) => point.triggered);
      const triggerIndex = markedTriggerIndex >= 0 ? markedTriggerIndex : points.length - 1;
      const triggerPoint = points[triggerIndex] ?? points[points.length - 1];
      const triggerX = toX(triggerIndex);
      const triggerY = toY(triggerPoint.value);
      const thresholdY = threshold.value !== undefined && Number.isFinite(threshold.value) ? toY(threshold.value) : undefined;
      const middleIndex = Math.floor((points.length - 1) / 2);
      const axisIndexes = Array.from(new Set([0, middleIndex, points.length - 1]));
      const unit = series?.unit ?? detail.value?.trend?.unit ?? "";
      const thresholdText = threshold.text ?? (threshold.value !== undefined ? `${threshold.value}${unit}` : "");

      return (
        <div class="ig-alert-trend-chart">
          <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="触发趋势">
            <rect x="0" y="0" width={width} height={height} rx="6" fill="#f8fafc" />
            {thresholdY !== undefined ? (
              <>
                <line
                  x1={left}
                  y1={thresholdY}
                  x2={width - right}
                  y2={thresholdY}
                  stroke="#ff4d7a"
                  stroke-width="2"
                  stroke-dasharray="6 6"
                />
                <text x={width - right + 10} y={thresholdY + 5} fill="#f5003d" font-size="13">
                  {thresholdText}
                </text>
              </>
            ) : null}
            <polyline points={linePoints} fill="none" stroke="#315bff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx={triggerX} cy={triggerY} r="6" fill="#f5003d" />
            <text x={triggerX - 14} y={triggerY - 12} fill="#f5003d" font-size="13" font-weight="700">
              告警
            </text>
            {axisIndexes.map((index) => (
              <text key={`${points[index]?.time}-${index}`} x={toX(index) - 26} y={height - 16} fill="#8a94a6" font-size="12">
                {formatTime(points[index]?.time).slice(5)}
              </text>
            ))}
          </svg>
        </div>
      );
    };

    const renderJudgementPanel = (): JSX.Element => {
      if (!canConfirm.value) {
        return (
          <span class="ig-muted-text">当前状态为 {ALERT_STATUS_LABEL[detail.value!.status] ?? detail.value!.status}，无需重复确认。</span>
        );
      }

      return (
        <div class="ig-judgement-panel">
          <div class="ig-judgement-options">
            <button
              class={["ig-judgement-option", judgementResult.value === "REAL" ? "is-selected" : ""]}
              type="button"
              onClick={() => (judgementResult.value = "REAL")}
            >
              <span class="ig-judgement-radio" />
              <strong>确认真实</strong>
              <em>告警反映了实际粮情异常</em>
            </button>
            <button
              class={["ig-judgement-option", judgementResult.value === "MISTAKE" ? "is-selected" : ""]}
              type="button"
              onClick={() => (judgementResult.value = "MISTAKE")}
            >
              <span class="ig-judgement-radio" />
              <strong>标记误报</strong>
              <em>传感器故障/波动/干扰导致</em>
            </button>
          </div>

          <div class="ig-judgement-fields">
            {judgementResult.value === "REAL" ? (
              <label class="ig-inline-field">
                实报原因：
                <Select
                  value={realReason.value}
                  options={REAL_REASON_OPTIONS}
                  style={{ width: "180px" }}
                  onChange={(value: string) => (realReason.value = value)}
                />
              </label>
            ) : (
              <label class="ig-inline-field">
                误报原因：
                <Select
                  value={falseReason.value}
                  options={FALSE_REASON_OPTIONS}
                  style={{ width: "180px" }}
                  onChange={(value: string) => (falseReason.value = value)}
                />
              </label>
            )}
          </div>

          {judgementResult.value === "REAL" ? (
            <div class="ig-judgement-ai">
              <strong>AI处置建议</strong>
              <span>{detail.value?.aiSuggestion?.summary ?? "暂无建议"}</span>
              {(detail.value?.aiSuggestion?.suggestions ?? []).map((suggestion, index) => (
                <span key={`${suggestion}-${index}`}>{suggestion}</span>
              ))}
            </div>
          ) : null}
        </div>
      );
    };

    const slots = {
      "layout-header": (): JSX.Element => <span class="ig-header-tip">查看告警触发快照、趋势和处置判定。</span>,
      "layout-content": (): JSX.Element => (
        <Spin spinning={loading.value}>
          <div class="ig-page ig-section-stack ig-alert-detail-page">
            {detail.value ? (
              <>
                <section class="ig-alert-prototype-head">
                  <div class="ig-alert-hero__left">
                    <div class="ig-alert-hero__title">
                      <span class={["ig-alert-level", detail.value.alertInfo.level <= 2 ? "is-danger" : "is-warning"]}>
                        {detail.value.alertInfo.level}级告警
                      </span>
                      <strong>{detail.value.alertInfo.alertTypeName}</strong>
                    </div>
                    <div class="ig-alert-hero__meta">
                      <span>告警时间：{formatTime(detail.value.alertInfo.triggeredAt)}</span>
                      <span>
                        仓房：{detail.value.alertInfo.warehouseName}（{detail.value.alertInfo.grainType || "--"}）
                      </span>
                    </div>
                  </div>
                  <div class="ig-alert-hero__right">
                    <div>
                      <span>告警类型：</span>
                      <strong>{detail.value.alertInfo.alertTypeName}</strong>
                    </div>
                    <div>
                      <span>触发值/阈值：</span>
                      <strong>
                        {detail.value.alertInfo.currentValueText} / {detail.value.alertInfo.thresholdText || "--"}
                      </strong>
                    </div>
                  </div>
                  <div class="ig-alert-hero__status">{renderAlertStatus(detail.value.status)}</div>
                </section>

                <Card title="触发时刻数据快照">{renderSnapshot(detail.value.snapshot)}</Card>

                <Card title="触发趋势（最近48小时）">{renderTrendChart()}</Card>

                <Card title="处置判定" class={canConfirm.value ? "ig-dashed-card" : ""}>
                  {renderJudgementPanel()}
                </Card>

                <Card title="操作日志">
                  <div class="ig-alert-log">
                    {(detail.value.logs ?? []).map((item) => (
                      <div key={`${item.action}-${item.operatedAt}`}>
                        <span>{formatTime(item.operatedAt)}</span>
                        <strong>
                          {item.operatorName || "系统"}：{item.remark || item.action}
                        </strong>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            ) : (
              <Empty description="暂无告警详情" />
            )}
          </div>
        </Spin>
      ),
      "footer-page": (): JSX.Element => (
        <Space>
          <Button onClick={() => router.push({ name: "intelligent-grain-alerts" })}>返回告警列表</Button>
          <Button onClick={load}>刷新</Button>
          {canConfirm.value ? (
            <Button type={judgementResult.value === "REAL" ? "primary" : "default"} loading={submitting.value} onClick={submitJudgement}>
              {judgementResult.value === "REAL" ? "确认处置" : "提交误报"}
            </Button>
          ) : null}
          {detail.value?.status === GrainAlertStatus.PROCESSING || detail.value?.status === GrainAlertStatus.REVIEWING ? (
            <Button type="primary" onClick={() => router.push({ name: "intelligent-grain-alert-disposal", params: { id: alertId.value } })}>
              去处置
            </Button>
          ) : null}
          {detail.value?.status === GrainAlertStatus.CHECKING ? (
            <Button
              type="primary"
              onClick={() => router.push({ name: "intelligent-grain-alert-acceptance", params: { id: alertId.value } })}
            >
              去验收
            </Button>
          ) : null}
        </Space>
      ),
    };

    return (): JSX.Element => <CubeLayout title="告警详情" v-slots={slots} />;
  },
});
