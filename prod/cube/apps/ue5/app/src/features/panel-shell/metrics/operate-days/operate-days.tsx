import { defineComponent, ref, type PropType } from "vue";

import ModalAlarmTable from "@/features/equipment/modal-table/modal-alarm-tableNew";
import ModalEquipmentTable from "@/features/equipment/modal-table/modal-equipment-table";
import CountTo from "@/shared-ui/panel/count-to/count-to";

import styles from "./operate-days.module.less";

export const OperateDays = defineComponent({
  name: "OperateDays",
  props: {
    value: { type: Number, required: true, default: 0 },
    title: { type: String, required: true, default: "xx数量" },
    unit: { type: String, required: false },
    decimals: { type: Number, required: true, default: 0 },
    parameter: { type: Object as PropType<object>, default: () => ({}) },
  },
  setup(props, { slots }) {
    const deviceParameter = ref<Record<string, unknown>>({
      status: "",
    });
    const deviceModalShow = ref(false);
    const alarmModalShow = ref(false);
    const alarmParameter = ref<Record<string, unknown>>({});

    const handelClickDeviceNum = (): void => {
      if (props.title === "报警总数" || props.title === "报警数") {
        alarmParameter.value = { ...props.parameter };
        alarmModalShow.value = true;
      } else if (props.title === "设备总数" || props.title === "设备数") {
        deviceModalShow.value = true;
      }
    };

    const closeModal = (): void => {
      alarmModalShow.value = false;
      deviceModalShow.value = false;
    };

    return (): JSX.Element => (
      <>
        <div class={styles.operateDays} onClick={handelClickDeviceNum}>
          <div class={styles.top}>
            <div class={styles.tit}>{props.title}</div>
            <div class={[styles.statstics, "flex-end"]}>
              <CountTo startVal={0} endVal={props.value} duration={4000} decimals={props.decimals} class="scroll-number" />
              {props.unit && <span class={styles.unit}>{props.unit}</span>}
              {slots.default?.()}
            </div>
          </div>
        </div>
        {alarmModalShow.value && <ModalAlarmTable showModal={alarmModalShow.value} onClose={closeModal} parameter={alarmParameter.value} />}
        {deviceModalShow.value && (
          <ModalEquipmentTable showModal={deviceModalShow.value} onClose={closeModal} parameter={deviceParameter.value} />
        )}
      </>
    );
  },
});

export default OperateDays;
