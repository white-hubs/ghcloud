import { DataType, DATA_TYPE_OPTIONS, isNumericType, isFloatType } from "@/constants/data-type";
import { DeleteOutlined } from "@ant-design/icons-vue";
import { Form, FormItem, Input, InputNumber, Select, Button } from "@ghcloud/cube-ui";
import { defineComponent, reactive, ref, watch, computed } from "vue";

interface Props {
  formState: Record<string, unknown>;
  handleType: "add" | "edit" | "detail";
  disabled: boolean;
  onChange?: (dataType: Record<string, unknown>) => void;
}

interface EnumItem {
  value: string | number | undefined;
  label: string | number | undefined;
}

const INPUT_WIDTH = "170px";
const LABEL_WIDTH = "100px";
const LABEL_MARGIN_BOTTOM = "24px";
const PRECISION_MIN = 0;
const PRECISION_MAX = 4;
const BOOL_MAX_LENGTH = 20;
const ENUM_MAX_LENGTH = 20;
const INPUT_GAP = "8px";

/** 数据类型选择组件 */
export const DataTypeSelect = defineComponent({
  props: ["formState", "handleType", "disabled", "onChange"],
  setup(props: Props, { expose }) {
    const formRef = ref();
    const dataTypeState = reactive<Record<string, unknown>>({
      dataType: undefined,
      precision: undefined,
      min: undefined,
      max: undefined,
      boolStart: undefined,
      boolEnd: undefined,
      enumList: [] as EnumItem[],
    });

    const enumListState = ref<EnumItem[]>([
      {
        value: undefined,
        label: undefined,
      },
    ]);

    const dataTypeOptions = ref<{ label: string; value: string }[]>(DATA_TYPE_OPTIONS);
    const currentType = ref<string | number | undefined>();

    const formRules = {
      dataType: [{ required: true, message: "请选择数据类型", trigger: "change" }],
      precision: [{ required: true, message: "请输入精度（保留小数点后几位）", trigger: "change" }],
      min: [{ required: true, message: "请输入最小值", trigger: "change" }],
      max: [{ required: true, message: "请输入最大值", trigger: "change" }],
      boolStart: [{ required: true, message: "请输入布尔值", trigger: "change" }],
      boolEnd: [{ required: true, message: "请输入布尔值", trigger: "change" }],
    };

    /**
     * 监听 formState 中与 DataType 相关的字段变化（排除 defaultValue，避免输入默认值时触发重置）
     */
    watch(
      () => [
        props.formState?.dataType,
        props.formState?.precision,
        props.formState?.min,
        props.formState?.max,
        props.formState?.boolStart,
        props.formState?.boolEnd,
        props.formState?.enumList,
      ],
      () => {
        if (props.formState) {
          formRef.value?.clearValidate();
          dataTypeState.dataType = props.formState.dataType as string | number | undefined;
          dataTypeState.precision = props.formState.precision as number | undefined;
          dataTypeState.min = props.formState.min as number | undefined;
          dataTypeState.max = props.formState.max as number | undefined;
          dataTypeState.boolStart = props.formState.boolStart as string | undefined;
          dataTypeState.boolEnd = props.formState.boolEnd as string | undefined;
          dataTypeState.enumList = (props.formState.enumList || []) as EnumItem[];
          currentType.value = props.formState.dataType as string | number | undefined;
          if (Array.isArray(props.formState.enumList)) {
            enumListState.value = [...(props.formState.enumList as EnumItem[])];
          }
        } else {
          dataTypeState.dataType = undefined;
          dataTypeState.precision = undefined;
          dataTypeState.min = undefined;
          dataTypeState.max = undefined;
          dataTypeState.boolStart = undefined;
          dataTypeState.boolEnd = undefined;
          dataTypeState.enumList = [] as EnumItem[];
          enumListState.value = [{ value: undefined, label: undefined }];
          currentType.value = undefined;
        }
      },
      { deep: true, immediate: true },
    );

    /**
     * 监听数据类型变化
     */
    watch(
      () => dataTypeState.dataType,
      (value) => {
        if (value) {
          currentType.value = value as string | number;
          if (value === DataType.ENUM && enumListState.value.length === 0) {
            enumListState.value = [{ value: undefined, label: undefined }];
          }
        }
      },
    );

    /**
     * 监听所有字段变化，触发 onChange
     */
    watch(
      [() => dataTypeState, () => enumListState.value],
      () => {
        const result = {
          ...dataTypeState,
          enumList: enumListState.value,
        };
        props.onChange?.(result);
      },
      { deep: true },
    );

    /**
     * 添加枚举项
     */
    const enumAdd = (): void => {
      enumListState.value.push({
        value: undefined,
        label: undefined,
      });
    };

    /**
     * 删除枚举项
     */
    const enumDel = (index: number): void => {
      enumListState.value.splice(index, 1);
    };

    /**
     * 表单验证
     */
    const validate = async (): Promise<unknown> => {
      try {
        await formRef.value?.validate();
        return {
          ...dataTypeState,
          enumList: enumListState.value,
        };
      } catch (errorInfo) {
        return Promise.reject(errorInfo);
      }
    };

    /**
     * 重置表单
     */
    const resetForm = (): void => {
      formRef.value?.clearValidate();
    };

    expose({
      validate,
      resetForm,
    });

    /**
     * 判断是否为可编辑模式
     */
    const isEditable = computed(() => props.handleType === "add" || props.handleType === "edit");

    /**
     * 判断是否为数值类型
     */
    const isNumericTypeComputed = computed(() => isNumericType(currentType.value as string));

    /**
     * 判断是否为浮点类型
     */
    const isFloatTypeComputed = computed(() => isFloatType(currentType.value as string));

    return (): JSX.Element => (
      <Form ref={formRef} model={dataTypeState} layout="inline" labelCol={{ style: { width: LABEL_WIDTH } }} rules={formRules}>
        <FormItem label="数据类型" name="dataType" style={{ marginBottom: LABEL_MARGIN_BOTTOM }}>
          <Select
            v-model:value={dataTypeState.dataType}
            placeholder="请选择数据类型"
            options={dataTypeOptions.value}
            allowClear
            disabled={props.disabled}
            style={{ width: INPUT_WIDTH }}
            fieldNames={{ label: "label", value: "value" }}
          />
        </FormItem>
        {isNumericTypeComputed.value && !isFloatTypeComputed.value ? (
          <FormItem label="取值范围" name="min" style={{ marginBottom: LABEL_MARGIN_BOTTOM }}>
            <div style={{ display: "flex", alignItems: "center", gap: INPUT_GAP }}>
              <InputNumber
                v-model:value={dataTypeState.min}
                placeholder="请输入最小值"
                allowClear
                disabled={props.disabled}
                style={{ width: INPUT_WIDTH }}
              />
              <span style={{ color: "#666" }}>～</span>
              <InputNumber
                v-model:value={dataTypeState.max}
                placeholder="请输入最大值"
                allowClear
                disabled={props.disabled}
                style={{ width: INPUT_WIDTH }}
              />
            </div>
          </FormItem>
        ) : null}
        {isFloatTypeComputed.value ? (
          <>
            <FormItem label="取值范围" name="min" style={{ marginBottom: LABEL_MARGIN_BOTTOM }}>
              <div style={{ display: "flex", alignItems: "center", gap: INPUT_GAP }}>
                <InputNumber
                  v-model:value={dataTypeState.min}
                  placeholder="请输入最小值"
                  allowClear
                  disabled={props.disabled}
                  style={{ width: INPUT_WIDTH }}
                />
                <span style={{ color: "#666" }}>～</span>
                <InputNumber
                  v-model:value={dataTypeState.max}
                  placeholder="请输入最大值"
                  allowClear
                  disabled={props.disabled}
                  style={{ width: INPUT_WIDTH }}
                />
              </div>
            </FormItem>
            <FormItem label="精度" name="precision" style={{ marginBottom: LABEL_MARGIN_BOTTOM }}>
              <InputNumber
                v-model:value={dataTypeState.precision}
                placeholder="请输入精度（保留小数点后几位）"
                allowClear
                min={PRECISION_MIN}
                max={PRECISION_MAX}
                precision={0}
                disabled={props.disabled}
                style={{ width: INPUT_WIDTH }}
              />
            </FormItem>
          </>
        ) : null}
        {currentType.value === DataType.BOOLEAN ? (
          <FormItem label="布尔值" name="boolStart" style={{ marginBottom: LABEL_MARGIN_BOTTOM }}>
            <div style={{ display: "flex", alignItems: "center", gap: INPUT_GAP }}>
              <Input
                v-model:value={dataTypeState.boolStart}
                placeholder="如：开"
                allowClear
                maxlength={BOOL_MAX_LENGTH}
                addonBefore="0"
                disabled={props.disabled}
                style={{ width: INPUT_WIDTH }}
              />
              <span style={{ color: "#666" }}>～</span>
              <Input
                v-model:value={dataTypeState.boolEnd}
                placeholder="如：关"
                allowClear
                maxlength={BOOL_MAX_LENGTH}
                addonBefore="1"
                disabled={props.disabled}
                style={{ width: INPUT_WIDTH }}
              />
            </div>
          </FormItem>
        ) : null}
        {currentType.value === DataType.ENUM ? (
          <>
            {enumListState.value.map((item, index) => (
              <FormItem
                key={index}
                label={index === 0 ? "枚举项" : ""}
                name={`enumValue_${index}`}
                style={{
                  marginBottom: index === enumListState.value.length - 1 ? "0" : LABEL_MARGIN_BOTTOM,
                  marginLeft: index === 0 ? "0" : LABEL_WIDTH,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: INPUT_GAP }}>
                  <Input
                    v-model:value={item.value}
                    placeholder="请输入枚举值"
                    allowClear
                    maxlength={ENUM_MAX_LENGTH}
                    disabled={props.disabled}
                    style={{ width: INPUT_WIDTH }}
                  />
                  <span style={{ color: "#666" }}>～</span>
                  <Input
                    v-model:value={item.label}
                    placeholder="请输入枚举描述"
                    allowClear
                    maxlength={ENUM_MAX_LENGTH}
                    disabled={props.disabled}
                    style={{ width: INPUT_WIDTH }}
                  />
                  {enumListState.value.length > 1 && index >= 1 && isEditable.value ? (
                    <Button type="link" danger onClick={() => enumDel(index)}>
                      <DeleteOutlined />
                      删除
                    </Button>
                  ) : null}
                </div>
              </FormItem>
            ))}
            {isEditable.value ? (
              <FormItem label="" style={{ marginTop: "5px", marginLeft: LABEL_WIDTH }}>
                <Button type="link" onClick={enumAdd}>
                  +添加枚举参数
                </Button>
              </FormItem>
            ) : null}
          </>
        ) : null}
      </Form>
    );
  },
});
