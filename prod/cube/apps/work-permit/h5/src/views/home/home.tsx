import { defineComponent, onMounted, reactive, ref, shallowRef, type VNode } from "vue";
import { useRoute } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import type { FlowNumberStatistics, FormFlowGroupVO, FormFlowItemVO } from "@ghcloud/cube-service-interface/process-engine";
import { getPermissionFormFlowGroupCount, getUserFlowNumber } from "@ghcloud/cube-services-client/process-engine.client";

import { getCurrentApplicationCode, getCurrentApplicationName } from "@/utils/current-application";

import styles from "./home.module.less";

type TimeRangeKey = "TODAY" | "WEEK" | "MONTH" | "YEAR";

const timeOptions: { label: string; value: TimeRangeKey }[] = [
  { label: "今日", value: "TODAY" },
  { label: "本周", value: "WEEK" },
  { label: "本月", value: "MONTH" },
  { label: "今年", value: "YEAR" },
];

type StatisticKey = keyof Pick<FlowNumberStatistics, "submitCount" | "waitingCount" | "finishedCount">;
type StatisticType = "SUBMIT" | "WAITING" | "HANDLED";

const statisticOptions: { label: string; field: StatisticKey; type: StatisticType }[] = [
  { label: "发起数", field: "submitCount", type: "SUBMIT" },
  { label: "待处理数", field: "waitingCount", type: "WAITING" },
  { label: "处理数", field: "finishedCount", type: "HANDLED" },
];

const pad = (num: number): string => String(num).padStart(2, "0");

const formatDate = (date: Date): string => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const getWeekStart = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay() || 7;
  result.setDate(result.getDate() - day + 1);
  return result;
};

const getPeriodValue = (type: TimeRangeKey): string => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (type === "WEEK") {
    const weekStart = getWeekStart(now);
    start.setFullYear(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
    end.setFullYear(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);
  }

  if (type === "MONTH") {
    start.setDate(1);
    end.setMonth(now.getMonth() + 1, 0);
  }

  if (type === "YEAR") {
    start.setMonth(0, 1);
    end.setMonth(11, 31);
  }

  return `${formatDate(start)} 00:00:00,${formatDate(end)} 23:59:59`;
};

const withCurrentQuery = (basePath: string, params: Record<string, string | undefined>, routeQuery: Record<string, unknown>): string => {
  const query = new URLSearchParams();
  Object.entries(routeQuery).forEach(([key, value]) => {
    if (typeof value === "string" && value) {
      query.set(key, value);
    }
  });
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });
  return `${basePath}?${query.toString()}`;
};

export const Home = defineComponent({
  name: "WorkPermitH5Home",
  setup: () => {
    const route = useRoute();
    const applicationCode = getCurrentApplicationCode();
    const applicationName = getCurrentApplicationName();
    const keyword = shallowRef("");
    const selectedTime = shallowRef<TimeRangeKey>("TODAY");
    const loading = shallowRef(false);
    const groupLoading = shallowRef(false);
    const groups = ref<FormFlowGroupVO[]>([]);
    const statistics = reactive<FlowNumberStatistics>({
      submitCount: 0,
      waitingCount: 0,
      finishedCount: 0,
    });

    const loadStatistics = async (): Promise<void> => {
      const result = await getUserFlowNumber({
        applicationCode,
        period: getPeriodValue(selectedTime.value),
      });
      statistics.submitCount = result.submitCount ?? 0;
      statistics.waitingCount = result.waitingCount ?? 0;
      statistics.finishedCount = result.finishedCount ?? 0;
    };

    const loadGroups = async (): Promise<void> => {
      groupLoading.value = true;
      try {
        const query = {
          applicationCode,
          filterEmpty: true,
          ...(keyword.value.trim() ? { keyword: keyword.value.trim() } : {}),
        };
        const result = await getPermissionFormFlowGroupCount(query);
        groups.value = result;
      } finally {
        groupLoading.value = false;
      }
    };

    const loadPageData = async (): Promise<void> => {
      loading.value = true;
      try {
        await Promise.all([loadStatistics(), loadGroups()]);
      } finally {
        loading.value = false;
      }
    };

    const handleSearch = (): void => {
      void loadGroups();
    };

    const handleTimeChange = (value: TimeRangeKey): void => {
      selectedTime.value = value;
      void loadStatistics();
    };

    const openApply = (item: FormFlowItemVO): void => {
      globalThis.location.href = withCurrentQuery(
        "/streamengineH5/initiating-work-order",
        {
          processType: "ADD",
          businessType: item.businessType,
        },
        route.query,
      );
    };

    const openApprovalRecords = (type: StatisticType): void => {
      globalThis.location.href = withCurrentQuery(
        "/streamengineH5/personal-order-list",
        {
          applicationCode,
          period: getPeriodValue(selectedTime.value),
          type,
        },
        route.query,
      );
    };

    onMounted(() => {
      document.title = applicationName;
      void loadPageData();
    });

    const renderFlowItem = (item: FormFlowItemVO): VNode => (
      <button class={styles.flowItem} type="button" onClick={() => openApply(item)}>
        <span class={styles.flowIcon} />
        <span class={styles.flowName}>{item.name}</span>
      </button>
    );

    const renderFlowGroups = (): VNode => {
      if (groupLoading.value) {
        return <div class={styles.placeholder}>加载中...</div>;
      }
      if (groups.value.length === 0) {
        return <div class={styles.placeholder}>暂无作业单</div>;
      }
      return (
        <section class={styles.flowGroup}>
          <div class={styles.flowGroups}>
            {groups.value.map((group) => (
              <section class={styles.flowGroupSection} key={group.formGroupId}>
                <div class={styles.groupTitle}>
                  <span>{group.formGroupName}</span>
                  <em>{group.formGroupFlowList?.length ?? 0}项</em>
                </div>
                {(group.formGroupFlowList?.length ?? 0) > 0 ? (
                  <div class={styles.flowGrid}>{group.formGroupFlowList.map(renderFlowItem)}</div>
                ) : (
                  <div class={styles.emptyGroup}>暂无作业</div>
                )}
              </section>
            ))}
          </div>
        </section>
      );
    };

    const renderStatistic = (item: (typeof statisticOptions)[number]): VNode => (
      <button class={styles.statItem} key={item.field} type="button" onClick={() => openApprovalRecords(item.type)}>
        <strong>{statistics[item.field]}</strong>
        <span>{item.label}</span>
      </button>
    );

    return (): VNode => (
      <>
        <div class={styles.navbarWrap}>
          <CubeNavBar showBack title={applicationName} />
        </div>
        <div class={styles.container}>
          <form
            class={styles.searchBox}
            onSubmit={(event) => {
              event.preventDefault();
              handleSearch();
            }}
          >
            <span class={styles.searchIcon} />
            <input
              value={keyword.value}
              placeholder="输入作业名称"
              onInput={(event) => {
                keyword.value = (event.target as HTMLInputElement).value;
              }}
            />
          </form>

          <section class={styles.dashboard}>
            <div class={styles.dashboardHeader}>
              <h2>数据看板</h2>
              <div class={styles.timeTabs}>
                {timeOptions.map((item) => (
                  <button
                    key={item.value}
                    class={item.value === selectedTime.value ? styles.timeActive : ""}
                    type="button"
                    onClick={() => handleTimeChange(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div class={styles.statGrid}>{statisticOptions.map(renderStatistic)}</div>
          </section>

          {renderFlowGroups()}
        </div>

        {loading.value && <div class={styles.loadingBar} />}
      </>
    );
  },
});
