import { defineComponent, reactive, shallowRef, watch, type PropType } from "vue";

import { FileUpload } from "@ghcloud/cube-app-design";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import type { AlarmRecord as PlatformAlarmRecord } from "@ghcloud/cube-service-interface/alarm-center";
import { createAlarmFollow } from "@ghcloud/cube-services-client/alarm-center.client";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { Form, FormItem, message, Modal, Textarea } from "@ghcloud/cube-ui";

import type { AlarmRecord } from "../../../alarm-record-types";
import { toAlarmFileIds, type AlarmUploadedFile } from "../alarm-upload";
import { renderAlarmActionSummary, renderAlarmActionTitle } from "../modal-ui";

const defaultForm = () => ({
  followUpContent: "",
  files: [] as AlarmUploadedFile[],
});

export const FollowUpAlarmModal = defineComponent({
  name: "FollowUpAlarmModal",
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
      if (!form.followUpContent.trim()) {
        message.warning("请输入跟进记录信息");
        return;
      }
      loading.value = true;
      try {
        await useAuthRequest(() =>
          createAlarmFollow({ id: props.record.id, content: form.followUpContent, files: toAlarmFileIds(form.files) }),
        );
        message.success("跟进记录已提交");
        emit("success");
        close();
      } finally {
        loading.value = false;
      }
    };

    return () => (
      <Modal
        visible={props.visible}
        title={renderAlarmActionTitle("跟进记录", props.record)}
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
            <FormItem label="跟进记录信息">
              <Textarea
                value={form.followUpContent}
                onUpdate:value={(value: string) => (form.followUpContent = value)}
                placeholder="用于处理中时随时上传处理记录，工作留痕"
                rows={4}
              />
            </FormItem>
            <FormItem label="图片">
              <FileUpload
                v-model:value={form.files}
                sceneCode={GLOBAL_SCENE_CODE.alarmRecordFollowUp}
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
