import { Loading, PullRefresh } from "vant";
import { defineComponent, onMounted, onUnmounted, type VNode } from "vue";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";

import { OperationRecordsCardList } from "./operation-records-card-list";
import { OperationRecordsFilter } from "./operation-records-filter";
import { useOperationRecords } from "./use-operation-records";

import styles from "./operation-records.module.less";

export const OperationRecordsPage = defineComponent({
  name: "OperationRecordsPage",
  setup: () => {
    const operations = useOperationRecords();

    const loadMoreWhenReachedBottom = (): void => {
      const remaining = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
      if (remaining <= 120) void operations.loadMore();
    };

    document.title = "操作记录";
    onMounted(() => {
      void Promise.all([operations.reload(), operations.loadHostOptions()]);
      window.addEventListener("scroll", loadMoreWhenReachedBottom, { passive: true });
    });
    onUnmounted(() => window.removeEventListener("scroll", loadMoreWhenReachedBottom));

    return (): VNode => (
      <div class={styles.page}>
        <div class={styles.navbar}>
          <CubeNavBar showBack title="操作记录" />
        </div>

        <OperationRecordsFilter
          initialFilters={{ ...operations.filters }}
          hostOptions={operations.hostOptions.value}
          onChange={operations.applyFilters}
        />

        <div class={styles.resultSummary} aria-live="polite">
          <div class={styles.resultCount}>
            <span>操作记录</span>
            <strong>{operations.total.value}</strong>
            <span>条</span>
          </div>
          <span class={styles.sortHint}>按时间倒序</span>
        </div>

        <PullRefresh v-model={operations.refreshing.value} onRefresh={() => void operations.refresh()}>
          <main class={styles.listViewport}>
            <OperationRecordsCardList records={operations.records.value} />
            {operations.loading.value ? (
              <div class={styles.loadMore}>
                <Loading size="18px">加载中...</Loading>
              </div>
            ) : null}
            {operations.finished.value && operations.records.value.length > 0 ? <div class={styles.finishedText}>没有更多了</div> : null}
          </main>
        </PullRefresh>
      </div>
    );
  },
});

export default OperationRecordsPage;
