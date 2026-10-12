import { FormItemObjectValue, FormItemProps } from '../../../business/dynamic-table/form-item'

/**
 * 换班人员组件 props
 */
export interface ChangePersonSelectProps extends FormItemProps {
  modelValue?: FormItemObjectValue;
  placeholder?: string;
}
