export interface FormItem {
  title: string;
  key: string;
  type: string;
  placeholder?: string;
  options?: any[];
  itemWidth?: string;
  defaultVal?: any;
  labelCol?: number;
  slotName?: string;
  optionKey?: string;
  disabled?: boolean;
  allowClear?: boolean;
}
