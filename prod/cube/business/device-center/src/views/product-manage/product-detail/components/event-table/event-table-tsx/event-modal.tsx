import { EventForm } from "./event-form";
import { cubeDeviceCenterService } from "@/api/service";
import { TriggerType } from "@/constants/trigger-type";
import { useCubeModal } from "@ghcloud/cube-app-design";
import type { ProductEventDetailModel } from "@ghcloud/cube-iot-center-service";
import { Spin, message } from "@ghcloud/cube-ui";
import { defineComponent, ref, toRaw } from "vue";

// ==================== 类型定义 ====================

/** 事件参数项（表单用） */
interface EventParamItem {
  identifier: string;
  name: string;
  required?: boolean;
  dataType: string;
  unit?: string | null;
  min?: number | undefined;
  max?: number | undefined;
  precision?: number | undefined;
  maxLength?: number | undefined;
  enumValues?: { value: string | number; label: string }[];
  boolZeroText?: string;
  boolOneText?: string;
  dataRequired: boolean;
  description?: string;
  [key: string]: unknown;
}

/** 事件配置（触发条件等） */
interface EventConfigState {
  triggerType?: string;
  eventRelatedProp?: (string | number)[];
  rules?: {
    deviceId?: string;
    propCode?: string | number;
    op?: string | number;
    oprand?: (string | number)[];
    delayTime?: string | number;
  };
}

/** 表单完整状态（含 eventConfig、eventParams） */
interface CustomFormState {
  name?: string | number;
  eventCode?: string | number;
  categoryId?: string | number;
  status?: string | number;
  remark?: string | number;
  eventConfig?: EventConfigState;
  eventParams?: EventParamItem[];
}

interface Props {
  productId: string;
}

interface EditRecord {
  id?: string;
  eventCode?: string;
  name?: string;
  [key: string]: unknown;
}

type HandleType = "add" | "edit" | "detail";

// ==================== 常量 ====================

const MODAL_WIDTH = "1000px";
const MODAL_MIN_HEIGHT = "600px";

const MODAL_TITLES: Record<HandleType, string> = {
  add: "新增事件",
  edit: "编辑事件",
  detail: "查看事件",
};

// ==================== 转换函数（API ↔ 表单） ====================

/** 从 data_config 中解析 boolean 的 0/1 文案到 param */
function setBooleanLabelsFromEnum(param: EventParamItem, enumValues: { value: string | number; label: string }[] | undefined): void {
  const zeroItem = enumValues?.find((e) => e.value === "0" || Number.parseInt(String(e.value), 10) === 0);
  const oneItem = enumValues?.find((e) => e.value === "1" || Number.parseInt(String(e.value), 10) === 1);
  param.boolZeroText = zeroItem?.label ?? "关";
  param.boolOneText = oneItem?.label ?? "开";
}

/** 将接口返回的 data_config 写入表单用 param（回显） */
function processEventParamDataConfig(dataConfig: Record<string, unknown> | undefined, param: EventParamItem): void {
  if (!dataConfig) {
    return;
  }
  const { type, enumValues, len, min, max, step } = dataConfig as {
    type?: string;
    enumValues?: { value: string | number; label: string }[];
    len?: number;
    min?: number;
    max?: number;
    step?: number;
  };

  switch (type) {
    case "enum": {
      param.enumValues = (enumValues ?? []).map((e) => {
        const value = typeof e.value === "string" && !Number.isNaN(Number.parseInt(e.value, 10)) ? Number.parseInt(e.value, 10) : e.value;
        return { value, label: e.label };
      });
      if (param.dataType === "boolean") {
        setBooleanLabelsFromEnum(param, enumValues);
      }
      break;
    }
    case "boolean":
      setBooleanLabelsFromEnum(param, enumValues);
      break;
    case "strLen":
      param.maxLength = len;
      break;
    case "range":
      param.min = min;
      param.max = max;
      param.precision = step;
      break;
    default:
      break;
  }
}

