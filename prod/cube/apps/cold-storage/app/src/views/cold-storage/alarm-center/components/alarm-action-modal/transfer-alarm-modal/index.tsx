import { defineComponent, reactive, shallowRef, watch, type PropType } from "vue";

import { UserSelectPage } from "@ghcloud/cube-app-design";
import type { AlarmRecord as PlatformAlarmRecord } from "@ghcloud/cube-service-interface/alarm-center";
import { transferAlarmRecord } from "@ghcloud/cube-services-client/alarm-center.client";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { Form, FormItem, Input, message, Modal } from "@ghcloud/cube-ui";

import type { AlarmRecord } from "../../../alarm-record-types";
import { renderAlarmActionSummary, renderAlarmActionTitle } from "../modal-ui";

interface SelectedUserOption {
  id?: string | number;
  userId?: string | number;
  name?: string;
  label?: string;
  organization?: {
    id?: string | number;
    name?: string;
  };
  organizations?: Array<{
    id?: string | number;
    name?: string;
  }>;
  organizationId?: string | number;
  organizationName?: string;
}

const defaultForm = () => ({
  userId: "",
  userName: "",
  departmentId: "",
  departmentName: "",
});

const normalizeSelectedUser = (option: unknown): SelectedUserOption | undefined => {
  if (!option || Array.isArray(option)) {
    return Array.isArray(option) ? (option[0] as SelectedUserOption | undefined) : undefined;
  }
  return option as SelectedUserOption;
};

export const TransferAlarmModal = defineComponent({
  name: "TransferAlarmModal",
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
    const form = reactive(defaultForm());

    watch(
      () => props.visible,
      (visible) => {
        if (visible) {
          Object.assign(form, defaultForm());
        }
      },
    );

    const close = (): void => {
      emit("update:visible", false);
    };

    const handleUserChange = (value: string | undefined, option: unknown): void => {
      const selected = normalizeSelectedUser(option);
      const organization = selected?.organization ?? selected?.organizations?.[0];
      form.userId = String(selected?.userId ?? selected?.id ?? value ?? "");
      form.userName = String(selected?.name ?? selected?.label ?? "");
      form.departmentId = String(selected?.organizationId ?? organization?.id ?? "");
      form.departmentName = String(selected?.organizationName ?? organization?.name ?? "");
    };

    const submit = async (): Promise<void> => {
      if (!props.record) {
        close();
        return;
      }
      if (!form.userId) {
        message.warning("请选择处理人");
        return;
      }
      loading.value = true;
      try {
        await useAuthRequest(() =>
          transferAlarmRecord(props.record.id, {
            departmentId: form.departmentId,
            departmentName: form.departmentName,
            userId: form.userId,
            userName: form.userName,
          }),
        );
        message.success("指派成功");
        emit("success");
        close();
      } finally {
        loading.value = false;
      }
    };

    return () => (
      <Modal
        visible={props.visible}
        title={renderAlarmActionTitle("报警指派", props.record)}
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
          {renderAlarmActionSummary(props.record)}
          <Form layout="vertical" model={form}>
            <FormItem label="处理人" required>
              <UserSelectPage
                value={form.userId || undefined}
                onUpdate:value={(value?: string) => (form.userId = value ?? "")}
                onChange={handleUserChange}
              />
            </FormItem>
            <FormItem label="所属部门">
              <Input value={form.departmentName} disabled placeholder="选择人员后自动带出" />
            </FormItem>
          </Form>
        </div>
      </Modal>
    );
  },
});
