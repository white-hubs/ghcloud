import { Empty, Loading, PullRefresh, Search, Skeleton } from "vant";
import { computed, defineComponent, onMounted, reactive, shallowRef } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import type { GridDTO, GridStatisticsChildrenDTO, GridStatisticsTotalDTO, GridTaskStatDTO } from "@ghcloud/cube-grid-management-service";
import type { AreaTree } from "@ghcloud/cube-mdata-service";

import { GridOverviewCard } from "./components/grid-overview-card";
import { GridTabs, type GridTabItem } from "./components/grid-tabs";
import { SummaryCard, type OverviewSummaryItem } from "./components/summary-card";
import { TaskSummaryCard, type TaskSummaryItem } from "./components/task-summary-card";
import { cubeGridManagementService, cubeMdataService } from "@/api/server";
import { useGridState } from "@/pages/grid-list/grid-info-store";

import styles from "./index.module.less";

interface AreaTabItem extends GridTabItem {
  areaId: string;
}

const DEFAULT_TASK_STAT: GridTaskStatDTO = {
  totalNum: 0,
  doneTotalNum: 0,
  normalNum: 0,
  doneNormalNum: 0,
  alarmNum: 0,
  doneAlarmNum: 0,
  approveNum: 0,
  doneApproveNum: 0,
  faultOrderNum: 0,
};

const DEFAULT_TOTAL_STAT: GridStatisticsTotalDTO = {
  gridCount: 0,
  gridLeaderCount: 0,
  gridMemberCount: 0,
  deviceCount: 0,
  assetCount: 0,
};

const toNumber = (value: unknown): number => (Number.isFinite(Number(value)) ? Number(value) : 0);

const firstNumber = (...values: unknown[]): number => {
  const value = values.find((item) => item !== undefined && item !== null && item !== "");
  return toNumber(value);
};

const getAreaName = (area: AreaTree): string => area.name || area.text || "--";

