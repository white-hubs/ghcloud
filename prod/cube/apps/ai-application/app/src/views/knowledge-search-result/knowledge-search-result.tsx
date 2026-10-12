import { computed, defineComponent, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import type { KnowledgeSearchHitItem } from "@ghcloud/cube-ai-application-service";
import { SearchOutlined, Spin, message } from "@ghcloud/cube-ui";

import type { KnowledgeDocumentModel } from "../../../../../knowledge-document/service/src/types";
import { saveSearchDetailPayload } from "../knowledge-base/knowledge-search-detail-store";
import { pushSearchHistory } from "../knowledge-base/knowledge-search-history";
import { cubeAiApplicationService, cubeKnowledgeDocumentService } from "@/api/service";

import styles from "./knowledge-search-result.module.less";

const DEFAULT_TOP_K = 20;
const KB_AI_SEARCH_ICON = "/resource/v1/ai-application/kbAiSearch.png";

interface SearchResultCard {
  key: string;
  title: string;
  description: string;
  text: string;
  typeName: string;
  typeId: string;
  documentId: string;
  chunkId: string;
  headingPath: string[] | null;
  score: number | null;
}

function truncateText(value: string, max = 160): string {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max)}…`;
}

function resolveTitle(hit: KnowledgeSearchHitItem, document?: KnowledgeDocumentModel | null): string {
  if (document?.name?.trim()) {
    return document.name.trim();
  }
  if (Array.isArray(hit.headingPath) && hit.headingPath.length > 0) {
    return hit.headingPath.filter(Boolean).join(" / ");
  }
  if (hit.text?.trim()) {
    return truncateText(hit.text, 36);
  }
  return "未命名知识";
}

/** 安全智库搜索结果页：调用 AI Center kb.search，展示命中内容与分类名称 */
export const KnowledgeSearchResult = defineComponent({
  setup: () => {
    const router = useRouter();
    const route = useRoute();
    const keyword = ref("");
    const loading = ref(false);
    const cards = ref<SearchResultCard[]>([]);

    const resultCount = computed(() => cards.value.length);

    const loadDocumentMeta = async (documentIds: string[]): Promise<Map<string, KnowledgeDocumentModel>> => {
      const uniqueIds = [...new Set(documentIds.filter(Boolean))];
      const map = new Map<string, KnowledgeDocumentModel>();
      if (uniqueIds.length === 0) {
        return map;
      }
      const settled = await Promise.allSettled(
        uniqueIds.map(async (id) => {
          const detail = await cubeKnowledgeDocumentService.getKnowledgeDocumentDetails({ id });
          return detail;
        }),
      );
      for (const item of settled) {
        if (item.status === "fulfilled" && item.value?.id) {
          map.set(item.value.id, item.value);
        }
      }
      return map;
    };

    const runSearch = async (rawKeyword: string): Promise<void> => {
      const query = rawKeyword.trim();
      keyword.value = query;
      if (!query) {
        cards.value = [];
        message.warning("请输入搜索关键词");
        return;
      }

      loading.value = true;
      try {
        pushSearchHistory(query);
        const result = await cubeAiApplicationService.searchKnowledge({
          query,
          topK: DEFAULT_TOP_K,
        });
        const hits = Array.isArray(result.items) ? result.items : [];
        const metaMap = await loadDocumentMeta(hits.map((hit) => hit.documentId ?? "").filter(Boolean));
        cards.value = hits.map((hit, index) => {
          const documentId = hit.documentId ?? "";
          const document = documentId ? metaMap.get(documentId) : undefined;
          const text = hit.text ?? "";
          return {
            key: hit.chunkId || `${documentId}-${index}`,
            title: resolveTitle(hit, document),
            description: truncateText(text),
            text,
            typeName: document?.typeName?.trim() || "--",
            typeId: document?.typeId ?? "",
            documentId,
            chunkId: hit.chunkId ?? "",
            headingPath: Array.isArray(hit.headingPath) ? hit.headingPath : null,
            score: hit.score ?? null,
          };
        });
      } catch {
        cards.value = [];
      } finally {
        loading.value = false;
      }
    };

    const syncKeywordFromRoute = (): string => {
      const value = typeof route.query.keyword === "string" ? route.query.keyword.trim() : "";
      keyword.value = value;
      return value;
    };

    const handleSearch = (): void => {
      const value = keyword.value.trim();
      if (!value) {
        message.warning("请输入搜索关键词");
        return;
      }
      void router.replace({
        name: "knowledge-search-result",
        query: { keyword: value },
      });
    };

    const handleBack = (): void => {
      void router.push({ name: "knowledge-base" });
    };

    const handleOpenCard = (card: SearchResultCard): void => {
      saveSearchDetailPayload({
        title: card.title,
        text: card.text,
        typeName: card.typeName,
        keyword: keyword.value.trim(),
        documentId: card.documentId,
        chunkId: card.chunkId,
        headingPath: card.headingPath,
      });
      void router.push({
        name: "knowledge-search-detail",
        query: {
          ...(keyword.value.trim() ? { keyword: keyword.value.trim() } : {}),
          ...(card.chunkId ? { chunkId: card.chunkId } : {}),
          ...(card.documentId ? { documentId: card.documentId } : {}),
        },
      });
    };

    watch(
      () => route.query.keyword,
      () => {
        const value = syncKeywordFromRoute();
        if (value) {
          void runSearch(value);
        } else {
          cards.value = [];
        }
      },
      { immediate: true },
    );

    return (): JSX.Element => (
      <div class={styles.page}>
        <div class={styles.hero}>
          <h1 class={styles.title}>
            <span class={styles.titleBrand}>安全智库</span>
            <span class={styles.titleRest}>‑搜索结果</span>
          </h1>

          <div class={styles.searchBar}>
            <div class={styles.searchMode}>
              <img class={styles.aiSearchIcon} src={KB_AI_SEARCH_ICON} alt="" aria-hidden />
              <span class={styles.searchModeText}>智能搜索</span>
            </div>
            <div class={styles.searchDivider} aria-hidden />
            <div class={styles.searchInputWrap}>
              <input
                class={styles.searchInput}
                value={keyword.value}
                placeholder="请您输入搜索关键词,多词用空格隔开"
                onInput={(event: Event) => {
                  keyword.value = (event.target as HTMLInputElement).value;
                }}
                onKeydown={(event: KeyboardEvent) => {
                  if (event.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
            </div>
            <button type="button" class={styles.searchButton} onClick={handleSearch}>
              <SearchOutlined class={styles.searchButtonIcon} />
              <span>搜索</span>
            </button>
          </div>
        </div>

        <div class={styles.content}>
          <div class={styles.resultHeader}>
            <div class={styles.resultTitle}>
              共搜索到 <span class={styles.resultCount}>{resultCount.value}</span> 条相关知识库内容
            </div>
            <button type="button" class={styles.backButton} onClick={handleBack}>
              ← 返回智库首页
            </button>
          </div>

          <Spin spinning={loading.value}>
            {cards.value.length > 0 ? (
              <div class={styles.resultList}>
                {cards.value.map((card) => (
                  <article key={card.key} class={styles.resultCard}>
                    <button type="button" class={styles.resultName} onClick={() => handleOpenCard(card)}>
                      {card.title}
                    </button>
                    <p class={styles.resultDesc}>{card.description || "暂无摘要"}</p>
                    <span class={styles.resultTag}>{card.typeName}</span>
                  </article>
                ))}
              </div>
            ) : (
              <div class={styles.empty}>{loading.value ? "搜索中..." : "暂无相关知识库内容"}</div>
            )}
          </Spin>
        </div>
      </div>
    );
  },
});
