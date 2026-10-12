import { FormItemProps } from "../../../business/dynamic-table/form-item";

export interface DateTimePickerProps extends FormItemProps<[]> {
  modelValue?: string;
  format?: string;
  defaultValue?: Date | string;
}