export const GridOverview = defineComponent({
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const gridState = useGridState();
    const keyword = shallowRef("");
    const activeAreaId = shallowRef("");
    const routeAreaId = computed(() => (route.query.gridAreaId || route.query.areaId || "") as string);
    const state = reactive({
      refreshing: false,
      loading: false,
      initialLoading: true,
      areaTabs: [] as AreaTabItem[],
      grids: [] as GridStatisticsChildrenDTO[],
      taskStat: { ...DEFAULT_TASK_STAT },
      totalStat: { ...DEFAULT_TOTAL_STAT },
    });

    const visibleGrids = computed(() => {
      return state.grids.filter((grid) => {
        const matchKeyword = !keyword.value || (grid.gridAreaName || "").includes(keyword.value);
        return matchKeyword;
      });
    });

    const tabs = computed<GridTabItem[]>(() => state.areaTabs);

    const summaryItems = computed<OverviewSummaryItem[]>(() => {
      return [
        { label: "网格数", value: firstNumber(state.totalStat.gridCount, state.grids.length) },
        { label: "网格长", value: firstNumber(state.totalStat.gridLeaderCount) },
        { label: "网格员", value: firstNumber(state.totalStat.gridMemberCount) },
        {
          label: "设备",
          value: firstNumber(
            state.totalStat.deviceCount,
            state.grids.reduce((total, item) => total + firstNumber(item.deviceCount), 0),
          ),
        },
        {
          label: "资产",
          value: firstNumber(
            state.totalStat.assetCount,
            state.grids.reduce((total, item) => total + firstNumber(item.assetCount), 0),
          ),
        },
      ];
    });

    const taskSummaryItems = computed<TaskSummaryItem[]>(() => [
      { label: "总任务", value: state.taskStat.totalNum, tone: "blue" },
      { label: "已完成", value: state.taskStat.doneTotalNum, tone: "green" },
      { label: "进行中", value: Math.max(state.taskStat.totalNum - state.taskStat.doneTotalNum, 0), tone: "blue" },
      { label: "工单", value: state.taskStat.faultOrderNum, tone: "red" },
      { label: "待处理报警", value: Math.max(state.taskStat.alarmNum - state.taskStat.doneAlarmNum, 0), tone: "red" },
    ]);

    const getAreaTabs = async (): Promise<void> => {
      const result = await cubeMdataService.getAreaTree();
      state.areaTabs = result
        .filter((item) => item.id)
        .map((item) => ({
          label: getAreaName(item),
          value: item.id,
          areaId: item.id,
        }));
      activeAreaId.value = routeAreaId.value || state.areaTabs[0]?.areaId || "";
    };

    const getGridChildrenStats = async (): Promise<void> => {
      if (!activeAreaId.value) {
        state.grids = [];
        state.loading = false;
        state.initialLoading = false;
        return;
      }
      state.loading = true;
      try {
        const result = await cubeGridManagementService.getGridStatisticsChildren({
          gridAreaId: activeAreaId.value,
          dailyType: "GRID_MANAGE",
        });
        state.grids = result;
      } finally {
        state.loading = false;
        state.initialLoading = false;
      }
    };

    const getOverviewStat = async (): Promise<void> => {
      if (!activeAreaId.value) {
        state.totalStat = { ...DEFAULT_TOTAL_STAT };
        state.taskStat = { ...DEFAULT_TASK_STAT };
        return;
      }
      const [totalStat, taskStat] = await Promise.all([
        cubeGridManagementService.getGridStatisticsTotal(),
        cubeGridManagementService.getMyGridTaskStat({
          pageNumber: 1,
          pageSize: 200,
          dailyType: "GRID_MANAGE",
        }),
      ]);
      state.totalStat = totalStat;
      state.taskStat = taskStat;
    };

    const handleRefresh = async (): Promise<void> => {
      await getGridChildrenStats();
      state.refreshing = false;
    };

    const handleGoDetail = (grid: GridStatisticsChildrenDTO): void => {
      const gridInfo: GridDTO = {
        gridAreaId: String(grid.gridAreaId || ""),
        gridName: grid.gridAreaName || "--",
        gridDepartmentId: "",
        gridDepartmentName: "",
        childAreaName: "",
        gridManagers: [],
        gridMembers: [],
        gridMemberNames: [],
      };
      gridState.setGridInfo(gridInfo);
      sessionStorage.setItem("gridInfo", JSON.stringify(gridInfo));
      router.push({
        path: "/grid-list/info",
        query: {
          source: "overview",
        },
      });
    };

    const handleAreaChange = async (areaId: string): Promise<void> => {
      if (areaId === activeAreaId.value && !state.loading) {
        return;
      }
      activeAreaId.value = areaId;
      state.grids = [];
      await getGridChildrenStats();
    };

    onMounted(async () => {
      await getAreaTabs();
      await Promise.all([getOverviewStat(), getGridChildrenStats()]);
    });

    const renderOverviewSkeleton = (): JSX.Element => (
      <div class={styles["overview-skeleton"]}>
        <div class={[styles["summary-card"], styles["skeleton-summary-card"]]}>
          <div class={styles["summary-grid"]}>
            {Array.from({ length: 5 }).map((_, index) => (
              <div class={styles["summary-item"]} key={index}>
                <div class={[styles["skeleton-block"], styles["skeleton-number"]]} />
                <div class={[styles["skeleton-block"], styles["skeleton-label"]]} />
              </div>
            ))}
          </div>
        </div>
        <div class={[styles["task-summary-card"], styles["skeleton-task-card"]]}>
          <div class={styles["task-summary-list"]}>
            {Array.from({ length: 5 }).map((_, index) => (
              <div class={styles["task-summary-item"]} key={index}>
                <div class={[styles["skeleton-block"], styles["skeleton-task-number"]]} />
                <div class={[styles["skeleton-block"], styles["skeleton-task-label"]]} />
              </div>
            ))}
          </div>
        </div>
        <div class={styles["skeleton-tabs"]}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div class={styles["skeleton-tab"]} key={index} />
          ))}
        </div>
        {Array.from({ length: 2 }).map((_, index) => (
          <div class={[styles["grid-card"], styles["skeleton-grid-card"]]} key={index}>
            <div class={styles["grid-card-header"]}>
              <div class={[styles["skeleton-block"], styles["skeleton-card-title"]]} />
            </div>
            <div class={styles["grid-card-people"]}>
              <div class={[styles["skeleton-block"], styles["skeleton-people"]]} />
              <div class={[styles["skeleton-block"], styles["skeleton-people-short"]]} />
            </div>
            <div class={styles["grid-card-metrics"]}>
              {Array.from({ length: 4 }).map((_, metricIndex) => (
                <div class={styles["grid-card-metric"]} key={metricIndex}>
                  <div class={[styles["skeleton-block"], styles["skeleton-metric-number"]]} />
                  <div class={[styles["skeleton-block"], styles["skeleton-metric-label"]]} />
                </div>
              ))}
            </div>
            <div class={styles["status-row"]}>
              <div class={[styles["skeleton-block"], styles["skeleton-status-label"]]} />
              <div class={[styles["skeleton-block"], styles["skeleton-status-value"]]} />
            </div>
            <div class={styles["status-row"]}>
              <div class={[styles["skeleton-block"], styles["skeleton-status-label"]]} />
              <div class={[styles["skeleton-block"], styles["skeleton-status-value"]]} />
            </div>
          </div>
        ))}
      </div>
    );

    return (): JSX.Element => (
      <div class={styles["overview-page"]}>
        <CubeNavBar title="网格总览" />
        <div class={styles["overview-content"]}>
          <div class={styles["search-sticky"]}>
            <Search v-model={keyword.value} shape="round" placeholder="搜索网格名称..." background="transparent" />
          </div>
          <Skeleton loading={state.initialLoading} row={8} v-slots={{ template: renderOverviewSkeleton }}>
            <SummaryCard items={summaryItems.value} />
            <TaskSummaryCard items={taskSummaryItems.value} />
            <GridTabs items={tabs.value} active={activeAreaId.value} onChange={(value: string) => void handleAreaChange(value)} />
            <PullRefresh v-model={state.refreshing} class={styles["pull-refresh"]} onRefresh={handleRefresh}>
              {state.loading ? (
                <div class={styles["list-loading"]}>
                  <Loading color="#266dff" size="24px">
                    加载中...
                  </Loading>
                </div>
              ) : (
                <div class={styles["grid-card-list"]}>
                  {visibleGrids.value.map((grid) => (
                    <GridOverviewCard grid={grid} key={grid.gridAreaId} onClick={() => handleGoDetail(grid)} />
                  ))}
                </div>
              )}
              {!state.loading && !visibleGrids.value.length && <Empty description="暂无网格" />}
            </PullRefresh>
          </Skeleton>
        </div>
      </div>
    );
  },
});
