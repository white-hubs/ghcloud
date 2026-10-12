import { formNames, setLabelWidth, type ComponentProps, type DnyformItemOptions, type RootObject } from "@/typings/form-type";
import type { DynamicFormRenderOptionProps } from "@ghcloud/dynamic-form-render/src/dynamic-form-render-props";
import { ref, watch, type Ref } from "vue";

export interface UseFormData {
  dynFormOptions: Ref<DynamicFormRenderOptionProps[]>;
  dynFormData: Ref<Record<string, unknown>>;
  labelWidth: Ref<number>;
  initDynFormData: () => void;
  getDynFormOptions: () => void;
  updateOptionVisible: () => void;
  updateFormOptions: (data: string) => void;
  resetForm: () => void;
}

export const useFormData = (data: string): UseFormData => {
  let formSchema: RootObject[] = [];
  const labelWidth = ref(90);
  const dynFormOptions = ref<DynamicFormRenderOptionProps[]>([]);
  const dynFormData = ref<Record<string, unknown>>({});

  // 初始化表单数据
  const initFormSchema = (data: string): void => {
    try {
      if (!data || typeof data !== "string") {
        throw new Error("Invalid input: data must be a non-empty JSON string.");
      }
      if (!Array.isArray(formSchema)) {
        throw new Error("Invalid JSON format: Expected an array of form schema.");
      }
      formSchema = JSON.parse(data);
      dynFormOptions.value = [];
      // DynFormData.value = {}
    } catch {}
  };

  // 初始化默认值
  const initDynFormData = (): void => {
    formSchema.forEach((item) => {
      if (!item.code) {
        throw new Error("Form Schema Error: 字段名code不能为空");
      }
      const defaultData = item.defaultValue || item.defaultProps;
      if (["input", "textfield", "textfieldNumber", "textAlert"].includes(item.componentName)) {
        const isNumber = ["int", "float", "double"].includes(item.dataType);
        dynFormData.value[item.code as string] = isNumber ? Number(defaultData) : "";
      } else if (["radioGroup", "checkboxGroup"].includes(item.componentName)) {
        dynFormData.value[item.code as string] = Array.isArray(defaultData) ? defaultData : defaultData ? [defaultData] : [];
      } else {
        dynFormData.value[item.code as string] = defaultData;
      }
    });
  };
  // 转换组件属性
  const getDynFormOptions = (): void => {
    formSchema.forEach((item) => {
      if (!item.code) {
        throw new Error("Form Schema Error: 字段名code不能为空");
      }
      const itemName = formNames.find((e) => e.name === item.componentName)?.dynName ?? "";
      let itemOptions: DnyformItemOptions[] = [];

      if (item.defaultOptions && item.defaultOptions.length > 0) {
        itemOptions = item.defaultOptions.map((option) => ({
          ...option,
          label: option.label,
          value: option.idx,
          condition: option?.condition,
        }));
      }
      dynFormOptions.value.push({
        title: item.defaultLable,
        key: item.code,
        componentName: itemName,
        required: item?.options?.required || item?.required,
        dataType: item.dataType,
        componentProps: {
          options: itemOptions,
          defaultOptions: item.defaultOptions,
          maxlength: 1000,
          placeholder: item.defaultProps ? item.defaultProps : "",
          id: item.key,
        } as unknown as ComponentProps,
      });
    });
  };
  // 条件检查函数
  const checkCondition = (value: unknown, operator: string, expected: unknown): boolean => {
    switch (operator) {
      case "EQ":
        return Array.isArray(value) && Array.isArray(expected) ? value.some((v) => expected.includes(v)) : value === expected;
      case "NEQ":
        return value !== expected;
      case "GT":
        return Number(value) > Number(expected);
      case "LT":
        return Number(value) < Number(expected);
      default:
        return true;
    }
  };

  // 更新选项可见性
  const updateOptionVisible = (): void => {
    dynFormOptions.value.forEach((option) => {
      const componentProps = option.componentProps as ComponentProps;
      const options = componentProps.defaultOptions?.map((option) => ({
        ...option,
        label: option.label,
        value: option.idx,
        condition: option?.condition,
      }));
      if (options && Array.isArray(options)) {
        const newOptions = options?.map((opt) => {
          if (opt.condition?.type === "CONDITION") {
            const [targetKey, operator, expectedValue] = opt.condition.value as [string, string, unknown];
            const formKey = dynFormOptions.value.find((item) => item.componentProps?.id === targetKey)?.key as string;
            const isVisible = checkCondition(dynFormData.value[formKey], operator, expectedValue);
            opt.visible = isVisible;
          }
          return opt;
        });
        const hasVisibleTrue = newOptions.some((item) => item.visible === true);
        const result = newOptions.filter((item) => (hasVisibleTrue ? item.visible === true : !("visible" in item)));
        componentProps.options = result;
      }
    });
  };

  initFormSchema(data);
  initDynFormData();
  getDynFormOptions();
  updateOptionVisible();

  watch(
    () => dynFormData.value,
    () => {
      updateOptionVisible();
    },
    { deep: true },
  );

  const updateFormOptions = (data: string): void => {
    initFormSchema(data);
    // InitDynFormData()
    getDynFormOptions();
    updateOptionVisible();
  };
  const resetForm = (): void => {
    formSchema = [];
    dynFormOptions.value = [];
    dynFormData.value = {};
  };

  labelWidth.value = setLabelWidth(dynFormOptions.value);

  return {
    dynFormOptions,
    dynFormData,
    initDynFormData,
    getDynFormOptions,
    updateOptionVisible,
    updateFormOptions,
    labelWidth,
    resetForm,
  };
};
