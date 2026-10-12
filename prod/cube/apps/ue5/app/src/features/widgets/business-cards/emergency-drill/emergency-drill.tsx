import moment from "moment";
import { defineComponent, h, onMounted, onUnmounted, reactive, ref, toRefs } from "vue";

import { CubeOuaaService, type UserInfo } from "@ghcloud/cube-ouaa-service";

import { EmergencyEscape } from "./components/emergency-escape/emergency-escape";
import { EmergencyFinish } from "./components/emergency-finish/emergency-finish";
import { EmergencyHandle } from "./components/emergency-handle/emergency-handle";
import { SafetyAlarm } from "./components/safety-alarm/safety-alarm";
import { AlarmStatus } from "./hooks/tool";
import { useEmergencyDrill } from "./hooks/use-emergency-drill";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getAlarmRecordId } from "@/infrastructure/api/alarm";
import { changeModelByAreaId } from "@/visualization-core/event/register/common";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./emergency-drill.module.less";

/** 预案演练 demo 面板 */
export const EmergencyDrill = defineComponent({
  name: "EmergencyDrill",
  setup() {
    const { globalState, getAreaLevelById } = useStateStore();
    const { alarmDetail } = toRefs(globalState.business);
    const alarmHandlerUser = ref<UserInfo>();

    const { currentStep, steps, formattedTotalTime, handleCall, handleStart, playAnimation, formatStepTime, onUnmount } =
      useEmergencyDrill();

    const state = reactive<any>({
      info: {
        alarmStatus: AlarmStatus.ALARM_UN_CONFIRMED,
      },
    });

    const getData = async (): Promise<void> => {
      if (alarmDetail.value?.id) {
        const res = await getAlarmRecordId({ id: alarmDetail.value.id });
        state.info = {
          ...alarmDetail.value,
          ...res,
          alarmTime: moment(res.alarmTime).format("YYYY-MM-DD HH:mm:ss"),
          alarmConfirmedTime: res.alarmConfirmedTime ? moment(res.alarmConfirmedTime).format("YYYY-MM-DD HH:mm:ss") : "--",
        };
        // 处理人数据获取
        if (state.info.alarmNotifyUsers.length > 0) {
          const { authInfo } = useStateStore();
          alarmHandlerUser.value = await new CubeOuaaService(authInfo).getPersonInfo(state.info.alarmNotifyUsers[0].userId);
          state.info.callHandlerUser = alarmHandlerUser.value;
        }
        globalState.business.alarmDetail = state.info;
      } else {
        // 演示数据
        state.info = {
          alarmTime: "2023-06-16 17:58",
          alarmEventName: "火焰烟感火焰烟感火焰...",
          alarmEventTypeName: "冻品区",
          alarmHandlerName: "张三",
          alarmStatus: AlarmStatus.ALARM_UN_CONFIRMED,
        };
      }
    };
    onMounted(async () => {
      await getData();
      // 切换视角
      const areaIds = (globalState.business.alarmDetail?.area as string)?.split("-") || [];
      const areaId = areaIds[areaIds.length - 1];
      globalState.business.currentAreaId = areaId;
      globalState.business.currentAreaLeave = getAreaLevelById(areaId);
      await changeModelByAreaId();
      // playAnimation(1, state.info?.areaName)
      // showBuilding()
    });

    onUnmounted(() => {
      onUnmount();
    });

    const stepComponents = [
      { component: SafetyAlarm, title: "安全报警", step: 1 },
      { component: EmergencyEscape, title: "应急疏散", step: 2 },
      { component: EmergencyHandle, title: "应急处置", step: 3 },
      { component: EmergencyFinish, title: "处置完成", step: 4 },
    ];

    return (): JSX.Element => (
      <SubPanelTemplate title="预案关联">
        <div class={styles.emergencyDrill}>
          <div class={styles.emergencyStep}>
            <div class={styles.stepContainer}>
              {stepComponents.map((item, index) => {
                return h(item.component, {
                  title: item.title,
                  step: item.step,
                  key: `step-${item.step}`,
                  active: currentStep.value === item.step,
                  alarmDetail: state.info,
                  alarmHandlerUser: alarmHandlerUser.value,
                  totalProcessingTime: formattedTotalTime.value,
                  stepStatus: steps.value[index].status,
                  isProcessing: steps.value[index].isProcessing,
                  startTime: steps.value[index].startTime,
                  processingTime: steps.value[index].processingTime,
                  formattedProcessingTime: formatStepTime(steps.value[index].processingTime),
                  onCall: () => {
                    handleCall(index);
                    if (steps.value[index].isProcessing) {
                      playAnimation(item.step, state.info?.areaName);
                    }
                  },
                  onStart: () => {
                    handleStart(index);
                    if (steps.value[index].isProcessing) {
                      playAnimation(item.step, state.info?.areaName);
                    }
                  },
                });
              })}
            </div>
          </div>
        </div>
      </SubPanelTemplate>
    );
  },
});
