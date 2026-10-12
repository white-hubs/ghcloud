import type { OuaaEnum } from "@/components/common/ouaa-picker/ouaa-picker";
import type { ValueType } from "ant-design-vue/es/input-number/src/utils/MiniDecimal";
import type { CheckboxValueType } from "ant-design-vue/lib/checkbox/interface";

export interface MsgConfigFormState {
  condition: { name: string; value: ValueType; checked: boolean }[];
  msgConfig: CheckboxValueType[];
  noticeType: { name: OuaaEnum; value: { id: string; name: string }[] }[];
}
