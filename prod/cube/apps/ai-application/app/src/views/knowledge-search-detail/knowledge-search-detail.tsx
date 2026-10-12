import { computed, defineComponent, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { readSearchDetailPayload, type KnowledgeSearchDetailPayload } from "../knowledge-base/knowledge-search-detail-store";

import styles from "./knowledge-search-detail.module.less";

function splitParagraphs(text: string): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return [];
  }
  return normalized
    .split(/\n{2,}|\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/** 安全智库搜索段落详情：仅展示命中的这一段内容 */
export const KnowledgeSearchDetail = defineComponent({
  setup: () => {
    const router = useRouter();
    const route = useRoute();
    const payload = ref<KnowledgeSearchDetailPayload | null>(null);
    const highlight = ref(true);

    const paragraphs = computed(() => splitParagraphs(payload.value?.text ?? ""));
    const sectionTitle = computed(() => {
      const heading = Array.isArray(payload.value?.headingPath) ? payload.value?.headingPath.filter(Boolean).join(" / ") : "";
      return heading || payload.value?.title || "段落详情";
    });

    const handleBack = (): void => {
      const keyword = payload.value?.keyword || (typeof route.query.keyword === "string" ? route.query.keyword : "");
      void router.push({
        name: "knowledge-search-result",
        query: keyword ? { keyword } : undefined,
      });
    };

    onMounted(() => {
      payload.value = readSearchDetailPayload();
      window.setTimeout(() => {
        highlight.value = false;
      }, 1800);
    });

    return (): JSX.Element => (
      <div class={styles.page}>
        <div class={styles.hero}>
          <h1 class={styles.title}>
            <span class={styles.titleBrand}>安全智库</span>
            <span class={styles.titleRest}>‑详情</span>
          </h1>
        </div>

        <div class={styles.content}>
          <div class={styles.detailHeader}>
            <div class={styles.detailTitle}>{payload.value?.title || "内容标题"}</div>
            <button type="button" class={styles.backButton} onClick={handleBack}>
              ← 返回搜索结果
            </button>
          </div>

          {payload.value?.typeName ? <span class={styles.tag}>{payload.value.typeName}</span> : null}

          {payload.value ? (
            <div class={[styles.detailSection, highlight.value ? styles.highlightTarget : undefined]}>
              <h3 class={styles.sectionTitle}>{sectionTitle.value}</h3>
              {paragraphs.value.length > 0 ? (
                paragraphs.value.map((item, index) => (
                  <p key={`${index}-${item.slice(0, 12)}`} class={styles.sectionParagraph}>
                    {item}
                  </p>
                ))
              ) : (
                <p class={styles.sectionParagraph}>暂无段落内容</p>
              )}
            </div>
          ) : (
            <div class={styles.empty}>未找到段落详情，请返回搜索结果重新打开</div>
          )}
        </div>
      </div>
    );
  },
});
