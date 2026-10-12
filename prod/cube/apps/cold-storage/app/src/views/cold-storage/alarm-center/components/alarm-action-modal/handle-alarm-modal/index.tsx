import { defineComponent, reactive, shallowRef, watch, type PropType } from "vue";

import { FileUpload } from "@ghcloud/cube-app-design";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import type { AlarmReason, AlarmRecord as PlatformAlarmRecord } from "@ghcloud/cube-service-interface/alarm-center";
import { getAlarmReasons, handleAlarmRecord } from "@ghcloud/cube-services-client/alarm-center.client";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { Form, FormItem, Input, message, Modal, Select, Textarea } from "@ghcloud/cube-ui";

import { alarmResultOptions } from "../../../alarm-record-data";
import type { AlarmHandlerResult, AlarmRecord } from "../../../alarm-record-types";
import { toAlarmUploadFiles, type AlarmUploadedFile } from "../alarm-upload";
import { renderAlarmActionSummary, renderAlarmActionTitle } from "../modal-ui";

const defaultForm = () => ({
  alarmHandlerResult: "ALARM_ACTUAL" as AlarmHandlerResult,
  alarmReasonId: "",
  customReason: "",
  alarmHandlerResultRemark: "",
  fileVOS: [] as AlarmUploadedFile[],
});

export const HandleAlarmModal = defineComponent({
  name: "HandleAlarmModal",
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
    const reasonLoading = shallowRef(false);
    const reasonOptions = shallowRef<Array<{ label: string; value: string }>>([]);
    const form = reactive(defaultForm());

    const loadReasons = async (): Promise<void> => {
      reasonLoading.value = true;
      try {
        const reasons = await useAuthRequest(() => getAlarmReasons());
        reasonOptions.value = (reasons as AlarmReason[])
          .filter((item) => item.id && item.reason)
          .map((item) => ({ label: item.reason, value: String(item.id) }));
      } finally {
        reasonLoading.value = false;
      }
    };

    watch(
      () => props.visible,
      (visible) => {
        if (visible) {
          Object.assign(form, defaultForm());
          void loadReasons();
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
      const shouldFillReason = form.alarmHandlerResult === "ALARM_IMPRACTICAL";
      if (shouldFillReason && !form.alarmReasonId && !form.customReason.trim()) {
        message.warning("请选择或填写报警原因");
        return;
      }
      loading.value = true;
      try {
        await useAuthRequest(() =>
          handleAlarmRecord(props.record.id, {
            alarmHandlerResult: form.alarmHandlerResult,
            alarmReason: shouldFillReason ? (form.alarmReasonId ? { id: form.alarmReasonId } : { reason: form.customReason.trim() }) : null,
            alarmReasonName: shouldFillReason && !form.alarmReasonId ? form.customReason.trim() : null,
            alarmHandlerResultRemark: form.alarmHandlerResultRemark,
            fileVOS: toAlarmUploadFiles(form.fileVOS),
          }),
        );
        message.success("处理成功");
        emit("success");
        close();
      } finally {
        loading.value = false;
      }
    };

    return () => (
      <Modal
        visible={props.visible}
        title={renderAlarmActionTitle("报警处理", props.record)}
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
            <FormItem label="处理结果">
              <Select
                value={form.alarmHandlerResult}
                options={alarmResultOptions}
                placeholder="请选择处理结果"
                onUpdate:value={(value: AlarmHandlerResult) => (form.alarmHandlerResult = value)}
              />
            </FormItem>
            {form.alarmHandlerResult === "ALARM_IMPRACTICAL" && (
              <>
                <FormItem label="报警原因" required>
                  <Select
                    value={form.alarmReasonId || undefined}
                    options={reasonOptions.value}
                    loading={reasonLoading.value}
                    allowClear
                    showSearch
                    placeholder="请选择报警原因"
                    filterOption={(input: string, option?: { label?: string }) => String(option?.label ?? "").includes(input)}
                    onUpdate:value={(value?: string) => {
                      form.alarmReasonId = value ?? "";
                      if (value) {
                        form.customReason = "";
                      }
                    }}
                  />
                </FormItem>
                <FormItem label="其他原因">
                  <Input
                    value={form.customReason}
                    disabled={Boolean(form.alarmReasonId)}
                    onUpdate:value={(value: string) => (form.customReason = value)}
                    placeholder="字典中没有时可填写"
                    showCount={false}
                  />
                </FormItem>
              </>
            )}
            <FormItem label="处理说明">
              <Textarea
                value={form.alarmHandlerResultRemark}
                onUpdate:value={(value: string) => (form.alarmHandlerResultRemark = value)}
                placeholder="请输入处理说明"
                rows={4}
              />
            </FormItem>
            <FormItem label="图片">
              <FileUpload
                v-model:value={form.fileVOS}
                sceneCode={GLOBAL_SCENE_CODE.alarmRecordHandler}
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
