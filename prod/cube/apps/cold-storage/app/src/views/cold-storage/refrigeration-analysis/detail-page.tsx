import { computed, defineComponent, onMounted, ref, shallowRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type { ColdStoreMonitorTrend, ColdStoreRefrigerationUnitDetail } from "@ghcloud/cube-service-interface/cold-storage";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { getColdStoreRefrigerationUnitDetail } from "@ghcloud/cube-services-client/cold-storage.client";
import { Button, Empty, Spin } from "@ghcloud/cube-ui";

import { AiCard, MiniLineChart, StatGrid } from "../shared/components";
import { goBack } from "../shared/page";

import "./index.less";

const displayText = (value?: string | number | null): string => {
  if (value == null || value === "") {
    return "--";
  }
  return String(value);
};

const healthTone = (level?: string, score = 0): "green" | "orange" | "red" => {
  if (level === "WARNING" || score < 75) {
    return "red";
  }
  if (level === "WATCH" || score < 85) {
    return "orange";
  }
  return "green";
};

const toTrendLine = (trend: ColdStoreMonitorTrend): string => {
  const values = trend.points.map((point) => Number(point.value)).filter((value) => Number.isFinite(value));
  if (values.length === 0) {
    return "";
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((value, index) => {
      const x = values.length === 1 ? 200 : 16 + (index / (values.length - 1)) * 368;
      const y = 104 - ((value - min) / span) * 88;
      return `${Math.round(x)},${Math.round(y)}`;
    })
    .join(" ");
};

export const RefrigerationAnalysisDetailPage = defineComponent({
  name: "RefrigerationAnalysisDetailPage",
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const loading = shallowRef(false);
    const detail = ref<ColdStoreRefrigerationUnitDetail | null>(null);
    const unitCode = computed(() => {
      const value = route.query.id;
      return Array.isArray(value) ? (value[0] ?? "") : String(value ?? "");
    });

    const loadDetail = async (): Promise<void> => {
      if (!unitCode.value) {
        detail.value = null;
        return;
      }
      loading.value = true;
      try {
        detail.value = await useAuthRequest(() => getColdStoreRefrigerationUnitDetail(unitCode.value));
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      void loadDetail();
    });

    watch(unitCode, () => {
      void loadDetail();
    });

    const parameterScores = computed(() => detail.value?.parameterScores ?? []);
    const trendLines = computed(() => (detail.value?.trends ?? []).map(toTrendLine).filter(Boolean));
    const aiText = computed(() => {
      const current = detail.value;
      if (!current) {
        return "";
      }
      const suggestions = current.maintenanceSuggestions.length ? ` 维护建议：${current.maintenanceSuggestions.join("；")}` : "";
      return current.aiDiagnosis || current.diagnosis || suggestions
        ? `${current.aiDiagnosis || current.diagnosis || "暂无 AI 诊断"}${suggestions}`
        : "暂无 AI 诊断";
    });

    const content = (): JSX.Element => (
      <div class="cs-page refrigeration-detail-page">
        <Spin spinning={loading.value}>
          {detail.value ? (
            <div class="panel-stack">
              <div class="cs-detail-title">
                <h2>{displayText(detail.value.unitName)} 健康详情</h2>
              </div>
              <div class="health-detail">
                <div class="score-gauge">
                  <b>{detail.value.healthScore ?? "--"}</b>
                  <span>综合评分</span>
                </div>
                <div class="bar-list">
                  {parameterScores.value.map((item) => (
                    <div class="bar-row" key={item.code || item.name}>
                      <span>{item.name || item.code || "--"}</span>
                      <i>
                        <em style={{ width: `${item.score ?? 0}%` }} />
                      </i>
                      <b>{item.score ?? "--"}</b>
                    </div>
                  ))}
                </div>
              </div>
              <StatGrid
                items={[
                  { label: "AI剩余寿命", value: displayText(detail.value.remainingLife), tone: "orange" },
                  {
                    label: "运行趋势",
                    value: displayText(detail.value.trendName || detail.value.trend),
                    tone: detail.value.trend === "DECLINING" ? "orange" : "green",
                  },
                  {
                    label: "故障预测",
                    value: displayText(detail.value.diagnosis),
                    tone: healthTone(detail.value.healthLevel, detail.value.healthScore),
                  },
                  { label: "置信度", value: displayText(detail.value.diagnosisConfidence), tone: "blue" },
                ]}
              />
              {detail.value.runtimeMetrics.length ? (
                <StatGrid
                  items={detail.value.runtimeMetrics.map((item) => ({
                    label: item.name || item.code || "--",
                    value: `${displayText(item.value)}${item.unit ?? ""}`,
                    tone: "blue",
                  }))}
                />
              ) : null}
              <AiCard title="AI知识图谱推理" text={aiText.value} badge="根因分析" />
              {trendLines.value.length ? (
                <MiniLineChart
                  title="近7天参数趋势"
                  tone={healthTone(detail.value.healthLevel, detail.value.healthScore)}
                  lines={trendLines.value}
                />
              ) : null}
            </div>
          ) : (
            <Empty description="未找到制冷机组详情" />
          )}
        </Spin>
      </div>
    );

    return () => (
      <CubeLayout
        title="制冷机组详情"
        showFooter
        v-slots={{
          "layout-content": content,
          "footer-page": () => <Button onClick={() => goBack(router, { name: "refrigeration-analysis" })}>返回</Button>,
        }}
      />
    );
  },
});
