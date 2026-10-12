import { CloseOutlined } from "@ant-design/icons-vue";
import { computed, defineComponent, type PropType, ref, watch } from "vue";

import AlarmSnapshot from "@/features/equipment/alarm-chart-components/alarm-snapshot";
import type { EventVideo } from "@/infrastructure/api/models/linkage";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import H5Video from "@/shared-ui/panel/H5Video";

import "./alarm-modal.module.less";

const alarmModalPng = "/resource/v1/ue5-migrate/views-2d/alarm-empty.png";

interface AlarmData {
  alarmLevelCode: string;
  alarmLevelName: string;
  alarmTypeName: string;
  alarmTargetCode: string;
  alarmTargetName: string;
  alarmTargetTypeName: string;
  alarmTime: string;
  area: string;
  areaName: string;
  alarmEventName: string;
  alarmStatus: string;
  alarmStatusNameg: string;
  alarmTypeCode: string;
  businessKey: string;
  videoArr: EventVideo[];
}

export const AlarmModal = defineComponent({
  name: "Scada2DAlarmModal",
  props: {
    visible: { type: Boolean, required: true, default: false },
    alarmArr: { type: Array as PropType<AlarmData[]>, required: true, default: () => [] },
  },
  emits: ["closeAlarmModal"],
  setup(props, { emit }) {
    const currentAlarmIndex = ref(0);
    const activeKey = ref<string | null>(props.alarmArr[0]?.videoArr[0]?.deviceId ?? null);

    const getclass = computed(() => (level: string) => {
      switch (level) {
        case "one_level":
          return "red";
        case "two_level":
          return "yellow";
        case "three_level":
          return "orange";
        case "four_level":
          return "blue";
        default:
          return "blue";
      }
    });

    const getImg = computed(() => (level: string) => {
      switch (level) {
        case "one_level":
          return getAssetsImage("hong.png");
        case "two_level":
          return getAssetsImage("cheng.png");
        case "three_level":
          return getAssetsImage("huang.png");
        case "four_level":
          return getAssetsImage("lan.png");
        default:
          return getAssetsImage("lan.png");
      }
    });

    const getSJ = (data: AlarmData): string => ` 【${data.alarmTargetName} 在【${data.areaName}】发生 【${data.alarmEventName}】报警事件`;

    const handlePre = (): void => {
      if (currentAlarmIndex.value > 0) {
        currentAlarmIndex.value--;
        if (props.alarmArr[0]?.videoArr.length) {
          activeKey.value = props.alarmArr[currentAlarmIndex.value].videoArr[0].deviceId;
        }
      }
    };

    const handleNext = (): void => {
      if (currentAlarmIndex.value < props.alarmArr.length - 1) {
        currentAlarmIndex.value++;
        if (props.alarmArr[0]?.videoArr.length) {
          activeKey.value = props.alarmArr[currentAlarmIndex.value].videoArr[0].deviceId;
        }
      }
    };

    const handleClose = (): void => {
      emit("closeAlarmModal");
    };

    watch(
      () => [...props.alarmArr],
      () => {
        if (props.alarmArr.length && props.alarmArr[0].videoArr.length) {
          activeKey.value = props.alarmArr[0].videoArr[0].deviceId;
        }
      },
    );

    return (): JSX.Element | null => {
      if (!props.visible || props.alarmArr.length === 0) {
        return null;
      }

      const currentAlarm = props.alarmArr[currentAlarmIndex.value];
      const levelClass = getclass.value(currentAlarm.alarmLevelCode);
      const chartTypes = ["ELECTRICMANAGE", "FIRECONTROL", "ROTATINGMANAGE"];

      return (
        <div class="alarmDetail-wrap">
          <div class="alarm_box">
            <div class={["modal", levelClass]}>
              <div class="alarmDetail-modal-header">
                <div class="header-title">
                  <span>{currentAlarm.alarmTypeName}</span>
                  <a-tag color={levelClass} style="margin-left: 10px">
                    {currentAlarm.alarmLevelName}
                  </a-tag>
                </div>
                <div class="header-close" onClick={handleClose}>
                  <CloseOutlined />
                </div>
              </div>

              <div class="alarm_name" style={{ backgroundImage: `url(${getImg.value(currentAlarm.alarmLevelCode)})` }}>
                <div>{currentAlarm.alarmEventName}</div>
                <div class="alarm_time">{currentAlarm.alarmTime}</div>
              </div>

              <a-tooltip placement="topLeft" title={getSJ(currentAlarm)} arrow-point-at-center="">
                <div class="alarm_describe">
                  【{currentAlarm.alarmTargetName}】 在【{currentAlarm.areaName}】发生 【{currentAlarm.alarmEventName}】报警事件
                </div>
              </a-tooltip>

              <div class="alarm-content">
                {currentAlarm.videoArr.length > 0 ? (
                  <a-tabs
                    activeKey={activeKey.value ?? undefined}
                    onUpdate:activeKey={(value: string) => {
                      activeKey.value = value;
                    }}
                  >
                    {currentAlarm.videoArr.map((video) => (
                      <a-tab-pane key={video.deviceId} tab={video.deviceName}>
                        <div class="alarm-video-container">
                          <H5Video camera-item={video} id-str={`alarm_modal_${video.token}`} />
                        </div>
                      </a-tab-pane>
                    ))}
                  </a-tabs>
                ) : chartTypes.includes(currentAlarm.alarmTypeCode) ? (
                  <div>
                    <div class="alarm-chart-container">
                      <AlarmSnapshot alarmInfo={currentAlarm} id={currentAlarm.businessKey} />
                    </div>
                  </div>
                ) : (
                  <div style={{ justifyContent: "center", display: "flex" }}>
                    <img src={alarmModalPng} alt="" />
                  </div>
                )}
              </div>

              <div class="modal-footer">
                <a-space size={16}>
                  <span>
                    {currentAlarmIndex.value + 1}/{props.alarmArr.length}
                  </span>
                  <a-button disabled={currentAlarmIndex.value === 0} size="small" onClick={handlePre}>
                    上一条
                  </a-button>
                  <a-button disabled={currentAlarmIndex.value === props.alarmArr.length - 1} size="small" onClick={handleNext}>
                    下一条
                  </a-button>
                  <a-button size="small" type="primary" onClick={handleClose}>
                    关闭
                  </a-button>
                </a-space>
              </div>
            </div>
          </div>
        </div>
      );
    };
  },
});

export default AlarmModal;
