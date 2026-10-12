import dayjs from "dayjs";
import { PullRefresh, showNotify } from "vant";
import { defineComponent, onMounted, reactive, watch, type PropType } from "vue";
import { useRouter } from "vue-router";

import { CubeAppBusinessBridge } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts";
import type { PatrolPointVo, ExecutePeriodList } from "@ghcloud/cube-electronic-patrol-service";

import { cubeElectronPatrolService, cubeDailyInspectionService } from "@/api/server";
import { handleStorePatrolPoint } from "@/custom-store/use-patrol-store";
import { updatePatrolLocationIfAbsent } from "@/utils/update-patrol-location";

import styles from "./index.module.less";
export const TaskTabCard = defineComponent({
  props: {
    taskId: {
      type: String,
      default: "",
    },
    patrolWayList: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    patrolItem: {
      type: Object as PropType<ExecutePeriodList>,
      default: () => ({}),
    },
    showOperate: {
      type: Boolean,
      default: false,
    },
  },
  setup: (props, { expose }) => {
    const router = useRouter();
    const state = reactive<{
      pointList: PatrolPointVo[];
      loading: boolean;
      canPatrol: boolean;
    }>({
      pointList: [],
      canPatrol: false,
      loading: false,
    });
    const patrolResultMap: Record<string, string> = {
      ABNORMAL: "异常",
      NORMAL: "正常",
    };
    const getPoints = async (): Promise<void> => {
      const result = await cubeElectronPatrolService.getElectronTaskPoint({
        taskId: props.taskId,
        executePeriod: props.patrolItem.title,
      });
      state.pointList = result;
    };
    const handleCanPatrol = async (): Promise<void> => {
      const nowTime = new Date().getTime();
      state.canPatrol = props.patrolItem.startTime <= nowTime && props.patrolItem.endTime > nowTime;
    };

    const handleRefresh = async (): Promise<void> => {
      await getPoints();
      state.loading = false;
    };
    const getScanEntityCode = (code: string): string => {
      if (!code.includes("http")) {
        return code;
      }
      try {
        return new URL(code).searchParams.get("code") || code;
      } catch {
        const query = code.split("?")[1] || "";
        return new URLSearchParams(query).get("code") || code;
      }
    };
    const handleScanQrcode = async (pointVo: PatrolPointVo): Promise<void> => {
      const canScan = await cubeElectronPatrolService.checkCanElectronTask({
        taskId: props.taskId,
      });
      if (!canScan) return;
      handleStorePatrolPoint(pointVo);
      if (getEnvironment() !== "cubeApp") {
        showNotify({
          type: "warning",
          message: "请在cubeApp中打开",
        });
        return;
      }
      const code = await CubeAppBusinessBridge.handleBusinessScanCode();
      const scanCode = getScanEntityCode(code);
      const result = await cubeDailyInspectionService.getEntityByCode(encodeURIComponent(scanCode));
      if (String(result.entityId ?? "") !== String(pointVo.locationId ?? "")) {
        showNotify({
          type: "warning",
          message: "二维码与点位不一致",
        });
        return;
      }
      void updatePatrolLocationIfAbsent(pointVo.locationId);
      router.push({
        path: "/patrol-result",
        query: {
          backCount: 1,
          targetId: pointVo.locationId,
          targetName: pointVo.locationName,
        },
      });
    };
    const handleBlueToothPatrol = async (pointVo: PatrolPointVo): Promise<void> => {
      const canScan = await cubeElectronPatrolService.checkCanElectronTask({
        taskId: props.taskId,
      });
      if (!canScan) return;
      handleStorePatrolPoint(pointVo);
      router.push({
        path: "/electronicPatrolBluetooth",
        query: {
          bluetoothCode: pointVo.bluetoothCode,
          locationId: pointVo.locationId,
        },
      });
    };
    const handleNFCPatrol = async (pointVo: PatrolPointVo): Promise<void> => {
      const canScan = await cubeElectronPatrolService.checkCanElectronTask({
        taskId: props.taskId,
      });
      if (!canScan) return;
      handleStorePatrolPoint(pointVo);
      router.push({
        path: "/electronicPatrolNFC",
        query: {
          nfcCode: pointVo.nfcCode,
          locationId: pointVo.locationId,
        },
      });
    };
    const handleHiddenDanger = (pointVo: PatrolPointVo): void => {
      window.location.href = `/streamengineH5/initiating-work-order?processType=HANDLING&businessType=HIDDENDANGER&processId=${pointVo.hiddenId}`;
    };
    watch(
      () => props.showOperate,
      () => {
        props.showOperate && handleCanPatrol();
      },
      {
        immediate: true,
      },
    );
    onMounted(async () => {
      await getPoints();
    });
    expose({ getPoints });
    return (): JSX.Element => (
      <PullRefresh class={styles.pullRefresh} v-model={state.loading} success-text="刷新成功" onRefresh={handleRefresh}>
        <div class={styles.taskRecord}>
          {state.pointList.map((item) => (
            <div class={styles.taskItem} key={item.id} style={{ borderLeft: "1px dashed #ebebeb" }}>
              <div class={[styles.stepIcon, item.patrolResult && styles[item.patrolResult]]} />
              <div class={styles["title-status"]}>
                <div class={styles.title}>{item.locationName}</div>
                <div class={[styles.status, styles[item.patrolResult]]}>
                  {item.patrolResult ? patrolResultMap[item.patrolResult] : "--"}
                </div>
              </div>
              <div class={styles.taskInfo}>
                <div>{item.arae.length ? item.arae[0].name : "--"}</div>
                {state.canPatrol && !item.patrolResult && item.superintendent && (
                  <div class={styles["task-operate"]}>
                    {props.patrolWayList.includes("QRCODE") && (
                      <div class={styles.operate} onClick={async () => handleScanQrcode(item)}>
                        扫码巡更
                      </div>
                    )}
                    {props.patrolWayList.includes("BLUETOOTH") && (
                      <div class={styles.operate} onClick={async () => handleBlueToothPatrol(item)}>
                        蓝牙巡更
                      </div>
                    )}
                    {props.patrolWayList.includes("NFC") && (
                      <div class={styles.operate} onClick={async () => handleNFCPatrol(item)}>
                        NFC巡更
                      </div>
                    )}
                  </div>
                )}
              </div>
              {item.patrolResult && (
                <div class={styles.taskInfo}>
                  <div class={styles.taskPerson}>{item.userName}</div>
                  <div>{item.patrolDate ? dayjs(item.patrolDate).format("YYYY-MM-DD HH:mm:ss") : "--"}</div>
                </div>
              )}
              {!item.patrolResult && "--"}
              {item.hiddenId && (
                <div
                  class={styles["hidden-danger"]}
                  onClick={() => {
                    handleHiddenDanger(item);
                  }}
                >
                  隐患排查
                </div>
              )}
            </div>
          ))}
        </div>
      </PullRefresh>
    );
  },
});
