import { MethodForm } from "./method-form";
import { cubeDeviceIotCenterService } from "@/api/service";
import { DataType } from "@/constants/data-type";
import { MethodType } from "@/constants/method-type";
import type {
  ProductMethodDetailModel,
  ProductMethodParamModel,
  ProductMethodParamDataConfigModel,
} from "@ghcloud/cube-iot-center-service";
import { Modal, Spin, message } from "@ghcloud/cube-ui";
import { debounce } from "lodash";
import { defineComponent, ref } from "vue";

interface Props {
  productId: string;
}

interface EditRecord {
  id?: string;
  methodCode?: string;
  name?: string;
  methodType?: MethodType;
  description?: string;
  [key: string]: unknown;
}

type HandleType = "add" | "edit" | "detail";

/**
 * 表单参数项类型
 */
interface FormParamItem {
  identifier: string;
  name: string;
  required?: boolean;
  dataType: string;
  unit?: string | null;
  precision?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  enumValues?: { value: string | number; label: string }[];
  boolZeroText?: string;
  boolOneText?: string;
  dataRequired: boolean;
  [key: string]: unknown;
}

/**
 * 表单数据类型
 */
interface FormData {
  methodCode?: string;
  name?: string;
  methodType?: MethodType;
  status?: number;
  remark?: string;
  inputParams?: FormParamItem[];
  outputParams?: FormParamItem[];
  [key: string]: unknown;
}

/**
 * 提交参数数据配置类型
 */
interface SubmitDataConfig {
  type: string;
  enumValues?: { value: string | number; label: string }[];
  len?: number;
  min?: number;
  max?: number;
  step?: number | undefined;
}

/**
 * 提交数据类型
 */
interface SubmitParams {
  prodId: string;
  methodCode: string;
  name: string;
  callType: MethodType;
  remark: string;
  inputParams: {
    params: Partial<ProductMethodParamModel>[];
  };
  outputParams: {
    params: Partial<ProductMethodParamModel>[];
  };
  id?: string;
  [key: string]: unknown;
}

const MODAL_WIDTH = "1200px";
const MODAL_MIN_HEIGHT = "650px";
const DEBOUNCE_DELAY = 500;

const MODAL_TITLES: Record<HandleType, string> = {
  add: "新增服务方法",
  edit: "编辑服务方法",
  detail: "查看服务方法",
};

/**
 * 处理参数数据配置
 */
const processDataConfig = (dataConfig: ProductMethodParamDataConfigModel | undefined, param: FormParamItem): void => {
  if (!dataConfig) {
    return;
  }

  const { type, enumValues, len, min, max, step } = dataConfig;

  switch (type) {
    case "enum": {
      param.enumValues = (enumValues || []).map((e) => {
        const value = typeof e.value === "string" && !Number.isNaN(Number.parseInt(e.value, 10)) ? Number.parseInt(e.value, 10) : e.value;
        return { value, label: e.label };
      });
      // 如果是 boolean 类型，从 enumValues 中提取 boolZeroText 和 boolOneText
      if (param.dataType === DataType.BOOLEAN || param.dataType === "boolean") {
        const zeroItem = enumValues?.find((e) => e.value === "0" || Number.parseInt(e.value, 10) === 0);
        const oneItem = enumValues?.find((e) => e.value === "1" || Number.parseInt(e.value, 10) === 1);
        param.boolZeroText = zeroItem?.label || "关";
        param.boolOneText = oneItem?.label || "开";
      }
      break;
    }
    case "boolean": {
      const zeroItem = enumValues?.find((e) => e.value === "0" || Number.parseInt(e.value, 10) === 0);
      const oneItem = enumValues?.find((e) => e.value === "1" || Number.parseInt(e.value, 10) === 1);
      param.boolZeroText = zeroItem?.label || "关";
      param.boolOneText = oneItem?.label || "开";
      break;
    }
    case "strLen":
      param.maxLength = len;
      break;
    case "range":
      param.min = min;
      param.max = max;
      param.precision = step;
      break;
    default:
      // 其他类型不需要处理
      break;
  }
};

/**
 * 转换参数模型为表单参数项
 */
const convertParamToFormItem = (paramData: ProductMethodParamModel, isInput: boolean): FormParamItem => {
  const param: FormParamItem = {
    identifier: paramData.param_code || "",
    name: paramData.name || "",
    dataType: paramData.data_type || (isInput ? DataType.INT : "int"),
    unit: paramData.unit_symbol || null,
    precision: paramData.precision,
    dataRequired: false,
  };

  if (isInput) {
    param.required = paramData.required === true;
  }

  processDataConfig(paramData.data_config, param);
  return param;
};

/**
 * 处理回显数据
 */
const processDetailData = (res: ProductMethodDetailModel): FormData => ({
  methodCode: res.methodCode,
  name: res.name,
  methodType: res.callType === MethodType.ASYNC ? MethodType.ASYNC : MethodType.SYNC,
  status: res.status,
  remark: res.remark,
  timeoutSeconds: res.timeoutSeconds,
  retryCount: res.retryCount,
  retryInterval: res.retryInterval,
  inputParams: (res.inputParams?.params || []).map((p) => convertParamToFormItem(p, true)),
  outputParams: (res.outputParams?.params || []).map((p) => convertParamToFormItem(p, false)),
});

/**
 * 构建参数的数据配置
 */
