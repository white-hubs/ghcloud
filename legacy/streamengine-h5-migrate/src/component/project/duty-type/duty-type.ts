import { FormItemObjectValue, FormItemProps } from '../../../business/dynamic-table/form-item'
import { DutyTypeOption } from '../../../domain/supplement-class-option'

/**
 * 换班班次组件 props
 */
export interface ChangeDutyTypeProps extends FormItemProps<[dutyType: DutyTypeOption]> {
  modelValue?: FormItemObjectValue;
}
