import { DropdownItem, DropdownMenu, List, PullRefresh, Search, Tag, showToast } from "vant";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import type { OpinionVO, Sentiment } from "@ghcloud/cube-service-interface/security-opinion";

import { Bar } from "@/components/bar/bar";
import { PAGE_SIZE, PUSH_STATUS_LABEL, SENTIMENT_LABEL, WARNING_LEVEL_LABEL, WARNING_LEVEL_TAG } from "@/constants";
import { securityOpinionApi } from "@/services/security-opinion-api";
import { formatDateTime } from "@/utils/format-datetime";

import styles from "./opinion-list.module.less";

const SENTIMENT_OPTIONS: Array<{ label: string; value: Sentiment | "" }> = [
  { label: "全部", value: "" },
  { label: "正面", value: "positive" },
  { label: "中性", value: "neutral" },
  { label: "负面", value: "negative" },
];

function opinionKey(item: OpinionVO): string {
  const raw = item as OpinionVO & { id?: string | number; opinionId?: string | number };
  const id = raw.id ?? raw.opinionId;
  return id === undefined || id === null || id === "" ? "" : String(id);
}

export const OpinionListPage = defineComponent({
  name: "OpinionListPage",
  setup() {
    const router = useRouter();
    const rows = ref<OpinionVO[]>([]);
    const refreshing = ref(false);
    const loading = ref(false);
    const finished = ref(false);
    const pageNumber = ref(1);
    const total = ref(0);
    const requestSeq = ref(0);

    const filters = reactive({
      keyword: "",
      sentiment: "" as Sentiment | "",
    });

    const loadList = async (resetPage = false): Promise<void> => {
      if (loading.value && !resetPage) return;
      const seq = requestSeq.value + 1;
      requestSeq.value = seq;
      if (resetPage) {
        pageNumber.value = 1;
        total.value = 0;
        rows.value = [];
        finished.value = false;
      }
      loading.value = true;
      const currentPage = pageNumber.value;
      try {
        const result = await securityOpinionApi.pageOpinions({
          pageNumber: currentPage,
          pageSize: PAGE_SIZE,
          keyword: filters.keyword.trim() || undefined,
          sentiment: filters.sentiment || undefined,
        });
        if (seq !== requestSeq.value) return;
        total.value = result.total ?? 0;
        rows.value = resetPage ? result.records : [...rows.value, ...result.records];
        pageNumber.value = currentPage + 1;
        finished.value = (total.value > 0 && rows.value.length >= total.value) || result.records.length < PAGE_SIZE;
      } finally {
        if (seq === requestSeq.value) {
          loading.value = false;
          refreshing.value = false;
        }
      }
    };

    const reset = (): void => {
      filters.keyword = "";
      filters.sentiment = "";
      void loadList(true);
    };

    const onRefresh = async (): Promise<void> => {
      refreshing.value = true;
      await loadList(true);
    };

    onMounted(() => {
      document.title = "舆情列表";
      void loadList(true);
    });

    const levelTag = (item: OpinionVO): JSX.Element =>
      item.warningLevel ? (
        <Tag type={WARNING_LEVEL_TAG[String(item.warningLevel).toUpperCase()] ?? "primary"} plain>
          {item.warningLevelText || WARNING_LEVEL_LABEL[String(item.warningLevel).toUpperCase()] || item.warningLevel}
        </Tag>
      ) : (
        <span>-</span>
      );

    const openDetail = (item: OpinionVO): void => {
      const id = opinionKey(item);
      if (!id) {
        showToast("缺少舆情ID，无法查看详情");
        return;
      }
      void router.push(`/opinions/${id}`);
    };

    const renderCard = (item: OpinionVO): JSX.Element => (
      <div key={opinionKey(item) || item.title} class={styles.card} onClick={() => openDetail(item)}>
        <div class={styles.cardHeader}>
          <div class={styles.title}>{item.title}</div>
          {levelTag(item)}
        </div>
        <div class={styles.summary}>{item.summary || item.content || "-"}</div>
        <div class={styles.metaGrid}>
          <span>来源：{item.source || "-"}</span>
          <span>情感：{SENTIMENT_LABEL[item.sentiment]}</span>
          <span>热度：{item.heatIndex ?? "-"}</span>
          <span>推送：{item.pushStatusText || PUSH_STATUS_LABEL[String(item.pushStatus ?? "")] || "-"}</span>
        </div>
        <div class={styles.cardFooter}>
          <span>{formatDateTime(item.alertTime || item.collectedAt)}</span>
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class={styles.page}>
        <Bar name="舆情列表" isShowRight={false} onReset={reset} onSubmit={() => void loadList(true)} />
        <div class={styles.searchBar}>
          <Search
            v-model={filters.keyword}
            placeholder="搜索标题、摘要、关键词"
            shape="round"
            class={styles.search}
            onSearch={() => void loadList(true)}
            onClear={() => void loadList(true)}
          />
        </div>
        <div class={styles.filterBar}>
          <DropdownMenu overlay={false} class={styles.dropdownMenu}>
            <DropdownItem
              v-model={filters.sentiment}
              title={`情感：${SENTIMENT_OPTIONS.find((item) => item.value === filters.sentiment)?.label ?? "全部"}`}
              options={SENTIMENT_OPTIONS}
              onChange={() => void loadList(true)}
            />
          </DropdownMenu>
        </div>
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh}>
          <List
            class={styles.list}
            v-model:loading={loading.value}
            finished={finished.value}
            finishedText={rows.value.length ? "— 没有更多了 —" : "暂无匹配舆情"}
            onLoad={() => void loadList()}
          >
            {rows.value.map(renderCard)}
          </List>
        </PullRefresh>
      </div>
    );
  },
});
