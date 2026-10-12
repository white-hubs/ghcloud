import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import { getMaxTitleLength, type DataItem } from '@/tools'

export const formNames = [
  { name: 'input', dynName: 'TextInput' },
  { name: 'textfield', dynName: 'TextInput' },
  { name: 'textAlert', dynName: 'TextareaInput' },
  { name: 'textfieldNumber', dynName: 'NumberInput' },
  { name: 'select', dynName: 'SelectInput' },
  { name: 'radioGroup', dynName: 'RadioGroup' },
  { name: 'checkboxGroup', dynName: 'CheckboxGroup' },
]
export interface FormItemOptions {
  idx: number;
  label: string;
  condition?: {
    type?: string;
    value?: unknown[] | null;
  } | undefined;
  visible?: boolean;
}
export interface DnyformItemOptions {
  value: string | number;
  label: string;
}
export interface FormItemOpt {
  multiple: boolean;
  disabled: boolean;
  clearable: boolean;
  required: boolean;
}

export interface RootObject {
  label: string;
  placeholder: boolean;
  defaultOptions: FormItemOptions[];
  required: boolean;
  code: string; // 字段名
  componentName: string; // 组件名
  componentIcon: string;
  defaultLable: string; // 标题
  defaultProps: string; // placehanlder
  defaultValue: string; // 默认值
  type: string;
  dictType: string;
  options: FormItemOpt; // multiple | disabled | clearable | required
  key: string;
  dataType: string; // 数据类型 int | string | boolean | float | double | enum
  supportSetting: string[];
  idx: number;
  inTableCanvas?: unknown;
  selected?: unknown;
}

export interface DnyForm {
  dynFormOptions: DynamicFormRenderOptionProps[];
  dynFormData: unknown;
  labelWidth: number;
}

// 定义 componentProps 的类型
export interface ComponentProps {
  options?: FormItemOptions[];
  defaultOptions?: FormItemOptions[];
  maxlength?: number;
  placeholder?: string;
  id?: string;
}

export const setLabelWidth = (dynFormOptions: DynamicFormRenderOptionProps[]): number => {
  let labelWidth = 120
  if (dynFormOptions.length > 0){
    const maxLength = getMaxTitleLength(dynFormOptions as unknown as DataItem[])
    labelWidth = maxLength > 5 ? maxLength * 15 : 80
  }
  return labelWidth
}