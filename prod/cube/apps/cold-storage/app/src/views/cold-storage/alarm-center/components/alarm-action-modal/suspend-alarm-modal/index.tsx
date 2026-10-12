import { defineComponent, reactive, shallowRef, watch, type PropType } from "vue";

import { FileUpload } from "@ghcloud/cube-app-design";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import type { AlarmRecord as PlatformAlarmRecord } from "@ghcloud/cube-service-interface/alarm-center";
import { suspendAlarmRecord } from "@ghcloud/cube-services-client/alarm-center.client";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { DatePicker, Form, FormItem, message, Modal, Textarea } from "@ghcloud/cube-ui";

import type { AlarmRecord } from "../../../alarm-record-types";
import { toAlarmUploadFiles, type AlarmUploadedFile } from "../alarm-upload";
import { renderAlarmActionSummary, renderAlarmActionTitle } from "../modal-ui";

const defaultForm = () => ({
  estimatedProcessTime: "",
  remark: "",
  fileVOS: [] as AlarmUploadedFile[],
});

export const SuspendAlarmModal = defineComponent({
  name: "SuspendAlarmModal",
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

    const submit = async (): Promise<void> => {
      if (!props.record) {
        close();
        return;
      }
      if (!form.estimatedProcessTime) {
        message.warning("请选择预计处理时间");
        return;
      }
      loading.value = true;
      try {
        await useAuthRequest(() =>
          suspendAlarmRecord(props.record.id, {
            estimatedProcessTime: form.estimatedProcessTime,
            remark: form.remark,
            fileVOS: toAlarmUploadFiles(form.fileVOS),
          }),
        );
        message.success("挂起成功");
        emit("success");
        close();
      } finally {
        loading.value = false;
      }
    };

    return () => (
      <Modal
        visible={props.visible}
        title={renderAlarmActionTitle("报警挂起", props.record)}
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
            <FormItem label="预计处理时间">
              <DatePicker
                showTime
                valueFormat="YYYY-MM-DD HH:mm:ss"
                value={form.estimatedProcessTime}
                onUpdate:value={(value: string) => (form.estimatedProcessTime = value)}
                placeholder="请选择预计处理时间"
                style={{ width: "100%" }}
              />
            </FormItem>
            <FormItem label="挂起原因">
              <Textarea
                value={form.remark}
                onUpdate:value={(value: string) => (form.remark = value)}
                placeholder="请输入挂起原因"
                rows={4}
              />
            </FormItem>
            <FormItem label="图片">
              <FileUpload
                v-model:value={form.fileVOS}
                sceneCode={GLOBAL_SCENE_CODE.alarmRecordSuspend}
                businessKey="alarm"
                multiple
                showText
                maxCount={3}
                type="picture-card"
                size={100}
                typeList={[".png", ".jpg", ".jpeg"]}
                accept="image/*"
                customText="支持上传图片（.png/.jpg/.jpeg），最多3张"
              />
            </FormItem>
          </Form>
        </div>
      </Modal>
    );
  },
});
