import { ConfigProvider as AntdConfigProvider } from "ant-design-vue/es";
import { Textarea } from "ant-design-vue/es/input";
import zhCN from "ant-design-vue/es/locale/zh_CN";
import { defineComponent, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import type { KnowledgeRetrievalHitItem } from "@ghcloud/cube-ai-application-service";
import { CubeLayout } from "@ghcloud/cube-app-design";
import { InputNumber, message, Spin } from "@ghcloud/cube-ui";

import type { KnowledgeDocumentModel } from "../../../../../knowledge-document/service/src/types";
import { cubeAiApplicationService, cubeKnowledgeDocumentService } from "@/api/service";
import { ThemedSlider } from "@/components/themed-slider/themed-slider";

import styles from "./knowledge-retrieval-test.module.less";

/**
 * Ant Design Vue 4 的 InputNumber 用 CSS-in-JS（useStyle）在运行时注入 input 的 color / fontSize 等，
 * 外部 Less 即使带 #id 也常排在注入样式之前或权重相当，导致「改字色不生效」。
 * 官方途径：ConfigProvider `theme.components.InputNumber` 覆盖组件 token（与全局 `prefixCls` 一致）。
 */
const RECALL_TEST_INPUT_NUMBER_THEME = {
  token: {
    colorTextPlaceholder: "#94a3b8",
  },
  components: {
    InputNumber: {
      colorText: "#64748b",
      fontFamily: "'Source Han Sans CN', 'Noto Sans SC', 'Source Han Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
      fontSize: 14,
      lineHeight: 1,
    },
  },
};

const TOPK_MIN = 1;
const TOPK_MAX = 20;
const DEFAULT_MIN_SIMILARITY = 0.4;

function coerceTopKInput(value: unknown): number {
  if (value === null || value === undefined) {
    return TOPK_MIN;
  }
  if (typeof value === "string" && value.trim() === "") {
    return TOPK_MIN;
  }
  const n = typeof value === "number" ? value : Number.parseFloat(String(value));
  if (!Number.isFinite(n)) {
    return TOPK_MIN;
  }
  return Math.min(Math.max(Math.floor(n), TOPK_MIN), TOPK_MAX);
}

function coerceSimilarityInput(value: unknown): number {
  if (value === null || value === undefined) {
    return DEFAULT_MIN_SIMILARITY;
  }
  if (typeof value === "string" && value.trim() === "") {
    return DEFAULT_MIN_SIMILARITY;
  }
  const n = typeof value === "number" ? value : Number.parseFloat(String(value));
  if (!Number.isFinite(n)) {
    return DEFAULT_MIN_SIMILARITY;
  }
  return Math.min(Math.max(n, 0), 1);
}

function resolveHeadingPath(item: KnowledgeRetrievalHitItem): string {
  const headingPath = item.headingPath ?? item.heading_path;
  if (!Array.isArray(headingPath) || headingPath.length === 0) {
    return "--";
  }
  return headingPath.join(" / ");
}

function getScoreValue(item: KnowledgeRetrievalHitItem): number | null {
  const raw = item.score ?? item.vectorScore ?? item.vector_score ?? item.rankScore ?? item.rank_score;
  if (raw == null) {
    return null;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function resolveScoreLabel(item: KnowledgeRetrievalHitItem): string {
  const score = getScoreValue(item);
  return score == null ? "--" : score.toFixed(4);
}

function filterHitsByMinScore(hits: KnowledgeRetrievalHitItem[], minScore: number): KnowledgeRetrievalHitItem[] {
  return hits.filter((item) => {
    const s = getScoreValue(item);
    if (s == null) {
      return true;
    }
    return s >= minScore;
  });
}

/** 文案中展示相似度阈值：去掉不必要尾零（如 0.40 → 0.4） */
function formatSimilarityForDisplay(n: number): string {
  return String(Number.parseFloat(n.toFixed(4)));
}

function resolveRouteDocumentName(value: unknown): string {
  if (Array.isArray(value)) {
    return String(value[0] ?? "").trim();
  }

  return typeof value === "string" ? value.trim() : "";
}

export const KnowledgeRetrievalTest = defineComponent({
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const bizDocumentId = String(route.params.bizDocumentId ?? "").trim();
    const routeDocumentName = resolveRouteDocumentName(route.query.documentName);
    const pageLoading = ref(false);
    const testLoading = ref(false);
    const documentDetail = ref<KnowledgeDocumentModel | null>(null);
    const rawHits = ref<KnowledgeRetrievalHitItem[]>([]);
    const hasTested = ref(false);
    const previousLayoutContentStyle = {
      overflowY: "",
      display: "",
      flexDirection: "",
      minHeight: "",
    };

    const formState = reactive({
      query: "",
      topK: 5,
      /** 仅前端展示过滤；接口仍按 topK 返回 */
      minSimilarity: DEFAULT_MIN_SIMILARITY,
    });

    watch(
      () => formState.topK,
      (v) => {
        const c = coerceTopKInput(v);
        if (c !== v) {
          formState.topK = c;
        }
      },
      { flush: "sync" },
    );

    watch(
      () => formState.minSimilarity,
      (v) => {
        const c = coerceSimilarityInput(v);
        if (c !== v) {
          formState.minSimilarity = c;
        }
      },
      { flush: "sync" },
    );

    const loadDocumentDetail = async (): Promise<void> => {
      pageLoading.value = true;
      try {
        documentDetail.value = await cubeKnowledgeDocumentService.getKnowledgeDocumentDetails({ id: bizDocumentId });
      } finally {
        pageLoading.value = false;
      }
    };

    const lockLayoutContentScroll = (): void => {
      const layoutContent = document.getElementById("cube-layout-content");
      if (!layoutContent) {
        return;
      }

      previousLayoutContentStyle.overflowY = layoutContent.style.overflowY;
      previousLayoutContentStyle.display = layoutContent.style.display;
      previousLayoutContentStyle.flexDirection = layoutContent.style.flexDirection;
      previousLayoutContentStyle.minHeight = layoutContent.style.minHeight;
      layoutContent.style.overflowY = "hidden";
      layoutContent.style.display = "flex";
      layoutContent.style.flexDirection = "column";
      layoutContent.style.minHeight = "0";
    };

    const restoreLayoutContentScroll = (): void => {
      const layoutContent = document.getElementById("cube-layout-content");
      if (!layoutContent) {
        return;
      }

      layoutContent.style.overflowY = previousLayoutContentStyle.overflowY;
      layoutContent.style.display = previousLayoutContentStyle.display;
      layoutContent.style.flexDirection = previousLayoutContentStyle.flexDirection;
      layoutContent.style.minHeight = previousLayoutContentStyle.minHeight;
    };

    const handleBack = (): void => {
      void router.push({ name: "knowledge-document-list" });
    };

    const handleTest = async (): Promise<void> => {
      const query = formState.query.trim();
      if (!query) {
        message.error("请输入召回测试问题");
        return;
      }
      const topK = Math.min(Math.max(Math.floor(formState.topK), TOPK_MIN), TOPK_MAX);
      formState.topK = topK;
      testLoading.value = true;
      try {
        const result = await cubeAiApplicationService.testKnowledgeDocumentRetrieval(bizDocumentId, {
          query,
          topK,
        });
        rawHits.value = Array.isArray(result.items) ? result.items : [];
        hasTested.value = true;
        message.success("召回测试完成");
      } finally {
        testLoading.value = false;
      }
    };

    onMounted(() => {
      lockLayoutContentScroll();
      void loadDocumentDetail();
    });

    onBeforeUnmount(() => {
      restoreLayoutContentScroll();
    });

    return (): JSX.Element => {
      const documentName = routeDocumentName || documentDetail.value?.name || bizDocumentId || "文档";
      const visibleHits = filterHitsByMinScore(rawHits.value, formState.minSimilarity);
      const thresholdText = formState.minSimilarity.toFixed(2);
      const thresholdDisplayCompact = formatSimilarityForDisplay(formState.minSimilarity);
      /** 已发起测试且列表区无命中（接口 items 为空数组，或全部被相似度阈值过滤） */
      const isNoVisibleHitsAfterTest = hasTested.value && visibleHits.length === 0;

      let emptyText = "输入测试问题后点击「测试」查看命中分段。未分段时接口会返回相应提示。";
      if (isNoVisibleHitsAfterTest) {
        emptyText = `未找到符合阈值的结果，请降低相似度阈值或优化知识库内容。当前阈值：${thresholdDisplayCompact}`;
      }

      return (
        <CubeLayout
          title="召回测试"
          showHeader={false}
          showFooter={false}
          v-slots={{
            "layout-content": () => (
              <div class={styles.pageShell}>
                <div class={styles.page}>
                  <div class={styles.pageHeaderBar}>
                    <button type="button" class={styles.pageHeader} onClick={handleBack}>
                      <span class={styles.backIcon} aria-hidden="true">
                        <svg viewBox="0 0 16 16">
                          <path d="M14 8H3.5"></path>
                          <path d="M7 3.5 2.5 8 7 12.5"></path>
                        </svg>
                      </span>
                      <span class={styles.pageHeaderTitle}>{documentName}</span>
                    </button>
                  </div>

                  <Spin spinning={pageLoading.value}>
                    <div class={styles.content}>
                      <div class={styles.leftPanel}>
                        <div class={styles.settingsCard}>
                          <div class={styles.configForm}>
                            <div class={styles.fieldItem}>
                              <div class={styles.testQuestionLabel}>测试问题</div>
                              <div class={[styles.fieldControl, styles.testQuestionField]}>
                                <Textarea
                                  rows={3}
                                  autoSize={false}
                                  showCount={false}
                                  placeholder="请输入"
                                  value={formState.query}
                                  class={styles.inputBackground}
                                  style={{
                                    resize: "none",
                                    height: "86px",
                                    minHeight: "86px",
                                    maxHeight: "86px",
                                  }}
                                  onUpdate:value={(value: string) => {
                                    formState.query = value ?? "";
                                  }}
                                />
                              </div>
                            </div>

                            {/* 嵌套 Ant ConfigProvider：cube-ui 的封装未声明 theme 类型；此处用 ant 自带组件传 theme.components.InputNumber（CSS-in-JS token） */}
                            <AntdConfigProvider prefixCls="ai-application" locale={zhCN} theme={RECALL_TEST_INPUT_NUMBER_THEME}>
                              <div class={styles.fieldItem}>
                                <div class={styles.topKFieldLabel}>返回条数 (TopK)</div>
                                <div class={styles.topKSliderRow}>
                                  <div class={styles.topKSliderHost}>
                                    <ThemedSlider
                                      value={formState.topK}
                                      onUpdate:value={(v: number) => {
                                        formState.topK = v;
                                      }}
                                      min={TOPK_MIN}
                                      max={TOPK_MAX}
                                      step={1}
                                    />
                                  </div>
                                  <div class={styles.topKInput} data-krt-input-wrap>
                                    <InputNumber
                                      status=""
                                      allowClear={false}
                                      v-model:value={formState.topK}
                                      min={TOPK_MIN}
                                      max={TOPK_MAX}
                                      step={1}
                                      precision={0}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div class={styles.fieldItem}>
                                <div class={styles.topKFieldLabel}>相似度阈值</div>
                                <div class={styles.topKSliderRow}>
                                  <div class={styles.topKSliderHost}>
                                    <ThemedSlider
                                      value={formState.minSimilarity}
                                      onUpdate:value={(v: number) => {
                                        formState.minSimilarity = v;
                                      }}
                                      min={0}
                                      max={1}
                                      step={0.01}
                                    />
                                  </div>
                                  <div class={styles.topKInput} data-krt-input-wrap>
                                    <InputNumber
                                      status=""
                                      allowClear={false}
                                      v-model:value={formState.minSimilarity}
                                      min={0}
                                      max={1}
                                      step={0.01}
                                      precision={2}
                                    />
                                  </div>
                                </div>
                              </div>
                            </AntdConfigProvider>
                          </div>

                          <div class={styles.actionPanel}>
                            <button
                              type="button"
                              class={styles.testButton}
                              disabled={testLoading.value}
                              onClick={() => {
                                void handleTest();
                              }}
                            >
                              {testLoading.value ? "测试中…" : "测试"}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div class={styles.rightPanel}>
                        <div class={styles.resultDetailWrap}>
                          <div class={styles.resultCard}>
                            <div class={styles.resultHeader}>
                              <div>
                                <div class={styles.sectionTitle}>召回结果详情</div>
                                {hasTested.value && (
                                  <div class={styles.resultDesc}>
                                    {`接口返回 ${rawHits.value.length} 条，展示 ${visibleHits.length} 条（≥ ${thresholdText}）`}
                                  </div>
                                )}
                              </div>
                              {hasTested.value && (
                                <div class={styles.statusMeta}>
                                  <div class={styles.statusMetaInner}>
                                    {visibleHits.length} 条匹配（阈值 ≥ {thresholdText}）
                                  </div>
                                </div>
                              )}
                            </div>

                            <div class={styles.resultViewport}>
                              <div class={styles.resultBody}>
                                {visibleHits.length > 0 && (
                                  <div class={styles.hitList}>
                                    {visibleHits.map((item, index) => (
                                      <div key={`${item.chunkId ?? item.chunk_id ?? index}`} class={styles.hitCard}>
                                        <div class={styles.hitToolbar}>
                                          <span class={styles.hitIndex}>TOP {index + 1}</span>
                                          <span class={styles.scoreTag}>分数：{resolveScoreLabel(item)}</span>
                                        </div>
                                        <div class={styles.hitMeta}>
                                          <span>文件：{item.fileName ?? item.file_name ?? documentDetail.value?.name ?? "--"}</span>
                                          <span>分段ID：{item.chunkId ?? item.chunk_id ?? "--"}</span>
                                        </div>
                                        <div class={styles.hitHeading}>标题路径：{resolveHeadingPath(item)}</div>
                                        <div class={styles.hitText}>{item.text?.trim() || "--"}</div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {visibleHits.length === 0 && (
                                  <div
                                    class={[
                                      styles.empty,
                                      !isNoVisibleHitsAfterTest && styles.emptyIdle,
                                      isNoVisibleHitsAfterTest && styles.emptyThreshold,
                                    ]}
                                  >
                                    <span
                                      class={
                                        isNoVisibleHitsAfterTest ? [styles.emptyHintEmphasis, styles.emptyHintThreshold] : styles.emptyHint
                                      }
                                    >
                                      {emptyText}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Spin>
                </div>
              </div>
            ),
          }}
        />
      );
    };
  },
});
