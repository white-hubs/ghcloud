import { cubeDeviceCenterService } from "@/api/service";
import { CompareType, COMPARE_TYPE_OPTIONS } from "@/constants/compare-type";
import { DataType } from "@/constants/data-type";
import { TriggerType, TRIGGER_TYPE_OPTIONS } from "@/constants/trigger-type";
import type { ProductProp } from "@ghcloud/cube-iot-center-service";
import { Button, Form, FormItem, Input, InputNumber, Select, type FormExpose, message } from "@ghcloud/cube-ui";
import { defineComponent, reactive, ref, watch, onMounted, h } from "vue";
import { useRoute } from "vue-router";

// ==================== 类型定义 ====================

interface Props {
  formState: Record<string, string | number | [] | undefined>;
  handleType: "add" | "edit" | "detail";
  disabled?: boolean;
}

/**
 * 动态表单字段配置
 */
interface FormFieldConfig {
  value: string | number;
  label: string;
  component: unknown;
  props: Record<string, unknown>;
}

/**
 * 属性选项（用于下拉选择）
 */
interface PropOption {
  name: string;
  propCode: string;
  dataType?: string;
  dataConfig?: string;
}

/**
 * 枚举项数据类型
 */
interface EnumItem {
  label: string;
  value: string | number;
}

// ==================== 常量定义 ====================

const LABEL_WIDTH = "100px";
const INPUT_WIDTH = "130px";
const FIELD_GAP = "0px";
const FORM_ITEM_MARGIN_TOP = "24px";
const FORM_ITEM_MARGIN_BOTTOM = "24px";
const INPUT_GAP = "8px";
const RANGE_GAP = "6px";
const RANGE_SEPARATOR_COLOR = "#666";
const MAX_LENGTH = 20;

/**
 * 特殊组件标记（用于动态渲染）
 */
const COMPONENT_MARK = {
  BETWEEN_RANGE: "BETWEEN_RANGE",
  MULTIPLE_INPUT: "MULTIPLE_INPUT",
  MULTIPLE_INPUT_NUMBER: "MULTIPLE_INPUT_NUMBER",
} as const;

/**
 * 事件触发条件组件
 *
 * 功能说明：
 * 1. 根据触发条件类型（设备属性事件/设备原生事件）动态显示不同的表单字段
 * 2. 根据选择的属性数据类型和操作符，动态切换操作数输入组件
 *    - 单个值（GT、GE、LT、LE、EQ、NE）：单个输入框
 *    - 集合（IN、NOT_IN）：多选下拉框或多个输入框
 *    - 区间（BETWEEN）：两个输入框（min 和 max）
 * 3. 支持新增、编辑、查看三种模式
 */
