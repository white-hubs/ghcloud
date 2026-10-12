import { computed, defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import {
  GrainDimension,
  GrainHealthLevel,
  type GrainArchiveDetail,
  type GrainMetricValue,
  type GrainQualityPrediction,
  type GrainRiskPrediction,
} from "@ghcloud/cube-service-interface/intelligent-grain";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { getIntelligentGrainArchive } from "@ghcloud/cube-services-client/intelligent-grain.client";
import { Button, Empty, Space, Spin, Tag, message } from "@ghcloud/cube-ui";

import { useArchiveWarehouse } from "@/views/archive/use-archive-warehouse";
import { IntelligentGrainWarehouseSelector } from "@/views/archive/warehouse-selector";
import { formatMetric, formatTime, HEALTH_COLOR } from "@/views/shared/view-utils";

import "@/views/shared/intelligent-grain.less";

function metricValue(metric?: GrainMetricValue): string {
  return formatMetric(metric);
}

function numberText(value?: number | null, maximumFractionDigits = 0): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "--";
  }
  return value.toLocaleString("zh-CN", { maximumFractionDigits });
}

function valueWithUnit(value: number | undefined | null, unit: string, maximumFractionDigits = 0): string {
  const text = numberText(value, maximumFractionDigits);
  return text === "--" ? text : `${text}${unit}`;
}

function storageText(quality?: GrainQualityPrediction, grainType?: string): string {
  const month = quality?.storageMonths;
  const monthText = month === undefined || month === null ? "--" : `${Math.max(0, Math.round(month))}月`;
  return `${quality?.grainType || grainType || "--"}${monthText === "--" ? "" : monthText}`;
}

