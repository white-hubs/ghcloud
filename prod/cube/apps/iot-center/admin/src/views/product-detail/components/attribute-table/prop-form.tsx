import { DataTypeSelect } from "./data-type-select";
import { DefaultValueInput } from "./default-value-input";
import { DataType } from "@/constants/data-type";
import type { ProductProp } from "@ghcloud/cube-iot-center-service";
import { Form, FormItem, Input, RadioGroup, Textarea, type FormExpose } from "@ghcloud/cube-ui";
import { defineComponent, reactive, ref, watch } from "vue";

interface Props {
  formState: Record<string, unknown>;
  handleType: "add" | "edit" | "detail";
  disabled?: boolean;
}

interface EnumType {
  value: string | number | undefined;
  label: string | number | undefined;
}

interface DataTypeConfig {
  dataType?: string;
  precision?: number;
  enumList?: EnumType[];
  min?: number;
  max?: number;
  boolStart?: string;
  boolEnd?: string;
}

const READ_WRITE_OPTIONS = [
  { label: "读写", value: 1 },
  { label: "只读", value: 0 },
] as const;

const LABEL_WIDTH = "100px";
const DEFAULT_PRECISION = 2;
const DEFAULT_MAX_VALUE = 999999;

/** 属性表单 */
export const PropForm = defineComponent({
  props: ["formState", "handleType", "disabled"],
  setup(props: Props, { expose }) {
    const formRef = ref<FormExpose>();
    const dataTypeRef = ref<{ validate: () => Promise<unknown>; resetForm: () => void }>();
    const formState = reactive<Record<string, unknown>>({
      name: undefined,
      propCode: undefined,
      unitSymbol: undefined,
      dataType: undefined,
      precision: undefined,
      dataWrite: undefined,
      defaultValue: undefined,
      remark: undefined,
    });

    const defaultValueRef = ref<string>("");
    const propertyOption = ref<ProductProp>({});
    const minValueRef = ref<number>(0);
    const maxValueRef = ref<number>(DEFAULT_MAX_VALUE);

    /**
     * 验证属性标识（不允许中文）
     */
    const checkChinese = async (_rule: unknown, value: string): Promise<void> => {
      if (!value) {
        return Promise.reject(new Error("请输入属性标识"));
      }
      if (value.trim() === "") {
        return Promise.reject(new Error("请输入属性标识"));
      }
      const chineseRegex = /[\u4e00-\u9fa5]/;
      if (chineseRegex.test(value)) {
        return Promise.reject(new Error("属性标识不允许输入中文字符"));
      }
      return Promise.resolve();
    };

    const formRules = {
      name: [{ required: true, message: "请输入属性名称", trigger: "blur" }],
      propCode: [{ required: true, validator: checkChinese, trigger: "change" }],
      dataWrite: [{ required: true, message: "请选择读写类型", trigger: "change" }],
    };

    /**
     * 数据类型变化时更新 propertyOption
     */
    const dataTypeChange = (dataType: Record<string, unknown>): void => {
      // 只有在新增模式下，数据类型变化时才清空默认值
      // 编辑模式下不清空，保持原有默认值
      if (props.handleType === "add") {
        formState.defaultValue = undefined;
        defaultValueRef.value = "";
      }
      changeDefaultValueProp(dataType as DataTypeConfig);
    };

    /**
     * 更新 propertyOption，用于默认值组件
     */
    const changeDefaultValueProp = (item: DataTypeConfig): void => {
      let options: { label: string; value: string | number | boolean }[] = [];
      if (item.enumList) {
        options = item.enumList
          .filter((e) => e.value !== undefined && e.label !== undefined)
          .map((e) => ({
            label: String(e.label ?? ""),
            value: e.value ?? "",
          }));
      }
      if (item.dataType === DataType.BOOLEAN) {
        options = [
          { label: String(item?.boolStart || ""), value: 0 },
          { label: String(item?.boolEnd || ""), value: 1 },
        ];
      }
      propertyOption.value = {
        dataType: item.dataType ?? "",
        precision: item.precision ?? 0,
        dataConstraint: options,
        unitName: (formState.unitSymbol as string) || "",
      };
      // 更新 minValue 和 maxValue，用于 DefaultValueInput
      minValueRef.value = (item.min as number) ?? 0;
      maxValueRef.value = (item.max as number) ?? DEFAULT_MAX_VALUE;
    };

    /**
     * 监听 formState 变化
     */
    watch(
      () => props.formState,
      () => {
        if (props.formState) {
          formRef.value?.clearValidate();
          // 先保存 defaultValue，避免被 Object.assign 覆盖
          const savedDefaultValue = props.formState.defaultValue;
          Object.assign(formState, props.formState);
          const dataConfig = props.formState.dataConfig
            ? (JSON.parse(props.formState.dataConfig as string) as Partial<DataTypeConfig>)
            : {};
          const rawData: Record<string, unknown> = {
            dataType: (props.formState.dataType as string | undefined) ?? dataConfig.dataType,
            precision: (props.formState.precision as number | undefined) ?? dataConfig.precision,
            enumList: dataConfig.enumList,
            min: dataConfig.min,
            max: dataConfig.max,
            boolStart: dataConfig.boolStart,
            boolEnd: dataConfig.boolEnd,
          };
          const dataType = Object.fromEntries(Object.entries(rawData).filter(([, v]) => v !== undefined)) as DataTypeConfig;
          // 先更新 propertyOption，确保 DefaultValueInput 能正确渲染
          changeDefaultValueProp(dataType);
          // 然后设置 defaultValue，确保值能正确回显
          if (savedDefaultValue !== undefined && savedDefaultValue !== null && savedDefaultValue !== "") {
            defaultValueRef.value = String(savedDefaultValue);
            formState.defaultValue = savedDefaultValue;
          } else {
            defaultValueRef.value = "";
            formState.defaultValue = undefined;
          }
        } else {
          // 新增
          Object.keys(formState).forEach((key) => {
            formState[key] = undefined;
          });
          defaultValueRef.value = "";
        }
      },
      { deep: true, immediate: true },
    );

    /**
     * 表单验证
     */
    const validate = async (): Promise<unknown> => {
      try {
        const formValues = await formRef.value?.validate();
        const dataTypeData = await dataTypeRef.value?.validate();
        const formValuesObj = formValues as Record<string, unknown>;
        const dataTypeDataObj = dataTypeData as Record<string, unknown>;
        return {
          ...formValuesObj,
          ...dataTypeDataObj,
          defaultValue: defaultValueRef.value,
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
      dataTypeRef.value?.resetForm();
    };

    expose({
      validate,
      resetForm,
    });

    return (): JSX.Element => (
      <Form ref={formRef} model={formState} labelCol={{ style: { width: LABEL_WIDTH } }} rules={formRules}>
        <FormItem label="属性名称" name="name">
          <Input
            v-model:value={formState.name}
            placeholder="请输入属性名称"
            allowClear
            maxlength={30}
            showCount
            disabled={props.disabled}
          />
        </FormItem>
        <FormItem label="属性标识" name="propCode">
          <Input
            v-model:value={formState.propCode}
            placeholder="请输入属性标识"
            allowClear
            maxlength={50}
            showCount
            disabled={props.disabled}
          />
        </FormItem>
        <FormItem label="单位" name="unitSymbol">
          <Input
            v-model:value={formState.unitSymbol}
            placeholder="请输入单位"
            allowClear
            maxlength={20}
            showCount
            disabled={props.disabled}
          />
        </FormItem>
        <FormItem label="" name="dataConfigCustom">
          <DataTypeSelect
            ref={dataTypeRef}
            formState={formState}
            handleType={props.handleType}
            disabled={props.disabled || false}
            onChange={dataTypeChange}
          />
        </FormItem>
        <FormItem label="读写类型" name="dataWrite">
          <RadioGroup v-model:value={formState.dataWrite} options={READ_WRITE_OPTIONS} disabled={props.disabled} />
        </FormItem>
        <FormItem label="属性默认值" name="defaultValue">
          <DefaultValueInput
            v-model:value={formState.defaultValue}
            propertyOption={propertyOption.value}
            minValue={minValueRef.value}
            maxValue={maxValueRef.value}
            precision={propertyOption.value.precision ?? DEFAULT_PRECISION}
            disabled={props.disabled || false}
            onChange={(value: string) => {
              defaultValueRef.value = value;
            }}
          />
        </FormItem>
        <FormItem label="属性描述" name="remark">
          <Textarea
            v-model:value={formState.remark}
            placeholder="请输入属性描述"
            allowClear
            maxlength={200}
            showCount
            disabled={props.disabled}
          />
        </FormItem>
      </Form>
    );
  },
});