const buildDataConfig = (param: FormParamItem): SubmitDataConfig | undefined => {
  const { dataType, enumValues, boolZeroText, boolOneText, maxLength, min, max, precision } = param;

  switch (dataType) {
    case DataType.ENUM:
      if (!enumValues?.length) {
        return undefined;
      }
      return {
        type: "enum",
        enumValues: enumValues.map((e) => ({ value: String(e.value), label: e.label })),
      };

    case DataType.BOOLEAN:
      return {
        type: "enum",
        enumValues: [
          { value: 0, label: boolZeroText || "关" },
          { value: 1, label: boolOneText || "开" },
        ],
      };

    case DataType.STRING:
      if (maxLength === undefined) {
        return undefined;
      }
      return {
        type: "strLen",
        len: maxLength,
      };

    default:
      if (min !== undefined && max !== undefined) {
        return {
          type: "range",
          min,
          max,
          step: precision ?? undefined,
        };
      }
      return undefined;
  }
};

/**
 * 转换表单参数为提交参数
 */
const convertFormParamToSubmitParam = (param: FormParamItem, isInput: boolean): Partial<ProductMethodParamModel> => {
  const submitParam: Partial<ProductMethodParamModel> = {
    name: param.name,
    param_code: param.identifier,
    data_type: param.dataType,
    unit_symbol: param.unit || "",
  };

  if (param.precision !== undefined) {
    submitParam.precision = param.precision;
  }

  if (isInput) {
    submitParam.required = param.required === true;
  }

  const dataConfig = buildDataConfig(param);
  if (dataConfig) {
    submitParam.data_config = dataConfig as ProductMethodParamDataConfigModel;
  }

  return submitParam;
};

/**
 * 组装提交数据
 */
const buildSubmitParams = (formData: FormData, productId: string): SubmitParams => {
  const {
    methodCode,
    name,
    methodType,
    status,
    timeoutSeconds,
    retryCount,
    retryInterval,
    remark,
    inputParams = [],
    outputParams = [],
  } = formData;

  if (!methodCode || !name) {
    throw new Error("方法标识和方法名称不能为空");
  }

  return {
    prodId: productId,
    methodCode,
    name,
    callType: methodType === MethodType.ASYNC ? MethodType.ASYNC : MethodType.SYNC,
    status,
    timeoutSeconds,
    retryCount,
    retryInterval,
    remark: remark || "",
    inputParams: {
      params: inputParams.map((param) => convertFormParamToSubmitParam(param, true)),
    },
    outputParams: {
      params: outputParams.map((param) => convertFormParamToSubmitParam(param, false)),
    },
  };
};

/** 服务方法新增/编辑弹窗 */
export const MethodModal = defineComponent({
  props: ["productId"],
  emits: ["enter", "cancel"],
  setup(props: Props, { emit, expose }) {
    const methodFormRef = ref<{ validate: () => Promise<unknown>; resetForm: () => void }>();
    const spinning = ref(false);
    const handleType = ref<HandleType>("add");
    const recordId = ref<string | undefined>();
    const detailState = ref<FormData>({});
    const modalVisible = ref(false);
    const confirmLoading = ref(false);
    const modalTitle = ref(MODAL_TITLES.add);

    /**
     * 加载方法详情
     */
    const loadMethodDetail = async (id: string): Promise<void> => {
      spinning.value = true;
      recordId.value = id;
      try {
        const res = await cubeDeviceIotCenterService.getProductMethodDetail(id);
        detailState.value = processDetailData(res);
      } catch {
        // 静默失败
      } finally {
        spinning.value = false;
      }
    };

    /**
     * 重置弹窗状态
     */
    const resetModalState = (): void => {
      methodFormRef.value?.resetForm();
      detailState.value = {};
      recordId.value = undefined;
    };

    /**
     * 提交表单
     */
    const onSubmit = debounce(async (): Promise<void> => {
      try {
        const formData = await methodFormRef.value?.validate();
        if (!formData) {
          return;
        }

        confirmLoading.value = true;
        const params = buildSubmitParams(formData as FormData, props.productId);

        if (handleType.value === "add") {
          await cubeDeviceIotCenterService.addProductMethod(params);
        } else if (handleType.value === "edit" && recordId.value) {
          params.id = recordId.value;
          await cubeDeviceIotCenterService.updateProductMethod(params);
        }

        message.success("操作成功");
        modalVisible.value = false;
        resetModalState();
        emit("enter");
      } catch (error) {
        const err = error as { errorMessage?: string };
        message.error(err?.errorMessage ?? "操作失败");
      } finally {
        confirmLoading.value = false;
      }
    }, DEBOUNCE_DELAY);

    /**
     * 处理取消
     */
    const handleCancel = (): void => {
      modalVisible.value = false;
      resetModalState();
      emit("cancel");
    };

    /**
     * 打开弹窗
     */
    const openModal = (type: HandleType, record?: EditRecord): void => {
      handleType.value = type;
      modalTitle.value = MODAL_TITLES[type];
      resetModalState();
      modalVisible.value = true;

      if ((type === "edit" || type === "detail") && record?.id) {
        loadMethodDetail(record.id);
      }
    };

    expose({ openModal });

    /**
     * 渲染弹窗内容
     */
    return (): JSX.Element => (
      <Modal
        title={modalTitle.value}
        width={MODAL_WIDTH}
        v-model:visible={modalVisible.value}
        confirmLoading={confirmLoading.value}
        onOk={onSubmit}
        onCancel={handleCancel}
        maskClosable={false}
      >
        <Spin spinning={spinning.value}>
          <div style={{ minHeight: MODAL_MIN_HEIGHT }}>
            <MethodForm
              ref={methodFormRef}
              formState={detailState.value}
              handleType={handleType.value}
              disabled={handleType.value === "detail"}
            />
          </div>
        </Spin>
      </Modal>
    );
  },
});
