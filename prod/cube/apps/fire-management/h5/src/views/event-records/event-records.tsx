import { List, PullRefresh } from "vant";
import { computed, defineComponent, onMounted } from "vue";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";

import { EventRecordsCardList } from "./event-records-card-list";
import { EventRecordsFilter } from "./event-records-filter";
import { useEventRecords } from "./use-event-records";

import styles from "./event-records.module.less";

export const EventRecordsPage = defineComponent({
  name: "EventRecordsPage",
  setup: () => {
    const events = useEventRecords();
    const displayedTotal = computed(() => events.sourceTotal.value);

    document.title = "事件记录";
    onMounted(() => {
      void Promise.all([events.reload(), events.loadHostOptions(), events.loadEventOptions()]);
    });

    return (): JSX.Element => (
      <div class={styles.page}>
        <div class={styles.navbar}>
          <CubeNavBar showBack title="事件记录" />
        </div>

        <EventRecordsFilter
          initialFilters={{ ...events.filters }}
          hostOptions={events.hostOptions.value}
          eventOptions={events.eventOptions.value}
          onChange={events.applyFilters}
        />

        <div class={styles.resultSummary} aria-live="polite">
          <div class={styles.resultCount}>
            <span>事件记录</span>
            <strong>{displayedTotal.value}</strong>
            <span>条</span>
          </div>
          <span class={styles.sortHint}>按时间倒序</span>
        </div>

        <PullRefresh v-model={events.refreshing.value} onRefresh={() => void events.refresh()}>
          <main class={styles.listViewport}>
            <List
              v-model:loading={events.loading.value}
              finished={events.finished.value}
              immediateCheck={false}
              finished-text={events.records.value.length > 0 ? "没有更多了" : ""}
              onLoad={() => void events.loadMore()}
            >
              <EventRecordsCardList records={events.records.value} />
            </List>
          </main>
        </PullRefresh>
      </div>
    );
  },
});

export default EventRecordsPage;
