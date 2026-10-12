import { ProfileOutlined, PhoneOutlined } from "@ant-design/icons-vue";
import { defineComponent, type PropType } from "vue";

import type { UserInfo } from "@ghcloud/cube-ouaa-service";

import { StepCard } from "../step-card/step-card";
import { TimeCountDown } from "../time-count-down/time-count-down";
import { openAlarmDetailModal } from "@/features/widgets/modal/alarm-detail-modal/alarm-detail-modal";
import { debounce } from "@/infrastructure/utils/common";

import styles from "../../emergency-drill.module.less";

export const SafetyAlarm = defineComponent({
  name: "SafetyAlarm",
  props: {
    title: {
      type: String as PropType<string>,
      default: "安全报警",
    },
    step: {
      type: Number as PropType<number>,
      default: 1,
    },
    active: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    alarmDetail: {
      type: Object as PropType<any>,
      default: () => ({}),
    },
    alarmHandlerUser: {
      type: Object as PropType<UserInfo>,
      default: () => ({}),
    },
    stepStatus: {
      type: Object as PropType<{ status: string; color: string }>,
      default: () => ({ status: "待处理", color: "waiting" }),
    },
    isProcessing: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    startTime: {
      type: Number as PropType<number>,
      default: 0,
    },
    processingTime: {
      type: Number as PropType<number>,
      default: 0,
    },
    onCall: {
      type: Function as PropType<() => void>,
      default: () => {},
    },
    onStart: {
      type: Function as PropType<() => void>,
      default: () => {},
    },
    formattedProcessingTime: {
      type: String as PropType<string>,
      default: "00:00",
    },
  },
  setup(props) {
    const handleDetail = (): void => {
      openAlarmDetailModal({
        title: props.alarmDetail.alarmEventName,
        alarmData: props.alarmDetail,
      });
    };
    const handleCall = debounce(props.onCall, 500);
    const handleStart = debounce(props.onStart, 500);

    const stepSlots = {
      "title-tag": (): JSX.Element => {
        return <span class={[styles.tags, styles[props.stepStatus.color]]}>{props.stepStatus.status}</span>;
      },
      title: (): JSX.Element => {
        // 当处理中时显示倒计时
        if (props.isProcessing && props.startTime > 0) {
          return (
            <div class={styles.time}>
              <TimeCountDown startTime={props.startTime} />
            </div>
          );
        }
        return null;
      },
      content: (): JSX.Element => {
        return (
          <>
            <div class={styles.stepInfo}>
              <div class={styles.item}>
                <span class={styles.label}>报警时间: {props.alarmDetail?.alarmTime ?? "--"}</span>
              </div>
              <div class={styles.item}>
                <span class={styles.label}>
                  {props.alarmDetail?.alarmEventTypeName && `【${props.alarmDetail?.alarmEventTypeName ?? "--"}】`}
                  {props.alarmDetail?.alarmEventName ?? "--"}
                </span>
                <div class={styles.btns}>
                  <span class={[styles.btn, styles.info]} onClick={handleDetail}>
                    <ProfileOutlined class={styles.icon} />
                    详情
                  </span>
                  <span class={[styles.btn, styles.call]} style={{ marginLeft: "5px" }} onClick={handleStart}>
                    <ProfileOutlined class={styles.icon} />
                    {props.isProcessing ? "完成" : "启动"}
                  </span>
                </div>
              </div>
              <div class={styles.item}>
                <span class={styles.label}>通知人员: {props.alarmHandlerUser?.name || "--"}</span>
                <div class={styles.btns} onClick={handleCall}>
                  <span class={[styles.btn, styles.call]}>
                    <PhoneOutlined class={styles.icon} />
                    通话
                  </span>
                </div>
              </div>
              {props.stepStatus.status === "已完成" && (
                <div class={styles.item}>
                  <span>处理时长: {props.formattedProcessingTime}</span>
                </div>
              )}
            </div>
          </>
        );
      },
    };
    return (): JSX.Element => <StepCard {...props} v-slots={stepSlots} />;
  },
});
