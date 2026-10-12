import { Empty, List, Loading, PullRefresh, Search, showNotify, Tag } from "vant";
import { computed, defineComponent, onMounted, reactive, ref, type VNode } from "vue";
import { useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import type {
  ColdStoreMonitorCard,
  ColdStoreMonitorExceptionStatistics,
  ColdStoreMonitorMetric,
} from "@ghcloud/cube-service-interface/cold-storage";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { getColdStoreMonitorCards, getColdStoreMonitorExceptionStatistics } from "@ghcloud/cube-services-client/cold-storage.client";

import { displayText, withUnit } from "@/utils/format";

const statusType = (status?: string): "success" | "warning" | "danger" | "primary" => {
  const normalized = String(status ?? "").toUpperCase();
  if (["NORMAL", "ONLINE"].includes(normalized)) {
    return "success";
  }
  if (["LEAK", "AMMONIA_EXCEPTION", "AMMONIA_ABNORMAL"].includes(normalized)) {
    return "danger";
  }
  if (normalized) {
    return "warning";
  }
  return "primary";
};

const metricText = (metric: ColdStoreMonitorMetric): string => withUnit(metric.value, metric.unit);

const metricValue = (metric?: ColdStoreMonitorMetric): string => displayText(metric?.value);

const metricUnit = (metric?: ColdStoreMonitorMetric): string => metric?.unit ?? "";

const metricMatches = (metric: ColdStoreMonitorMetric, pattern: RegExp): boolean =>
  pattern.test(`${metric.code ?? ""}${metric.name ?? ""}${metric.productCode ?? ""}${metric.propertyCode ?? ""}`);

const findMetric = (metrics: ColdStoreMonitorMetric[], pattern: RegExp): ColdStoreMonitorMetric | undefined =>
  metrics.find((metric) => metricMatches(metric, pattern));

const primaryMetric = (metrics: ColdStoreMonitorMetric[]): ColdStoreMonitorMetric | undefined =>
  findMetric(metrics, /NH|AMMONIA|氨/i) ?? metrics[0];

const cardTone = (status?: string): "normal" | "danger" => {
  const normalized = String(status ?? "").toUpperCase();
  return normalized && !["NORMAL", "ONLINE"].includes(normalized) ? "danger" : "normal";
};

const statusText = (card: ColdStoreMonitorCard): string => card.statusName || (cardTone(card.status) === "danger" ? "异常" : "运行正常");

const simplifiedMetrics = (card: ColdStoreMonitorCard): Array<{ label: string; value: string; warn?: boolean }> => {
  const metrics = card.metrics ?? [];
  const pressure = findMetric(metrics, /PRESS|压力/i);
  const exhaustTemp = findMetric(metrics, /EXHAUST|DISCHARGE|排气/i);
  const current = findMetric(metrics, /CURRENT|电流/i);
  const door = findMetric(metrics, /DOOR|门/i);
  const storeTemp = findMetric(metrics, /STORE_TEMP|ROOM_TEMP|库内|库温|冷库温|温度/i);

  return [
    { label: pressure?.name || "排气压力", value: pressure ? metricText(pressure) : "--", warn: pressure?.abnormal },
    { label: exhaustTemp?.name || "排气温度", value: exhaustTemp ? metricText(exhaustTemp) : "--", warn: exhaustTemp?.abnormal },
    { label: current?.name || "运行电流", value: current ? metricText(current) : "--", warn: current?.abnormal },
    { label: door?.name || "库门状态", value: door ? metricText(door) : "--", warn: door?.abnormal },
    { label: storeTemp?.name || "库内温度", value: storeTemp ? metricText(storeTemp) : "--", warn: storeTemp?.abnormal },
    {
      label: "设备状态",
      value: card.warningText || `${card.onlineDeviceCount ?? 0}台设备在线`,
      warn: cardTone(card.status) === "danger",
    },
  ];
};

export const MonitoringPage = defineComponent({
  name: "MonitoringPage",
  setup: () => {
    const router = useRouter();
    const keyword = ref("");
    const cards = ref<ColdStoreMonitorCard[]>([]);
    const statistics = ref<ColdStoreMonitorExceptionStatistics>({});
    const requesting = ref(false);
    const listLoading = ref(false);
    const refreshing = ref(false);
    const finished = ref(false);
    const paging = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });

    const statisticCards = computed(() => [
      { label: "氨浓度异常", value: statistics.value.ammoniaExceptionCount ?? 0, tone: "danger" },
      { label: "制冷异常", value: statistics.value.refrigerationExceptionCount ?? 0, tone: "warning" },
      { label: "库门异常", value: statistics.value.doorExceptionCount ?? 0, tone: "warning" },
      { label: "温湿度异常", value: statistics.value.temperatureHumidityExceptionCount ?? 0, tone: "primary" },
      {
        label: "在线冷库",
        value: `${statistics.value.onlineStoreCount ?? 0}/${statistics.value.totalStoreCount ?? 0}`,
        tone: "success",
      },
    ]);

    const loadStatistics = async (): Promise<void> => {
      statistics.value = await useAuthRequest(() => getColdStoreMonitorExceptionStatistics());
    };

    const loadCards = async (reset = false): Promise<void> => {
      if (requesting.value) {
        return;
      }
      requesting.value = true;
      if (!reset) {
        listLoading.value = true;
      }
      try {
        if (reset) {
          paging.pageNumber = 1;
          finished.value = false;
        }
        const page = await useAuthRequest(() =>
          getColdStoreMonitorCards({
            pageNumber: paging.pageNumber,
            pageSize: paging.pageSize,
            keyword: keyword.value.trim(),
          }),
        );
        const records = page.records ?? [];
        cards.value = reset ? records : [...cards.value, ...records];
        paging.total = page.total ?? 0;
        finished.value = cards.value.length >= paging.total || records.length < paging.pageSize;
        if (!finished.value) {
          paging.pageNumber += 1;
        }
      } catch (error) {
        showNotify({ type: "danger", message: error instanceof Error ? error.message : "监测感知列表加载失败" });
        finished.value = true;
      } finally {
        requesting.value = false;
        listLoading.value = false;
      }
    };

    const loadPage = async (): Promise<void> => {
      await Promise.all([loadStatistics(), loadCards(true)]);
    };

    const refresh = async (): Promise<void> => {
      refreshing.value = true;
      try {
        await loadPage();
      } finally {
        refreshing.value = false;
      }
    };

    const search = (): void => {
      void loadCards(true);
    };

    const openDetail = (card: ColdStoreMonitorCard): void => {
      void router.push({ name: "monitoring-detail", query: { id: card.id } });
    };

    onMounted(() => {
      void loadPage();
    });

    return (): VNode => (
      <>
        <CubeNavBar showBack title="监测感知" />
        <main class="cs-h5-page monitoring-page">
          <section class="stat-scroll">
            {statisticCards.value.map((item) => (
              <div class={`stat-card stat-card--${item.tone}`} key={item.label}>
                <span>{item.label}</span>
                <b>{item.value}</b>
              </div>
            ))}
          </section>

          <div class="search-panel">
            <Search v-model={keyword.value} shape="round" placeholder="搜索冷库名称/编号" onSearch={search} onClear={search} />
          </div>

          <PullRefresh v-model={refreshing.value} onRefresh={refresh} class="content-refresh">
            <List
              v-model:loading={listLoading.value}
              finished={finished.value}
              immediateCheck={false}
              finished-text="没有更多了"
              onLoad={() => void loadCards()}
            >
              {cards.value.length ? (
                <div class="card-list">
                  {cards.value.map((card) => {
                    const tone = cardTone(card.status);
                    const mainMetric = primaryMetric(card.metrics ?? []);
                    return (
                      <article class={`store-card store-card--${tone}`} key={card.id} onClick={() => openDetail(card)}>
                        <header>
                          <h3>{displayText(card.name)}</h3>
                          <Tag type={statusType(card.status)}>{statusText(card)}</Tag>
                        </header>

                        <div class="store-primary-metric">
                          <span>{mainMetric?.name || "NH3 浓度"}</span>
                          <b>{metricValue(mainMetric)}</b>
                          <small>{metricUnit(mainMetric)}</small>
                        </div>

                        <div class="store-simple-grid">
                          {simplifiedMetrics(card).map((metric) => (
                            <div class={metric.warn ? "store-simple-item store-simple-item--warn" : "store-simple-item"} key={metric.label}>
                              <b>{metric.value}</b>
                              <span>{metric.label}</span>
                            </div>
                          ))}
                        </div>

                        <footer>
                          <span>{card.warningText || `${card.onlineDeviceCount ?? 0}台设备在线，运行稳定`}</span>
                          <b>详情 ›</b>
                        </footer>
                      </article>
                    );
                  })}
                </div>
              ) : requesting.value && !refreshing.value ? (
                <div class="page-loading">
                  <Loading type="spinner" />
                </div>
              ) : requesting.value ? null : (
                <Empty description="暂无监测感知数据" />
              )}
            </List>
          </PullRefresh>
        </main>
      </>
    );
  },
});
