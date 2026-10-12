import { Tab, Tabs, Button, showLoadingToast, closeToast, showNotify } from "vant";
import { defineComponent, onMounted, reactive, ref, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts";
import type { ElectronTaskDetailVo } from "@ghcloud/cube-electronic-patrol-service";

import { stateMapVo } from "../constant";
import { TaskTabCard } from "./components/task-tab-card";
import { cubeElectronPatrolService } from "@/api/server";
import { usePatrolStore } from "@/custom-store/use-patrol-store";

import styles from "./index.module.less";
export const Index = defineComponent({
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const patrolStore = usePatrolStore();
    const state = reactive<{
      taskVo: ElectronTaskDetailVo;
      activeTab: number;
      showPatrolOperate: boolean;
    }>({
      taskVo: {
        id: "",
        taskName: "",
        startDate: 0,
        endDate: 0,
        executeData: "",
        publisherName: "",
        publisherDepName: "",
        patrolLocationNum: 0,
        completedNum: 0,
        undoneNum: 0,
        status: "",
        routeName: "",
        inOrder: false,
        userId: "",
        userName: "",
        userDep: "",
        affirmState: false,
        patrolWayList: [],
        gpsDistanceMeters: undefined,
        gpsStayMinutes: undefined,
        data: [],
        executePeriod: [],
        normalLocationNum: 0,
        untowardLocationNum: 0,
        executePeriodList: [],
        loginBelonger: false,
        assistIds: "",
        assistNames: "",
        distribution: false,
      },
      activeTab: 0,
      showPatrolOperate: false,
    });
    onMounted(() => {
      document.title = "任务详情";
      getData();
    });
    const getData = async (): Promise<void> => {
      showLoadingToast({ message: "加载中..." });
      const result = await cubeElectronPatrolService.getElectronTaskDetail({
        taskId: route.query.taskId as string,
      });
      state.taskVo = result;
      patrolStore.setPatrolUser({
        id: result.userId,
        name: result.userName,
      });
      computedActiveTab();
      handleShowPatrolOperate();
      closeToast();
    };
    const handleShowPatrolOperate = (): void => {
      const nowTime = new Date().getTime();
      state.showPatrolOperate =
        state.taskVo.startDate <= nowTime && state.taskVo.endDate > nowTime && state.taskVo.status === "IN_EXECUTION";
    };
    const canShowGpsPatrol = (): boolean => state.showPatrolOperate && state.taskVo.patrolWayList.includes("GPS");
    const computedActiveTab = (): void => {
      const nowTime = new Date().getTime();
      const index = state.taskVo.executePeriodList.findIndex((item) => item.startTime <= nowTime && item.endTime > nowTime);
      if (index > -1) {
        state.activeTab = index;
      } else {
        state.activeTab = 0;
      }
    };
    const taskTabCardRefs = ref<({ getPoints: () => Promise<void> } | null)[]>([]);
    const handleReceive = async (): Promise<void> => {
      const nowTime = new Date().getTime();
      if (nowTime < state.taskVo.startDate) {
        showNotify({
          type: "danger",
          message: "当前时间未在任务时间范围",
        });
        return;
      }
      if (nowTime > state.taskVo.endDate) {
        showNotify({
          type: "danger",
          message: "当前时间未在任务时间范围",
        });
        return;
      }
      await cubeElectronPatrolService.receiveElectronTask({
        taskId: state.taskVo.id,
      });
      showNotify({
        type: "success",
        message: "接收成功",
      });
      await getData();
      taskTabCardRefs.value.forEach((inst) => inst?.getPoints?.());
    };
    const handleDispatch = (): void => {
      router.push({
        path: "/patrol-task-dispatch",
        query: {
          id: state.taskVo.id,
        },
      });
    };
    const handleTransfer = (): void => {
      router.push({
        path: "/patrol-task-transfer",
        query: {
          taskId: state.taskVo.id,
        },
      });
    };
    const handleGpsPatrol = async (): Promise<void> => {
      const canScan = await cubeElectronPatrolService.checkCanElectronTask({
        taskId: state.taskVo.id,
      });
      if (!canScan) {
        return;
      }
      if (getEnvironment() !== "cubeApp") {
        showNotify({
          type: "warning",
          message: "请在cubeApp中打开",
        });
        return;
      }

      router.push({
        path: "/electronicPatrolGPS",
        query: {
          taskId: state.taskVo.id,
          executePeriod: state.taskVo.executePeriodList[state.activeTab]?.title,
        },
      });
    };
    return (): VNode => (
      <div>
        <CubeNavBar showBack title={route.meta.title} />
        <div class={styles.container}>
          <div class={styles["header-card"]}>
            <div class={styles["title-status"]}>
              <div class={styles.title}>{state.taskVo.taskName}</div>
              <div class={styles.status}>{stateMapVo[state.taskVo.status]}</div>
            </div>
            <div class={styles["card-content"]}>
              <div class={styles["card-row"]}>
                <div class={styles["card-label"]}>巡更时间：</div>
                <div class={styles["card-value"]}>{state.taskVo.executeData || "--"}</div>
              </div>
              <div class={styles["card-row"]}>
                <div class={styles["card-label"]}>巡更点数：</div>
                <div class={styles["card-value"]}>{state.taskVo.patrolLocationNum || "--"}</div>
              </div>
              <div class={styles["card-row"]}>
                <div class={styles["card-label"]}>发布人：</div>
                <div class={styles["card-value"]}>{state.taskVo.publisherName || "--"}</div>
              </div>
              <div class={styles["card-row"]}>
                <div class={styles["card-label"]}>发布部门：</div>
                <div class={styles["card-value"]}>{state.taskVo.publisherDepName || "--"}</div>
              </div>
              <div class={styles["card-row"]}>
                <div class={styles["card-label"]}>协同人：</div>
                <div class={styles["card-value"]}>{state.taskVo.assistNames || "--"}</div>
              </div>
              <div class={styles["card-row"]}>
                <div class={styles["card-label"]}>巡更人：</div>
                <div class={styles["card-value"]}>{state.taskVo.userName || "--"}</div>
              </div>
            </div>
          </div>
          <div class={styles.tabsContainer}>
            <Tabs animated shrink v-model:active={state.activeTab}>
              {state.taskVo.executePeriodList.map((item, tabIndex) => (
                <Tab title={item.title} key={item.title}>
                  <TaskTabCard
                    ref={(el) => {
                      if (el) {
                        taskTabCardRefs.value[tabIndex] = el as unknown as { getPoints: () => Promise<void> };
                      }
                    }}
                    patrolWayList={state.taskVo.patrolWayList}
                    showOperate={state.showPatrolOperate}
                    patrolItem={item}
                    taskId={state.taskVo.id}
                  />
                </Tab>
              ))}
            </Tabs>
          </div>
          <div class={styles["footer-btn"]}>
            <div style={{ display: "flex", gap: "12px", width: "100%" }}>
              {state.taskVo.status === "TO_BE_RECEIVED" && (
                <Button block type="primary" onClick={handleReceive}>
                  接收
                </Button>
              )}
              {state.taskVo.status === "IN_EXECUTION" && state.taskVo.distribution && (
                <Button block onClick={handleDispatch}>
                  分发
                </Button>
              )}
              {state.taskVo.status === "IN_EXECUTION" && state.taskVo.loginBelonger && (
                <Button block type="primary" onClick={handleTransfer}>
                  移交
                </Button>
              )}
              {canShowGpsPatrol() && (
                <Button block type="primary" onClick={handleGpsPatrol}>
                  GPS巡更
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
