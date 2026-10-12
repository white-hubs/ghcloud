import { defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { ClockCircleOutlined, SearchOutlined, message } from "@ghcloud/cube-ui";

import type { KnowledgeDocumentTypeModel } from "../../../../../knowledge-document/service/src/types";
import { pushSearchHistory, readSearchHistory } from "./knowledge-search-history";
import { cubeKnowledgeDocumentService } from "@/api/service";

import styles from "./knowledge-base.module.less";

const KB_AI_SEARCH_ICON = "/resource/v1/ai-application/kbAiSearch.png";

/** 知识库首页：安全智库检索入口 + 1级类型卡片 */
export const KnowledgeBase = defineComponent({
  setup: () => {
    const router = useRouter();
    const loading = ref(false);
    const types = ref<KnowledgeDocumentTypeModel[]>([]);
    const keyword = ref("");
    const searchHistory = ref<string[]>(readSearchHistory());

    const loadTypes = async (): Promise<void> => {
      loading.value = true;
      try {
        const response = await cubeKnowledgeDocumentService.getKnowledgeTypeTreeList();
        types.value = (Array.isArray(response) ? response : []).filter((item) => !item.parentId);
      } finally {
        loading.value = false;
      }
    };

    const goDocuments = (item: KnowledgeDocumentTypeModel): void => {
      if (!item.id) {
        return;
      }
      void router.push({
        name: "knowledge-document-list",
        query: { typeId: item.id },
      });
    };

    const handleSearch = (raw?: string): void => {
      const value = (raw ?? keyword.value).trim();
      if (!value) {
        message.warning("请输入搜索关键词");
        return;
      }
      keyword.value = value;
      searchHistory.value = pushSearchHistory(value, searchHistory.value);
      void router.push({
        name: "knowledge-search-result",
        query: { keyword: value },
      });
    };

    onMounted(() => {
      void loadTypes();
    });

    return (): JSX.Element => (
      <div class={styles.page}>
        <div class={styles.hero}>
          <h1 class={styles.title}>
            <span class={styles.titleBrand}>安全智库</span>
            <span class={styles.titleRest}>，AI安全助手帮你智能检索相关信息</span>
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
            <button type="button" class={styles.searchButton} onClick={() => handleSearch()}>
              <SearchOutlined class={styles.searchButtonIcon} />
              <span>搜索</span>
            </button>
          </div>

          <div class={styles.searchHistory}>
            <ClockCircleOutlined class={styles.historyIcon} />
            <span class={styles.historyLabel}>搜索记录:</span>
            {searchHistory.value.length > 0 ? (
              <div class={styles.historyList}>
                {searchHistory.value.map((item, index) => (
                  <span key={item} class={styles.historyItemGroup}>
                    {index > 0 ? (
                      <span class={styles.historySep} aria-hidden>
                        |
                      </span>
                    ) : null}
                    <button
                      type="button"
                      class={styles.historyItem}
                      onClick={() => {
                        handleSearch(item);
                      }}
                    >
                      {item}
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div class={styles.content}>
          {loading.value ? (
            <div class={styles.empty}>加载中...</div>
          ) : types.value.length > 0 ? (
            <div class={styles.typeGrid}>
              {types.value.map((item) => (
                <button key={item.id} type="button" class={styles.typeCard} onClick={() => goDocuments(item)}>
                  <div class={styles.typeMain}>
                    <div class={styles.typeName}>{item.name || "--"}</div>
                    <div class={styles.typeCount}>{item.entryCount ?? 0}条</div>
                    <div class={styles.typeStats}>
                      {(item.entryCount30d ?? 0) > 0 ? (
                        <span class={styles.typeStatsGrowth} aria-hidden />
                      ) : (
                        <span class={styles.typeStatsEmpty} aria-hidden />
                      )}
                      <span class={styles.typeStatsText}>近30天新增{item.entryCount30d ?? 0}条</span>
                    </div>
                  </div>
                  <div class={styles.typeIconWrap}>
                    {item.icon?.path ? (
                      <img class={styles.typeIcon} src={item.icon.path} alt="" />
                    ) : (
                      <div class={styles.typeIconFallback}>{(item.name ?? "知").slice(0, 1)}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div class={styles.empty}>暂无分类</div>
          )}
        </div>
      </div>
    );
  },
});
