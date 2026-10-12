import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Steps,
  Switch,
  Table,
  TimePicker,
  message,
} from "ant-design-vue";
import type { TableProps } from "ant-design-vue";
import dayjs, { type Dayjs } from "dayjs";
import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design/src/base-components/cube-layout/cube-layout";
import { UserSelectPage } from "@ghcloud/cube-app-design/src/business-components/ouaa-components/user-select-page";
import {
  CameraAiInspectionActionType,
  CameraAiInspectionCycleType,
  CameraAiInspectionExecutionMode,
} from "@ghcloud/cube-service-interface/video-monitor";
import type {
  AiInspectionEmergencyRule,
  CameraAiInspectionActionRule,
  CameraAiInspectionAlgorithm,
  CameraAiInspectionPlanBase,
  CameraAiInspectionPlanCamera,
  CameraAiInspectionPlanPatchParam,
} from "@ghcloud/cube-service-interface/video-monitor";
import {
  createAiInspectionPlan,
  getAiInspectionCameraOptionsByIds,
  getAiInspectionPlan,
  listAiInspectionAlgorithms,
  listAiInspectionEmergencyRules,
  listAiInspectionPlanActionRules,
  pageAiInspectionPlanCameras,
  patchAiInspectionPlan,
} from "@ghcloud/cube-services-client/video-monitor.client";

import { CameraPicker } from "./components/camera-picker";
import { ACTION_TYPE_OPTIONS, CYCLE_TYPE_OPTIONS, EXECUTION_MODE_OPTIONS, WEEK_OPTIONS } from "@/constants/ai-inspection";
import { useAuthRequest } from "@/hooks/auth-request";
import type {
  AiInspectionActionRuleForm,
  AiInspectionPlanCameraEditRow,
  AiInspectionPlanFormState,
  AiInspectionSelectedCamera,
} from "@/types/ai-inspection";
import { buildPlanPayload, normalizeDateTimeValue, type AiInspectionDateTimeValue } from "@/utils/ai-inspection";

import "./ai-inspection.less";

interface Props {
  mode: "create" | "edit";
  id?: string;
}

const DEFAULT_ACTION_RULE: AiInspectionActionRuleForm = {
  enabled: false,
  actionType: CameraAiInspectionActionType.ALARM,
  confidenceThresholdPercent: 80,
};

const MONTH_OPTIONS = Array.from({ length: 31 }, (_, index) => ({
  label: `${index + 1}日`,
  value: String(index + 1),
}));

const toStringValue = (value: unknown): string | undefined => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return undefined;
};

const toStringArray = (value: unknown): string[] => (Array.isArray(value) ? value.map(String) : []);

const toNumberValue = (value: unknown): number | undefined => {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const getRequestErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    const candidates = [record.errorMessage, record.message, record.msg, record.error_description, record.errorDetail];
    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate.trim();
      }
    }
  }
  return fallback;
};

const cloneActionRule = (rule?: AiInspectionActionRuleForm): AiInspectionActionRuleForm => ({
  enabled: rule?.enabled ?? DEFAULT_ACTION_RULE.enabled,
  actionType: rule?.actionType ?? DEFAULT_ACTION_RULE.actionType,
  confidenceThresholdPercent: rule?.confidenceThresholdPercent ?? DEFAULT_ACTION_RULE.confidenceThresholdPercent,
  emergencyRuleId: rule?.emergencyRuleId,
  workOrderTemplateId: rule?.workOrderTemplateId,
  hiddenDangerObjectFieldKey: rule?.hiddenDangerObjectFieldKey,
  sitePhotoFieldKey: rule?.sitePhotoFieldKey,
  titleFieldKey: rule?.titleFieldKey,
  descriptionFieldKey: rule?.descriptionFieldKey,
});

const createNewCameraRow = (camera: AiInspectionSelectedCamera): AiInspectionPlanCameraEditRow => ({
  ...camera,
  actionRule: cloneActionRule(),
});

const createDefaultEnabledActionRule = (): AiInspectionActionRuleForm => ({
  ...cloneActionRule(),
  enabled: true,
});