export const DataCondition = defineComponent({
  props: ["formState", "handleType", "disabled"],
  setup(props: Props, { expose }) {
    const route = useRoute();
    const { id } = route.query as { id: string };
    const formRef = ref<FormExpose>();

    // ==================== 表单状态 ====================

    const formState = reactive<Record<string, string | number | unknown[] | undefined>>({
      triggerType: undefined,
      propCode: undefined,
      op: undefined,
      oprand: undefined,
      delayTime: undefined,
      oprandMin: undefined,
      oprandMax: undefined,
    });

    // ==================== 表单验证规则 ====================

    const formRules = {
      triggerType: [{ required: true, message: "请选择触发条件", trigger: "change" }],
      propCode: [{ required: true, message: "请选择事件属性", trigger: "change" }],
      op: [{ required: true, message: "请选择判断条件", trigger: "change" }],
      oprand: [
        {
          validator: (_rule: unknown, value: unknown): Promise<void> => {
            // BETWEEN 区间时，oprand 由 oprandMin 和 oprandMax 组成，不需要验证 oprand
            if (formState.op === CompareType.BETWEEN) {
              return Promise.resolve();
            }
            if (value === undefined || value === null || value === "") {
              return Promise.reject(new Error("请输入具体值"));
            }
            return Promise.resolve();
          },
          trigger: "change",
        },
      ],
      delayTime: [{ required: true, message: "请输入状态持续时延(秒)", trigger: "change" }],
      // BETWEEN 区间时，验证 oprandMin 和 oprandMax
      oprandMin: [
        {
          validator: (_rule: unknown, value: number | undefined): Promise<void> => {
            if (formState.op === CompareType.BETWEEN && (value === undefined || value === null)) {
              return Promise.reject(new Error("请输入最小值"));
            }
            return Promise.resolve();
          },
          trigger: "change",
        },
      ],
      oprandMax: [
        {
          validator: (_rule: unknown, value: number | undefined): Promise<void> => {
            if (formState.op === CompareType.BETWEEN && (value === undefined || value === null)) {
              return Promise.reject(new Error("请输入最大值"));
            }
            return Promise.resolve();
          },
          trigger: "change",
        },
      ],
    };

    // ==================== 数据状态 ====================

    const propOptions = ref<PropOption[]>([]);
    const dataType = ref<string>();
    const propData = ref<EnumItem[]>([]);
    const loading = ref(false);
    // 标记区间范围是否已初始化（避免重复回显覆盖用户输入）
    const betweenRangeInitialized = ref(false);

    // ==================== 动态表单字段配置 ====================

    /**
     * 创建基础字段属性
     */
    const createBaseFieldProps = (): Record<string, unknown> => ({
      allowClear: true,
      style: { width: INPUT_WIDTH },
    });

    /**
     * 设备属性事件的表单字段配置
     * 注意：这里使用 ref，后续会根据数据类型动态修改 component
     */
    const propSourceFields = ref<FormFieldConfig[]>([
      {
        label: "",
        value: "propCode",
        component: Select,
        props: {
          placeholder: "事件属性",
          options: propOptions.value,
          allowClear: true,
          fieldNames: { label: "name", value: "propCode" },
          style: { width: INPUT_WIDTH },
        },
      },
      {
        label: "",
        value: "op",
        component: Select,
        props: {
          placeholder: "操作符",
          options: COMPARE_TYPE_OPTIONS,
          allowClear: true,
          style: { width: INPUT_WIDTH },
        },
      },
      {
        label: "",
        value: "oprand",
        component: InputNumber,
        props: {
          placeholder: "具体值",
          ...createBaseFieldProps(),
          maxlength: MAX_LENGTH,
        },
      },
      {
        label: "",
        value: "delayTime",
        component: InputNumber,
        props: {
          placeholder: "状态持续时延(秒)",
          ...createBaseFieldProps(),
          maxlength: MAX_LENGTH,
        },
      },
    ]);

    /**
     * 触发条件类型与表单字段的映射关系
     */
    const triggerTypeFieldMap = new Map<string | number, FormFieldConfig[]>([
      [TriggerType.SIMPLE, propSourceFields.value],
      [TriggerType.NATURE, []],
    ]);

    const dynamicFields = ref<FormFieldConfig[]>([]);

    /**
     * 触发条件选择字段（固定显示）
     */
    const triggerTypeField = ref<FormFieldConfig[]>([
      {
        label: "触发条件",
        value: "triggerType",
        component: Select,
        props: {
          placeholder: "请选择触发条件",
          options: TRIGGER_TYPE_OPTIONS,
          allowClear: true,
          style: { width: INPUT_WIDTH },
        },
      },
    ]);

    // ==================== 业务逻辑函数 ====================

    /**
     * 切换触发条件类型
     */
    const handleTriggerTypeChange = (value: string | number): void => {
      const fields = triggerTypeFieldMap.get(value) ?? [];
      // 使用浅拷贝，保持对象引用共享
      dynamicFields.value = [...fields];
    };

    /**
     * 解析属性数据配置
     */
    const parsePropDataConfig = (dataConfig: string | undefined): EnumItem[] => {
      if (!dataConfig) {
        return [];
      }
      try {
        return JSON.parse(dataConfig) as EnumItem[];
      } catch {
        return [];
      }
    };

    /**
     * 处理事件属性选择变化
     */
    const handlePropCodeChange = (value: unknown): void => {
      try {
        const selectedProp = propOptions.value.find((item) => item.propCode === value);
        if (!selectedProp) {
          return;
        }

        dataType.value = selectedProp.dataType;
        propData.value = parsePropDataConfig(selectedProp.dataConfig);
      } catch {
        // 静默处理错误
      }
    };

    /**
     * 转换产品属性列表为选项列表
     */
    const transformPropListToOptions = (propList: ProductProp[]): PropOption[] => {
      if (!Array.isArray(propList)) {
        return [];
      }
      return propList
        .map((item: ProductProp) => {
          const result: PropOption = {
            name: (item.name as string) ?? "",
            propCode: (item.propCode as string) ?? "",
          };
          if (item.dataType) {
            result.dataType = item.dataType as string;
          }
          if (item.dataConfig) {
            result.dataConfig = item.dataConfig as string;
          }
          return result;
        })
        .filter((item) => item.propCode);
    };

    /**
     * 更新字段选项
     */
    const updateFieldOptions = (): void => {
      const propCodeField = propSourceFields.value.find((field) => field.value === "propCode");
      if (propCodeField) {
        propCodeField.props.options = propOptions.value;
      }

      const opField = propSourceFields.value.find((field) => field.value === "op");
      if (opField) {
        opField.props.options = COMPARE_TYPE_OPTIONS;
      }
    };

    /**
     * 加载属性列表
     */
    const loadOptions = async (): Promise<void> => {
      loading.value = true;
      try {
        const propListRes = await cubeDeviceCenterService.getProductPropList({ prodId: id ?? "" });

        if (Array.isArray(propListRes)) {
          propOptions.value = transformPropListToOptions(propListRes);
        } else {
          propOptions.value = [];
        }

        updateFieldOptions();
      } catch (error) {
        const err = error as { errorMessage?: string };
        message.error(err?.errorMessage ?? "加载属性列表失败，请稍后重试");
        propOptions.value = [];
      } finally {
        loading.value = false;
      }
    };

    /**
     * 判断是否为集合操作符
     */
    const isCollectionOperator = (op: string): boolean => op === CompareType.IN || op === CompareType.NOT_IN;

    /**
     * 判断是否为区间操作符
     */
    const isRangeOperator = (op: string): boolean => op === CompareType.BETWEEN;

    /**
     * 判断是否为选择类型（枚举或布尔）
     */
    const isSelectType = (type: string): boolean => type === DataType.ENUM || type === DataType.BOOLEAN;

    /**
     * 配置区间操作数组件
     */
    const configureRangeOperand = (operandField: FormFieldConfig): void => {
      operandField.component = COMPONENT_MARK.BETWEEN_RANGE;
      operandField.props = {
        ...createBaseFieldProps(),
        placeholder: "区间范围",
      };
    };

    /**
     * 配置集合操作数组件
     */
    const configureCollectionOperand = (operandField: FormFieldConfig, type: string): void => {
      if (isSelectType(type)) {
        // 枚举/布尔类型：使用多选下拉框
        operandField.component = Select;
        operandField.props = {
          ...createBaseFieldProps(),
          placeholder: "请选择多个值",
          mode: "multiple",
          options: propData.value,
        };
      } else if (type === DataType.STRING) {
        // 字符串类型：使用多个输入框
        operandField.component = COMPONENT_MARK.MULTIPLE_INPUT;
        operandField.props = {
          ...createBaseFieldProps(),
          placeholder: "多个值",
        };
      } else {
        // 数值类型：使用多个数字输入框
        operandField.component = COMPONENT_MARK.MULTIPLE_INPUT_NUMBER;
        operandField.props = {
          ...createBaseFieldProps(),
          placeholder: "多个值",
        };
      }
    };

    /**
     * 配置单个值操作数组件
     */
    const configureSingleOperand = (operandField: FormFieldConfig, type: string): void => {
      if (type === DataType.STRING) {
        operandField.component = Input;
        operandField.props = {
          ...createBaseFieldProps(),
          placeholder: "具体值",
          maxlength: MAX_LENGTH,
        };
      } else if (isSelectType(type)) {
        operandField.component = Select;
        operandField.props = {
          ...createBaseFieldProps(),
          placeholder: "请选择值",
          options: propData.value,
        };
      } else {
        // int, long, float, double 等数值类型
        operandField.component = InputNumber;
        operandField.props = {
          ...createBaseFieldProps(),
          placeholder: "具体值",
        };
      }
    };

    /**
     * 根据操作符和数据类型动态切换操作数输入组件
     */
    const updateOperandComponent = (type: string | undefined, op: string): void => {
      const operandField = propSourceFields.value.find((field) => field.value === "oprand");
      if (!operandField || !type) {
        return;
      }

      if (isRangeOperator(op)) {
        configureRangeOperand(operandField);
      } else if (isCollectionOperator(op)) {
        configureCollectionOperand(operandField, type);
      } else {
        configureSingleOperand(operandField, type);
      }
    };

    /**
     * 处理 BETWEEN 区间的数据回显
     * 只在初始化时调用，避免覆盖用户输入的值
     */
    const handleBetweenRangeDataEcho = (): void => {
      // 如果已经初始化过，不再处理
      if (betweenRangeInitialized.value) {
        return;
      }
      // 如果 oprandMin 和 oprandMax 都已经有值，说明用户已经输入过，不需要从 oprand 回显
      if (formState.oprandMin !== undefined || formState.oprandMax !== undefined) {
        betweenRangeInitialized.value = true;
        return;
      }
      const currentValue = formState.oprand as [number, number] | undefined;
      if (currentValue && Array.isArray(currentValue) && currentValue.length === 2) {
        formState.oprandMin = currentValue[0] as number;
        formState.oprandMax = currentValue[1] as number;
        betweenRangeInitialized.value = true;
      }
    };

    /**
     * 解析 oprand 值（可能是字符串或数组）
     */
    const parseOprandValue = (oprand: unknown): unknown[] | undefined => {
      if (oprand === undefined || oprand === null) {
        return undefined;
      }
      // 如果是数组，直接返回
      if (Array.isArray(oprand)) {
        return oprand;
      }
      // 如果是字符串，尝试解析为 JSON
      if (typeof oprand === "string") {
        try {
          const parsed = JSON.parse(oprand);
          if (Array.isArray(parsed)) {
            return parsed;
          }
          // 如果不是数组，返回包含该值的数组
          return [parsed];
        } catch {
          // 解析失败，返回包含该字符串的数组
          return [oprand];
        }
      }
      // 其他类型，返回包含该值的数组
      return [oprand];
    };

    /**
     * 初始化表单数据（编辑/查看模式）
     */
    const initializeFormData = async (): Promise<void> => {
      if (!props.formState) {
        return;
      }

      formRef.value?.clearValidate();
      Object.assign(formState, props.formState, props.formState.rules);

      // 处理 oprand 值的解析（可能是字符串或数组）
      if (formState.oprand !== undefined) {
        const parsedOprand = parseOprandValue(formState.oprand);
        formState.oprand = parsedOprand as unknown[];
      }

      // 处理 BETWEEN 区间的数据回显
      if (formState.op === CompareType.BETWEEN) {
        // 重置初始化标记，允许重新回显
        betweenRangeInitialized.value = false;
        handleBetweenRangeDataEcho();
      } else {
        // 如果不是 BETWEEN 操作符，重置初始化标记
        betweenRangeInitialized.value = false;
      }

      // 如果有属性编码，需要加载选项并更新组件类型
      if (formState.propCode) {
        try {
          await loadOptions();
          handlePropCodeChange(formState.propCode);
          if (formState.op) {
            updateOperandComponent(dataType.value, formState.op as string);
          }
        } catch {
          // loadOptions 已经处理了错误提示
        }
      }
    };

    /**
     * 清空表单数据（新增模式）
     */
    const clearFormData = (): void => {
      Object.keys(formState).forEach((key) => {
        formState[key] = undefined;
      });
    };

    /**
     * 处理属性变化时的操作数清理
     */
    const handleOperandOnPropChange = (value: unknown): void => {
      if (props.handleType === "add") {
        formState.oprand = undefined;
        formState.oprandMin = undefined;
        formState.oprandMax = undefined;
      } else {
        const rules = props.formState.rules as { propCode?: unknown; oprand?: unknown } | undefined;
        if (value === rules?.propCode) {
          const oprandValue = rules?.oprand as string | number | unknown[] | undefined;
          formState.oprand = oprandValue;
          // 如果是 BETWEEN 区间，解析数组
          if (
            formState.op === CompareType.BETWEEN &&
            Array.isArray(oprandValue) &&
            oprandValue.length === 2 &&
            typeof oprandValue[0] === "number" &&
            typeof oprandValue[1] === "number"
          ) {
            formState.oprandMin = oprandValue[0];
            formState.oprandMax = oprandValue[1];
          }
        } else {
          formState.oprand = undefined;
          formState.oprandMin = undefined;
          formState.oprandMax = undefined;
        }
      }
    };

    // ==================== 监听器 ====================

    /**
     * 监听外部传入的 formState 变化（用于编辑/查看模式的数据回显）
     */
    watch(
      () => props.formState,
      async () => {
        if (props.formState) {
          await initializeFormData();
        } else {
          clearFormData();
        }
      },
      { deep: true, immediate: true },
    );

    /**
     * 监听触发条件类型变化
     */
    watch(
      () => formState.triggerType,
      (value) => {
        if (value && !Array.isArray(value)) {
          handleTriggerTypeChange(value);
        }
      },
    );

    /**
     * 监听事件属性变化
     */
    watch(
      () => formState.propCode,
      (value) => {
        handleOperandOnPropChange(value);
        handlePropCodeChange(value);
      },
    );

    /**
     * 监听操作符变化，动态更新操作数输入组件
     */
    watch(
      () => formState.op,
      (op) => {
        if (op) {
          updateOperandComponent(dataType.value, op as string);
        }
      },
    );

    /**
     * 监听数据类型变化，动态更新操作数输入组件
     */
    watch(
      () => dataType.value,
      (type) => {
        if (formState.op) {
          updateOperandComponent(type, formState.op as string);
        }
      },
    );

    /**
     * 监听 BETWEEN 区间的 min 和 max 值变化，自动更新 oprand
     */
    watch(
      () => [formState.oprandMin, formState.oprandMax],
      ([minVal, maxVal]) => {
        if (formState.op === CompareType.BETWEEN && minVal !== undefined && maxVal !== undefined) {
          formState.oprand = [minVal as number, maxVal as number] as unknown[];
        }
      },
    );

    // ==================== 表单方法 ====================

    /**
     * 表单验证
     */
    const validate = async (): Promise<unknown> => {
      try {
        // 处理 BETWEEN 区间的数据格式
        if (formState.op === CompareType.BETWEEN) {
          const minValue = formState.oprandMin as number | undefined;
          const maxValue = formState.oprandMax as number | undefined;
          if (minValue !== undefined && maxValue !== undefined) {
            formState.oprand = [minValue, maxValue];
          } else {
            // 如果值不完整，清空 oprand，让验证失败
            formState.oprand = undefined;
          }
        }
        // 先验证表单字段
        const validatedValues = await formRef.value?.validate();
        // 合并 formState 中的值（包括 oprandMin 和 oprandMax，它们可能不在 FormItem 中）
        return {
          ...validatedValues,
          triggerType: formState.triggerType,
          propCode: formState.propCode,
          op: formState.op,
          oprand: formState.oprand,
          delayTime: formState.delayTime,
          // BETWEEN 区间时，也返回 oprandMin 和 oprandMax（虽然它们会被合并到 oprand 中）
          ...(formState.op === CompareType.BETWEEN
            ? {
                oprandMin: formState.oprandMin,
                oprandMax: formState.oprandMax,
              }
            : {}),
        };
      } catch (errorInfo) {
        return Promise.reject(errorInfo);
      }
    };

    /**
     * 重置表单验证状态
     */
    const resetForm = (): void => {
      formRef.value?.clearValidate();
    };

    // ==================== 生命周期 ====================

    onMounted(async () => {
      await loadOptions();
    });

    // ==================== 暴露方法 ====================

    expose({
      validate,
      resetForm,
      formState,
    });

    // ==================== 渲染函数 ====================

    /**
     * 渲染 InputNumber 组件（包裹在 div 中以限制宽度）
     */
    const renderInputNumberWithWidth = (
      value: number | undefined,
      placeholder: string,
      disabled: boolean,
      width: string = INPUT_WIDTH,
      onUpdate?: (value: number | undefined) => void,
    ): JSX.Element => {
      const props: Record<string, unknown> = {
        "v-model:value": value,
        placeholder,
        allowClear: true,
        disabled,
      };
      if (onUpdate) {
        props.onChange = onUpdate;
      }
      return (
        <div style={{ width }}>
          <InputNumber {...props} />
        </div>
      );
    };

    /**
     * 渲染 BETWEEN 区间输入框（两个输入框）
     */
    const renderBetweenRange = (): JSX.Element => {
      // 只在初始化时处理数据回显，避免覆盖用户输入
      handleBetweenRangeDataEcho();

      return (
        <div style={{ display: "flex", alignItems: "center", gap: RANGE_GAP, flexWrap: "nowrap" }}>
          <FormItem name="oprandMin" style={{ marginBottom: 0, marginRight: 0 }}>
            <div style={{ width: INPUT_WIDTH }}>
              <InputNumber
                v-model:value={formState.oprandMin as number | undefined}
                placeholder="最小值"
                allowClear
                disabled={props.disabled || false}
              />
            </div>
          </FormItem>
          <span style={{ color: RANGE_SEPARATOR_COLOR, flexShrink: 0 }}>～</span>
          <FormItem name="oprandMax" style={{ marginBottom: 0, marginRight: 0 }}>
            <div style={{ width: INPUT_WIDTH }}>
              <InputNumber
                v-model:value={formState.oprandMax as number | undefined}
                placeholder="最大值"
                allowClear
                disabled={props.disabled || false}
              />
            </div>
          </FormItem>
        </div>
      );
    };

    /**
     * 渲染多个输入框（用于 IN、NOT_IN 的字符串或数值类型）
     */
    const renderMultipleInput = (isNumber: boolean): JSX.Element => {
      // 确保 oprand 是数组格式，使用 parseOprandValue 解析
      // 使用 computed 或直接从 formState.oprand 读取，确保响应式
      const currentValue = formState.oprand;
      const parsedValues = parseOprandValue(currentValue);
      const values = parsedValues ?? [];

      const addValue = (): void => {
        const currentArray = parseOprandValue(formState.oprand) ?? [];
        const newValues = [...currentArray, isNumber ? (0 as number) : ("" as string)];
        formState.oprand = newValues;
      };

      const removeValue = (index: number): void => {
        const currentArray = parseOprandValue(formState.oprand) ?? [];
        const newValues = currentArray.filter((_, i) => i !== index);
        formState.oprand = newValues.length > 0 ? newValues : undefined;
      };

      const updateValue = (index: number, value: string | number | undefined): void => {
        const currentArray = parseOprandValue(formState.oprand) ?? [];
        const newValues = [...currentArray];
        if (value === undefined || value === null || value === "") {
          newValues.splice(index, 1);
        } else {
          newValues[index] = value;
        }
        formState.oprand = newValues.length > 0 ? newValues : undefined;
      };

      // 确保 values 数组有值，如果没有值且不是禁用状态，至少显示一个空输入框
      const displayValues = values.length > 0 ? values : props.disabled ? [] : [isNumber ? undefined : undefined];

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: INPUT_GAP }}>
          {displayValues.map((_val, index) => {
            // 每次渲染时都从 formState.oprand 读取当前值，确保响应式
            const currentArray = parseOprandValue(formState.oprand) ?? [];
            const currentItemValue = currentArray[index];

            return (
              <div key={index} style={{ display: "flex", alignItems: "center", gap: INPUT_GAP }}>
                {isNumber ? (
                  <div style={{ width: INPUT_WIDTH }}>
                    <InputNumber
                      v-model:value={currentItemValue as number | undefined}
                      placeholder={`值 ${index + 1}`}
                      allowClear
                      disabled={props.disabled || false}
                      onChange={(value: number | undefined) => {
                        updateValue(index, value);
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ width: INPUT_WIDTH }}>
                    <Input
                      v-model:value={currentItemValue as string | undefined}
                      placeholder={`值 ${index + 1}`}
                      allowClear
                      maxlength={MAX_LENGTH}
                      disabled={props.disabled || false}
                      onUpdate:value={(value: string | undefined) => {
                        updateValue(index, value);
                      }}
                    />
                  </div>
                )}
                {!props.disabled && (
                  <Button type="link" danger size="small" onClick={() => removeValue(index)}>
                    删除
                  </Button>
                )}
              </div>
            );
          })}
          {!props.disabled && (
            <Button type="dashed" size="small" onClick={addValue} style={{ width: INPUT_WIDTH }}>
              + 添加值
            </Button>
          )}
        </div>
      );
    };

    /**
     * 使用 h() 函数动态渲染组件
     * 注意：h() 函数不支持 v-model 指令，需要手动处理双向绑定
     */
    const renderDynamicComponent = (fieldConfig: FormFieldConfig, fieldName: string): JSX.Element => {
      // BETWEEN 区间：特殊处理
      if (fieldName === "oprand" && fieldConfig.component === COMPONENT_MARK.BETWEEN_RANGE) {
        return renderBetweenRange();
      }

      // 多个输入框：特殊处理
      if (fieldName === "oprand" && fieldConfig.component === COMPONENT_MARK.MULTIPLE_INPUT) {
        return renderMultipleInput(false);
      }

      if (fieldName === "oprand" && fieldConfig.component === COMPONENT_MARK.MULTIPLE_INPUT_NUMBER) {
        return renderMultipleInput(true);
      }

      // delayTime 字段特殊处理（InputNumber 需要包裹在 div 中）
      if (fieldName === "delayTime" && fieldConfig.component === InputNumber) {
        const fieldProps = fieldConfig.props as { placeholder?: string };
        return renderInputNumberWithWidth(
          formState.delayTime as number | undefined,
          fieldProps.placeholder || "状态持续时延(秒)",
          props.disabled || false,
        );
      }

      // 普通组件渲染
      const componentProps = {
        ...fieldConfig.props,
        value: formState[fieldName],
        "onUpdate:value": (value: string | number | [] | undefined) => {
          formState[fieldName] = value;
        },
        disabled: props.disabled || false,
      };

      return h(fieldConfig.component as unknown as { (props: Record<string, unknown>): JSX.Element }, componentProps);
    };

    /**
     * 渲染触发条件字段
     */
    const renderTriggerTypeField = (): JSX.Element => (
      <div style={{ display: "flex" }}>
        {triggerTypeField.value.map((field) => {
          const fieldName = String(field.value);
          return (
            <FormItem
              key={fieldName}
              label={field.label}
              name={fieldName}
              style={{ marginBottom: FORM_ITEM_MARGIN_BOTTOM, marginRight: 0 }}
            >
              {renderDynamicComponent(field, fieldName)}
            </FormItem>
          );
        })}
      </div>
    );

    /**
     * 渲染动态字段
     */
    const renderDynamicFields = (): JSX.Element | null => {
      if (dynamicFields.value.length === 0) {
        return null;
      }

      return (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            marginLeft: LABEL_WIDTH,
            marginTop: "-10px",
            gap: FIELD_GAP,
            alignItems: "flex-start",
          }}
        >
          {dynamicFields.value.map((field) => {
            const fieldName = String(field.value);
            return (
              <FormItem
                key={fieldName}
                label={field.label}
                name={fieldName}
                style={{
                  marginRight: 0,
                  marginLeft: 0,
                  marginTop: FORM_ITEM_MARGIN_TOP,
                  flex: "0 0 auto",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", flexWrap: "nowrap" }}>
                  {renderDynamicComponent(field, fieldName)}
                  {fieldName === "delayTime" && <span style={{ marginLeft: "10px" }}>秒</span>}
                </div>
              </FormItem>
            );
          })}
        </div>
      );
    };

    // ==================== 渲染 ====================

    return (): JSX.Element => (
      <Form
        ref={formRef}
        model={formState}
        labelCol={{ style: { width: LABEL_WIDTH } }}
        layout="inline"
        rules={formRules}
        style={{ marginBottom: 0 }}
      >
        {renderTriggerTypeField()}
        {renderDynamicFields()}
      </Form>
    );
  },
});
