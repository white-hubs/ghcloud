import { FormItemObjectValue, FormItemProps } from '../../../business/dynamic-table/form-item'

export type SupplementClassDeps = [repairDate: string]

export interface SupplementClassProps extends FormItemProps<SupplementClassDeps> {
  // TODO(danke): string 是兼容旧格式，在未来可能删除
  modelValue?: string | FormItemObjectValue;
  readonly?: boolean;
}