const toActionRuleForm = (rule?: CameraAiInspectionActionRule): AiInspectionActionRuleForm => ({
  enabled: Boolean(rule?.enabled),
  actionType: rule?.actionType ?? CameraAiInspectionActionType.ALARM,
  confidenceThresholdPercent: typeof rule?.confidenceThreshold === "number" ? rule.confidenceThreshold * 100 : 80,
  emergencyRuleId: rule?.emergencyRuleId,
  workOrderTemplateId: rule?.workOrderTemplateId,
});

const toDayjsValue = (value: AiInspectionDateTimeValue): Dayjs | null => {
  const normalized = normalizeDateTimeValue(value);
  if (!normalized) {
    return null;
  }
  return dayjs(normalized);
};

const toTimePickerValue = (value?: string): Dayjs | undefined => {
  if (!value) {
    return undefined;
  }
  const match = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(value);
  if (!match) {
    return undefined;
  }
  return dayjs(`2000-01-01T${match[1]}:${match[2]}:${match[3] ?? "00"}`);
};

export default defineComponent<Props>({
  name: "AiInspectionPlanEditor",
  props: {
    mode: { type: String as () => "create" | "edit", required: true },
    id: { type: String, default: undefined },
  },
  setup(props) {
    const router = useRouter();
    const currentStep = ref(0);
    const loading = ref(false);
    const cameraLoading = ref(false);
    const saving = ref(false);
    const pickerVisible = ref(false);
    const algorithms = ref<CameraAiInspectionAlgorithm[]>([]);
    const emergencyRules = ref<AiInspectionEmergencyRule[]>([]);
    const selectedCameras = ref<AiInspectionSelectedCamera[]>([]);
    const planBase = reactive({
      cameraNum: 0,
      version: undefined as string | undefined,
    });
    const cameraPage = reactive({
      current: 1,
      pageSize: 10,
      total: 0,
      records: [] as AiInspectionPlanCameraEditRow[],
    });
    const cameraDraft = reactive({
      add: new Map<string, AiInspectionPlanCameraEditRow>(),
      update: new Map<string, Partial<AiInspectionPlanCameraEditRow>>(),
      removeIds: new Set<string>(),
    });
    const actionRuleDraft = reactive({
      upsert: new Map<string, AiInspectionActionRuleForm>(),
      removeDeviceIds: new Set<string>(),
    });
    const form = reactive<AiInspectionPlanFormState>({
      name: "",
      executionMode: CameraAiInspectionExecutionMode.CYCLE,
      cycleType: CameraAiInspectionCycleType.EVERY_DAY,
      cycleValues: [],
      enabled: true,
      immediateExecute: false,
      taskLimitMinutes: 60,
    });

    const isEditMode = computed(() => props.mode === "edit" && Boolean(props.id));
    const pageTitle = computed(() => (props.mode === "create" ? "新增巡检计划" : "编辑巡检计划"));
    const algorithmOptions = computed(() => algorithms.value.map((item) => ({ label: item.name, value: item.id })));
    const cameraRows = computed<AiInspectionPlanCameraEditRow[]>(() => {
      if (!isEditMode.value) {
        return selectedCameras.value;
      }
      return [
        ...cameraPage.records.filter((item) => !item.planCameraId || !cameraDraft.removeIds.has(item.planCameraId)),
        ...Array.from(cameraDraft.add.values()),
      ];
    });
    const cameraCount = computed(() =>
      isEditMode.value ? planBase.cameraNum + cameraDraft.add.size - cameraDraft.removeIds.size : selectedCameras.value.length,
    );
    const pickerSelectedIds = computed(() => Array.from(new Set(cameraRows.value.map((item) => item.id))));

    const loadBaseData = async (): Promise<void> => {
      const [algorithmList, rulePage] = await Promise.all([
        useAuthRequest(() => listAiInspectionAlgorithms()),
        useAuthRequest(() => listAiInspectionEmergencyRules({ pageNumber: 1, pageSize: 100, applicationCode: "SECURITY_MONITORING" })),
      ]);
      algorithms.value = algorithmList;
      emergencyRules.value = rulePage.records;
    };

    const fillForm = (detail: CameraAiInspectionPlanBase): void => {
      form.name = detail.name ?? "";
      form.principalUserId = detail.principalUserId;
      form.executionMode = detail.executionMode ?? CameraAiInspectionExecutionMode.CYCLE;
      form.cycleType = detail.cycleType ?? CameraAiInspectionCycleType.EVERY_DAY;
      form.cycleValues = typeof detail.cycleValues === "string" ? detail.cycleValues.split(",").filter(Boolean) : [];
      form.executeTime = typeof detail.executeTime === "string" ? detail.executeTime : undefined;
      form.startTime = normalizeDateTimeValue(detail.startTime);
      form.endTime = normalizeDateTimeValue(detail.endTime);
      form.enabled = detail.enabled ?? true;
      form.immediateExecute = detail.immediateExecute ?? false;
      form.taskLimitMinutes = detail.taskLimitMinutes ?? 60;
      form.remark = detail.remark ?? "";
      planBase.cameraNum = detail.cameraNum ?? 0;
      planBase.version = normalizeDateTimeValue(detail.updateTime);
    };

    const loadDetail = async (): Promise<void> => {
      if (!isEditMode.value || !props.id) {
        return;
      }
      const detail = await useAuthRequest(() => getAiInspectionPlan(props.id!));
      if (!detail) {
        message.warning("未找到巡检计划详情");
        return;
      }
      fillForm(detail);
      await loadCameraPage();
    };

    const buildCameraRows = (
      cameras: CameraAiInspectionPlanCamera[],
      cameraOptions: AiInspectionSelectedCamera[],
      actionRules: CameraAiInspectionActionRule[],
    ): AiInspectionPlanCameraEditRow[] => {
      const optionMap = new Map(cameraOptions.map((item) => [item.id, item]));
      const ruleMap = new Map(actionRules.map((item) => [String(item.deviceId), item]));
      return cameras.map((camera) => {
        const deviceId = String(camera.deviceId);
        const planCameraId = camera.id ? String(camera.id) : undefined;
        const option = optionMap.get(deviceId);
        const update = planCameraId ? cameraDraft.update.get(planCameraId) : undefined;
        return {
          id: deviceId,
          planCameraId,
          name: option?.name ?? `设备已不可用（${deviceId}）`,
          code: option?.code ?? "",
          areaId: option?.areaId,
          areaName: option?.areaName ?? "",
          onlineStatus: option?.onlineStatus,
          algorithmId: update?.algorithmId ?? String(camera.algorithmId),
          sort: update?.sort ?? camera.sort,
          unavailable: !option,
          actionRule: toActionRuleForm(ruleMap.get(deviceId)),
        };
      });
    };

    const loadCameraPage = async (): Promise<void> => {
      if (!isEditMode.value || !props.id) {
        return;
      }
      cameraLoading.value = true;
      try {
        const page = await useAuthRequest(() =>
          pageAiInspectionPlanCameras(props.id!, {
            pageNumber: cameraPage.current,
            pageSize: cameraPage.pageSize,
          }),
        );
        const cameras = page.records ?? [];
        const deviceIds = cameras.map((item) => String(item.deviceId));
        const [cameraOptions, actionRules] = deviceIds.length
          ? await Promise.all([
              useAuthRequest(() => getAiInspectionCameraOptionsByIds({ deviceIds })),
              useAuthRequest(() => listAiInspectionPlanActionRules(props.id!, { deviceIds })),
            ])
          : [[], []];
        cameraPage.total = page.total ?? 0;
        cameraPage.records = buildCameraRows(cameras, cameraOptions, actionRules);
      } catch {
        message.error("加载摄像头失败");
      } finally {
        cameraLoading.value = false;
      }
    };

    const resolveActionRule = (record: AiInspectionPlanCameraEditRow): AiInspectionActionRuleForm => {
      const draft = actionRuleDraft.upsert.get(record.id);
      if (draft) {
        return draft;
      }
      if (actionRuleDraft.removeDeviceIds.has(record.id)) {
        return DEFAULT_ACTION_RULE;
      }
      return record.actionRule ?? DEFAULT_ACTION_RULE;
    };

    const ensureActionRuleDraft = (record: AiInspectionPlanCameraEditRow): AiInspectionActionRuleForm => {
      const existing = actionRuleDraft.upsert.get(record.id);
      if (existing) {
        return existing;
      }
      const draft = cloneActionRule(record.actionRule);
      actionRuleDraft.upsert.set(record.id, draft);
      actionRuleDraft.removeDeviceIds.delete(record.id);
      return draft;
    };

    const updateActionRule = (record: AiInspectionPlanCameraEditRow, patch: Partial<AiInspectionActionRuleForm>): void => {
      if (patch.enabled === false) {
        actionRuleDraft.upsert.delete(record.id);
        if (isEditMode.value) {
          actionRuleDraft.removeDeviceIds.add(record.id);
        }
        return;
      }
      const rule = ensureActionRuleDraft(record);
      Object.assign(rule, patch);
      if (patch.enabled === true) {
        rule.enabled = true;
      }
    };

    const updateCameraAlgorithm = (record: AiInspectionPlanCameraEditRow, algorithmId?: string): void => {
      record.algorithmId = algorithmId;
      if (!isEditMode.value) {
        return;
      }
      if (!record.planCameraId) {
        cameraDraft.add.set(record.id, { ...record });
        return;
      }
      const update = cameraDraft.update.get(record.planCameraId) ?? {};
      update.algorithmId = algorithmId;
      update.sort = record.sort;
      cameraDraft.update.set(record.planCameraId, update);
    };

    const applyAlgorithmToVisibleCameras = (algorithmId: string): void => {
      cameraRows.value.forEach((camera) => updateCameraAlgorithm(camera, algorithmId));
    };

    const removeCamera = (record: AiInspectionPlanCameraEditRow): void => {
      actionRuleDraft.upsert.delete(record.id);
      if (!isEditMode.value) {
        selectedCameras.value = selectedCameras.value.filter((item) => item.id !== record.id);
        return;
      }
      if (record.planCameraId) {
        cameraDraft.removeIds.add(record.planCameraId);
        cameraDraft.update.delete(record.planCameraId);
        actionRuleDraft.removeDeviceIds.add(record.id);
      } else {
        cameraDraft.add.delete(record.id);
      }
    };

    const handleCameraConfirm = (cameras: AiInspectionSelectedCamera[]): void => {
      if (!isEditMode.value) {
        const exists = new Set(selectedCameras.value.map((item) => item.id));
        const newCameras = cameras.filter((item) => !exists.has(item.id)).map(createNewCameraRow);
        newCameras.forEach((camera) => {
          actionRuleDraft.upsert.set(camera.id, createDefaultEnabledActionRule());
        });
        selectedCameras.value = [...selectedCameras.value, ...newCameras];
        return;
      }
      const existsOnCurrentPage = new Set(cameraRows.value.map((item) => item.id));
      cameras
        .filter((item) => !existsOnCurrentPage.has(item.id) && !cameraDraft.add.has(item.id))
        .forEach((camera) => {
          const row = createNewCameraRow(camera);
          actionRuleDraft.removeDeviceIds.delete(row.id);
          actionRuleDraft.upsert.set(row.id, createDefaultEnabledActionRule());
          cameraDraft.add.set(row.id, row);
        });
    };

    const validate = (): boolean => {
      if (!form.name.trim()) {
        message.warning("请填写计划名称");
        currentStep.value = 0;
        return false;
      }
      if (!form.principalUserId) {
        message.warning("请选择负责人");
        currentStep.value = 0;
        return false;
      }
      if (form.executionMode === CameraAiInspectionExecutionMode.ONCE && !form.startTime) {
        message.warning("单次计划必须填写开始时间");
        currentStep.value = 0;
        return false;
      }
      if (form.startTime && form.endTime && dayjs(form.endTime).isBefore(dayjs(form.startTime))) {
        message.warning("结束时间必须晚于开始时间");
        currentStep.value = 0;
        return false;
      }
      if (form.executionMode === CameraAiInspectionExecutionMode.CYCLE) {
        if (!form.cycleType || !form.executeTime) {
          message.warning("循环计划必须选择周期和执行时间");
          currentStep.value = 0;
          return false;
        }
        if (form.cycleType !== CameraAiInspectionCycleType.EVERY_DAY && !form.cycleValues.length) {
          message.warning("请选择周期值");
          currentStep.value = 0;
          return false;
        }
      }
      if (cameraCount.value <= 0) {
        message.warning("请至少选择一个摄像头");
        currentStep.value = 1;
        return false;
      }
      if (!isEditMode.value && selectedCameras.value.some((item) => !item.algorithmId)) {
        message.warning("每个摄像头必须选择算法");
        currentStep.value = 1;
        return false;
      }
      if (isEditMode.value && cameraRows.value.some((item) => !item.algorithmId)) {
        message.warning("当前页每个摄像头必须选择算法");
        currentStep.value = 1;
        return false;
      }
      if (Array.from(cameraDraft.add.values()).some((item) => !item.algorithmId)) {
        message.warning("新增摄像头必须选择算法");
        currentStep.value = 1;
        return false;
      }
      if (Array.from(cameraDraft.update.values()).some((item) => !item.algorithmId)) {
        message.warning("已修改的摄像头必须选择算法");
        currentStep.value = 1;
        return false;
      }
      for (const rule of actionRuleDraft.upsert.values()) {
        if (!rule.enabled) {
          continue;
        }
        if (!rule.actionType) {
          message.warning("请选择处置动作");
          currentStep.value = 2;
          return false;
        }
        if (rule.actionType === CameraAiInspectionActionType.ALARM && !rule.emergencyRuleId) {
          message.warning("请选择报警规则");
          currentStep.value = 2;
          return false;
        }
      }
      return true;
    };

    const buildPatchPayload = (): CameraAiInspectionPlanPatchParam => ({
      base: {
        name: form.name.trim(),
        principalUserId: form.principalUserId ?? "",
        executionMode: form.executionMode,
        cycleType: form.executionMode === CameraAiInspectionExecutionMode.CYCLE ? form.cycleType : undefined,
        cycleValues: form.executionMode === CameraAiInspectionExecutionMode.CYCLE ? form.cycleValues.join(",") : undefined,
        executeTime: form.executionMode === CameraAiInspectionExecutionMode.CYCLE ? form.executeTime : undefined,
        startTime: form.startTime,
        endTime: form.endTime,
        enabled: form.enabled,
        taskLimitMinutes: form.taskLimitMinutes,
        remark: form.remark,
      },
      cameraChanges: {
        add: Array.from(cameraDraft.add.values()).map((camera) => ({
          deviceId: camera.id,
          algorithmId: camera.algorithmId ?? "",
          sort: camera.sort,
        })),
        update: Array.from(cameraDraft.update.entries()).map(([id, camera]) => ({
          id,
          algorithmId: camera.algorithmId ?? "",
          sort: camera.sort,
        })),
        removeIds: Array.from(cameraDraft.removeIds),
      },
      actionRuleChanges: {
        upsert: Array.from(actionRuleDraft.upsert.entries())
          .filter(([, rule]) => rule.enabled && rule.actionType)
          .map(([deviceId, rule]) => ({
            deviceId,
            actionType: rule.actionType!,
            confidenceThreshold: rule.confidenceThresholdPercent / 100,
            emergencyRuleId: rule.actionType === CameraAiInspectionActionType.ALARM ? rule.emergencyRuleId : undefined,
            workOrderTemplateId: rule.actionType === CameraAiInspectionActionType.WORK_ORDER ? rule.workOrderTemplateId : undefined,
          })),
        removeDeviceIds: Array.from(actionRuleDraft.removeDeviceIds),
      },
      version: planBase.version,
    });

    const handleSave = async (): Promise<void> => {
      if (!validate()) {
        return;
      }
      saving.value = true;
      try {
        if (isEditMode.value && props.id) {
          await useAuthRequest(() => patchAiInspectionPlan(props.id!, buildPatchPayload()));
          message.success("保存成功");
        } else {
          const payload = buildPlanPayload(form, selectedCameras.value, actionRuleDraft.upsert);
          if (form.immediateExecute) {
            let timedOut = false;
            const request = useAuthRequest(() => createAiInspectionPlan(payload)).catch((error) => {
              if (!timedOut) {
                throw error;
              }
              return "";
            });
            await Promise.race([
              request,
              new Promise((resolve) => {
                window.setTimeout(() => {
                  timedOut = true;
                  resolve(undefined);
                }, 3000);
              }),
            ]);
            message.success("已提交，结果稍后查看");
          } else {
            await useAuthRequest(() => createAiInspectionPlan(payload));
            message.success("保存成功");
          }
        }
        router.push({ name: "AiInspectionPlanList" });
      } catch (error) {
        message.error(getRequestErrorMessage(error, "保存失败"));
      } finally {
        saving.value = false;
      }
    };

    const setDateField = (field: "startTime" | "endTime", value: AiInspectionDateTimeValue): void => {
      form[field] = normalizeDateTimeValue(value);
    };

    const cameraColumns: TableProps<AiInspectionPlanCameraEditRow>["columns"] = [
      { title: "摄像头名称", dataIndex: "name", key: "name" },
      { title: "摄像头编码", dataIndex: "code", key: "code" },
      { title: "区域", dataIndex: "areaName", key: "areaName" },
      { title: "在线状态", dataIndex: "onlineStatus", key: "onlineStatus" },
      {
        title: "关联算法",
        key: "algorithmId",
        width: 220,
        customRender: ({ record }) => (
          <Select
            placeholder="请选择算法"
            value={record.algorithmId}
            options={algorithmOptions.value}
            style="width: 180px"
            onUpdate:value={(value: unknown) => updateCameraAlgorithm(record, toStringValue(value))}
          />
        ),
      },
      {
        title: "操作",
        key: "actions",
        width: 90,
        customRender: ({ record }) => (
          <Button type="link" danger onClick={() => removeCamera(record)}>
            移除
          </Button>
        ),
      },
    ];

    const actionRuleColumns: TableProps<AiInspectionPlanCameraEditRow>["columns"] = [
      { title: "摄像头名称", dataIndex: "name", key: "name", width: 180 },
      {
        title: "算法",
        key: "algorithmId",
        width: 160,
        customRender: ({ record }) => algorithms.value.find((item) => item.id === record.algorithmId)?.name ?? record.algorithmId ?? "--",
      },
      {
        title: "启用",
        key: "enabled",
        width: 90,
        customRender: ({ record }) => {
          const rule = resolveActionRule(record);
          return <Switch checked={rule.enabled} onChange={(checked: unknown) => updateActionRule(record, { enabled: checked === true })} />;
        },
      },
      {
        title: "置信度阈值",
        key: "confidenceThresholdPercent",
        width: 160,
        customRender: ({ record }) => {
          const rule = resolveActionRule(record);
          return (
            <InputNumber
              min={0}
              max={100}
              precision={2}
              addonAfter="%"
              disabled={!rule.enabled}
              value={rule.confidenceThresholdPercent}
              onUpdate:value={(value: unknown) =>
                updateActionRule(record, {
                  confidenceThresholdPercent: toNumberValue(value) ?? 0,
                })
              }
            />
          );
        },
      },
      {
        title: "处置动作",
        key: "actionType",
        width: 160,
        customRender: ({ record }) => {
          const rule = resolveActionRule(record);
          return (
            <Select
              disabled={!rule.enabled}
              value={rule.actionType}
              options={[...ACTION_TYPE_OPTIONS]}
              style="width: 140px"
              onUpdate:value={(value: unknown) => updateActionRule(record, { actionType: value as CameraAiInspectionActionType })}
            />
          );
        },
      },
      {
        title: "报警规则",
        key: "emergencyRuleId",
        width: 220,
        customRender: ({ record }) => {
          const rule = resolveActionRule(record);
          return (
            <Select
              showSearch
              optionFilterProp="label"
              disabled={!rule.enabled || rule.actionType !== CameraAiInspectionActionType.ALARM}
              value={rule.emergencyRuleId}
              options={emergencyRules.value.map((item) => ({ label: item.name ?? item.id, value: item.id }))}
              style="width: 200px"
              onUpdate:value={(value: unknown) => updateActionRule(record, { emergencyRuleId: toStringValue(value) })}
            />
          );
        },
      },
    ];

    const renderBasicForm = () => (
      <div class="ai-inspection-section">
        <div class="ai-inspection-section__title">基础信息</div>
        <Form layout="vertical">
          <Form.Item label="计划名称" required>
            <Input
              maxlength={100}
              value={form.name}
              onUpdate:value={(value: string) => {
                form.name = value;
              }}
            />
          </Form.Item>
          <Form.Item label="负责人" required>
            <UserSelectPage
              value={form.principalUserId}
              onUpdate:value={(value: unknown) => {
                form.principalUserId = toStringValue(value);
              }}
            />
          </Form.Item>
          <Space size={16} wrap>
            <Form.Item label="执行模式" required>
              <Select
                value={form.executionMode}
                options={[...EXECUTION_MODE_OPTIONS]}
                style="width: 180px"
                onUpdate:value={(value: unknown) => {
                  form.executionMode = value as CameraAiInspectionExecutionMode;
                }}
              />
            </Form.Item>
            <Form.Item label="开始时间" required={form.executionMode === CameraAiInspectionExecutionMode.ONCE}>
              <DatePicker
                showTime
                value={toDayjsValue(form.startTime) ?? undefined}
                onChange={(value: string | Dayjs | null) => setDateField("startTime", value)}
              />
            </Form.Item>
            <Form.Item label="结束时间">
              <DatePicker
                showTime
                value={toDayjsValue(form.endTime) ?? undefined}
                onChange={(value: string | Dayjs | null) => setDateField("endTime", value)}
              />
            </Form.Item>
          </Space>
          {form.executionMode === CameraAiInspectionExecutionMode.CYCLE && (
            <Space size={16} wrap>
              <Form.Item label="循环周期" required>
                <Select
                  value={form.cycleType}
                  options={[...CYCLE_TYPE_OPTIONS]}
                  style="width: 180px"
                  onUpdate:value={(value: unknown) => {
                    const cycleType = value as CameraAiInspectionCycleType;
                    form.cycleType = cycleType;
                    if (cycleType === CameraAiInspectionCycleType.EVERY_DAY) {
                      form.cycleValues = [];
                    }
                  }}
                />
              </Form.Item>
              {form.cycleType === CameraAiInspectionCycleType.EVERY_WEEK && (
                <Form.Item label="周期值" required>
                  <Checkbox.Group
                    value={form.cycleValues}
                    options={[...WEEK_OPTIONS]}
                    onChange={(values) => {
                      form.cycleValues = values as string[];
                    }}
                  />
                </Form.Item>
              )}
              {form.cycleType === CameraAiInspectionCycleType.EVERY_MONTH && (
                <Form.Item label="周期值" required>
                  <Select
                    mode="multiple"
                    value={form.cycleValues}
                    options={MONTH_OPTIONS}
                    style="width: 260px"
                    onUpdate:value={(values: unknown) => {
                      form.cycleValues = toStringArray(values);
                    }}
                  />
                </Form.Item>
              )}
              <Form.Item label="执行时间" required>
                <TimePicker
                  format="HH:mm"
                  value={toTimePickerValue(form.executeTime)}
                  onChange={(value: string | Dayjs | null) => {
                    const time = toDayjsValue(value);
                    form.executeTime = time?.isValid() ? time.format("HH:mm") : undefined;
                  }}
                />
              </Form.Item>
            </Space>
          )}
          <Space size={16} wrap>
            <Form.Item label="任务时限（分钟）">
              <InputNumber
                min={1}
                value={form.taskLimitMinutes}
                onUpdate:value={(value: unknown) => {
                  form.taskLimitMinutes = toNumberValue(value);
                }}
              />
            </Form.Item>
            <Form.Item label="是否启用">
              <Switch
                checked={form.enabled}
                onChange={(checked: unknown) => {
                  form.enabled = checked === true;
                }}
              />
            </Form.Item>
            {props.mode === "create" && (
              <Form.Item label="保存后立即执行一次">
                <Switch
                  checked={form.immediateExecute}
                  onChange={(checked: unknown) => {
                    form.immediateExecute = checked === true;
                  }}
                />
              </Form.Item>
            )}
          </Space>
          <Form.Item label="备注">
            <Input.TextArea
              maxlength={500}
              value={form.remark}
              onUpdate:value={(value: string) => {
                form.remark = value;
              }}
            />
          </Form.Item>
        </Form>
      </div>
    );

    const renderCameraForm = () => (
      <div class="ai-inspection-section">
        <div class="ai-inspection-toolbar">
          <div class="ai-inspection-section__title">巡检内容</div>
          <Space>
            <Select
              placeholder="批量应用算法"
              options={algorithmOptions.value}
              style="width: 220px"
              onChange={(value: unknown) => {
                const algorithmId = toStringValue(value);
                if (algorithmId) {
                  applyAlgorithmToVisibleCameras(algorithmId);
                }
              }}
            />
            <Button
              type="primary"
              onClick={() => {
                pickerVisible.value = true;
              }}
            >
              选择摄像头
            </Button>
          </Space>
        </div>
        <Table
          rowKey={(record) => record.planCameraId ?? record.id}
          dataSource={cameraRows.value}
          columns={cameraColumns}
          loading={cameraLoading.value}
          pagination={
            isEditMode.value
              ? {
                  current: cameraPage.current,
                  pageSize: cameraPage.pageSize,
                  total: Math.max(cameraCount.value, 0),
                  showSizeChanger: true,
                  onChange: (page: number, pageSize: number) => {
                    cameraPage.current = page;
                    cameraPage.pageSize = pageSize;
                    loadCameraPage();
                  },
                }
              : false
          }
          bordered
          locale={{ emptyText: "请选择摄像头" }}
        />
      </div>
    );

    const renderActionRuleEditor = () => (
      <div class="ai-inspection-section">
        <div class="ai-inspection-section__title">自动处置</div>
        {!cameraRows.value.length && <div class="ai-inspection-muted">选择摄像头并关联算法后，可配置自动处置。</div>}
        {!!cameraRows.value.length && (
          <Table
            rowKey={(record) => record.planCameraId ?? record.id}
            dataSource={cameraRows.value}
            columns={actionRuleColumns}
            loading={cameraLoading.value}
            pagination={
              isEditMode.value
                ? {
                    current: cameraPage.current,
                    pageSize: cameraPage.pageSize,
                    total: Math.max(cameraCount.value, 0),
                    showSizeChanger: true,
                    onChange: (page: number, pageSize: number) => {
                      cameraPage.current = page;
                      cameraPage.pageSize = pageSize;
                      loadCameraPage();
                    },
                  }
                : false
            }
            bordered
          />
        )}
      </div>
    );

    const renderStepContent = () => {
      if (currentStep.value === 0) {
        return renderBasicForm();
      }
      if (currentStep.value === 1) {
        return renderCameraForm();
      }
      return renderActionRuleEditor();
    };

    onMounted(async () => {
      loading.value = true;
      try {
        await loadBaseData();
        await loadDetail();
      } catch {
        message.error("加载页面数据失败");
      } finally {
        loading.value = false;
      }
    });

    const slots = {
      "layout-header": () => <Button onClick={() => router.push({ name: "AiInspectionPlanList" })}>返回</Button>,
      "layout-content": () => (
        <>
          <div class="ai-inspection-form">
            <div class="ai-inspection-form__steps">
              <Steps current={currentStep.value} items={[{ title: "基础信息" }, { title: "巡检内容" }, { title: "自动处置" }]} />
            </div>
            <div class="ai-inspection-form__body">
              {loading.value ? <div class="ai-inspection-muted">加载中...</div> : renderStepContent()}
            </div>
          </div>
          <CameraPicker
            visible={pickerVisible.value}
            selectedIds={pickerSelectedIds.value}
            onClose={() => {
              pickerVisible.value = false;
            }}
            onConfirm={handleCameraConfirm}
          />
        </>
      ),
      "footer-page": () => (
        <>
          {currentStep.value > 0 && (
            <Button
              onClick={() => {
                currentStep.value -= 1;
              }}
            >
              上一步
            </Button>
          )}
          {currentStep.value < 2 && (
            <Button
              type="primary"
              onClick={() => {
                currentStep.value += 1;
              }}
            >
              下一步
            </Button>
          )}
          {currentStep.value === 2 && (
            <Button type="primary" loading={saving.value} onClick={handleSave}>
              保存
            </Button>
          )}
        </>
      ),
    };

    return () => <CubeLayout title={pageTitle.value} v-slots={slots} />;
  },
});
