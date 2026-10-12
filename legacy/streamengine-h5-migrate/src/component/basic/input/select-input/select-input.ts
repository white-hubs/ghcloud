export interface SelectInputColumn<T> {
  text: string;
  value: string;
  originItem: T;
}

export interface SelectInputProps<Option, TK = keyof Option, VK = keyof Option> {
  options: Option[];
  optionTextKey: TK;
  optionValueKey: VK;
  label?: string;
  required?: boolean;
  // TODO(danke): 当前版本下 modelValue 使用泛型会破坏其他组件类型
  modelValue?: unknown;
  errorMessage?: string;
  placeholder?: string;
  echoMode?: boolean;
  readonly?: boolean;
}
