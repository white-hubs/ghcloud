import { FormItemObjectValue, FormItemProps } from '../../../business/dynamic-table/form-item'
import { StaffUser } from '../../../domain/user'
import { DutyTypeOption } from '../../../domain/supplement-class-option'
import { DynamicTableProcessType } from '../../../business/dynamic-table/dynamic-table'

/**
 * 换班班次组件 props
 */
export interface ChangeClassSelectProps extends FormItemProps<[user: StaffUser,classType:DutyTypeOption,day:string]> {
  modelValue?: FormItemObjectValue;
  processType?:DynamicTableProcessType;
  readonly?:boolean;
}