function yearMonthText(value?: string): string {
  if (!value) {
    return "--";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

const RADAR_DIMENSIONS = [
  { dimension: GrainDimension.TEMPERATURE, label: "温度" },
  { dimension: GrainDimension.STORAGE, label: "储量" },
  { dimension: GrainDimension.PEST, label: "虫害" },
  { dimension: GrainDimension.QUALITY, label: "品质" },
  { dimension: GrainDimension.HUMIDITY, label: "湿度" },
  { dimension: GrainDimension.GAS, label: "气体" },
];

export const IntelligentGrainArchiveDetail = defineComponent({
  name: "IntelligentGrainArchiveDetail",
  setup: () => {
    const router = useRouter();
    const loading = ref(false);
    const archive = ref<GrainArchiveDetail>();
    const { warehouseLoading, warehouseOptions, selectedWarehouseId, loadWarehouses, changeWarehouse } = useArchiveWarehouse();

    const metricCards = computed(() => {
      const metrics = archive.value?.metrics ?? {};
      return [
        {
          key: "temperature",
          label: "温度",
          metric: metrics.temperature,
          hint: metrics.temperature?.status === "ALARM" ? "上升中" : "持平",
        },
        { key: "storage", label: "储量", metric: metrics.storage, hint: metrics.storage?.status === "ALARM" ? "较上次异常" : "库存稳定" },
        { key: "humidity", label: "湿度", metric: metrics.humidity, hint: metrics.humidity?.status === "ALARM" ? "超出区间" : "持平" },
        { key: "gas", label: "气体", metric: metrics.gas, hint: metrics.gas?.status === "ALARM" ? "需要复核" : "正常" },
      ];
    });

    const readyScores = computed(
      () => archive.value?.health.dimensionScores.filter((item) => item.ready && item.score !== undefined && item.score !== null) ?? [],
    );
    const healthScore = computed(() => {
      if (archive.value?.health.score !== undefined && archive.value.health.score !== null) {
        return archive.value.health.score;
      }
      if (readyScores.value.length === 0) {
        return undefined;
      }
      return Math.round(readyScores.value.reduce((sum, item) => sum + (item.score ?? 0), 0) / readyScores.value.length);
    });
    const healthText = computed(() => {
      if (!archive.value) {
        return "--";
      }
      if (archive.value.health.level === GrainHealthLevel.DANGER) {
        return "危险";
      }
      if (archive.value.health.level === GrainHealthLevel.WARN) {
        return "关注";
      }
      return "健康";
    });
    const radarAxis = computed(() => {
      const scores = archive.value?.health.dimensionScores ?? [];
      const cx = 210;
      const cy = 160;
      const radius = 118;
      const labelRadius = 142;
      return RADAR_DIMENSIONS.map((config, index) => {
        const item = scores.find((score) => score.dimension === config.dimension);
        const ready = Boolean(item?.ready && item.score !== undefined && item.score !== null);
        const value = ready ? Math.max(0, Math.min(100, item?.score ?? 0)) : 0;
        const angle = -Math.PI / 2 + (Math.PI * 2 * index) / RADAR_DIMENSIONS.length;
        return {
          key: config.dimension,
          label: ready ? `${config.label} ${Math.round(value)}` : `${config.label}(未载入)`,
          value,
          ready,
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius,
          labelX: cx + Math.cos(angle) * labelRadius,
          labelY: cy + Math.sin(angle) * labelRadius,
        };
      });
    });
    const radarPoints = computed(() => {
      const cx = 210;
      const cy = 160;
      return radarAxis.value
        .filter((item) => item.ready)
        .map((item) => {
          const ratio = Math.max(0, Math.min(100, item.value)) / 100;
          return `${cx + (item.x - cx) * ratio},${cy + (item.y - cy) * ratio}`;
        })
        .join(" ");
    });
    const riskCards = computed<GrainRiskPrediction[]>(() => archive.value?.riskPredictions?.slice(0, 3) ?? []);
    const qualityPrediction = computed(() => archive.value?.qualityPrediction);
    const archiveGrainName = computed(() => archive.value?.grainVarietyName || archive.value?.grainType || "");
    const qualityProgress = computed(() => {
      const estimate = qualityPrediction.value?.currentFattyAcidEstimate;
      const threshold = qualityPrediction.value?.unsuitableThreshold;
      if (estimate === undefined || estimate === null || !threshold) {
        return 0;
      }
      return Math.max(4, Math.min(100, (estimate / threshold) * 100));
    });

    const load = async (warehouseId = selectedWarehouseId.value): Promise<void> => {
      if (!warehouseId) {
        archive.value = undefined;
        return;
      }
      loading.value = true;
      try {
        archive.value = await useAuthRequest(() => getIntelligentGrainArchive(warehouseId));
      } catch (error) {
        message.error((error as Error).message || "加载档案详情失败");
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      void loadWarehouses()
        .then((warehouseId) => load(warehouseId))
        .catch((error: unknown) => {
          message.error((error as Error).message || "加载仓房列表失败");
        });
    });

    const slots = {
      "layout-header": (): JSX.Element => (
        <Space>
          <IntelligentGrainWarehouseSelector
            value={selectedWarehouseId.value}
            options={warehouseOptions.value}
            loading={warehouseLoading.value}
            onChange={(value: string) => {
              void changeWarehouse(value).then(() => load(value));
            }}
          />
        </Space>
      ),
      "layout-content": (): JSX.Element => (
        <Spin spinning={loading.value}>
          <div class="ig-page ig-archive-detail-page">
            {archive.value ? (
              <>
                <section class="ig-archive-hero">
                  <div>
                    <h2>{archive.value.warehouseName} · 粮情档案</h2>
                    <p>
                      品种：{archiveGrainName.value || "--"} <span /> 入库：{archive.value.inboundDate || "--"} <span /> 最近扫描：
                      {formatTime(archive.value.latestScanTime)}
                    </p>
                  </div>
                  <Tag color={HEALTH_COLOR[archive.value.health.level]}>
                    {healthScore.value ?? "--"}分 · {healthText.value}
                  </Tag>
                </section>

                <section class="ig-archive-metric-row">
                  {metricCards.value.map((item) => (
                    <div class={`ig-archive-metric-card is-${item.key}`} key={item.key}>
                      <span>{item.label}</span>
                      <strong>{metricValue(item.metric)}</strong>
                      <em>{item.hint}</em>
                    </div>
                  ))}
                </section>

                <section class="ig-archive-panel-card">
                  <h3>健康度雷达图</h3>
                  <div class="ig-archive-radar">
                    <svg viewBox="0 0 420 330" role="img" aria-label="健康度雷达图">
                      {[0.2, 0.4, 0.6, 0.8, 1].map((ratio) => (
                        <polygon
                          key={ratio}
                          points={radarAxis.value
                            .map((axis) => `${210 + (axis.x - 210) * ratio},${160 + (axis.y - 160) * ratio}`)
                            .join(" ")}
                          class="ig-archive-radar__grid"
                        />
                      ))}
                      {radarAxis.value.map((axis) => (
                        <line key={axis.key} x1="210" y1="160" x2={axis.x} y2={axis.y} class="ig-archive-radar__line" />
                      ))}
                      {radarPoints.value ? <polygon points={radarPoints.value} class="ig-archive-radar__shape" /> : null}
                      <text x="210" y="154" text-anchor="middle" class="ig-archive-radar__score">
                        {healthScore.value ?? "--"}
                      </text>
                      <text x="210" y="178" text-anchor="middle" class="ig-archive-radar__label">
                        综合评分 · {healthText.value}
                      </text>
                      {radarAxis.value.map((axis) => (
                        <text
                          key={axis.key}
                          x={axis.labelX}
                          y={axis.labelY}
                          text-anchor="middle"
                          class={["ig-archive-radar__axis", axis.ready ? "" : "is-missing"]}
                        >
                          {axis.label}
                        </text>
                      ))}
                    </svg>
                    <p>六维度加权：温度30% | 储量20% | 虫害10% | 品质15% | 湿度15% | 气体10%</p>
                  </div>
                </section>

                <section class="ig-archive-ai-card is-blue">
                  <h3>AI通风策略推荐</h3>
                  <p>仓外气温、湿度、仓内粮温和粮情状态按规则研判。</p>
                  <div class="ig-archive-ai-highlight">
                    <strong>{archive.value.ventilationSuggestion?.summary ?? "暂无通风建议"}</strong>
                    <span>{archive.value.ventilationSuggestion?.suggestions?.join("；") || "建议持续监测仓内温湿度变化。"}</span>
                  </div>
                </section>

                <section class="ig-archive-ai-card is-green ig-quality-prediction-card">
                  <h3>AI品质预测</h3>
                  <div class="ig-quality-prediction-metrics">
                    <div>
                      <span>品种/已储</span>
                      <strong>{storageText(qualityPrediction.value, archiveGrainName.value)}</strong>
                    </div>
                    <div>
                      <span>累计积温</span>
                      <strong>{valueWithUnit(qualityPrediction.value?.accumulatedTemperature, "℃·天")}</strong>
                    </div>
                    <div>
                      <span>脂肪酸估值</span>
                      <strong class="is-warning">
                        {valueWithUnit(qualityPrediction.value?.currentFattyAcidEstimate, "mgKOH/100g", 1)}
                      </strong>
                    </div>
                    <div>
                      <span>月均衰减</span>
                      <strong>{numberText(qualityPrediction.value?.monthlyDecayRate, 1)}</strong>
                    </div>
                    <div>
                      <span>预计不宜存</span>
                      <strong class="is-warning">{yearMonthText(qualityPrediction.value?.expectedUnsuitableDate)}</strong>
                    </div>
                  </div>
                  <div class="ig-quality-prediction-scale">
                    <span class="is-safe">宜存</span>
                    <div class="ig-quality-prediction-track">
                      <i style={{ width: `${qualityProgress.value}%` }} />
                      <b style={{ left: `${qualityProgress.value}%` }} />
                    </div>
                    <span class="is-light">轻度不宜存</span>
                    <span class="is-heavy">重度不宜存</span>
                  </div>
                  <div class="ig-quality-prediction-current">
                    ↑ 当前估值（{qualityPrediction.value?.precisionNote ?? "基于积温推算，精度±3个月"}）
                  </div>
                  <p class="ig-quality-prediction-summary">
                    {qualityPrediction.value?.summary ?? "品质维度基于积温推算（精度±3个月），待接入化验室实测数据后可校准。"}
                  </p>
                </section>

                <section class="ig-archive-panel-card ig-risk-prediction-panel">
                  <h3>
                    <span class="ig-risk-prediction-panel__icon">🔮</span>
                    AI风险预测
                  </h3>
                  <div class="ig-archive-risk-grid">
                    {riskCards.value.map((item, index) => (
                      <div
                        class={[
                          "ig-archive-risk-card",
                          `is-${index}`,
                          item.type ? `is-${String(item.type).toLowerCase()}` : "",
                          item.badgeLevel ? `is-level-${item.badgeLevel}` : "",
                        ]}
                        key={`${item.type || index}-${item.title}`}
                      >
                        <div class="ig-archive-risk-card__head">
                          <div class="ig-archive-risk-card__title">
                            {item.icon ? <span>{item.icon}</span> : null}
                            <strong>{item.title}</strong>
                          </div>
                          {item.badgeText ? <em>{item.badgeText}</em> : null}
                        </div>
                        <div class="ig-archive-risk-card__metrics">
                          {item.metrics.map((metric) => (
                            <div key={`${item.title}-${metric.label}`}>
                              <span>{metric.label}</span>
                              <strong class={metric.highlight ? "is-highlight" : ""}>{metric.value}</strong>
                            </div>
                          ))}
                        </div>
                        <p>{item.conclusion || item.summary}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            ) : (
              <Empty description="暂无档案数据" />
            )}
          </div>
        </Spin>
      ),
      "footer-page": (): JSX.Element => (
        <Space>
          <Button onClick={() => history.back()}>返回</Button>
          <Button onClick={() => void load()}>刷新</Button>
          <Button
            onClick={() => router.push({ name: "intelligent-grain-archive-trend", query: { warehouseId: selectedWarehouseId.value } })}
          >
            趋势曲线
          </Button>
          <Button
            onClick={() => router.push({ name: "intelligent-grain-archive-records", query: { warehouseId: selectedWarehouseId.value } })}
          >
            数据明细
          </Button>
        </Space>
      ),
    };

    return (): JSX.Element => <CubeLayout title="档案详情" v-slots={slots} />;
  },
});