/** 组装触发条件规则（详情返回、提交均为单条规则对象，SIMPLE 时对应 SimpleRule） */
function buildEventRulesPayload(eventConfig: EventConfigState | undefined): Record<string, unknown> {
  if (!eventConfig?.rules || eventConfig.triggerType !== TriggerType.SIMPLE) {
    return {};
  }
  const { deviceId, propCode, op, oprand, delayTime } = eventConfig.rules;
  const oprandList = Array.isArray(oprand) ? oprand : oprand !== undefined && oprand !== null ? [oprand] : [];
  const delayTimeNum =
    typeof delayTime === "number" && Number.isInteger(delayTime) ? delayTime : Number.parseInt(String(delayTime ?? 0), 10);
  const rule: Record<string, unknown> = {
    propCode,
    op,
    oprand: oprandList,
    delayTime: Number.isNaN(delayTimeNum) ? 0 : delayTimeNum,
  };
  if (deviceId !== undefined && deviceId !== "") {
    rule.deviceId = deviceId;
  }
  return rule;
}

/** 接口事件参数 → 表单 EventParamItem */
function convertApiParamToFormItem(paramData: Record<string, unknown>): EventParamItem {
  const param: EventParamItem = {
    identifier: (paramData.param_code as string) || "",
    name: (paramData.name as string) || "",
    required: paramData.required === true,
    dataType: (paramData.data_type as string) || "int",
    unit: (paramData.unit_symbol as string) || null,
    precision: paramData.precision as number | undefined,
    dataRequired: false,
  };

  processEventParamDataConfig(paramData.data_config as Record<string, unknown> | undefined, param);
  return param;
}

/** 表单 EventParamItem → 物联参数规格（提交用） */
function convertEventParamToSubmit(param: EventParamItem): Record<string, unknown> {
  const submitParam: Record<string, unknown> = {
    name: param.name,
    param_code: param.identifier,
    data_type: param.dataType,
    description: param.description ?? "",
    required: param.required === true,
    precision: param.precision ?? 0,
    unit_symbol: param.unit ?? "",
  };

  const dataConfig: Record<string, unknown> = {};
  if (param.dataType === "enum" && param.enumValues?.length) {
    dataConfig.type = "enum";
    dataConfig.enumValues = param.enumValues.map((e) => ({ value: String(e.value), label: e.label }));
  } else if (param.dataType === "boolean") {
    dataConfig.type = "enum";
    dataConfig.enumValues = [
      { value: 0, label: param.boolZeroText || "关" },
      { value: 1, label: param.boolOneText || "开" },
    ];
  } else if (param.dataType === "string" && param.maxLength !== undefined) {
    dataConfig.type = "strLen";
    dataConfig.len = param.maxLength;
  } else if (param.min !== undefined && param.max !== undefined) {
    dataConfig.type = "range";
    dataConfig.min = param.min;
    dataConfig.max = param.max;
    if (param.precision !== undefined) {
      dataConfig.step = param.precision;
    }
  }

  if (Object.keys(dataConfig).length > 0) {
    submitParam.data_config = dataConfig;
  }

  return submitParam;
}

/** 详情返回的 rules（可能为数组）转为表单用的单条规则 */
function normalizeRulesForForm(rawRules: unknown): Record<string, unknown> | undefined {
  if (Array.isArray(rawRules) && rawRules.length > 0) {
    return rawRules[0] as Record<string, unknown>;
  }
  return rawRules as Record<string, unknown> | undefined;
}

// ==================== 组件 ====================

