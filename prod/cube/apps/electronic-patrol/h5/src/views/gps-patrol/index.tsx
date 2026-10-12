import { Button, Cell, Popup, showDialog, showNotify, closeToast } from "vant";
import { defineComponent, onBeforeUnmount, onMounted, reactive, type VNode } from "vue";
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import type { ElectronTaskDetailVo, GpsPatrolCandidate, PatrolPointVo } from "@ghcloud/cube-electronic-patrol-service";

import { cubeElectronPatrolService } from "@/api/server";
import { handleStorePatrolPoint, usePatrolStore } from "@/custom-store/use-patrol-store";

import styles from "./index.module.less";

const createEmptyTask = (): ElectronTaskDetailVo => ({
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
});

export const Index = defineComponent({
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const patrolStore = usePatrolStore();
    const state = reactive<{
      taskVo: ElectronTaskDetailVo;
      elapsedMinutes: number;
      requiredStayMinutes: number;
      scanning: boolean;
      matching: boolean;
      gpsCandidates: GpsPatrolCandidate[];
      showGpsCandidates: boolean;
      statusText: string;
    }>({
      taskVo: createEmptyTask(),
      elapsedMinutes: 0,
      requiredStayMinutes: 1,
      scanning: false,
      matching: false,
      gpsCandidates: [],
      showGpsCandidates: false,
      statusText: "GPS巡更中",
    });
    let gpsTimer: ReturnType<typeof setInterval> | null = null;

    onMounted(() => {
      document.title = "GPS巡更";
      initGpsPatrol();
    });

    onBeforeRouteLeave(() => {
      cleanupGpsPatrol();
    });

    onBeforeUnmount(() => {
      cleanupGpsPatrol();
    });

    const initGpsPatrol = async (): Promise<void> => {
      try {
        if (getEnvironment() !== "cubeApp") {
          showNotify({ type: "warning", message: "请在cubeApp中打开" });
          return;
        }
        const taskId = route.query.taskId as string;
        const taskVo = await cubeElectronPatrolService.getElectronTaskDetail({ taskId });
        state.taskVo = taskVo;
        state.requiredStayMinutes = Math.max(1, Number(taskVo.gpsStayMinutes || 1));
        patrolStore.setPatrolUser({
          id: taskVo.userId,
          name: taskVo.userName,
        });

        const canPatrol = await cubeElectronPatrolService.checkCanElectronTask({ taskId });
        if (!canPatrol) {
          return;
        }
        const location = await cubeAppService.getLocation();

        if (typeof location?.longitude !== "number" || typeof location?.latitude !== "number") {
          await showGpsDisabledDialog();
          return;
        }
        state.scanning = true;
        state.statusText = "GPS巡更中";
        startGpsTimer();
      } catch (error) {
        const errorMessage = (error as { toJSON?: () => { errorMessage?: string } }).toJSON?.().errorMessage;
        showNotify({ type: "danger", message: errorMessage || "GPS巡更启动失败" });
      } finally {
        closeToast();
      }
    };

    const startGpsTimer = (): void => {
      stopGpsTimer();

      gpsTimer = setInterval(() => {
        if (!state.scanning) {
          stopGpsTimer();
          return;
        }
        state.elapsedMinutes += 1;
        if (state.elapsedMinutes >= state.requiredStayMinutes) {
          void requestGpsMatch();
        }
      }, 60 * 1000);
    };

    const stopGpsTimer = (): void => {
      if (gpsTimer) {
        clearInterval(gpsTimer);
        gpsTimer = null;
      }
    };

    const cleanupGpsPatrol = (): void => {
      state.scanning = false;
      state.matching = false;
      state.showGpsCandidates = false;
      stopGpsTimer();
    };

    const showGpsDisabledDialog = async (): Promise<void> => {
      await showDialog({
        message: "手机GPS定位未开启",
        confirmButtonText: "确认",
      });
    };

    const getExecutePeriod = (): string | undefined => route.query.executePeriod as string | undefined;

    const buildGpsPatrolPoint = (candidate: GpsPatrolCandidate): PatrolPointVo => ({
      id: String(candidate.id ?? ""),
      locationId: String(candidate.locationId ?? ""),
      locationName: candidate.locationName || "--",
      taskName: state.taskVo.taskName,
      nfcCode: "",
      bluetoothCode: "",
      arae: [],
      userId: state.taskVo.userId,
      userName: state.taskVo.userName,
      startDate: state.taskVo.startDate,
      endDate: state.taskVo.endDate,
      patrolResult: candidate.defaultResult || "NORMAL",
      hiddenId: "",
      remark: "",
      orderNum: 0,
      nfcLongitude: "",
      nfcDimension: "",
      patrolWay: "GPS",
      files: [],
      superintendent: true,
    });

    const goGpsPatrolResult = (candidate: GpsPatrolCandidate): void => {
      stopGpsTimer();
      state.scanning = false;
      state.showGpsCandidates = false;
      handleStorePatrolPoint(buildGpsPatrolPoint(candidate));
      router.push({
        path: "/patrol-result",
        query: {
          backCount: 2,
          targetId: candidate.locationId,
          targetName: candidate.locationName,
        },
      });
    };

    const requestGpsMatch = async (): Promise<void> => {
      if (state.matching || !state.scanning) {
        return;
      }
      state.matching = true;
      state.statusText = "正在识别巡更点";
      try {
        const location = await cubeAppService.getLocation();
        if (typeof location?.longitude !== "number" || typeof location?.latitude !== "number") {
          await showGpsDisabledDialog();
          return;
        }
        if (!state.scanning) {
          return;
        }
        const executePeriod = getExecutePeriod();
        const payload = {
          taskId: state.taskVo.id,
          longitude: location.longitude,
          latitude: location.latitude,
          stayMinutes: state.elapsedMinutes,
          sourceType: "USER",
        } as const;
        const result = await cubeElectronPatrolService.matchGpsPatrol(executePeriod ? { ...payload, executePeriod } : payload);
        if (!state.scanning) {
          return;
        }
        if (result.status === "MATCHED" && result.candidates.length > 0) {
          goGpsPatrolResult(result.candidates[0]);
          return;
        }
        if (result.status === "MULTIPLE" && result.candidates.length > 0) {
          stopGpsTimer();
          state.scanning = false;
          state.gpsCandidates = result.candidates;
          state.showGpsCandidates = true;
          return;
        }
        if (result.status === "ORDER_LIMIT") {
          await showDialog({ message: result.message || `请到${result.nextLocation?.locationName || "--"}巡更点进行巡更` });
          return;
        }
        if (result.status === "WAIT_STAY") {
          showNotify({ type: "warning", message: result.message || "已进入巡更范围，请继续停留" });
          return;
        }
        showNotify({ type: "warning", message: result.message || "未匹配到巡更点" });
      } catch (error) {
        const errorMessage = (error as { toJSON?: () => { errorMessage?: string } }).toJSON?.().errorMessage;
        showNotify({ type: "danger", message: errorMessage || "GPS巡更匹配失败" });
      } finally {
        state.matching = false;
        if (state.scanning) {
          state.statusText = state.elapsedMinutes >= state.requiredStayMinutes ? "正在识别巡更点" : "GPS巡更中";
        }
      }
    };

    const exitGpsPatrol = (): void => {
      cleanupGpsPatrol();
      router.go(-1);
    };

    return (): VNode => (
      <>
        <CubeNavBar showBack title="GPS巡更" />
        <div class={styles.container}>
          <div class={styles.radar}>
            <div class={styles.sweep} />
            <div class={styles.centerDot} />
          </div>
          <div class={styles.title}>{state.statusText}</div>
          <div class={styles.subTitle}>{state.taskVo.taskName || "--"}</div>
          <div class={styles.timer}>
            请等待 {state.elapsedMinutes} / {state.requiredStayMinutes} 分钟
          </div>
          {state.elapsedMinutes < state.requiredStayMinutes && (
            <Button class={styles.exitBtn} block plain type="primary" onClick={exitGpsPatrol}>
              退出巡更
            </Button>
          )}
        </div>
        <Popup v-model:show={state.showGpsCandidates} round position="bottom">
          <div class={styles.candidateTitle}>选择巡更点</div>
          {state.gpsCandidates.map((item) => (
            <Cell
              key={item.id}
              title={item.locationName}
              label={typeof item.distanceMeters === "number" ? `距离 ${item.distanceMeters.toFixed(1)} 米` : ""}
              is-link
              onClick={() => goGpsPatrolResult(item)}
            />
          ))}
        </Popup>
      </>
    );
  },
});
