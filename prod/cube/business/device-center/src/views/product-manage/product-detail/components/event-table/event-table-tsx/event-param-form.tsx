import { DATA_TYPE_OPTIONS, DataType, FLOAT_TYPES, NUMERIC_TYPES } from "@/constants/data-type";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons-vue";
import { Form, FormItem, Input, Select, InputNumber, Button, Switch, type FormExpose } from "@ghcloud/cube-ui";
import { defineComponent, reactive, ref, watch, computed, onBeforeUnmount } from "vue";

interface ParamItem {
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
  [key: string]: unknown;
}

interface Props {
  param: ParamItem;
  disabled: boolean;
  onChange?: (data: Partial<ParamItem>) => void;
}

const RANGE_INPUT_WIDTH = "350px";
const LABEL_INPUT_WIDTH = "200px";
const SELECT_WIDTH = "350px";
const INPUT_GAP = "8px";
const FIELD_GAP = "8px";
const LABEL_WIDTH = "100px";
const PRECISION_MIN = 0;
const PRECISION_MAX = 4;
const ENUM_MAX_LENGTH = 20;

/** 事件参数表单组件 */
export const EventParamForm = defineComponent({
  props: ["param", "disabled", "onChange"],
  setup(props: Props, { expose }) {
    const isMounted = ref(true);
    const formRef = ref<FormExpose>();

    const paramState = reactive<ParamItem>({
      identifier: props.param.identifier || "",
      name: props.param.name || "",
      required: props.param.required || false,
      dataType: props.param.dataType || DataType.INT,
      unit: props.param.unit || null,
      min: props.param.min,
      max: props.param.max,
      precision: props.param.precision,
      maxLength: props.param.maxLength,
      enumValues: props.param.enumValues || [],
      boolZeroText: props.param.boolZeroText || "关",
      boolOneText: props.param.boolOneText || "开",
      dataRequired: props.param.dataRequired || false,
    });

    const enumValues = ref<{ value: string | number; label: string }[]>(paramState.enumValues || []);

    /**
     * 监听 param 变化
     */
    const stopWatchParam = watch(
      () => props.param,
      () => {
        Object.assign(paramState, {
          identifier: props.param.identifier || "",
          name: props.param.name || "",
          required: props.param.required || false,
          dataType: props.param.dataType || DataType.INT,
          unit: props.param.unit || null,
          min: props.param.min,
          max: props.param.max,
          precision: props.param.precision,
          maxLength: props.param.maxLength,
          enumValues: props.param.enumValues || [],
          boolZeroText: props.param.boolZeroText || "关",
          boolOneText: props.param.boolOneText || "开",
          dataRequired: props.param.dataRequired || false,
        });
        enumValues.value = paramState.enumValues || [];
      },
      { deep: true, immediate: true },
    );

    /**
     * 监听 paramState 变化，触发 onChange
     */
    const stopWatchState = watch(
      () => paramState,
      () => {
        if (!isMounted.value || !props.onChange) {
          return;
        }
        try {
          props.onChange({
            ...paramState,
            enumValues: enumValues.value,
          });
        } catch (_ignore) {
          // 静默处理错误，避免在组件卸载时抛出异常
        }
      },
      { deep: true, flush: "pre" },
    );

    /**
     * 表单验证规则
     */
    const formRules = {
      identifier: [{ required: true, message: "请输入参数标识", trigger: "blur" }],
      name: [{ required: true, message: "请输入参数名称", trigger: "blur" }],
      dataType: [{ required: true, message: "请选择数据类型", trigger: "change" }],
      min: [
        {
          validator: (_rule: unknown, value: number | undefined): Promise<void> => {
            if (value !== undefined && value !== null) {
              const { max } = paramState;
              if (max !== undefined && max !== null && value > max) {
                return Promise.reject(new Error("最小值不能大于最大值"));
              }
            }
            return Promise.resolve();
          },
          trigger: "blur",
        },
      ],
      max: [
        {
          validator: (_rule: unknown, value: number | undefined): Promise<void> => {
            if (value !== undefined && value !== null) {
              const { min } = paramState;
              if (min !== undefined && min !== null && value < min) {
                return Promise.reject(new Error("最大值不能小于最小值"));
              }
            }
            return Promise.resolve();
          },
          trigger: "blur",
        },
      ],
      maxLength: [
        {
          validator: (_rule: unknown, value: number | undefined): Promise<void> => {
            if (value !== undefined && value !== null && value < 1) {
              return Promise.reject(new Error("最大长度必须大于等于1"));
            }
            return Promise.resolve();
          },
          trigger: "blur",
        },
      ],
      precision: [
        {
          validator: (_rule: unknown, value: number | undefined): Promise<void> => {
            if (value !== undefined && value !== null) {
              if (value < PRECISION_MIN || value > PRECISION_MAX) {
                return Promise.reject(new Error(`精度必须在${PRECISION_MIN}到${PRECISION_MAX}之间`));
              }
            }
            return Promise.resolve();
          },
          trigger: "blur",
        },
      ],
      enumValues: [
        {
          validator: (_rule: unknown, _value: unknown): Promise<void> => {
            const values = enumValues.value;
            if (paramState.dataType === DataType.ENUM) {
              if (!values || values.length === 0) {
                return Promise.reject(new Error("枚举类型至少需要一个枚举项"));
              }
              for (const item of values) {
                if (!item.value && item.value !== 0 && item.value !== "0") {
                  return Promise.reject(new Error("枚举项的Value不能为空"));
                }
                if (!item.label || item.label.trim() === "") {
                  return Promise.reject(new Error("枚举项的Label不能为空"));
                }
              }
            }
            return Promise.resolve();
          },
          trigger: "change",
        },
      ],
      boolZeroText: [
        {
          validator: (_rule: unknown, value: string | undefined): Promise<void> => {
            if (paramState.dataType === DataType.BOOLEAN) {
              if (!value || value.trim() === "") {
                return Promise.reject(new Error("布尔值0的文本不能为空"));
              }
            }
            return Promise.resolve();
          },
          trigger: "blur",
        },
      ],
      boolOneText: [
        {
          validator: (_rule: unknown, value: string | undefined): Promise<void> => {
            if (paramState.dataType === DataType.BOOLEAN) {
              if (!value || value.trim() === "") {
                return Promise.reject(new Error("布尔值1的文本不能为空"));
              }
            }
            return Promise.resolve();
          },
          trigger: "blur",
        },
      ],
    };

    /**
     * 表单验证
     */
    const validate = async (): Promise<unknown> => {
      try {
        await formRef.value?.validate();
        return {
          ...paramState,
          enumValues: enumValues.value,
        };
      } catch (errorInfo) {
        return Promise.reject(errorInfo);
      }
    };

    /**
     * 清除验证
     */
    const clearValidate = (): void => {
      formRef.value?.clearValidate();
    };

    /**
     * 添加枚举项
     */
    const addEnumItem = (): void => {
      enumValues.value.push({ value: "", label: "" });
    };

    /**
     * 删除枚举项
     */
    const removeEnumItem = (index: number): void => {
      enumValues.value.splice(index, 1);
    };

    /**
     * 数据类型变化时清空相关配置
     */
    const stopWatchDataType = watch(
      () => paramState.dataType,
      (newType) => {
        if (newType === "enum") {
          if (enumValues.value.length === 0) {
            enumValues.value.push({ value: "", label: "" });
          }
        } else {
          enumValues.value = [];
        }
        if (!NUMERIC_TYPES.includes(newType as (typeof NUMERIC_TYPES)[number])) {
          delete paramState.min;
          delete paramState.max;
          delete paramState.precision;
        }
        if (newType !== "string") {
          delete paramState.maxLength;
        }
        if (newType !== "boolean") {
          paramState.boolZeroText = "关";
          paramState.boolOneText = "开";
        }
      },
    );

    const isNumericType = computed(() => NUMERIC_TYPES.includes(paramState.dataType as (typeof NUMERIC_TYPES)[number]));
    const isFloatType = computed(() => FLOAT_TYPES.includes(paramState.dataType as (typeof FLOAT_TYPES)[number]));

    /**
     * 组件卸载前清理监听器
     */
    onBeforeUnmount(() => {
      isMounted.value = false;
      stopWatchParam();
      stopWatchState();
      stopWatchDataType();
    });

    expose({
      validate,
      clearValidate,
    });

    return (): JSX.Element => (
      <Form ref={formRef} model={paramState} labelCol={{ style: { width: LABEL_WIDTH } }} rules={formRules}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", gap: FIELD_GAP, flexWrap: "wrap", alignItems: "flex-start" }}>
            <FormItem
              label="参数标识"
              name="identifier"
              style={{ marginBottom: 0, width: RANGE_INPUT_WIDTH }}
              class="param-form-item-compact"
            >
              <Input
                v-model:value={paramState.identifier}
                placeholder="请输入参数标识"
                allowClear
                maxlength={50}
                showCount
                disabled={props.disabled}
              />
            </FormItem>
            <FormItem label="参数名称" name="name" style={{ marginBottom: 0, width: RANGE_INPUT_WIDTH }}>
              <Input
                v-model:value={paramState.name}
                placeholder="请输入参数名称"
                allowClear
                maxlength={30}
                showCount
                disabled={props.disabled}
              />
            </FormItem>
            <FormItem label="是否必填" name="required" style={{ marginBottom: 0, width: SELECT_WIDTH }}>
              <Switch
                v-model:value={paramState.required}
                checkedChildren="必填"
                unCheckedChildren="不必填"
                {...(props.disabled ? { disabled: true } : {})}
              />
            </FormItem>
            <FormItem label="参数单位" name="unit" style={{ marginBottom: 0, width: SELECT_WIDTH }}>
              <Input v-model:value={paramState.unit} placeholder="请输入单位" allowClear maxlength={20} disabled={props.disabled} />
            </FormItem>
            <FormItem label="数据类型" name="dataType" style={{ marginBottom: 0, width: SELECT_WIDTH }}>
              <Select
                v-model:value={paramState.dataType}
                options={DATA_TYPE_OPTIONS}
                placeholder="请选择数据类型"
                showSearch={false}
                disabled={props.disabled}
              />
            </FormItem>
          </div>

          {/* 数据类型配置 */}
          {isNumericType.value && !isFloatType.value ? (
            <FormItem label="取值范围" style={{ marginBottom: 0 }}>
              <div style={{ display: "flex", gap: INPUT_GAP, alignItems: "center" }}>
                <FormItem name="min" style={{ marginBottom: 0 }}>
                  <InputNumber
                    v-model:value={paramState.min}
                    placeholder="最小值"
                    allowClear
                    disabled={props.disabled}
                    style={{ width: RANGE_INPUT_WIDTH, maxWidth: RANGE_INPUT_WIDTH }}
                  />
                </FormItem>
                <span style={{ color: "#8c8c8c", margin: "0 4px" }}>～</span>
                <FormItem name="max" style={{ marginBottom: 0 }}>
                  <InputNumber
                    v-model:value={paramState.max}
                    placeholder="最大值"
                    allowClear
                    disabled={props.disabled}
                    style={{ width: RANGE_INPUT_WIDTH, maxWidth: RANGE_INPUT_WIDTH }}
                  />
                </FormItem>
              </div>
            </FormItem>
          ) : null}

          {isFloatType.value ? (
            <>
              <FormItem label="取值范围" style={{ marginBottom: 0 }}>
                <div style={{ display: "flex", gap: INPUT_GAP, alignItems: "center" }}>
                  <FormItem name="min" style={{ marginBottom: 0 }}>
                    <InputNumber
                      v-model:value={paramState.min}
                      placeholder="最小值"
                      allowClear
                      disabled={props.disabled}
                      style={{ width: RANGE_INPUT_WIDTH, maxWidth: RANGE_INPUT_WIDTH }}
                    />
                  </FormItem>
                  <span style={{ color: "#8c8c8c", margin: "0 4px" }}>～</span>
                  <FormItem name="max" style={{ marginBottom: 0 }}>
                    <InputNumber
                      v-model:value={paramState.max}
                      placeholder="最大值"
                      allowClear
                      disabled={props.disabled}
                      style={{ width: RANGE_INPUT_WIDTH, maxWidth: RANGE_INPUT_WIDTH }}
                    />
                  </FormItem>
                </div>
              </FormItem>
              <FormItem label="小数精度" name="precision" style={{ marginBottom: 0 }}>
                <InputNumber
                  v-model:value={paramState.precision}
                  placeholder="保留小数位数"
                  allowClear
                  min={PRECISION_MIN}
                  max={PRECISION_MAX}
                  precision={0}
                  disabled={props.disabled}
                  style={{ width: RANGE_INPUT_WIDTH, maxWidth: RANGE_INPUT_WIDTH }}
                />
              </FormItem>
            </>
          ) : null}

          {paramState.dataType === "string" ? (
            <FormItem label="最大长度" name="maxLength" style={{ marginBottom: 0 }}>
              <InputNumber
                v-model:value={paramState.maxLength}
                placeholder="请输入最大长度"
                allowClear
                min={1}
                disabled={props.disabled}
                style={{ width: RANGE_INPUT_WIDTH, maxWidth: RANGE_INPUT_WIDTH }}
              />
            </FormItem>
          ) : null}

          {paramState.dataType === "boolean" ? (
            <FormItem label="布尔值" style={{ marginBottom: 0 }}>
              <div style={{ display: "flex", gap: INPUT_GAP, alignItems: "center" }}>
                <FormItem name="boolZeroText" style={{ marginBottom: 0 }}>
                  <Input
                    v-model:value={paramState.boolZeroText}
                    placeholder="如：关"
                    allowClear
                    maxlength={20}
                    addonBefore="0"
                    disabled={props.disabled}
                    style={{ width: LABEL_INPUT_WIDTH, maxWidth: LABEL_INPUT_WIDTH }}
                  />
                </FormItem>
                <span style={{ color: "#8c8c8c", margin: "0 4px" }}>～</span>
                <FormItem name="boolOneText" style={{ marginBottom: 0 }}>
                  <Input
                    v-model:value={paramState.boolOneText}
                    placeholder="如：开"
                    allowClear
                    maxlength={20}
                    addonBefore="1"
                    disabled={props.disabled}
                    style={{ width: LABEL_INPUT_WIDTH, maxWidth: LABEL_INPUT_WIDTH }}
                  />
                </FormItem>
              </div>
            </FormItem>
          ) : null}

          {paramState.dataType === "enum" ? (
            <FormItem label="枚举项" name="enumValues" style={{ marginBottom: 0 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  {!props.disabled && (
                    <Button type="primary" size="small" icon={<PlusOutlined />} onClick={addEnumItem}>
                      新增枚举项
                    </Button>
                  )}
                </div>
                {enumValues.value.length === 0 ? (
                  <div
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      color: "#8c8c8c",
                      background: "#fafafa",
                      borderRadius: "4px",
                      border: "1px dashed #d9d9d9",
                      fontSize: "13px",
                    }}
                  >
                    暂无枚举项
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {enumValues.value.map((item, index) => (
                      <div key={index} style={{ display: "flex", gap: INPUT_GAP, alignItems: "center", flexWrap: "wrap" }}>
                        <Input
                          v-model:value={item.value}
                          placeholder="Value"
                          allowClear
                          maxlength={ENUM_MAX_LENGTH}
                          disabled={props.disabled}
                          style={{ width: LABEL_INPUT_WIDTH }}
                        />
                        <span style={{ color: "#8c8c8c", margin: "0 4px" }}>～</span>
                        <Input
                          v-model:value={item.label}
                          placeholder="Label"
                          allowClear
                          maxlength={ENUM_MAX_LENGTH}
                          disabled={props.disabled}
                          style={{ width: LABEL_INPUT_WIDTH }}
                        />
                        {enumValues.value.length > 1 && !props.disabled && (
                          <Button
                            type="link"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removeEnumItem(index)}
                            style={{ padding: 0, height: "auto" }}
                          >
                            删除
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormItem>
          ) : null}
        </div>
      </Form>
    );
  },
});
