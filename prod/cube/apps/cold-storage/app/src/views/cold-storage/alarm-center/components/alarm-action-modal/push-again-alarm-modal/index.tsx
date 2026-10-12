import { defineComponent, shallowRef, type PropType } from "vue";

import type { AlarmRecord as PlatformAlarmRecord } from "@ghcloud/cube-service-interface/alarm-center";
import { repeatPushAlarm } from "@ghcloud/cube-services-client/alarm-center.client";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { message, Modal } from "@ghcloud/cube-ui";

import type { AlarmRecord } from "../../../alarm-record-types";
import { renderAlarmActionTitle } from "../modal-ui";

export const PushAgainAlarmModal = defineComponent({
  name: "PushAgainAlarmModal",
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    record: {
      type: Object as PropType<AlarmRecord | PlatformAlarmRecord | null>,
      default: null,
    },
  },
  emits: ["update:visible", "success"],
  setup: (props, { emit }) => {
    const loading = shallowRef(false);

    const close = (): void => {
      emit("update:visible", false);
    };

    const submit = async (): Promise<void> => {
      if (!props.record) {
        close();
        return;
      }
      loading.value = true;
      try {
        await useAuthRequest(() => repeatPushAlarm(String(props.record?.businessKey ?? props.record?.id ?? "")));
        message.success("已再次推送");
        emit("success");
        close();
      } finally {
        loading.value = false;
      }
    };

    return () => (
      <Modal
        visible={props.visible}
        title={renderAlarmActionTitle("再次推送", props.record)}
        width={620}
        confirmLoading={loading.value}
        destroyOnClose
        okText="确定"
        cancelText="取消"
        onOk={submit}
        onCancel={close}
        onUpdate:visible={(value: boolean) => emit("update:visible", value)}
      >
        <div class="alarm-action-modal-body">
          <div class="alarm-action-confirm">
            <div class="alarm-action-confirm__title">确认再次推送该报警？</div>
            <div class="alarm-action-confirm__desc">{props.record?.alarmEventName ?? "当前报警"}</div>
          </div>
        </div>
      </Modal>
    );
  },
});
