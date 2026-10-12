import dayjs from "dayjs";
import { Popup } from "vant";
import { defineComponent, onMounted, reactive } from "vue";

import type { AlarmRecord } from "@ghcloud/cube-alarm-center-service/src/types/alarm-center";
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import type { FaultApplyDTO, FaultApplyHomePageStatisticsDTO, GridTaskDTO } from "@ghcloud/cube-grid-management-service";

import { useGridState } from "../grid-info-store";
import { BasicInfoUI } from "./components/basic-ui/index";
import { cubeAlarmCenterService, cubeGridManagementService } from "@/api/server";
import { AlarmUI } from "@/components/alarm-card/alarm-ui";
import { ModelRender } from "@/components/model-render/model-render";
import { TaskUI } from "@/components/task-card/task-ui";
import { WorkOrderUI, type WorkOrderPeriod } from "@/components/work-order-card";

import styles from "./index.module.less";
export const GridVisualInfo = defineComponent({
  setup: () => {
    type PeriodParams = {
      period: string;
    };
    type WorkOrderTimeParams = {
      "submitTime.begin": string;
      "submitTime.end": string;
    };
    const createEmptyTaskStat = () => ({
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
    const getPeriodParams = (type: WorkOrderPeriod): PeriodParams => {
      const period = `${dayjs().startOf(type).format("YYYY-MM-DD HH:mm:ss")},${dayjs().endOf(type).format("YYYY-MM-DD HH:mm:ss")}`;
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
    const gridState = useGridState();
    const PAGE_SIZE = 10;
    const state = reactive({
      showPopup: true,
      activeTab: "basic",
      workOrderPeriod: "day" as WorkOrderPeriod,
      taskInfo: {
        taskList: [] as GridTaskDTO[],
        taskStat: createEmptyTaskStat(),
      },
      workOrderInfo: {
        workOrderList: [] as FaultApplyDTO[],
        workOrderStat: createEmptyWorkOrderStat(),
      },
      workOrderPagination: {
        pageNumber: 0,
        loading: false,
        finished: false,
      },
      alarmInfo: {
        alarmList: [] as AlarmRecord[],
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

    const tabList = [
      {
        key: "basic",
        title: "基本信息",
      },
      {
        key: "task",
        title: "任务信息",
      },
      {
        key: "workOrder",
        title: "工单信息",
      },
      {
        key: "alarm",
        title: "报警信息",
      },
    ];
    const getTaskStat = async () => {
      const timeParams = getPeriodParams("day");
      const result = await cubeGridManagementService.getMyGridTaskStat({
        pageNumber: 1,
        pageSize: 200,
        gridAreaId: gridState.getGridInfo().gridAreaId,
        dailyType: "GRID_MANAGE",
        ...timeParams,
      } as {
        pageNumber: number;
        pageSize: number;
        gridAreaId: string;
        dailyType: string;
      } & PeriodParams);
      state.taskInfo.taskStat = result;
    };
    const getAlarmStat = async () => {
      const timeParams = getPeriodParams("day");
      const result = await cubeAlarmCenterService.getAlarmStatusStatistics({
        areaId: gridState.getGridInfo().gridAreaId,
        areaLike: false,
        ...timeParams,
      } as {
        areaId: string;
        areaLike: boolean;
      } & PeriodParams);
      const calcList = result.filter((item) => item.alarmStatus !== "TIME_OUT_UN_HANDLER");
      const alarmNum = calcList.reduce((cur, pre) => {
        return cur + pre.alarmNum;
      }, 0);
      const doneAlarmNum = calcList.find((item) => item.alarmStatus === "ALARM_HANDLER")?.alarmNum || 0;
      state.alarmInfo.alarmStat.alarmNum = alarmNum;
      state.alarmInfo.alarmStat.doneAlarmNum = doneAlarmNum;
    };
    const getMyTaskList = async (pageNumber = 1) => {
      if (state.taskPagination.loading) {
        return;
      }
      state.taskPagination.loading = true;
      const timeParams = getPeriodParams("day");
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
        } & PeriodParams);
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
      const timeParams = getPeriodParams(state.workOrderPeriod);
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
      const timeParams = getPeriodParams(state.workOrderPeriod);
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
    const getAlarmList = async (pageNumber = 1) => {
      if (state.alarmPagination.loading) {
        return;
      }
      state.alarmPagination.loading = true;
      const timeParams = getPeriodParams("day");
      try {
        const res = await cubeAlarmCenterService.getAlarmRecordsPage({
          pageNumber,
          pageSize: PAGE_SIZE,
          userId: "",
          areaIds: gridState.getGridInfo().gridAreaId,
          ...timeParams,
        } as {
          pageNumber: number;
          pageSize: number;
          userId: string;
          areaIds: string;
        } & PeriodParams);
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
    const handleWorkOrderPeriodChange = async (periodType: WorkOrderPeriod): Promise<void> => {
      state.workOrderPeriod = periodType;
      state.workOrderPagination.pageNumber = 0;
      state.workOrderPagination.finished = false;
      state.workOrderInfo.workOrderList = [];
      await Promise.all([getWorkOrderStat(), getWorkOrderList(1)]);
    };
    const handleChangeTab = (tab: string): void => {
      state.activeTab = tab;
    };
    onMounted(async () => {
      getTaskStat();
      getWorkOrderStat();
      getAlarmStat();
      getMyTaskList();
      getWorkOrderList();
      getAlarmList();
    });
    return (): JSX.Element => (
      <div class={styles["visual-container"]}>
        <CubeNavBar title="网格详情" />
        <div class={styles["container"]}>
          <div class={styles["model-container"]}>
            <ModelRender areaId={gridState.getGridInfo().gridAreaId} smartCameraPaddingFactor={1.2} pitchDegrees={0} />
          </div>
          <Popup v-model:show={state.showPopup} round position="bottom" overlay={false}>
            <div class={styles["popup-content"]}>
              <div class={styles["popup-tabs"]}>
                {tabList.map((item) => (
                  <div
                    key={item.key}
                    class={[styles["popup-tab-item"], state.activeTab === item.key && styles["active"]]}
                    onClick={() => handleChangeTab(item.key)}
                  >
                    {item.title}
                  </div>
                ))}
              </div>
              <div class={styles["tab-content"]}>
                {state.activeTab === "basic" && <BasicInfoUI />}
                {state.activeTab === "task" && (
                  <TaskUI
                    taskInfo={state.taskInfo}
                    loading={state.taskPagination.loading}
                    finished={state.taskPagination.finished}
                    onLoadMore={loadMoreTasks}
                  />
                )}
                {state.activeTab === "alarm" && (
                  <AlarmUI
                    alarmInfo={state.alarmInfo}
                    loading={state.alarmPagination.loading}
                    finished={state.alarmPagination.finished}
                    onLoadMore={loadMoreAlarms}
                  />
                )}
                {state.activeTab === "workOrder" && (
                  <WorkOrderUI
                    gridAreaId={gridState.getGridInfo().gridAreaId}
                    period={state.workOrderPeriod}
                    workOrderInfo={state.workOrderInfo}
                    loading={state.workOrderPagination.loading}
                    finished={state.workOrderPagination.finished}
                    onPeriodChange={handleWorkOrderPeriodChange}
                    onLoadMore={loadMoreWorkOrders}
                  />
                )}
              </div>
              {/* <div class={styles['basic']}>
                <div class={styles['center-user-card']}>
                  <div class={styles['user']}>
                    <div class={styles['name']}>李四（网格长）</div>
                    <div>交易区</div>
                  </div>
                  <div class={styles['phone-icon']}>
                    <img src={bluePhoneIcon} alt="" srcset="" />
                  </div>
                </div>
                <div class={styles['grid-card']}>
                  <div class={styles['grid-title']}>网格下属</div>
                  <div class={styles['grid-list']}>
                    <div class={styles['grid-item']}>
                      <img src={gearIcon} alt="" />
                      <div class={styles['item-stat']}>
                        <div class={styles['stat-value']}>33</div>
                        <div class={styles['stat-label']}>档位</div>
                      </div>

                    </div>
                    <div class={styles['grid-item']}>
                      <img src={gearIcon} alt="" />
                      <div class={styles['item-stat']}>
                        <div class={styles['stat-value']}>33</div>
                        <div class={styles['stat-label']}>资产</div>
                      </div>

                    </div>
                    <div class={styles['grid-item']}>
                      <img src={gearIcon} alt="" />
                      <div class={styles['item-stat']}>
                        <div class={styles['stat-value']}>33</div>
                        <div class={styles['stat-label']}>设备</div>
                      </div>

                    </div>
                    <div class={styles['grid-item']}>
                      <img src={gearIcon} alt="" />
                      <div class={styles['item-stat']}>
                        <div class={styles['stat-value']}>33</div>
                        <div class={styles['stat-label']}>巡更点</div>
                      </div>

                    </div>
                    <div class={styles['grid-item']}>
                      <img src={gearIcon} alt="" />
                      <div class={styles['item-stat']}>
                        <div class={styles['stat-value']}>33</div>
                        <div class={styles['stat-label']}>现场点</div>
                      </div>

                    </div>
                    <div class={styles['grid-item']}>
                      <img src={gearIcon} alt="" />
                      <div class={styles['item-stat']}>
                        <div class={styles['stat-value']}>33</div>
                        <div class={styles['stat-label']}>小散工程</div>
                      </div>

                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </Popup>
        </div>
      </div>
    );
  },
});
