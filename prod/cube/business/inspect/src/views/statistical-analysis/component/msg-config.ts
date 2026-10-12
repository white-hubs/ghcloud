import type { OuaaEnum } from '@/components/common/ouaa-picker/ouaa-picker'
import type { ValueType } from 'ant-design-vue/es/input-number/src/utils/MiniDecimal'
import type { CheckboxValueType } from 'ant-design-vue/lib/checkbox/interface'

export const msgOptions = [
  { label: '站内', value: 'CHANNEL_SITE', terminal: 'bimops-manage-web' },
  { label: 'APP站内', value: 'CHANNEL_SITE_APP', terminal: 'bimops-manage-app' },
  { label: '短信', value: 'CHANNEL_SMS' },
  { label: 'APP推送', value: 'CHANNEL_APP' },
  { label: '语音电话', value: 'CHANNEL_VOICE' },
]

export enum MsgConfigBusinessTypeEmum {
  /** 巡检任务 */
  TASK_GENERATE = 'TASK_GENERATE',
  /** 任务即将失效 */
  TASK_LAPSE = 'TASK_LAPSE',
  /** 任务失效未完成 */
  TASK_LAPSE_UNFINISHED = 'TASK_LAPSE_UNFINISHED',
  /** 任务异常 */
  TASK_RECORD_ERROR = 'TASK_RECORD_ERROR'
}

export interface MsgConfigFormState {
  condition: { name: string; value: ValueType;checked: boolean; }[];
  msgConfig: CheckboxValueType[];
  noticeType: { name: string|null;value: { id: string; name: string; }[]; }[];
}