/** 事件新增/编辑弹窗 */
export const EventModal = defineComponent({
  props: ["productId"],
  emits: ["enter", "cancel"],
  setup(props: Props, { emit, expose }) {
    const eventFormRef = ref<{ validate: () => Promise<unknown>; resetForm: () => void }>();
    const spinning = ref(false);
    const handleType = ref<HandleType>("add");
    const recordId = ref<string | undefined>();
    const detailState = ref<Record<string, string | number | [] | undefined>>({});

    /**
     * 加载事件详情（接口返回类型为 ProductEventDetailModel）
     */
    const loadEventDetail = async (id: string): Promise<void> => {
      spinning.value = true;
      recordId.value = id;
      try {
        const res = (await cubeDeviceCenterService.getProductEventDetail(id)) as ProductEventDetailModel | undefined;
        if (res) {
          const { eventConfig } = res;
          const eventParamsList = (Array.isArray(eventConfig?.params) ? eventConfig.params : []).map((p) =>
            convertApiParamToFormItem(p as unknown as Record<string, unknown>),
          );
          const rulesForForm = normalizeRulesForForm(eventConfig?.rules);
          const detail = {
            ...res,
            eventConfig: eventConfig ? { ...eventConfig, rules: rulesForForm } : eventConfig,
            eventParams: eventParamsList,
          };
          detailState.value = detail as unknown as Record<string, string | number | [] | undefined>;
        }
      } catch (_ignore) {
        // 静默失败
      } finally {
        spinning.value = false;
      }
    };

    /**
     * 组装提交数据（与接口约定一致：eventConfig.rules 为单条规则对象，prodId/categoryId/status 为数字）
     */
    const buildSubmitParams = (formData: CustomFormState): Record<string, unknown> => {
      const raw = toRaw(formData) as CustomFormState;
      const { name, eventCode, categoryId, status, remark, eventConfig, eventParams } = raw;
      const paramsList = Array.isArray(eventParams) ? eventParams : [];
      const rulesPayload = buildEventRulesPayload(eventConfig);
      return {
        prodId: props.productId,
        name,
        eventCode,
        categoryId,
        status,
        remark,
        eventConfig: {
          triggerType: eventConfig?.triggerType ?? "",
          eventRelatedProp: Array.isArray(eventConfig?.eventRelatedProp) ? eventConfig.eventRelatedProp : [],
          rules: rulesPayload,
          params: paramsList.map(convertEventParamToSubmit),
        },
      };
    };

    /**
     * 重置弹窗状态
     */
    const resetModalState = (): void => {
      eventFormRef.value?.resetForm();
      detailState.value = {};
      recordId.value = undefined;
      modalApi.setConfirmLoading(false);
    };

    /**
     * 弹窗管理
     */
    const [CubeModal, modalApi] = useCubeModal({
      title: MODAL_TITLES.add,
      width: MODAL_WIDTH,
      onCancel: () => {
        resetModalState();
        modalApi.close();
        emit("cancel");
      },
      onConfirm: async (): Promise<void> => {
        try {
          modalApi.setConfirmLoading(true);
          const formData = await eventFormRef.value?.validate();
          if (!formData) {
            return;
          }
          const params = buildSubmitParams(formData as CustomFormState);
          if (handleType.value === "add") {
            await cubeDeviceCenterService.addProductEvent(params);
            message.success("新增成功");
          } else if (handleType.value === "edit" && recordId.value) {
            await cubeDeviceCenterService.updateProductEvent({ id: recordId.value, ...params });
            message.success("编辑成功");
          }

          modalApi.close();
          resetModalState();
          emit("enter");
        } catch (error) {
          const err = error as { errorMessage?: string };
          message.error(err?.errorMessage ?? "操作失败");
        } finally {
          modalApi.setConfirmLoading(false);
        }
      },
    });

    /**
     * 打开弹窗
     */
    const openModal = (type: HandleType, record?: EditRecord): void => {
      handleType.value = type;
      modalApi.open();
      resetModalState();

      modalApi.setState({ title: MODAL_TITLES[type] });

      if ((type === "edit" || type === "detail") && record?.id) {
        loadEventDetail(record.id);
      }
    };

    expose({
      openModal,
    });

    /**
     * 渲染弹窗内容
     */
    const modalSlots = {
      default: (): JSX.Element => (
        <Spin spinning={spinning.value}>
          <div style={{ minHeight: MODAL_MIN_HEIGHT }}>
            <EventForm
              ref={eventFormRef}
              formState={detailState.value as CustomFormState}
              handleType={handleType.value}
              disabled={handleType.value === "detail"}
            />
          </div>
        </Spin>
      ),
    };

    return (): JSX.Element => <CubeModal v-slots={modalSlots} />;
  },
});
