import { computed, defineComponent, onBeforeUnmount, ref } from "vue";

import { useCubeModal } from "@ghcloud/cube-app-design";
import { Alert, Button, Form, FormItem, Select, Space, Textarea, Upload, UploadOutlined, message } from "@ghcloud/cube-ui";

import {
  ALARM_ACTIONS,
  ALARM_TYPES,
  ALARM_OPINION_MAX_LENGTH,
  ALARM_ATTACHMENT_MAX_COUNT,
  ALARM_ATTACHMENT_MAX_BYTES,
  ALARM_ATTACHMENT_ACCEPT,
} from "@/constants/realtime";
import type { AlarmAction, AlarmAttachment } from "@/models/realtime";
import { usePositioningStore } from "@/stores/positioning";
import { useRealtimeStore } from "@/stores/realtime";

import "./alarm-operation-modal.less";

export function useAlarmOperationModal(onSaved: () => void) {
  const store = useRealtimeStore();
  const positioning = usePositioningStore();
  const alarmId = ref("");
  const action = ref<AlarmAction>("confirm");
  const opinion = ref("");
  const assignee = ref("");
  const attachments = ref<AlarmAttachment[]>([]);
  const reading = ref(false);
  const submitted = ref(false);
  let fileGeneration = 0;
  const alarm = computed(() => store.findAlarm(alarmId.value));
  const assigneeOptions = computed(() =>
    positioning.state.persons
      .filter((item) => item.source === "organization")
      .map((item) => ({ value: `${item.name}（${item.id}）`, label: `${item.name} · ${item.organization}` })),
  );
  const [CubeModal, modal] = useCubeModal({
    width: "600px",
    wrapperClass: "pp-alarm-operation-modal",
    onClosed: () => {
      fileGeneration++;
      reading.value = false;
      attachments.value = [];
    },
  });
  onBeforeUnmount(() => {
    fileGeneration++;
  });

  async function selectFile(file: File): Promise<false> {
    if (reading.value || submitted.value) {
      return false;
    }
    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (
      attachments.value.length >= ALARM_ATTACHMENT_MAX_COUNT ||
      file.size <= 0 ||
      file.size > ALARM_ATTACHMENT_MAX_BYTES ||
      !ALARM_ATTACHMENT_ACCEPT.split(",").includes(extension)
    ) {
      message.warning(
        `最多添加${ALARM_ATTACHMENT_MAX_COUNT}个附件，支持 PNG、JPG、PDF，单个文件不超过${ALARM_ATTACHMENT_MAX_BYTES / 1024 / 1024} MB且不能为空`,
      );
      return false;
    }
    const generation = fileGeneration;
    reading.value = true;
    try {
      const url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => (typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("附件读取失败")));
        reader.onerror = () => reject(new Error("附件读取失败"));
        reader.readAsDataURL(file);
      });
      if (generation === fileGeneration) {
        attachments.value.push({ id: crypto.randomUUID(), name: file.name, url });
      }
    } catch {
      message.error("附件读取失败，请重新选择");
    } finally {
      if (generation === fileGeneration) {
        reading.value = false;
      }
    }
    return false;
  }
  function submit(): void {
    if (reading.value || submitted.value) {
      return;
    }
    submitted.value = true;
    try {
      store.operateAlarm(alarmId.value, action.value, opinion.value, assignee.value, attachments.value);
      modal.close();
      message.success(`${ALARM_ACTIONS[action.value]}成功`);
      onSaved();
    } catch (error) {
      submitted.value = false;
      message.warning(error instanceof Error ? error.message : "操作失败，请重试");
    }
  }
  const AlarmOperationModal = defineComponent({
    name: "AlarmOperationModal",
    setup: () => () => (
      <CubeModal
        v-slots={{
          default: () => (
            <Form layout="vertical" class="pp-alarm-operation-modal__form">
              <div class="pp-alarm-operation-modal__context">
                <strong>{alarm.value ? ALARM_TYPES[alarm.value.type] : ""}</strong>
                <span>{alarm.value?.id}</span>
                <span>{alarm.value?.personName || alarm.value?.regionName}</span>
              </div>
              {(action.value === "falseAlarm" || action.value === "close") && (
                <Alert
                  type="warning"
                  showIcon
                  message={
                    action.value === "falseAlarm"
                      ? "标记误报后将关闭该告警，请说明核实结果"
                      : "关闭后将从实时定位的当前告警中移除，处置记录仍保留"
                  }
                />
              )}
              {action.value === "assign" && (
                <FormItem label="处置人" required>
                  <Select
                    aria-label="处置人"
                    showSearch
                    optionFilterProp="label"
                    placeholder="请选择处置人"
                    options={assigneeOptions.value}
                    value={assignee.value || undefined}
                    onChange={(value: string) => {
                      assignee.value = value;
                    }}
                  />
                </FormItem>
              )}
              <FormItem label="处置意见" required>
                <Textarea
                  aria-label="处置意见"
                  placeholder="请填写核实结果、处理措施或后续进展"
                  rows={4}
                  maxlength={ALARM_OPINION_MAX_LENGTH}
                  showCount
                  v-model:value={opinion.value}
                />
              </FormItem>
              <FormItem label="附件">
                <Upload
                  accept={ALARM_ATTACHMENT_ACCEPT}
                  beforeUpload={selectFile}
                  fileList={[]}
                  disabled={reading.value || submitted.value || attachments.value.length >= ALARM_ATTACHMENT_MAX_COUNT}
                >
                  <Button loading={reading.value}>
                    <UploadOutlined />
                    添加附件
                  </Button>
                </Upload>
                <p class="pp-muted">
                  支持 PNG、JPG、PDF，最多{ALARM_ATTACHMENT_MAX_COUNT}个，每个不超过{ALARM_ATTACHMENT_MAX_BYTES / 1024 / 1024} MB
                </p>
                {attachments.value.map((file) => (
                  <div key={file.id} class="pp-alarm-operation-modal__file">
                    <span>{file.name}</span>
                    <Button
                      type="link"
                      danger
                      onClick={() => {
                        attachments.value = attachments.value.filter((item) => item.id !== file.id);
                      }}
                    >
                      移除
                    </Button>
                  </div>
                ))}
              </FormItem>
            </Form>
          ),
          footer: () => (
            <Space>
              <Button onClick={() => modal.close()}>取消</Button>
              <Button
                type="primary"
                danger={action.value === "falseAlarm" || action.value === "close"}
                loading={reading.value}
                disabled={submitted.value || !opinion.value.trim() || (action.value === "assign" && !assignee.value)}
                onClick={submit}
              >
                {ALARM_ACTIONS[action.value]}
              </Button>
            </Space>
          ),
        }}
      />
    ),
  });
  return {
    AlarmOperationModal,
    open: (id: string, operation: AlarmAction) => {
      fileGeneration++;
      alarmId.value = id;
      action.value = operation;
      opinion.value = "";
      assignee.value = "";
      attachments.value = [];
      reading.value = false;
      submitted.value = false;
      modal.setState({ title: ALARM_ACTIONS[operation] });
      modal.open();
    },
  };
}
