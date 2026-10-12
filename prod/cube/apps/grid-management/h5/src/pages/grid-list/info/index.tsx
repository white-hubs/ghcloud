import { useGridState } from "../grid-info-store";
import { cubeAlarmCenterService, cubeGridManagementService, cubeOuaaService } from "@/api/server";

import styles from "./index.module.less";
const GM_IMG = "/resource/v1/grid-management/images/grid-list";
const bluePhoneIcon = `${GM_IMG}/blue-phone-icon.png`;
const userPhoneIcon = `${GM_IMG}/phone-icon.png`;
import dayjs from "dayjs";
import { computed, defineComponent, onMounted, onUnmounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import type { AlarmRecord } from "@ghcloud/cube-alarm-center-service/src/types/alarm-center";
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import type { FaultApplyDTO, FaultApplyHomePageStatisticsDTO, GridTaskDTO, GridTaskStatDTO } from "@ghcloud/cube-grid-management-service";

import { AlarmCard } from "@/components/alarm-card";
import { Card } from "@/components/card";
import { ModelRender } from "@/components/model-render/model-render";
import { TaskCard } from "@/components/task-card";
import { WorkOrderCard, type WorkOrderPeriod } from "@/components/work-order-card";
import { useSubPagesRouter } from "@/pages/sub-pages/sub-pages-router";

export const GridInfo = defineComponent({
  setup: () => {
    const route = useRoute();
    const fromOverview = computed(() => route.query.source === "overview");
    type TodayTimeParams = {
      period: string;
    };
    const createEmptyTaskStat = (): GridTaskStatDTO => ({
      totalNum: 0,
      doneTotalNum: 0,
      normalNum: 0,
      doneNormalNum: 0,
      alarmNum: 0,
      doneAlarmNum: 0,
      approveNum: 0,
      doneApproveNum: 0,
      faultOrderNum: 0,
    });
    const createEmptyWorkOrderStat = (): FaultApplyHomePageStatisticsDTO => ({
      orderCount: 0,
      orderRatio: 0,
      processOrder: 0,
      finishOrder: 0,
    });
    const getTodayTimeParams = (): TodayTimeParams => {
      const period = `${dayjs().startOf("day").format("YYYY-MM-DD HH:mm:ss")},${dayjs().endOf("day").format("YYYY-MM-DD HH:mm:ss")}`;
      return { period };
    };
    const getDetailTimeParams = (): Partial<TodayTimeParams> => (fromOverview.value ? {} : getTodayTimeParams());
    const getWorkOrderStatisticsPeriodParams = (periodType: WorkOrderPeriod): TodayTimeParams => {
      const period = `${dayjs().startOf(periodType).format("YYYY-MM-DD HH:mm:ss")},${dayjs().endOf(periodType).format("YYYY-MM-DD HH:mm:ss")}`;
      return { period };
    };
    const getWorkOrderStatisticsType = (periodType: WorkOrderPeriod): "TODAY" | "THIS_WEEK" | "THIS_MONTH" | "THIS_YEAR" => {
      const periodMap = {
        day: "TODAY",
        week: "THIS_WEEK",
        month: "THIS_MONTH",
        year: "THIS_YEAR",
      } as const;
      return periodMap[periodType];
    };
    const subPagesRouter = useSubPagesRouter();
    const gridState = useGridState();
    const gridAreaId = ref("");
    const userId = ref("");
    const PAGE_SIZE = 10;
    const state = reactive<{
      gridSubordinateStat: {
        deviceCount: number;
        patrolLocationCount: number;
        propertyCount: number;
        scenePointCount: number;
        stallCount: number;
        smallCount: number;
      };
      taskInfo: {
        taskList: GridTaskDTO[];
        taskStat: GridTaskStatDTO;
      };
      workOrderPeriod: WorkOrderPeriod;
      workOrderInfo: {
        workOrderList: FaultApplyDTO[];
        workOrderStat: FaultApplyHomePageStatisticsDTO;
      };
      workOrderPagination: {
        pageNumber: number;
        loading: boolean;
        finished: boolean;
      };
      alarmInfo: {
        alarmList: AlarmRecord[];
        alarmStat: GridTaskStatDTO;
      };
      taskPagination: {
        pageNumber: number;
        loading: boolean;
        finished: boolean;
      };
      alarmPagination: {
        pageNumber: number;
        loading: boolean;
        finished: boolean;
      };
    }>({
      gridSubordinateStat: {
        deviceCount: 0,
        patrolLocationCount: 0,
        propertyCount: 0,
        scenePointCount: 0,
        stallCount: 0,
        smallCount: 0,
      },
      taskInfo: {
        taskList: [],
        taskStat: createEmptyTaskStat(),
      },
      workOrderPeriod: fromOverview.value ? "year" : "day",
      workOrderInfo: {
        workOrderList: [],
        workOrderStat: createEmptyWorkOrderStat(),
      },
      workOrderPagination: {
        pageNumber: 0,
        loading: false,
        finished: false,
      },
      alarmInfo: {
        alarmList: [],
        alarmStat: createEmptyTaskStat(),
      },
      taskPagination: {
        pageNumber: 0,
        loading: false,
        finished: false,
      },
      alarmPagination: {
        pageNumber: 0,
        loading: false,
        finished: false,
      },
    });
    const subordinateEntityList: {
      title: string;
      key: keyof typeof state.gridSubordinateStat;
      onClick?: () => void;
    }[] = [
      {
        title: "档位",
        key: "stallCount",
        onClick: () => subPagesRouter.toStallList(gridState.getGridInfo().gridAreaId),
      },
      {
        title: "设备",
        key: "deviceCount",
        onClick: () => subPagesRouter.toDeviceList(gridState.getGridInfo().gridAreaId),
      },
      {
        title: "资产",
        key: "propertyCount",
        onClick: () => subPagesRouter.toAssetList(gridState.getGridInfo().gridAreaId),
      },
      {
        title: "现场点",
        key: "scenePointCount",
        onClick: () => subPagesRouter.toSitePointList(gridState.getGridInfo().gridAreaId),
      },
      {
        title: "巡更点",
        key: "patrolLocationCount",
        onClick: () => subPagesRouter.toPatrolPointList(gridState.getGridInfo().gridAreaId),
      },
    ];
    const getObjectStat = async () => {
      const result = await cubeGridManagementService.getGridAreaObjectCountStat({ gridAreaIds: [gridState.getGridInfo().gridAreaId] });
      if (!result[0]) {
        return;
      }
      // 只有一项！
      const stat = result[0];
      state.gridSubordinateStat = {
        deviceCount: stat.deviceCount,
        patrolLocationCount: stat.patrolLocationCount,
        propertyCount: stat.propertyCount,
        scenePointCount: stat.scenePointCount,
        stallCount: stat.stallCount,
        smallCount: 0,
      };
    };
    // getMyGridTaskStat
    const getTaskStat = async () => {
      const timeParams = getDetailTimeParams();
      const result = await cubeGridManagementService.getMyGridTaskStat({
        pageNumber: 1,
        pageSize: 10,
        gridAreaId: gridState.getGridInfo().gridAreaId,
        dailyType: "GRID_MANAGE",
        ...timeParams,
      } as {
        pageNumber: number;
        pageSize: number;
        gridAreaId: string;
        dailyType: string;
      } & Partial<TodayTimeParams>);
      state.taskInfo.taskStat = result;
    };
    const getAlarmStat = async () => {
      const timeParams = getDetailTimeParams();
      const result = await cubeAlarmCenterService.getAlarmStatusStatistics({
        areaId: gridState.getGridInfo().gridAreaId,
        areaLike: false,
        ...timeParams,
      } as {
        areaId: string;
        areaLike: boolean;
      } & Partial<TodayTimeParams>);
      const calcList = result.filter((item) => item.alarmStatus !== "TIME_OUT_UN_HANDLER");
      const alarmNum = calcList.reduce((cur, pre) => cur + pre.alarmNum, 0);
      const doneAlarmNum = calcList.find((item) => item.alarmStatus === "ALARM_HANDLER")?.alarmNum || 0;
      state.alarmInfo.alarmStat.alarmNum = alarmNum;
      state.alarmInfo.alarmStat.doneAlarmNum = doneAlarmNum;
    };
    const getMyTaskList = async (pageNumber = 1) => {
      if (state.taskPagination.loading) {
        return;
      }
      state.taskPagination.loading = true;
      const timeParams = getDetailTimeParams();
      try {
        const res = await cubeGridManagementService.getMyGridTaskList({
          pageNumber,
          pageSize: PAGE_SIZE,
          gridAreaId: gridState.getGridInfo().gridAreaId,
          dailyType: "GRID_MANAGE",
          ...timeParams,
        } as {
          pageNumber: number;
          pageSize: number;
          gridAreaId: string;
          dailyType: string;
        } & Partial<TodayTimeParams>);
        state.taskPagination.pageNumber = pageNumber;
        state.taskInfo.taskList = pageNumber === 1 ? res.records : [...state.taskInfo.taskList, ...res.records];
        state.taskPagination.finished = pageNumber >= res.pages;
      } finally {
        state.taskPagination.loading = false;
      }
    };
    const loadMoreTasks = (): void => {
      if (!state.taskPagination.loading && !state.taskPagination.finished) {
        getMyTaskList(state.taskPagination.pageNumber + 1);
      }
    };
    const getWorkOrderStat = async () => {
      const timeParams = getWorkOrderStatisticsPeriodParams(state.workOrderPeriod);
      const result = await cubeGridManagementService.getFaultApplyHomePageStatistics({
        areaIds: [gridState.getGridInfo().gridAreaId],
        type: getWorkOrderStatisticsType(state.workOrderPeriod),
        admin: true,
        businessType: "FAULT",
        ...timeParams,
      });
      state.workOrderInfo.workOrderStat = result;
    };
    const getWorkOrderList = async (pageNumber = 1) => {
      if (state.workOrderPagination.loading) {
        return;
      }
      state.workOrderPagination.loading = true;
      const timeParams = getWorkOrderStatisticsPeriodParams(state.workOrderPeriod);
      try {
        const res = await cubeGridManagementService.getFaultApplyAll({
          pageNumber,
          pageSize: PAGE_SIZE,
          areaIds: [gridState.getGridInfo().gridAreaId],
          businessType: "FAULT",
          submitTime: timeParams.period,
        } as {
          pageNumber: number;
          pageSize: number;
          areaIds: string[];
          businessType: string;
          submitTime: string;
        });
        state.workOrderPagination.pageNumber = pageNumber;
        state.workOrderInfo.workOrderList = pageNumber === 1 ? res.records : [...state.workOrderInfo.workOrderList, ...res.records];
        state.workOrderPagination.finished = pageNumber >= res.pages;
      } finally {
        state.workOrderPagination.loading = false;
      }
    };
    const loadMoreWorkOrders = (): void => {
      if (!state.workOrderPagination.loading && !state.workOrderPagination.finished) {
        getWorkOrderList(state.workOrderPagination.pageNumber + 1);
      }
    };
    const handleWorkOrderPeriodChange = async (period: WorkOrderPeriod): Promise<void> => {
      state.workOrderPeriod = period;
      state.workOrderPagination.pageNumber = 0;
      state.workOrderPagination.finished = false;
      state.workOrderInfo.workOrderList = [];
      await Promise.all([getWorkOrderStat(), getWorkOrderList(1)]);
    };
    const getAlarmList = async (pageNumber = 1) => {
      if (state.alarmPagination.loading) {
        return;
      }
      state.alarmPagination.loading = true;
      const timeParams = getDetailTimeParams();
      try {
        const res = await cubeAlarmCenterService.getAlarmRecordsPage({
          pageNumber,
          userId: "",
          pageSize: PAGE_SIZE,
          areaIds: gridState.getGridInfo().gridAreaId,
          ...timeParams,
        } as {
          pageNumber: number;
          userId: string;
          pageSize: number;
          areaIds: string;
        } & Partial<TodayTimeParams>);
        state.alarmPagination.pageNumber = pageNumber;
        state.alarmInfo.alarmList = pageNumber === 1 ? res.records : [...state.alarmInfo.alarmList, ...res.records];
        state.alarmPagination.finished = pageNumber >= res.pages;
      } finally {
        state.alarmPagination.loading = false;
      }
    };
    const loadMoreAlarms = (): void => {
      if (!state.alarmPagination.loading && !state.alarmPagination.finished) {
        getAlarmList(state.alarmPagination.pageNumber + 1);
      }
    };
    onMounted(() => {
      const cacheGrid = sessionStorage.getItem("gridInfo");
      if (cacheGrid) {
        gridState.setGridInfo(JSON.parse(cacheGrid));
      }
      getObjectStat();
      getTaskStat();
      getWorkOrderStat();
      getAlarmStat();
      getMyTaskList();
      getWorkOrderList();
      getAlarmList();
      getUser();
      gridAreaId.value = gridState.getGridInfo().gridAreaId;
      sessionStorage.setItem("gridInfo", JSON.stringify(gridState.getGridInfo()));
    });
    onUnmounted(() => {
      sessionStorage.removeItem("gridInfo");
    });
    const getUser = async () => {
      const user = await cubeOuaaService.getUserMine();
      userId.value = user.id;
    };
    return (): JSX.Element => (
      <>
        <CubeNavBar title={gridState.getGridInfo().gridName} />
        <div class={styles["container"]}>
          <div class={styles["users-container"]}>
            {gridState.getGridInfo().gridManagers.map((item) => (
              <div class={styles["center-user"]} key={item.gridManagerId}>
                <div class={styles["user-info"]}>
                  {item.avatar && <img class={styles["avatar"]} src={item.avatar.path} alt="" srcset="" />}
                  <div class={styles["info"]}>
                    <div class={styles["user-name"]}>
                      {item.gridManagerName}
                      <div class={styles["position"]}>网格长</div>
                    </div>
                    <div class={styles["user-phone"]}>联系方式：{item.mobile}</div>
                  </div>
                </div>
                <div
                  class={styles["center-phone-icon"]}
                  onClick={() => {
                    cubeAppService.callPhone(item.mobile);
                  }}
                >
                  <img src={bluePhoneIcon} alt="" srcset="" />
                </div>
              </div>
            ))}

            <div class={styles["user-list"]}>
              <div class={styles["title"]}>网格员</div>
              <div class={styles["user-list"]}>
                {gridState.getGridInfo().gridMembers.map((item) => (
                  <div class={styles["user-list-item"]} key={item.mobile}>
                    <div class={styles["name-phone"]}>
                      <div class={styles["name"]}>{item.name}</div>
                      <div class={styles["phone"]}>{item.mobile}</div>
                    </div>
                    <div
                      class={styles["user-phone-icon"]}
                      onClick={() => {
                        cubeAppService.callPhone(item.mobile);
                      }}
                    >
                      <img src={userPhoneIcon} alt="" srcset="" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Card title="网格平面图">
            <div class={styles["floor-plan"]}>{gridAreaId.value && <ModelRender areaId={gridAreaId.value} />}</div>
          </Card>
          <Card title="网格下属有">
            <div class={styles["grid-subordinate"]}>
              {subordinateEntityList.map((item) => (
                <div class={styles["subordinate-item"]} key={item.key} onClick={() => item.onClick?.()}>
                  <div class={styles["subordinate-label"]}>{item.title}</div>
                  <div class={styles["subordinate-value"]}>
                    {item.key in state.gridSubordinateStat ? state.gridSubordinateStat[item.key] : 0}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <TaskCard
            taskInfo={state.taskInfo}
            gridAreaId={gridState.getGridInfo().gridAreaId}
            userIds={userId.value ? [userId.value] : []}
            fromOverview={fromOverview.value}
            loading={state.taskPagination.loading}
            finished={state.taskPagination.finished}
            onLoadMore={loadMoreTasks}
          />
          <AlarmCard
            alarmInfo={state.alarmInfo}
            loading={state.alarmPagination.loading}
            finished={state.alarmPagination.finished}
            onLoadMore={loadMoreAlarms}
          />
          <WorkOrderCard
            gridAreaId={gridState.getGridInfo().gridAreaId}
            period={state.workOrderPeriod}
            workOrderInfo={state.workOrderInfo}
            loading={state.workOrderPagination.loading}
            finished={state.workOrderPagination.finished}
            onPeriodChange={handleWorkOrderPeriodChange}
            onLoadMore={loadMoreWorkOrders}
          />
        </div>
      </>
    );
  },
});
