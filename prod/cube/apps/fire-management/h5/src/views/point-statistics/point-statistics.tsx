import { List, PullRefresh } from "vant";
import { defineComponent, onMounted } from "vue";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";

import { PointStatisticsCardList } from "./point-statistics-card-list";
import { PointStatisticsFilter } from "./point-statistics-filter";
import { usePointStatistics } from "./use-point-statistics";

import styles from "./point-statistics.module.less";

export const PointStatisticsPage = defineComponent({
  name: "PointStatisticsPage",
  setup: () => {
    const statistics = usePointStatistics();

    document.title = "点位统计";
    onMounted(() => {
      void Promise.all([statistics.reload(), statistics.loadHostOptions()]);
    });

    return (): JSX.Element => (
      <div class={styles.page}>
        <div class={styles.navbar}>
          <CubeNavBar showBack title="点位统计" />
        </div>

        <PointStatisticsFilter
          initialFilters={{ ...statistics.filters }}
          hostOptions={statistics.hostOptions.value}
          onChange={statistics.applyFilters}
        />

        <div class={styles.resultSummary} aria-live="polite">
          <div class={styles.resultCount}>
            <span>异常点位</span>
            <strong>{statistics.total.value}</strong>
            <span>个</span>
          </div>
          <span class={styles.sortHint}>按触发频次排序</span>
        </div>

        <PullRefresh v-model={statistics.refreshing.value} onRefresh={() => void statistics.refresh()}>
          <main class={styles.listViewport}>
            <List
              v-model:loading={statistics.loading.value}
              finished={statistics.finished.value}
              immediateCheck={false}
              finished-text={statistics.records.value.length > 0 ? "没有更多了" : ""}
              onLoad={() => void statistics.loadMore()}
            >
              <PointStatisticsCardList records={statistics.records.value} />
            </List>
          </main>
        </PullRefresh>
      </div>
    );
  },
});

export default PointStatisticsPage;
