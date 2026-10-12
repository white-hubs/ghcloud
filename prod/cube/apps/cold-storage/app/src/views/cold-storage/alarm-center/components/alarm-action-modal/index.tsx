import { defineComponent, type PropType } from "vue";

import type { AlarmRecord as PlatformAlarmRecord } from "@ghcloud/cube-service-interface/alarm-center";

import type { AlarmActionType, AlarmRecord } from "../../alarm-record-types";
import { FollowUpAlarmModal } from "./follow-up-alarm-modal";
import { HandleAlarmModal } from "./handle-alarm-modal";
import { PushAgainAlarmModal } from "./push-again-alarm-modal";
import { SuspendAlarmModal } from "./suspend-alarm-modal";
import { TransferAlarmModal } from "./transfer-alarm-modal";

import "./index.less";

export const AlarmActionModal = defineComponent({
  name: "AlarmActionModal",
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    action: {
      type: String as PropType<AlarmActionType>,
      required: true,
    },
    record: {
      type: Object as PropType<AlarmRecord | PlatformAlarmRecord | null>,
      default: null,
    },
  },
  emits: ["update:visible", "success"],
  setup: (props, { emit }) => {
    const close = (visible: boolean): void => {
      emit("update:visible", visible);
    };

    const success = (): void => {
      emit("success");
    };

    return () => {
      if (props.action === "transfer") {
        return <TransferAlarmModal visible={props.visible} record={props.record} onUpdate:visible={close} onSuccess={success} />;
      }
      if (props.action === "suspend") {
        return <SuspendAlarmModal visible={props.visible} record={props.record} onUpdate:visible={close} onSuccess={success} />;
      }
      if (props.action === "handle") {
        return <HandleAlarmModal visible={props.visible} record={props.record} onUpdate:visible={close} onSuccess={success} />;
      }
      if (props.action === "followUp") {
        return <FollowUpAlarmModal visible={props.visible} record={props.record} onUpdate:visible={close} onSuccess={success} />;
      }
      return <PushAgainAlarmModal visible={props.visible} record={props.record} onUpdate:visible={close} onSuccess={success} />;
    };
  },
});
