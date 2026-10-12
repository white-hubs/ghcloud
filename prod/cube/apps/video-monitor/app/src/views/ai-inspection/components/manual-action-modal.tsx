import { Form, InputNumber, Modal, Select, message } from "ant-design-vue";
import { defineComponent, reactive, ref, watch } from "vue";

import { CameraAiInspectionActionType } from "@ghcloud/cube-service-interface/video-monitor";
import type { AiInspectionEmergencyRule, AiInspectionWorkOrderTemplate } from "@ghcloud/cube-service-interface/video-monitor";
import {
  generateAiInspectionEventAction,
  getAiInspectionWorkOrderTemplate,
  listAiInspectionEmergencyRules,
  listAiInspectionWorkOrderTemplates,
} from "@ghcloud/cube-services-client/video-monitor.client";

import { ACTION_TYPE_OPTIONS } from "@/constants/ai-inspection";
import { useAuthRequest } from "@/hooks/auth-request";
import type { AiInspectionActionRuleForm, WorkOrderFieldOption } from "@/types/ai-inspection";
import { buildWorkOrderFields, parseTemplateFields } from "@/utils/ai-inspection";

interface Props {
  visible: boolean;
  eventId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ManualActionModal = defineComponent<Props>({
  name: "ManualActionModal",
  props: {
    visible: { type: Boolean, required: true },
    eventId: { type: String, default: undefined },
    onClose: { type: Function, required: true },
    onSuccess: { type: Function, required: true },
  },
  setup(props) {
    const submitting = ref(false);
    const emergencyRules = ref<AiInspectionEmergencyRule[]>([]);
    const workOrderTemplates = ref<AiInspectionWorkOrderTemplate[]>([]);
    const workOrderFields = ref<WorkOrderFieldOption[]>([]);
    const form = reactive<AiInspectionActionRuleForm>({
      enabled: true,
      actionType: CameraAiInspectionActionType.ALARM,
      confidenceThresholdPercent: 80,
    });

    const loadOptions = async (): Promise<void> => {
      const [rules, templates] = await Promise.all([
        useAuthRequest(() => listAiInspectionEmergencyRules({ pageNumber: 1, pageSize: 100, applicationCode: "SECURITY_MONITORING" })),
        useAuthRequest(() =>
          listAiInspectionWorkOrderTemplates({ pageNumber: 1, pageSize: 100, status: "IN_USE", application: "HIDDENDANGER" }),
        ),
      ]);
      emergencyRules.value = rules.records;
      workOrderTemplates.value = templates.records;
    };

    const loadTemplateFields = async (templateId?: string): Promise<void> => {
      if (!templateId) {
        workOrderFields.value = [];
        return;
      }
      const detail = await useAuthRequest(() => getAiInspectionWorkOrderTemplate(templateId));
      workOrderFields.value = parseTemplateFields(detail);
    };

    const handleSubmit = async (): Promise<void> => {
      if (!props.eventId || !form.actionType) {
        return;
      }
      if (form.actionType === CameraAiInspectionActionType.ALARM && !form.emergencyRuleId) {
        message.warning("请选择报警规则");
        return;
      }
      if (form.actionType === CameraAiInspectionActionType.WORK_ORDER) {
        if (!form.workOrderTemplateId) {
          message.warning("请选择隐患单模板");
          return;
        }
        if (!form.hiddenDangerObjectFieldKey || !form.sitePhotoFieldKey) {
          message.warning("请选择隐患对象字段和抓拍图片字段");
          return;
        }
      }
      submitting.value = true;
      try {
        await useAuthRequest(() =>
          generateAiInspectionEventAction(props.eventId!, {
            actionType: form.actionType!,
            emergencyRuleId: form.actionType === CameraAiInspectionActionType.ALARM ? form.emergencyRuleId : undefined,
            workOrderTemplateId: form.actionType === CameraAiInspectionActionType.WORK_ORDER ? form.workOrderTemplateId : undefined,
            workOrderFields:
              form.actionType === CameraAiInspectionActionType.WORK_ORDER
                ? buildWorkOrderFields({ fields: workOrderFields.value, rule: form })
                : undefined,
          }),
        );
        message.success("已提交，结果稍后查看");
        props.onSuccess();
        props.onClose();
      } catch {
        message.error("提交失败");
      } finally {
        submitting.value = false;
      }
    };

    watch(
      () => props.visible,
      (visible) => {
        if (visible) {
          form.actionType = CameraAiInspectionActionType.ALARM;
          form.emergencyRuleId = undefined;
          form.workOrderTemplateId = undefined;
          form.hiddenDangerObjectFieldKey = undefined;
          form.sitePhotoFieldKey = undefined;
          form.titleFieldKey = undefined;
          form.descriptionFieldKey = undefined;
          loadOptions();
        }
      },
    );

    return () => (
      <Modal open={props.visible} title="生成处置" confirmLoading={submitting.value} onCancel={props.onClose} onOk={handleSubmit}>
        <Form layout="vertical">
          <Form.Item label="处置动作" required>
            <Select
              options={[...ACTION_TYPE_OPTIONS]}
              value={form.actionType}
              onUpdate:value={(value: unknown) => {
                form.actionType = value as CameraAiInspectionActionType;
              }}
            />
          </Form.Item>
          <Form.Item label="置信度阈值">
            <InputNumber disabled value={form.confidenceThresholdPercent} addonAfter="%" style="width: 100%" />
          </Form.Item>
          {form.actionType === CameraAiInspectionActionType.ALARM && (
            <Form.Item label="报警规则" required>
              <Select
                showSearch
                optionFilterProp="label"
                value={form.emergencyRuleId}
                options={emergencyRules.value.map((item) => ({ label: item.name ?? item.id, value: item.id }))}
                onUpdate:value={(value: unknown) => {
                  form.emergencyRuleId = typeof value === "string" ? value : undefined;
                }}
              />
            </Form.Item>
          )}
          {form.actionType === CameraAiInspectionActionType.WORK_ORDER && (
            <>
              <Form.Item label="隐患单模板" required>
                <Select
                  showSearch
                  optionFilterProp="label"
                  value={form.workOrderTemplateId}
                  options={workOrderTemplates.value.map((item) => ({ label: item.name, value: item.id }))}
                  onUpdate:value={(value: unknown) => {
                    const templateId = typeof value === "string" ? value : undefined;
                    form.workOrderTemplateId = templateId;
                    loadTemplateFields(templateId);
                  }}
                />
              </Form.Item>
              <Form.Item label="隐患对象字段" required>
                <Select
                  value={form.hiddenDangerObjectFieldKey}
                  options={workOrderFields.value.map((item) => ({ label: item.fieldName, value: item.fieldKey }))}
                  onUpdate:value={(value: unknown) => {
                    form.hiddenDangerObjectFieldKey = typeof value === "string" ? value : undefined;
                  }}
                />
              </Form.Item>
              <Form.Item label="抓拍图片字段" required>
                <Select
                  value={form.sitePhotoFieldKey}
                  options={workOrderFields.value.map((item) => ({ label: item.fieldName, value: item.fieldKey }))}
                  onUpdate:value={(value: unknown) => {
                    form.sitePhotoFieldKey = typeof value === "string" ? value : undefined;
                  }}
                />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    );
  },
});
