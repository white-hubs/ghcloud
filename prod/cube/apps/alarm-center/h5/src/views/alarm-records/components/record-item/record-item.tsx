import { cubeAlarmCenterService } from "../../../../api/server";
import { LocationIcon } from "../../../../components/location-icon";
import { useGlobalRouter } from "../../../../hook/use-global-router";
import { getAssetsFile } from "../../../../utils/index";
import styles from "./index.module.less";
import type { AlarmRecord } from "@ghcloud/cube-alarm-center-service/src/types/alarm-center";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import dayjs from "dayjs";
import { showNotify } from "vant";
import { defineComponent, type PropType } from "vue";
export const RecordItem = defineComponent({
  props: {
    record: {
      type: Object as PropType<AlarmRecord>,
      default: () => {},
    },
    recordIndex: {
      type: Number,
      default: () => 0,
    },
    isCombine: {
      type: Boolean,
      default: () => false,
    },
    permissions: {
      type: Array,
      default: () => undefined,
    },
  },
  emits: ["changeRecord", "handleInfo"],
  setup: (props, { emit }) => {
    const env = getEnvironment();
    const timeoutPng = getAssetsFile("time-out.png");
    const { router } = useGlobalRouter();
    // 移交
    const handleTransfer = (e: Event): void => {
      e.stopPropagation();
      router.push({
        path: "/alarm-transfer",
        query: {
          id: props.record.id,
        },
      });
    };
    // 接收
    const handleAlarmConfirm = async (e: Event): Promise<void> => {
      e.stopPropagation();
      try {
        await cubeAlarmCenterService.handleAlarmConfirm({ id: props.record.id });
        emit("changeRecord", { index: props.recordIndex, record: { ...props.record, alarmStatus: "ALARM_PROGRESS_CONFIRMED" } });
        showNotify({ type: "success", background: "#07c160", message: "接收成功" });
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", background: "#ee0a24", message: errorMessage || "请求失败" });
      }
    };
    // 处理
    const alarmHandle = (e: Event): void => {
      e.stopPropagation();
      router.push({
        path: "/alarm-handle",
        query: {
          id: props.record.id,
        },
      });
    };
    // 跳转详情
    const handleDetails = (): void => {
      emit("handleInfo");
      router.push({
        path: "/alarm-details",
        query: {
          id: props.record.id,
          permissions: JSON.stringify(props.permissions as string[]),
        },
      });
    };
    return (): JSX.Element => (
      <div class={styles["record-item"]} onClick={handleDetails}>
        {props.isCombine && <div class={styles["record-market-name"]}>成都农产品批发市场</div>}

        <div class={[styles["record-item-title"], props.isCombine && styles["record-item-title-combine"]]}>
          <div class={styles.text}>{props.record.alarmEventName}</div>
          <div class={styles["status-level"]}>
            <div class={[styles.status, styles[props.record.alarmStatus]]}>{props.record.alarmStatusName}</div>
            <div class={[styles.level, styles[props.record.alarmLevelCode]]}>{props.record.alarmLevelName}</div>
          </div>
          {props.record.alarmHandlerTimeoutStatus === "TIMED_OUT" && <img class={styles.timeout} src={timeoutPng} alt="" />}
        </div>
        <div class={styles["record-item-content"]}>
          <div class={styles["alarm-cell-item"]}>
            <span class={styles.label}>报警时间:</span>
            <span class={styles.value}>{props.record.alarmTime ? dayjs(props.record.alarmTime).format("YYYY-MM-DD HH:mm:ss") : "--"}</span>
          </div>
          <div class={styles["alarm-cell-item"]}>
            <span class={styles.label}>报警区域:</span>
            <span class={styles.value}>{props.record.areaName || "--"}</span>
          </div>
          <div class={styles["alarm-cell-item"]}>
            <span class={styles.label}>详细位置:</span>
            <span class={styles.value}>
              <span style={{ marginRight: "6px" }} class={styles.address}>
                {props.record.alarmTargetAddress || "--"}{" "}
              </span>
              {env === "cubeApp" && props.record.alarmTargetLongitude && (
                <LocationIcon
                  location={{
                    address: props.record.alarmTargetAddress,
                    lngAndlat: props.record.alarmTargetLongitude,
                  }}
                />
              )}
            </span>
          </div>
          <div class={styles["alarm-cell-item"]}>
            <span class={styles.label}>处理人员:</span>
            <span class={styles.value}>{props.record.alarmHandlerName || "--"}</span>
          </div>
        </div>
        {["ALARM_UN_CONFIRMED", "ALARM_PROGRESS_CONFIRMED"].includes(props.record.alarmStatus) && (
          <div class={styles["record-operate"]}>
            {props.permissions
              ? props.permissions.includes("CONFIRM") &&
                props.record.alarmStatus === "ALARM_UN_CONFIRMED" && (
                  <div class={styles.handle} onClick={handleAlarmConfirm}>
                    接收
                  </div>
                )
              : props.record.alarmStatus === "ALARM_UN_CONFIRMED" && (
                  <div class={styles.handle} onClick={handleAlarmConfirm}>
                    接收
                  </div>
                )}
            {props.record.alarmStatus === "ALARM_PROGRESS_CONFIRMED" && (
              <>
                {props.permissions ? (
                  props.permissions.includes("ASSIGN") && (
                    <div class={styles.transfer} onClick={handleTransfer}>
                      移交
                    </div>
                  )
                ) : (
                  <div class={styles.transfer} onClick={handleTransfer}>
                    移交
                  </div>
                )}
                {props.permissions ? (
                  props.permissions.includes("HANDLE") && (
                    <div class={styles.handle} onClick={alarmHandle}>
                      处理
                    </div>
                  )
                ) : (
                  <div class={styles.handle} onClick={alarmHandle}>
                    处理
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  },
});
