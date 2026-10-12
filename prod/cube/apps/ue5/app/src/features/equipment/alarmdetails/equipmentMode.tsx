import { RightOutlined } from "@ant-design/icons-vue";
import { defineComponent, onMounted, ref, type PropType } from "vue";

import Modal from "../modal-table/modal";
import AlarmFlow from "./flow";
import AlarmInfo from "./info";
import AlarmPlan from "./plan";
import { getOperatorLogs } from "@/infrastructure/api/alarm";
import { getIotDeviceListByEvent } from "@/infrastructure/api/linkage";
import bus from "@/infrastructure/utils/bus";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./equipmentMode.module.less";

export const EquipmentMode = defineComponent({
  name: "EquipmentMode",
  props: {
    alarmDetailData: { type: Object as PropType<Record<string, any>>, required: true },
    isalarm: { type: Boolean, required: false },
    xf: { type: Boolean, required: false },
    showModal: { type: Boolean, required: true, default: true },
  },
  emits: ["close", "showBusinessPanel", "openDevicePanel", "closeDevicePanel"],
  setup(props, { emit }) {
    const { globalState } = useStateStore();
    const tabsList = ref<string[]>(["报警详情"]);
    const activeTabs = ref("报警详情");

    const closeModal = (backViewPoint = false): void => {
      globalState.business.currentAreaLeave = Math.min(
        props.alarmDetailData?.area ? props.alarmDetailData.area.split("-").length + 1 : 1,
        3,
      );
      emit("showBusinessPanel");
      emit("close", backViewPoint);
    };

    const toDeviceInfo = (): void => {
      emit("close", false);
      emit("closeDevicePanel", false);
      emit("openDevicePanel", props.alarmDetailData.alarmTargetKey, props.alarmDetailData);
      bus.emit("openDevicePopup", props.alarmDetailData);
    };

    const getDeviceLinkageList = async (): Promise<void> => {
      const data = await getIotDeviceListByEvent({
        eventId: props.alarmDetailData.businessKey,
      });
      if (data && data.length) {
        tabsList.value.push("联动预案");
      }
    };

    const getFlowPath = async (): Promise<void> => {
      const data = await getOperatorLogs({ id: props.alarmDetailData.id });
      if (data?.length) {
        tabsList.value.push("处理流程");
      }
    };

    onMounted(() => {
      void getDeviceLinkageList();
      void getFlowPath();
    });

    return (): JSX.Element => (
      <Modal
        title={props.alarmDetailData?.alarmTypeName || props.alarmDetailData?.alarmEventName || "报警详情"}
        show={props.showModal}
        width="1150px"
        zIndex={3300}
        onClose={() => closeModal(false)}
        wrapClassName="modal-table-alarm modal-alarm-detail"
      >
        <div class="alarmDetail-wrap">
          <div class={["alarmDetail-modal", props.xf ? "xf" : ""]}>
            <div class="alarmDetail-modal-content flex-column">
              <div class="content-tabs">
                {tabsList.value.map((item) => (
                  <div
                    key={item}
                    class={item === activeTabs.value ? "active" : ""}
                    onClick={() => {
                      activeTabs.value = item;
                    }}
                  >
                    <div>{item}</div>
                    <span>
                      <RightOutlined />
                    </span>
                  </div>
                ))}
              </div>
              <div class="conent-body">
                {activeTabs.value === "报警详情" && <AlarmInfo id={props.alarmDetailData?.id} onToDeviceInfo={toDeviceInfo} />}
                {activeTabs.value === "联动预案" && (
                  <AlarmPlan id={props.alarmDetailData?.id} businessKey={props.alarmDetailData?.businessKey} />
                )}
                {activeTabs.value === "处理流程" && <AlarmFlow id={props.alarmDetailData?.id} />}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  },
});

export default EquipmentMode;
